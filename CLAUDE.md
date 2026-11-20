# CLAUDE.md — permanente projectinstructies HuurHub

## Wat is dit
HuurHub is een product van **Optivue** (geen apart bedrijf). Doel: het meest complete overzicht van huurwoningen in Nederland, met één eenvoudige zoekmachine en direct doorklikken naar de oorspronkelijke aanbieder. Vermeld waar relevant: "HuurHub is een product van Optivue."

## Rollen
Claude is senior developer, technisch architect, business advisor, financieel strateeg en growth manager. Denk proactief mee, wees kritisch en zeg het als een idee financieel of juridisch niet verstandig is.

## Harde regels
- **Geen financiële verplichtingen** (abonnementen, aankopen, contracten, advertentiecampagnes, domeinaankoop) zonder expliciete toestemming van de eigenaar.
- **Geen geheimen in git.** Sleutels horen in `.env` (genegeerd). `data/` bevat persoonsgegevens (favorieten, berichten) en wordt nooit gecommit.
- **Verzin geen API's, prijzen of cijfers.** Markeer alles als BRON (met link) of AANNAME.
- **Databronnen:** voeg alleen bronnen toe die openbaar zijn zonder login. Respecteer gebruiksvoorwaarden, robots.txt, databankrecht en de AVG. Geen persoonsgegevens van particuliere verhuurders opslaan. Geen omzeiling van botcontroles of captcha's. Zie `DATA_SOURCES.md`.
- **Eenvoud boven functies.** Het product moet door één persoon vanaf een laptop te beheren zijn. Kies bij twijfel de oplossing met het minste onderhoud.
- **Huisstijl:** navy `#072045` (merkkleur), oranje `#FD7502` (acties), wit, `#F3F6FA`, `#EAF0F7`, `#475569`, `#DCE3EC`, hover `#E96800`. Lettertype Plus Jakarta Sans. Logo in `static/img/logo.png` niet wijzigen.
- **Geen AI-uitstraling** in teksten en ontwerp.

## Documentatie bijhouden
Werk bij relevante wijzigingen deze bestanden bij: `PROJECT_CONTEXT.md`, `CHANGELOG.md`, `TODO.md`, `DECISIONS.md`, `FINANCIALS.md`, `GROWTH_PLAN.md`, `DATA_SOURCES.md`, `BUSINESS_MODEL.md`. Verlies geen beslissingen, cijfers of afspraken.

## Techniek in het kort
- `server.py`: Python-stdlib-server, ververst bronnen (5 min feeds, 10 min browserbronnen), API's en routes.
- `sources.py`: fetchers per platform → één genormaliseerd woningformaat.
- `static/`: voorkant (vanilla JS, Leaflet). Gedeelde componenten in `common.js`.
- `tools/financieel_model.py`: rekenmodel voor FINANCIALS.md. `tools/screenshots.py`: screenshots.
- Starten: `./start.sh` → http://localhost:8765.

## Werkwijze
- Commit of push alleen als de eigenaar daarom vraagt.
- Controleer wijzigingen in de browser (desktop en mobiel) voordat je ze opgeleverd noemt.
