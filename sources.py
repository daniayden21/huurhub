"""Bronnen voor Huurhub. Elke fetcher geeft een lijst genormaliseerde woningen terug.

Alle bronnen zijn openbare pagina's die je zonder login kunt bekijken. ZIG- en SSH-portalen
hebben een openbare JSON-feed; WoningNet (DAK) en Woonnet Rijnmond laden hun aanbod in de
browser, dus die openen we met een headless browser en lezen wat de pagina zelf ophaalt.
"""
import asyncio, base64, json, re, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"}
SOCIAAL_MAX = 932.93  # liberalisatiegrens 2026

# host -> (naam, detailpad, soort)
ZIG = {
    "www.roommatch.nl": ("Roommatch (DUWO, Ymere, Idealis)", "/aanbod/studentenwoningen/details/", "student"),
    "www.roomspot.nl": ("Roomspot (Enschede)", "/aanbod/te-huur/details/", "student"),
    "www.woonnet-haaglanden.nl": ("Woonnet Haaglanden", "/aanbod/nu-te-huur/te-huur/details/", None),
    "www.hureninhollandrijnland.nl": ("Huren in Holland Rijnland", "/aanbod/nu-te-huur/huurwoningen/details/", None),
    "www.woninghuren.nl": ("Woninghuren (Twente)", "/aanbod/te-huur/details/", None),
    "www.dewoningzoeker.nl": ("De Woningzoeker (Zwolle e.o.)", "/aanbod/te-huur/details/", None),
    "www.woonkeus-stedendriehoek.nl": ("Woonkeus Stedendriehoek", "/aanbod/nu-te-huur/huurwoningen/details/", None),
    "www.hurennoordveluwe.nl": ("Huren Noord-Veluwe", "/aanbod/nu-te-huur/huurwoningen/details/", None),
    "www.klikvoorwonen.nl": ("Klik voor Wonen (West-Brabant)", "/aanbod/nu-te-huur/huurwoningen/details/", None),
    "www.zuidwestwonen.nl": ("ZuidWest Wonen (Zeeland)", "/aanbod/nu-te-huur/huurwoningen/details/", None),
    "www.wooniezie.nl": ("Wooniezie (Eindhoven e.o.)", "/aanbod/nu-te-huur/te-huur/details/", None),
    "www.thuisinlimburg.nl": ("Thuis in Limburg", "/aanbod/nu-te-huur/huurwoningen/details/", None),
    "www.mijnwoningzoeken.nl": ("Mijn Woningzoeken (NO-Brabant)", "/aanbod/te-huur/details/", None),
}
# subdomein van mijndak.nl -> naam
DAK = {
    "amsterdam": "WoningNet Regio Amsterdam",
    "studentenwoning": "Studentenwoningweb (Amsterdam)",
    "utrecht": "WoningNet Regio Utrecht",
    "eemvallei": "WoningNet Eemvallei (Amersfoort)",
    "mijnwoonservice": "Mijn Woonservice (Haarlem/IJmond)",
    "almere": "WoningNet Almere",
    "gooienvecht": "WoningNet Gooi en Vecht",
    "woonkeus": "Woonkeus Drechtsteden",
    "woongaard": "Woongaard",
    "middenholland": "WoningNet Midden-Holland (Gouda)",
    "groningenhuurt": "Groningen Huurt",
}

TOEWIJZING_ZIG = {
    "inschrijfduur": "inschrijfduur", "kaart": "inschrijfduur", "punten": "punten",
    "random": "loting", "loting": "loting", "reactiedatum": "wie eerst komt",
    "hospiteren": "hospiteren", "hospitereninschrijfduur": "hospiteren", "cooptation": "hospiteren",
}
KANSRIJK = {"loting", "wie eerst komt", "hospiteren"}


