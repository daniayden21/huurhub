# Databronnen HuurHub

_Laatst bijgewerkt: 20 november 2026. Prijzen en voorwaarden zijn alleen opgenomen als ze gevonden zijn; anders staat er "onbekend"._

## 1. Juridisch kader (lees dit eerst)
| Regel | Wat het betekent voor HuurHub | Bron |
|---|---|---|
| **Databankrecht** (Databankenwet / richtlijn 96/9) | Het Europese Hof oordeelde in 2013 dat de metazoekmachine GasPedaal het databankrecht van AutoTrack schond door die databank via zoekopdrachten te hergebruiken. HuurHub doet technisch iets vergelijkbaars. | [Innoweb/Wegener, C-202/12](https://www.scl.org/2984-database-right-innoweb-v-wegener-cjeu-judgment/), [IPKat](https://ipkitten.blogspot.com/2013/12/stepping-on-gaspedaal-cjeu-rules-on-re.html) |
| **Gebruiksvoorwaarden** van platforms | Veel platforms verbieden hergebruik van hun aanbod. Ook als een databank niet beschermd is, kunnen voorwaarden hergebruik contractueel beperken. | Per bron controleren |
| **AVG / scraping** | De Autoriteit Persoonsgegevens noemt het scrapen van persoonsgegevens door private partijen "bijna altijd illegaal". Woningadvertenties van corporaties bevatten nauwelijks persoonsgegevens; die van particulieren vaak wel (naam, telefoon). | [AP-handreiking via IAPP](https://iapp.org/news/a/netherlands-dpa-issues-guidance-against-web-scraping), [Dutch IT Channel](https://www.dutchitchannel.nl/news/433543/ap-scraping-is-bijna-altijd-illegaal) |
| **Auteursrecht op foto's** | Woningfoto's zijn van de aanbieder. Tonen via een directe link (hotlink) is gangbaar, maar niet zonder risico. | – |

**Conclusie:** de huidige aanpak (openbaar aanbod automatisch ophalen) is technisch sterk, maar juridisch kwetsbaar zodra HuurHub publiek en commercieel wordt. De oplossing is **toestemming en officiële koppelingen** (zie §4). Laat dit vóór de lancering toetsen door een jurist met IE-ervaring. Zie DECISIONS.md D-004.

## 2. Bronnen die nu gekoppeld zijn (26)
| Naam | Type aanbod | Dekking (nu) | Techniek | Toegang | Kosten | Prioriteit |
|---|---|---|---|---|---|---|
| 13 ZIG-portalen (Woonnet Haaglanden, Holland Rijnland, Klik voor Wonen, ZuidWest Wonen, Wooniezie, Thuis in Limburg, Mijn Woningzoeken, Woninghuren, De Woningzoeker, Stedendriehoek, Noord-Veluwe, Roommatch, Roomspot) | Sociale huur en studenten | ±800 woningen | Openbare JSON (`/portal/object/frontend/getallobjects`) | Openbaar, geen login. Toestemming niet gevraagd. | €0 | Hoog: toestemming vragen aan ZIG Websoftware |
| 11 WoningNet/DĀK-regio's (Amsterdam, Utrecht, Eemvallei, Almere, Gooi en Vecht, Woonkeus, Woongaard, Midden-Holland, Mijn Woonservice, Studentenwoningweb, Groningen Huurt) | Sociale huur, middenhuur, studenten | ±450 | Headless browser leest het eigen dataverzoek van de pagina | Openbaar, geen login. Toestemming niet gevraagd. | €0 | Hoog: toestemming vragen aan WoningNet |
| Woonnet Rijnmond | Sociale huur, middenhuur | ±115 | Headless browser (GraphQL-antwoorden van de pagina) | Openbaar. Toestemming niet gevraagd. | €0 | Hoog: toestemming vragen (platform Embrace) |
| SSH | Studenten | ±35 | Openbare JSON-API van de site | Openbaar. Toestemming niet gevraagd. | €0 | Middel |

**Strategische kans:** bijna al het sociale huuraanbod loopt via drie softwareleveranciers (ZIG Websoftware, WoningNet/DĀK en Embrace). Met een officiële afspraak met deze drie heb je in één keer het grootste deel van Nederland legaal en stabiel gedekt. Dat is de belangrijkste zakelijke stap voor de lancering.

## 3. Bronnen die nog ontbreken
| Naam | Type aanbod | Geschatte dekking | Technische mogelijkheid | Toegangsvoorwaarden | Kosten | Prioriteit |
|---|---|---|---|---|---|---|
| **Huurwoningen.nl** | Vrije sector, kamers | Groot (landelijk) | **Productfeed via affiliateprogramma** (Daisycon campagne 17650, ook Awin) | Aanmelden als affiliate. Toegestaan: feed en deeplinks; niet: promotiecodes en cashback. | €0. Je **ontvangt** €3–10 per lead (premium-proefaccount) | **Zeer hoog** |
| **Kamer.nl** | Kamers, studenten | Middel | **Productfeed via Daisycon** (campagne 19459) | Aanmelden; keyword-marketing niet toegestaan | €0. Je ontvangt €1–20 per lead | **Zeer hoog** |
| **Huurzone** | Vrije sector | Onbekend | Feed "op maat" via Daisycon (campagne 15142) | Aanmelden | €0. Je ontvangt €0–4 (pagina mogelijk verouderd) | Hoog |
| Huurstunt | Vrije sector | Onbekend | Affiliate via Daisycon (11314); feed onbekend | Aanmelden | €0; vergoeding onbekend | Middel |
| Kamernet | Kamers, studenten | Groot (studenten) | Affiliate via Daisycon (447), **geen feed gevonden** | Aanmelden | €0. Je ontvangt €2–5 per lead | Middel: alleen doorverwijzen |
| Pararius | Vrije sector | Zeer groot | **Geen openbare API** gevonden. Scrapers bestaan (Apify), maar zijn waarschijnlijk in strijd met de voorwaarden. | Direct contact nodig | Onbekend | Hoog: partnerschap verkennen. **Niet scrapen.** |
| Funda (huur) | Vrije sector via makelaars | Groot | API alleen voor aangesloten makelaars (volgens een derde bron); geen openbare API | Partnerschap via Funda in Business | Onbekend | Middel: verkennen |
| HousingAnywhere | Middellang verblijf, expats | Middel | Geen affiliate- of feedprogramma gevonden (eigenaar van Kamernet) | Direct contact | Onbekend | Laag |
| Entree (Arnhem-Nijmegen) | Sociale huur | Middel | Nieuwe site sinds 24 november 2026; techniek nog onbekend | Openbaar? | €0 | Hoog: na lancering bekijken |
| SSH& (Nijmegen/Arnhem) | Studenten | Middel | Aanbod alleen na inloggen | Partnerschap nodig | Onbekend | Middel |
| Friesland, Drenthe, Zeeland-Noord, Noord-Holland-Noord, Flevoland (buiten Almere) | Sociale huur | Gaten in de kaart (Friesland 0, Drenthe 1 woning) | Portalen nog niet gevonden | – | €0 | Hoog: regio's in kaart brengen |
| Institutionele verhuurders (Vesteda, Bouwinvest, Heimstaden, Holland2Stay, Xior e.a.) | Middenhuur, vrije sector, studenten | Groot | Eigen websites; feeds onbekend | Direct contact; zij willen bereik | Onbekend | Middel-hoog |
| Makelaars via CRM (Realworks, Kolibri, Goes) | Vrije sector | Zeer groot (op termijn) | Realworks-API werkt alleen als de makelaar de koppeling activeert. Een XML-feed per makelaar is gangbaar (vergelijk Huispedia, Jaap). | Opt-in per makelaar | €0 voor de makelaar (zoals bij Huispedia) | Middel: "Woning plaatsen"-route na de lancering |
| Particuliere verhuurders | Kamers, woningen | Middel | Aanmelden via HuurHub ("Woning plaatsen") | Eigen voorwaarden; AVG beheren | €0 | Laag tot middel |

Bronnen: [Huurwoningen partnerprogramma](https://www.huurwoningen.nl/en/content/become-an-affiliate-partner-of-huurwoningen/), [Daisycon Huurwoningen](https://daisycon.com/campaigns/17650-huurwoningen-nl), [Daisycon Kamer.nl](https://daisycon.com/nl/campagnes/19459-kamer-nl-nl), [Daisycon Huurzone](https://www.daisycon.com/en/campaigns/15142-huurzone-nl), [Daisycon Huurstunt](https://daisycon.com/be/campagnes/11314-huurstunt), [Daisycon Kamernet](https://daisycon.com/nl/campagnes/447-kamernet), [Pararius-scraper (Apify)](https://apify.com/unfenced-group/pararius-scraper/api), [pyfunda](https://pypi.org/project/pyfunda/2.9.0/), [Brixxs over Realworks-API](https://brixxs.com/faq/hoe-kan-ik-een-api-koppeling-maken-met-realworks/), [Huispedia voor makelaars](https://huispedia.nl/voor-makelaars).

**Let op:** de vergoedingen zijn per Daisycon-taalversie verschillend. Controleer de actuele voorwaarden in het Daisycon-dashboard na aanmelding.

## 4. Advies: volgorde van uitbreiden
1. **Affiliatefeeds (Huurwoningen.nl, Kamer.nl, Huurzone):** legaal, geen kosten, ze **leveren geld op** en vullen het grootste gat (vrije sector). Kost ongeveer 1–2 dagen bouwen per feed.
2. **Toestemming van ZIG, WoningNet en Embrace** voor het sociale aanbod dat al werkt. Bied een duidelijke doorverwijzing en bronvermelding aan; corporaties willen dat woningen bij de juiste mensen terechtkomen.
3. **Ontbrekende regio's** in Friesland, Drenthe en Flevoland in kaart brengen.
4. **Institutionele verhuurders** benaderen voor een feed (bereik in ruil voor aanbod).
5. **Pararius en Funda:** pas benaderen met gebruikerscijfers in de hand. Zonder afspraak niet koppelen.

Betaalde databronnen: er is geen betaalde huur-API gevonden die aantoonbaar veel extra aanbod oplevert. Scraping-diensten zoals Apify-actors zijn goedkoop, maar verplaatsen het juridische risico alleen maar. Advies: daar **niet** in investeren.

## 5. Synchronisatie, dubbelingen en actualiteit
- **Synchronisatie:** werkt al. Feeds elke 5 minuten, browserbronnen elke 10 minuten. Affiliatefeeds komen meestal als XML of CSV, die je elk uur kunt ophalen.
- **Dubbele advertenties (nog bouwen):** sleutel = postcode + huisnummer + toevoeging. Valt die samen, dan behandel je huur ±5% en m² ±3 als hetzelfde object. Toon één kaart met meerdere aanbieders ("Ook op Kamernet"). De oorspronkelijke verhuurder (corporatie) gaat vóór een doorverkoper.
- **Verlopen advertenties:** een woning die bij een ronde ontbreekt, wordt verwijderd (dat werkt al). Advies: pas na twee gemiste rondes verwijderen, om storingen op te vangen.
- **Actualiteit bewaken (nog bouwen):** per bron een waarschuwing als het aantal woningen meer dan 50% daalt ten opzichte van het gemiddelde van de afgelopen 7 dagen, of als een bron 3 rondes faalt. Melding via e-mail.
