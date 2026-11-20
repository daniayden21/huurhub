# Financiën HuurHub

_Laatst bijgewerkt: 20 november 2026. Rekenmodel: `python3 tools/financieel_model.py`. Alle omzet is **exclusief btw**._

**Legenda:** **BRON** = gevonden prijs of benchmark (met link, nog bij de leverancier verifiëren vóór je een besluit neemt). **SCHATTING** = eigen aanname. Er zijn **nog geen offertes** opgevraagd.

## 1. Huidige kosten (november 2026)
| Post | Kosten | Toelichting |
|---|---|---|
| Hosting | €0 | Draait lokaal op de laptop |
| Databronnen | €0 | Openbare portalen, geen betaalde API's |
| Geocoding (PDOK) | €0 | Gratis dienst van de overheid |
| Kaart (OpenStreetMap) | €0 | Niet geschikt voor zwaar commercieel gebruik |
| GitHub | €0 | |
| **Totaal** | **€0 per maand** | |

## 2. Kostenoverzicht bij lancering
### Eenmalig
| Post | Bedrag | Soort |
|---|---|---|
| Juridisch advies (databankrecht, voorwaarden, privacy) | €1.000–2.500 | SCHATTING |
| Merkregistratie "HuurHub" Benelux (BOIP, 1 klasse) | ±€250 | SCHATTING, tarief controleren op boip.int |
| Domeinnaam: alternatief (bijvoorbeeld huur-hub.nl is vrij) of overname van huurhub.nl | €10 tot onbekend | huurhub.nl en .com zijn bezet (whois, 20-11-2026) |
| Ontwikkeling van accounts, betalen en meldingen | €0 aan geld (eigen tijd) | |