def post_json(url, timeout=40):
    req = urllib.request.Request(url, data=b"", method="POST", headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def get_json(url, timeout=40):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return json.load(r)


def doelgroep_van(*teksten):
    t = " ".join(x if isinstance(x, str) else json.dumps(x, ensure_ascii=False) for x in teksten if x).lower()
    if re.search(r"senior|55\+|65\+|55-plus|ouder worden", t): return "senioren"
    if "stud" in t or "t/m 20" in t or "onzelfstandig" in t: return "studenten"
    if "jong" in t: return "jongeren"
    if "alleen voor gezinnen" in t or "grote gezinnen" in t: return "gezinnen"
    if "zorg" in t or "rolstoel" in t or "wibo" in t or "aangep" in t: return "zorg"
    return "iedereen"


def sector_van(huur, label="", student=False):
    l = (label or "").lower()
    if student: return "student"
    if "middenhuur" in l: return "middenhuur"
    if "vrije sector" in l: return "vrije sector"
    return "sociaal" if huur <= SOCIAAL_MAX else "vrije sector"


# ---------------------------------------------------------------- ZIG
def fetch_zig(host):
    naam, pad, soort = ZIG[host]
    d = post_json(f"https://{host}/portal/object/frontend/getallobjects/format/json")
    objs = d.get("result", d) if isinstance(d, dict) else d
    out = []
    for o in objs:
        if o.get("rentBuy") != "Huur" or (o.get("dwellingType") or {}).get("categorie") != "woning":
            continue
        model = ((o.get("model") or {}).get("modelCategorie") or {}).get("code", "")
        if model in ("woningruil",):
            continue
        huur = float(o.get("netRent") or 0)
        if huur < 150:
            continue
        dg_codes = "/".join(x.get("code", "") for x in o.get("doelgroepen") or [])
        student = soort == "student" or "stud" in dg_codes.lower()
        pics = o.get("pictures") or []
        out.append({
            "id": f"zig:{host}:{o.get('id')}", "bron": naam, "bronHost": host,
            "adres": f"{o.get('street','')} {o.get('houseNumber','')}{o.get('houseNumberAddition') or ''}".strip(),
            "postcode": (o.get("postalcode") or "").replace(" ", ""),
            "plaats": (o.get("city") or {}).get("name", ""), "wijk": (o.get("quarter") or {}).get("name", ""),
            "lat": float(o["latitude"]) if o.get("latitude") else None,
            "lon": float(o["longitude"]) if o.get("longitude") else None,
            "huur": round(huur, 2), "totaal": round(float(o.get("totalRent") or huur), 2),
            "type": "zelfstandig" if o.get("isZelfstandig") else "kamer",
            "m2": o.get("areaDwelling") or None,
            "kamers": int((o.get("sleepingRoom") or {}).get("amountOfRooms") or 0) or None,
            "huisgenoten": o.get("aantalMedebewoners"),
            "toewijzing": TOEWIJZING_ZIG.get(model, "overig"),
            "doelgroep": "studenten" if student else doelgroep_van(dg_codes, (o.get("actionLabel") or {}).get("localizedLabel") if isinstance(o.get("actionLabel"), dict) else o.get("actionLabel")),
            "sector": sector_van(huur, "", student),
            "label": (o.get("woningsoort") or {}).get("localizedNaam") or "",
            "huurtoeslag": bool(o.get("huurtoeslagMogelijk")),
            "sluit": (o.get("closingDate") or "")[:16] or None,
            "geplaatst": (o.get("publicationDate") or "")[:16] or None,
            "foto": f"https://{host}{pics[0]['uri']}" if pics and pics[0].get("uri") else None,
            "fotos": [f"https://{host}{x['uri']}" for x in pics if x.get("uri") and x.get("type", "jpg") in ("jpg", "jpeg", "png", "webp")][:15],
            "omschrijving": (o.get("infoveldKort") or "").strip(),
            "kenmerken": zig_kenmerken(o),
            "beschikbaar": (o.get("availableFromDate") or o.get("availableFrom") or "")[:10] or None,
            "url": f"https://{host}{pad}{o.get('urlKey','')}",
        })
    return out


def zig_kenmerken(o):
    k = []
    lab = ((o.get("energyLabel") or {}).get("icon") or "").replace("icon_label_", "").upper()
    if lab and len(lab) <= 5: k.append(f"Energielabel {lab.replace('PLUS', '+')}")
    if (o.get("floor") or {}).get("localizedName"): k.append(o["floor"]["localizedName"])
    if o.get("balcony"): k.append("Balkon")
    if o.get("constructionYear"): k.append(f"Bouwjaar {o['constructionYear']}")
    if o.get("newlyBuild"): k.append("Nieuwbouw")
    if o.get("huurtoeslagMogelijk"): k.append("Huurtoeslag mogelijk")
    if o.get("aantalMedebewoners"): k.append(f"{o['aantalMedebewoners']} huisgenoten")
    if (o.get("dwellingType") or {}).get("localizedName"): k.append(o["dwellingType"]["localizedName"])
    return k


# ---------------------------------------------------------------- SSH
def fetch_ssh():
    offers = get_json("https://www.sshxl.nl/api/v1/offer")
    ids = ",".join(str(o["WocasId"]) for o in offers)
    det = {str(d["EenheidNummer"]): d for d in get_json(f"https://www.sshxl.nl/api/v1/offer/getOffersDetails?wocasIds={ids}")}
    out = []
    for o in offers:
        d = det.get(str(o["WocasId"]), {})
        a = (d.get("ADRES_H") or [{}])[0]
        m2 = (d.get("ASP_TOTAAL_C") or [{}])[0].get("TotOpp")
        plaats = (a.get("Plaats") or "").title()
        huur = float(o.get("NettoHuur") or 0)
        zelf = d.get("Soort_Product") == "zelf" or o.get("UnitType") == "Woning"
        out.append({
            "id": f"ssh:{o['WocasId']}", "bron": "SSH (Utrecht, Rotterdam, Zwolle e.a.)", "bronHost": "www.sshxl.nl",
            "adres": " ".join(str(x) for x in [a.get("Straatnaam"), a.get("Nummer"), a.get("Letter"), a.get("Toevoeging")] if x),
            "postcode": (a.get("Postcode") or "").replace(" ", ""), "plaats": plaats, "wijk": "",
            "lat": None, "lon": None, "huur": huur, "totaal": float(o.get("BruttoHuur") or huur),
            "type": "zelfstandig" if zelf else "kamer", "m2": m2, "kamers": None, "huisgenoten": None,
            "toewijzing": "inschrijfduur", "doelgroep": "studenten", "sector": "student",
            "label": f"{o.get('ContractType','')} · {o.get('Kind','')}".strip(" ·"),
            "huurtoeslag": bool(o.get("SubsidiabeleHuur")) and zelf,
            "sluit": (o.get("ExpireBy") or "")[:16] or None, "geplaatst": (o.get("PublishedOn") or "")[:16] or None,
            "foto": (o.get("Image") or {}).get("FilePathNL"),
            "fotos": [x for x in [(o.get("Image") or {}).get("FilePathNL")] if x],
            "omschrijving": "", "beschikbaar": (o.get("ContractStartDate") or "")[:10] or None,
            "kenmerken": [x for x in [o.get("ContractType"), {"Bezichtiging": "Toewijzing via bezichtiging", "Kennismakingsavond": "Toewijzing via kennismakingsavond"}.get(o.get("Kind"), o.get("Kind")), "Huurtoeslag mogelijk" if o.get("SubsidiabeleHuur") and zelf else None] if x],
            "url": "https://www.sshxl.nl/en/rental-offer/long-stay",
        })
    return out


# ---------------------------------------------------------------- browserbronnen
async def _dak(ctx, sub):
    host = f"{sub}.mijndak.nl"
    pg = await ctx.new_page()
    got = []

    async def on_resp(r):
        if "HaalUitgelogdAanbod" in r.url:
            try:
                got.append(await r.json())
            except Exception:
                pass
    pg.on("response", on_resp)

    def lijst():
        return [x for g in got for x in ((g.get("data") or {}).get("PublicatieLijst") or {}).get("List", [])]
    try:
        L = []
        for poging in range(3):
            if poging == 1:  # soms is eerst een sessie nodig via de homepage
                await pg.goto(f"https://{host}/", wait_until="domcontentloaded", timeout=45000)
            got.clear()
            try:
                async with pg.expect_response(lambda r: "HaalUitgelogdAanbod" in r.url, timeout=25000) as info:
                    await pg.goto(f"https://{host}/Woningaanbod", wait_until="domcontentloaded", timeout=45000)
                await info.value
                await pg.wait_for_timeout(300)
            except Exception:
                pass
            L = lijst()
            if L:
                break
    finally:
        await pg.close()
    out, seen = [], set()
    for p in L:
        if p["Id"] in seen or p.get("EenheidSoort") != "Woonruimte":
            continue
        seen.add(p["Id"])
        e, a, c = p.get("Eenheid") or {}, p.get("Adres") or {}, p.get("Cluster") or {}
        cluster = p.get("IsCluster")
        huur = float((c.get("PrijsMin") if cluster else e.get("NettoHuur")) or p.get("GepersonaliseerdeHuur") or 0)
        if huur < 150:
            continue
        lat = float((c if cluster else e).get("Breedtegraad") or 0) or None
        lon = float((c if cluster else e).get("Lengtegraad") or 0) or None
        label = p.get("PublicatieLabel") or ""
        dg = (c if cluster else e).get("Doelgroep") or ""
        model = p.get("PublicatieModel") or ""
        student = sub == "studentenwoning"
        detail = e.get("DetailSoort") or ""
        out.append({
            "id": f"dak:{sub}:{p['Id']}", "bron": DAK[sub], "bronHost": host,
            "adres": c.get("Naam") if cluster else " ".join(str(x) for x in [a.get("Straatnaam"), a.get("Huisnummer"), a.get("Huisletter"), a.get("HuisnummerToevoeging")] if x),
            "postcode": a.get("Postcode") or "", "plaats": a.get("Woonplaats") or "", "wijk": a.get("Wijk") or "",
            "lat": lat, "lon": lon, "huur": round(huur, 2), "totaal": float(e.get("Brutohuur") or huur),
            "type": "kamer" if (detail.lower() == "kamer" or "onzelfstandig" in label.lower()) else "zelfstandig",
            "m2": float(e.get("WoonVertrekkenTotOpp") or 0) or None,
            "kamers": e.get("AantalKamers") or None, "huisgenoten": None,
            "toewijzing": "loting" if "loting" in model.lower() else ("vrije sector" if "vrije" in model.lower() else "inschrijfduur"),
            "doelgroep": "studenten" if student else doelgroep_van(label, dg if dg in ("Senioren", "Jongeren", "Zorg") else ""),
            "sector": sector_van(huur, p.get("PublicatieModule") or "", student),
            "label": " · ".join(x for x in [label, detail, p.get("ContractVorm") if "onbepaalde" not in (p.get("ContractVorm") or "").lower() else ""] if x),
            "huurtoeslag": None, "sluit": (p.get("EinddatumTijd") or "")[:16] or None,
            "geplaatst": (p.get("PublicatieDatum") or "")[:16] or None,
            "foto": p.get("Foto_Locatie"), "cluster": bool(cluster),
            "fotos": [x for x in [p.get("Foto_Locatie")] if x],
            "omschrijving": ((p.get("PublicatieOmschrijving") or {}).get("Tekst") or "").strip(),
            "beschikbaar": (p.get("Opleverdatum") or "")[:10] or None,
            "kenmerken": [x for x in [
                f"Energielabel {e['EnergieLabel']}" if e.get("EnergieLabel") else None,
                e.get("DetailSoort"), e.get("SoortBouw"),
                "Lift" if p.get("HeeftLift") else None,
                f"Verdieping {p['Verdieping']}" if str(p.get("Verdieping") or "").isdigit() else None,
                p.get("ContractVorm"), f"Verhuurder: {e['Eigenaar']}" if e.get("Eigenaar") else None,
                (e.get("Toegankelijkheid") if e.get("Toegankelijkheid") and "zonder bijzondere" not in e.get("Toegankelijkheid", "") else None),
            ] if x],
            "url": f"https://{host}/HuisDetails?PublicatieId={p['Id']}",
        })
    return out


async def _rijnmond(ctx):
    pg = await ctx.new_page()
    got, state = [], {"next": True, "pages": 0}

    async def on_resp(r):
        if "graphql" in r.url:
            try:
                j = await r.json()
                hp = (j.get("data") or {}).get("housingPublications")
                if hp:
                    got.extend(e["node"] for e in hp["nodes"]["edges"])
                    state["next"] = bool((hp["nodes"].get("pageInfo") or {}).get("hasNextPage"))
                    state["pages"] += 1
            except Exception:
                pass
    pg.on("response", on_resp)
    try:
        await pg.goto("https://www.woonnetrijnmond.nl/nl-NL/aanbod", wait_until="domcontentloaded", timeout=60000)
        for _ in range(60):  # wacht op de eerste pagina resultaten
            if state["pages"]:
                break
            await pg.wait_for_timeout(250)
        w = pg.get_by_role("button", name="Weigeren")
        try:
            await w.first.click(timeout=4000)
            await pg.wait_for_timeout(500)
        except Exception:
            pass
        fouten = 0
        while state["next"] and fouten < 4 and state["pages"] < 60:
            voor = state["pages"]
            try:
                await pg.get_by_role("button", name="Meer laden").first.click(timeout=6000)
            except Exception:
                fouten += 1
                await pg.wait_for_timeout(800)
                continue
            for _ in range(40):
                if state["pages"] > voor:
                    break
                await pg.wait_for_timeout(150)
            else:
                fouten += 1
    finally:
        await pg.close()
    out, seen = [], set()
    alloc = {"Inschrijfduur": "inschrijfduur", "WoningLoting": "loting", "Loting": "loting",
             "DirectTeHuur": "wie eerst komt", "Direct te huur": "wie eerst komt"}
    for n in got:
        if n["id"] in seen:
            continue
        seen.add(n["id"])
        u = n.get("unit") or {}
        huur = float(((u.get("basicRent") or {}).get("exact")) or ((u.get("basicRent") or {}).get("min")) or 0)
        if huur < 150:
            continue
        loc = u.get("location") or {}
        try:
            pc_nr = base64.b64decode(loc.get("id", "")).decode().split(":", 1)[1].split(";")
            postcode, nr = pc_nr[0], pc_nr[1]
        except Exception:
            postcode, nr = "", ""
        highlights = " ".join(h.get("description", "") for h in n.get("highlights") or [])
        avail = (u.get("availableFor") or {}).get("name", "")
        area = max([(d["node"].get("surfaceArea") or 0) for d in (u.get("dimensions") or {}).get("edges", [])] or [0])
        thumbs = (u.get("thumbnails") or {}).get("edges") or []
        bed = (u.get("numberOfBedrooms") or {}).get("exact") or 0
        out.append({
            "id": f"rijnmond:{n['id']}", "bron": "Woonnet Rijnmond", "bronHost": "www.woonnetrijnmond.nl",
            "adres": loc.get("addressLine1", ""), "postcode": postcode, "huisnr": nr,
            "plaats": loc.get("addressLine2", ""), "wijk": "", "lat": None, "lon": None,
            "huur": round(huur, 2), "totaal": float((u.get("grossRent") or {}).get("exact") or huur),
            "type": "zelfstandig", "m2": round(area / 1e6) if area else None,
            "kamers": bed + 1 if bed else None, "huisgenoten": None,
            "toewijzing": alloc.get((n.get("allocationProcess") or {}).get("name", ""), "overig"),
            "doelgroep": doelgroep_van(highlights, avail, u.get("suitability") or ""),
            "sector": sector_van(huur, highlights),
            "label": " · ".join(x for x in [highlights, avail if avail not in ("Iedereen", "") else ""] if x),
            "huurtoeslag": None, "sluit": None, "geplaatst": (n.get("startTime") or "")[:16] or None,
            "foto": thumbs[0]["node"]["url"] if thumbs else None,
            "fotos": [t["node"]["url"] for t in thumbs][:15],
            "omschrijving": (u.get("description") or "").strip(),
            "beschikbaar": None, "slaapkamers": bed or None,
            "kenmerken": [x for x in [
                f"Energielabel {(u.get('energyRating') or {}).get('name')}" if (u.get("energyRating") or {}).get("name") else None,
                f"{bed} slaapkamer{'s' if bed != 1 else ''}" if bed else None,
                "Tijdelijk contract" if u.get("endDateTemporaryRentalAgreement") else None,
                avail if avail and avail != "Iedereen" else None,
            ] if x],
            "url": "https://www.woonnetrijnmond.nl/nl-NL/aanbod/advertentie/" + ((u.get("slug") or {}).get("value") or ""),
        })
    return out


async def fetch_browser_sources(report, parallel=4):
    """report(naam, items|None, fout|None) wordt per bron aangeroepen zodra die klaar is.
    Bronnen lopen parallel in één browser; afbeeldingen en lettertypen worden niet geladen."""
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(user_agent=UA["User-Agent"], locale="nl-NL")
        await ctx.route("**/*", lambda route: route.abort()
                        if route.request.resource_type in ("image", "font", "media") else route.continue_())
        sem = asyncio.Semaphore(parallel)

        async def run(naam, coro_fn):
            async with sem:
                try:
                    report(naam, await coro_fn(), None)
                except Exception as e:
                    report(naam, None, f"{type(e).__name__}: {e}"[:200])
        try:
            await asyncio.gather(run("Woonnet Rijnmond", lambda: _rijnmond(ctx)),
                                 *[run(DAK[sub], lambda sub=sub: _dak(ctx, sub)) for sub in DAK])
        finally:
            await browser.close()


ALL_SOURCES = [v[0] for v in ZIG.values()] + ["SSH (Utrecht, Rotterdam, Zwolle e.a.)"] + list(DAK.values()) + ["Woonnet Rijnmond"]
