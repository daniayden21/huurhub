# HuurHub

_HuurHub is een product van Optivue._

Alle huurwoningen van Nederland overzichtelijk op één plek. HuurHub haalt het openbare aanbod op van 26 verhuurportalen (woningcorporaties en studentenhuisvesters) en toont het op een kaart en in een lijst.

## Starten

```bash
./start.sh
```

Open daarna http://localhost:8765. De eerste keer installeert `start.sh` de benodigdheden.

## Pagina's

| Adres | Inhoud |
|---|---|
| `/` | Homepage: zoekmodule, populaire huurwoningen, steden, provinciekaart, waarom HuurHub |
| `/woningen` | Zoeken op kaart en lijst, met filters, sortering en favorieten |
| `/woningen#mijn` | Mijn woningen: favorieten en reacties per status, met notities |
| `/woning?id=…` | Detailpagina met fotogalerij, kenmerken, locatie en link naar de aanbieder |
| `/hoe-werkt-het`, `/over-ons`, `/contact`, `/veelgestelde-vragen`, `/woning-plaatsen`, `/inloggen`, `/privacy`, `/voorwaarden` | Inhoudspagina's |

## Opbouw

- `server.py` is een Python-server zonder framework. Hij ververst de openbare feeds elke 5 minuten en de sites die een browser nodig hebben elke 10 minuten. Daarnaast levert hij de API's en de pagina's.
  - `GET /api/listings`: alle woningen (lichte versie)
  - `GET /api/woning?id=`: één woning met foto's, omschrijving, kenmerken en vergelijkbare woningen
  - `GET /api/summary`: cijfers, populaire woningen, steden en provincies voor de homepage
  - `GET/POST /api/tracker`: favorieten en reacties
  - `POST /api/bericht`: contact- en aanmeldformulieren, opgeslagen in `data/berichten.json`
  - `GET /api/geocode?q=`: plaats naar coördinaten (PDOK Locatieserver)
- `sources.py` bevat per platform een fetcher die het aanbod omzet naar één vast formaat.
- `static/` bevat de voorkant:
  - `style.css`: huisstijl (navy `#072045`, oranje `#FD7502`, Plus Jakarta Sans)
  - `common.js`: gedeelde componenten (`Navbar`, `Footer`, `PropertyCard`, `SearchBar`, iconen, favorieten)
  - `index.html`, `woningen.html` + `woningen.js`, `woning.html`, `pagina.html` + `pagina.js`
- `tools/screenshots.py` maakt de screenshots in `static/img/` opnieuw (de server moet daarvoor draaien).

## Nog niet gebouwd

- Echte accounts: Inloggen legt nu uit dat accounts binnenkort komen. Favorieten worden lokaal bewaard.
- Socialmedia-links in de footer wijzen nog nergens naar.
- Privacybeleid en voorwaarden zijn concepten die nog juridisch gecontroleerd moeten worden.

## Foto's

De stadsfoto's en de homepagefoto komen van Wikimedia Commons, onder vrije licenties. De naamsvermelding staat op `/over-ons`.