### Vaste maandlasten (excl. btw)
| Post | Bedrag/maand | Soort | Toelichting |
|---|---|---|---|
| VPS (4 vCPU, 8 GB, met snapshots) | ±€20 | SCHATTING | Hetzner verhoogde de prijzen in 2026 met 30–37% en beperkt de beschikbaarheid ([heise](https://heise.de/-11185981), [Hetzner docs](https://docs.hetzner.com/de/general/infrastructure-and-availability/price-adjustment/)). Vergelijk vóór aankoop met andere aanbieders. |
| Domein | ±€1 | SCHATTING | ±€12 per jaar |
| Database en accounts (Supabase Free) | €0 | BRON | Gratis tot ±50.000 MAU; Pro kost $25 per maand ([Supabase](https://supabase.com/pricing)) |
| E-mail (Resend Free) | €0 | BRON | 3.000 mails per maand en 100 per dag gratis; Pro ±$20 per maand voor 50.000 mails ([Resend](https://resend.com/pricing)) |
| Statistieken (zelf gehost, zonder cookies) | €0 | SCHATTING | Geen cookiebanner nodig |
| Monitoring (gratis laag) | €0 | SCHATTING | |
| **Totaal vast** | **±€21** | | |

### Variabel en meegroeiend
| Post | Bedrag | Soort | Wanneer |
|---|---|---|---|
| Betaalkosten per transactie | €0,25–0,35 | BRON (bandbreedte), [Mollie/Stripe-vergelijking](https://payrequest.io/nl/guides/mollie-vs-stripe) | Per Pro-betaling |
| E-mail Pro | ±€19 per maand | BRON | Boven 3.000 mails per maand (±100 Pro-leden met dagelijkse meldingen) |
| Kaarttegels bij een betaalde provider | ±€25 per maand | SCHATTING, offerte nodig | Vanaf ±3.000 MAU |
| Tweede of zwaardere server | ±€20 per maand | SCHATTING | Vanaf ±8.000 MAU |
| Supabase Pro | ±€24 per maand | BRON | Vanaf ±50.000 MAU |
| Marketing | €0–1.200 per maand | Keuze | Zie GROWTH_PLAN.md |

**Kosten per gebruiker:** zonder marketing ±€0,02 per MAU per maand. De kosten zijn geen risico; de omzet per gebruiker is laag.

## 3. Scenario's per maand (stabiele maand, zonder marketing en eenmalige kosten)
Aannames: Pro €4,99 incl. btw, 40% opzegging per maand, betalend = 1% / 2% / 3,5% van MAU, affiliate ±€0,045 per MAU, geen advertenties.

| MAU | Scenario | Betalend | Omzet Pro | Omzet affiliate | Omzet totaal (excl. btw) | Kosten | Netto operationeel resultaat |
|---|---|---|---|---|---|---|---|
| 500 | conservatief | 5 | €21 | €22 | €43 | €23 | €20 |
| 500 | realistisch | 10 | €41 | €22 | €64 | €24 | €39 |
| 500 | ambitieus | 18 | €74 | €22 | €97 | €27 | €69 |
| 1.000 | conservatief | 10 | €41 | €45 | €86 | €24 | €62 |
| 1.000 | realistisch | 20 | €82 | €45 | €127 | €28 | €99 |
| 1.000 | ambitieus | 35 | €144 | €45 | €189 | €33 | €156 |
| 5.000 | conservatief | 50 | €206 | €225 | €431 | €82 | €349 |
| 5.000 | realistisch | 100 | €412 | €225 | €637 | €100 | €537 |
| 5.000 | ambitieus | 175 | €722 | €225 | €947 | €126 | €820 |
| 10.000 | conservatief | 100 | €412 | €450 | €862 | €120 | €742 |
| 10.000 | realistisch | 200 | €825 | €450 | €1.275 | €155 | €1.120 |
| 10.000 | ambitieus | 350 | €1.443 | €450 | €1.893 | €208 | €1.686 |

**Break-even:**
- **Zonder marketing:** al vanaf ±300 MAU, omdat de vaste kosten zo laag zijn.
- **Met €800 marketing per maand** (realistisch, juni 2027): pas boven ±7.000 MAU.
- **Om er €3.000 per maand aan over te houden:** bij €4,99 en 2% conversie heb je ±25.000–30.000 MAU nodig. Met €7,99 of een hogere conversie is dat minder.

## 4. Cashflow tot 1 juli 2027
Zie GROWTH_PLAN.md voor de maandtabellen. Benodigde investering (eenmalige kosten, hosting en marketing, min de omzet):

| Scenario | Eenmalig | Marketing dec–jun | Cumulatief resultaat op 30 juni 2027 |
|---|---|---|---|
| Conservatief | €1.500 | €1.050 | **−€2.216** |
| Realistisch | €2.500 | €2.400 | **−€3.650** |
| Ambitieus | €3.500 | €4.400 | **−€3.790** (vanaf mei per maand winstgevend) |

**Benodigde buffer:** houd ±€4.500 beschikbaar (realistisch plus 25% onvoorzien).

## 5. Omzet, winst, cashflow en btw
- **Omzet:** wat je factureert exclusief btw. Bij €4,99 incl. btw is dat €4,12.
- **Btw:** €0,87 per €4,99 gaat naar de Belastingdienst (aangifte per kwartaal via Optivue). Dit is geen omzet.
  - **Kleineondernemersregeling (KOR):** heeft Optivue minder dan €20.000 omzet per jaar en doet het mee aan de KOR, dan reken je geen btw. Dan blijft €4,99 omzet, maar je kunt geen btw terugvragen op kosten. Overleg met je boekhouder; dit scheelt bij lage aantallen ±17%.
- **Winst:** omzet min alle kosten, inclusief marketing en afschrijving van de eenmalige kosten. Over de winst betaalt Optivue inkomsten- of vennootschapsbelasting.
- **Cashflow:** wat er echt op de rekening binnenkomt en afgaat. Affiliatevergoedingen worden vaak pas 1–2 maanden na de lead uitbetaald, na goedkeuring.

## 6. Advies
1. De kosten zijn geen probleem. **Groei en omzet per gebruiker** zijn de opgaven.
2. Geef pas geld uit aan betaalde marketing als je meting werkt (UTM-codes plus statistieken).
3. Vraag offertes op voor de VPS en de kaarttegels voordat je publiek gaat. Daarna worden de SCHATTINGEN in dit document BRON.
