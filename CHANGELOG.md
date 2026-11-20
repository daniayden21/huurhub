# Changelog

## 2026-11-20
### Toegevoegd
- Projectdocumentatie: CLAUDE.md, PROJECT_CONTEXT.md, DATA_SOURCES.md, BUSINESS_MODEL.md, FINANCIALS.md, GROWTH_PLAN.md, DECISIONS.md, TODO.md en CHANGELOG.md.
- `tools/financieel_model.py`: rekenmodel voor de scenario's en unit economics.
- Vermelding "HuurHub is een product van Optivue" in de footer.
- Homepage volgens de brief: hero, zoekmodule, populaire huurwoningen, steden, provinciekaart en Waarom HuurHub.
- Woningdetailpagina's met galerij, kenmerken, locatie en vergelijkbare woningen.
- Zoekpagina met minimale en maximale prijs, kamers, oppervlakte, beschikbaarheid en sorteren op prijs.
- Mijn woningen: favorieten en reacties per status, met notities.
- Inhoudspagina's: Hoe werkt het?, Over ons, Contact, Veelgestelde vragen, Woning plaatsen, Inloggen, Privacy en Voorwaarden.
- 11 extra bronnen: Brabant, Zeeland, Limburg, Almere, Gooi, Drechtsteden, Gouda en Groningen.

### Gewijzigd
- Browserbronnen lopen parallel en laden geen afbeeldingen meer: een ronde duurt ±15 seconden in plaats van ±2 minuten. Interval 5/10 minuten.
- Huisstijl naar navy/oranje met het aangeleverde logo.

### Infrastructuur
- Repository op GitHub (daniayden21/huurhub). `.gitignore` sluit `.env`, sleutels, `data/` (persoonsgegevens), `.venv` en `archief/` uit.

## 2026-11-19
- Eerste versie: 26 bronnen, kaart met live verversing, reactie-tracker.
