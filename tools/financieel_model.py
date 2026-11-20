#!/usr/bin/env python3
"""Financieel model HuurHub. Alle aannames staan bovenaan en zijn gelabeld.

Gebruik:  python3 tools/financieel_model.py          (drukt markdown-tabellen af)

Bedragen in euro. Omzet is EXCLUSIEF btw. Consumentenprijzen zijn INCLUSIEF 21% btw.
"BRON" = gebaseerd op een gevonden prijs/benchmark (zie DATA_SOURCES.md / FINANCIALS.md);
"AANNAME" = eigen schatting, nog niet gevalideerd.
"""

BTW = 0.21

A = {
    # --- Pro-abonnement
    "pro_prijs_incl": 4.99,          # AANNAME: jouw richtprijs
    "betaalkosten_per_transactie": 0.35,  # BRON (bandbreedte €0,25–0,35 SEPA/iDEAL, Mollie/Stripe; nog verifiëren)
    "pro_churn_pm": 0.40,            # AANNAME: zoekers stoppen als ze een woning vinden (gem. looptijd ±2,5 mnd)
    # --- conversie (aandeel van MAU)
    "geregistreerd_van_mau": 0.25,   # AANNAME
    "betalend_van_mau": {"conservatief": 0.010, "realistisch": 0.020, "ambitieus": 0.035},  # BRON-richting: freemium mediaan 2,1% (RevenueCat 2026)
    # --- gebruik
    "pageviews_per_mau": 12,         # AANNAME
    "doorkliks_per_mau": 4,          # AANNAME: klikken naar aanbieder per maand
    "aandeel_doorkliks_affiliate": 0.15,  # AANNAME: deel van de doorkliks naar platforms met affiliateprogramma
    "affiliate_conversie": 0.015,    # AANNAME: deel van affiliate-doorkliks dat een (proef)account aanmaakt
    "affiliate_vergoeding": 5.00,    # BRON: Daisycon Huurwoningen €3–10, Kamernet €2–5, Kamer.nl €1–20 per lead
    "adsense_rpm": 1.50,             # AANNAME: € per 1.000 pageviews op contentpagina's (geen NL-bron gevonden)
    "ads_aan": False,                # ADVIES: bij lancering geen advertenties
    # --- vaste kosten per maand (excl. btw)
    "vast": {
        "VPS (4 vCPU / 8 GB, incl. snapshots)": 20.0,   # AANNAME: Hetzner-prijzen 2026 gewijzigd, opnieuw offerte opvragen
        "Domeinnaam (.nl)": 1.0,                       # AANNAME: ±€12/jaar
        "Privacyvriendelijke statistieken": 0.0,       # AANNAME: zelf gehost (Umami/GoatCounter)
        "Monitoring (gratis laag)": 0.0,               # AANNAME
        "Supabase (gratis laag tot 50k MAU)": 0.0,      # BRON: supabase.com/pricing (nog verifiëren)
        "Kaarttegels (betaalde provider bij groei)": 0.0,  # zie schaalregels hieronder
    },
    # --- kosten die meegroeien
    "email_gratis_per_maand": 3000,  # BRON: Resend gratis laag (3.000/mnd, 100/dag)
    "email_pro_kosten": 19.0,        # BRON: Resend Pro ≈ $20/mnd voor 50.000 mails (≈ €19, koers-aanname)
    "mails_per_pro_per_maand": 30,   # AANNAME: dagelijkse samenvatting
    "mails_per_geregistreerde": 4,   # AANNAME
    "kaart_betaald_vanaf_mau": 3000, # AANNAME: boven dit volume eigen/betaalde tegelserver nodig (OSM-gebruiksbeleid)
    "kaart_kosten": 25.0,            # AANNAME: nog offerte opvragen (MapTiler/Stadia/eigen tegels)
    "supabase_pro_vanaf_mau": 50000, # BRON: gratis laag tot ±50k MAU
    "supabase_pro_kosten": 24.0,     # BRON: $25/mnd (≈ €24)
    "vps_extra_vanaf_mau": 8000,     # AANNAME: tweede server/zwaarder pakket
    "vps_extra_kosten": 20.0,        # AANNAME
}


