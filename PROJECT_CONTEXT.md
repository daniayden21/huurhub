# Projectcontext HuurHub

_Laatst bijgewerkt: 20 november 2026_

## 1. Organisatie
- **Optivue** is het bedrijf van de eigenaar en ontwikkelt AI- en digitale oplossingen voor bedrijven.
- **HuurHub** is een product van Optivue, met een eigen merk, eigen website, eigen gebruikers en een eigen productstrategie.

## 2. Visie en doelen
- HuurHub moet het meest complete overzicht van huurwoningen in Nederland worden: vrijwel iedere online beschikbare huurwoning op één plek.
- Belangrijkste USP's: het grootste aanbod, zoveel mogelijk platforms, één zoekmachine, direct doorklikken naar de aanbieder, en eenvoudig en betaalbaar.
- **Hard doel: minimaal 5.000 MAU op 1 juli 2027.** Een MAU is een unieke gebruiker die in een kalendermaand minstens één zoekopdracht doet of een woning bekijkt. Het doel wordt gemeten over juni 2027.
- Het product moet grotendeels automatisch draaien en door één persoon te beheren zijn.

## 3. Huidige stand (november 2026)
| Onderdeel | Status |
|---|---|
| Aanbod | ±1.400 woningen uit 26 portalen (sociale huur, studenten, een deel middenhuur) |
| Website | Homepage, zoekpagina met kaart en filters, detailpagina's, Mijn woningen, inhoudspagina's |
| Hosting | Alleen lokaal op de laptop (`./start.sh`), nog niet online |
| Gebruikers | 0 (nog niet gelanceerd) |
| Accounts / betalen | Nog niet gebouwd. Favorieten worden lokaal bewaard. |
| Domein | huurhub.nl en huurhub.com zijn **al geregistreerd door een ander** (zie risico's) |
| Code | GitHub: daniayden21/huurhub (branch `main`) |

## 4. Technische architectuur
```
                ┌────────────── server.py (Python, alleen standaardbibliotheek) ──────────────┐
 Bronnen        │  verversen (threads)          opslag (data/*.json)        HTTP-API + pagina's │
 ZIG-portalen ──┼─► fetch_zig() elke 5 min ──┐                                                   │
 SSH-API ───────┼─► fetch_ssh() elke 5 min ──┼─► enrich(): PDOK-geocoding ──► snapshot.json ──► /api/listings
 WoningNet/DĀK ─┼─► Playwright (headless) ───┤   + provincie, first_seen      seen.json        /api/woning
 Woonnet Rijnm. ┼─► elke 10 min, 4 parallel ─┘                                geocache.json    /api/summary
                │                                                             tracker.json ◄── /api/tracker
                │                                                             berichten.json ◄ /api/bericht
                └─────────────────────────────────────────────────────────────────────────────┘
 Voorkant (static/): index.html · woningen.html+js · woning.html · pagina.html+js · common.js (componenten) · style.css
 Externe diensten in de browser: OpenStreetMap-tegels, unpkg (Leaflet), Google Fonts, foto's van aanbieders, Wikimedia-foto's
```
- **Genormaliseerd woningformaat:** id, bron, adres, postcode, plaats, wijk, lat/lon, provincie, huur, totaal, type, m², kamers, toewijzing, doelgroep, sector, sluit, beschikbaar, foto('s), omschrijving, kenmerken, url, nieuwSinds.
- **Verlopen advertenties:** een woning die niet meer in de bron staat, verdwijnt bij de volgende ronde. Woningen met een verlopen reactiedatum worden in de voorkant verborgen.
- **Dubbele advertenties:** nog niet afgehandeld (zie TODO).

## 5. Externe afhankelijkheden
| Afhankelijkheid | Waarvoor | Kosten nu | Risico |
|---|---|---|---|
| 26 portaalwebsites | Aanbod | €0 | Juridisch (toestemming), technisch (wijzigingen, blokkades) |
| PDOK Locatieserver | Adres → coördinaten | €0 (overheid) | Laag |
| OpenStreetMap-tegelserver | Kaart | €0 | Gebruiksbeleid staat geen zwaar commercieel gebruik toe; bij groei een andere tegelprovider nodig |
| unpkg.com | Leaflet-bibliotheek | €0 | Beter zelf hosten |
| Google Fonts | Lettertype | €0 | Privacy: IP-adres gaat naar Google; beter zelf hosten |
| Wikimedia Commons | Stadsfoto's | €0 | Naamsvermelding verplicht (staat op /over-ons) |
| Playwright + Chromium | Browserbronnen | €0 | Zwaar voor een kleine server |
| GitHub | Code | €0 | Laag |

## 6. Belangrijkste documenten
- `DATA_SOURCES.md`: alle bronnen, voorwaarden en prioriteiten
- `BUSINESS_MODEL.md`: verdienmodel en prijsadvies
- `FINANCIALS.md`: kosten, scenario's en break-even
- `GROWTH_PLAN.md`: weg naar 5.000 MAU
- `DECISIONS.md`: genomen en open beslissingen
- `TODO.md`: actiepunten