def maand(mau, scenario="realistisch", marketing=0.0):
    a = A
    pro_netto = a["pro_prijs_incl"] / (1 + BTW) - a["betaalkosten_per_transactie"]
    betalend = round(mau * a["betalend_van_mau"][scenario])
    geregistreerd = round(mau * a["geregistreerd_van_mau"])
    omzet_pro = betalend * a["pro_prijs_incl"] / (1 + BTW)
    betaalkosten = betalend * a["betaalkosten_per_transactie"]
    aff_doorkliks = mau * a["doorkliks_per_mau"] * a["aandeel_doorkliks_affiliate"]
    omzet_aff = aff_doorkliks * a["affiliate_conversie"] * a["affiliate_vergoeding"]
    omzet_ads = (mau * a["pageviews_per_mau"] / 1000 * a["adsense_rpm"]) if a["ads_aan"] else 0.0
    vast = sum(a["vast"].values())
    mails = betalend * a["mails_per_pro_per_maand"] + geregistreerd * a["mails_per_geregistreerde"]
    email = a["email_pro_kosten"] if mails > a["email_gratis_per_maand"] else 0.0
    kaart = a["kaart_kosten"] if mau >= a["kaart_betaald_vanaf_mau"] else 0.0
    supa = a["supabase_pro_kosten"] if mau >= a["supabase_pro_vanaf_mau"] else 0.0
    vps = a["vps_extra_kosten"] if mau >= a["vps_extra_vanaf_mau"] else 0.0
    kosten = vast + email + kaart + supa + vps + betaalkosten + marketing
    omzet = omzet_pro + omzet_aff + omzet_ads
    return {
        "mau": mau, "geregistreerd": geregistreerd, "betalend": betalend,
        "omzet_pro": omzet_pro, "omzet_aff": omzet_aff, "omzet_ads": omzet_ads, "omzet": omzet,
        "btw_af_te_dragen": betalend * a["pro_prijs_incl"] - omzet_pro,
        "kosten_vast": vast + kaart + supa + vps, "kosten_variabel": email + betaalkosten, "marketing": marketing,
        "kosten": kosten, "resultaat": omzet - kosten, "pro_netto_per_lid": pro_netto,
    }


def e(x):
    return f"€{x:,.0f}".replace(",", ".")


def scenario_tabel():
    print("| MAU | Scenario | Betalend | Omzet Pro | Omzet affiliate | Omzet totaal (excl. btw) | Kosten | Resultaat |")
    print("|---|---|---|---|---|---|---|---|")
    for mau in (500, 1000, 5000, 10000):
        for sc in ("conservatief", "realistisch", "ambitieus"):
            r = maand(mau, sc)
            print(f"| {mau:,} | {sc} | {r['betalend']} | {e(r['omzet_pro'])} | {e(r['omzet_aff'])} | {e(r['omzet'])} | {e(r['kosten'])} | {e(r['resultaat'])} |".replace(",", "."))


def unit_economics():
    a = A
    netto = a["pro_prijs_incl"] / (1 + BTW) - a["betaalkosten_per_transactie"]
    looptijd = 1 / a["pro_churn_pm"]
    print(f"- Netto per Pro-lid per maand (excl. btw, na betaalkosten): €{netto:.2f}")
    print(f"- Gemiddelde looptijd bij {a['pro_churn_pm']:.0%} opzegging per maand: {looptijd:.1f} maanden")
    print(f"- Levenslange waarde (LTV) per Pro-lid: €{netto * looptijd:.2f}")
    for prijs in (4.99, 5.99, 7.99, 9.99):
        n = prijs / (1 + BTW) - a["betaalkosten_per_transactie"]
        print(f"  - bij €{prijs:.2f}: netto €{n:.2f}/mnd, LTV €{n * looptijd:.2f}")


if __name__ == "__main__":
    print("## Unit economics\n"); unit_economics()
    print("\n## Scenario's per maand\n"); scenario_tabel()
    r = maand(5000, "realistisch")
    print(f"\nBreak-even check 5.000 MAU realistisch: omzet {e(r['omzet'])}, kosten {e(r['kosten'])}")
