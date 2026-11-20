# Beslissingen

_Formaat: ID · datum · status · beslissing · reden. Status: **genomen**, **advies** (wacht op de eigenaar) of **open**._

| ID | Datum | Status | Beslissing | Reden |
|---|---|---|---|---|
| D-001 | 19-11-2026 | genomen | HuurHub draait op een Python-server zonder framework, met JSON-bestanden en een vanilla-JS-voorkant. | Eenvoudig, geen bouwstap, door één persoon te beheren. |
| D-002 | 19-11-2026 | genomen | Alleen openbare bronnen zonder login. Geen botcontroles of captcha's omzeilen. | Juridisch en ethisch. Pararius, Huurwoningen.nl en Kamer.nl blokkeren automatisch bezoek. |
| D-003 | 20-11-2026 | genomen | Huisstijl: navy, oranje, Plus Jakarta Sans en het aangeleverde logo, zonder AI-uitstraling. | Brief van de eigenaar. |
| D-004 | 20-11-2026 | **advies** | Vóór de publieke lancering een jurist laten toetsen: databankrecht, voorwaarden van bronnen, AVG en foto's. | Uitspraak C-202/12 (GasPedaal) en de AP-handreiking over scraping. Dit is het grootste risico voor het bestaan van HuurHub. |
| D-005 | 20-11-2026 | **advies** | Uitbreiden via **affiliatefeeds** (Huurwoningen.nl, Kamer.nl, Huurzone) en **toestemming** van ZIG, WoningNet en Embrace; Pararius en Funda niet scrapen. | Legaal, gratis, levert geld op en dekt de vrije sector. |
| D-006 | 20-11-2026 | **open** | Prijs en vorm van Pro: €4,99 per maand doorlopend, of zoekpassen (€5,99 per maand / €14,99 voor 3 maanden, zonder automatische verlenging). | Zoeken is tijdelijk; een pas past beter en geeft minder klachten. Zie BUSINESS_MODEL.md §3. |
| D-007 | 20-11-2026 | **advies** | Bij de lancering geen advertentienetwerk en geen advertentie bij het doorverwijzen. Wel contextuele partnerlinks. | Google verbiedt advertenties op exit- en tussenschermen; de opbrengst is laag (±€90 per maand bij 5.000 MAU); een cookiebanner schaadt de gebruikerservaring. |
| D-008 | 20-11-2026 | **open** | Merknaam en domein: huurhub.nl en huurhub.com zijn bezet (whois 20-11-2026, geen actieve site). Kies uit: (a) de eigenaar benaderen voor overname, (b) een alternatief domein (bijvoorbeeld huur-hub.nl is vrij), (c) een andere naam. Eerst het merkenregister (BOIP) controleren. | Zonder eigen .nl-domein en merkrecht bouw je SEO op een onzekere basis. |
| D-009 | 20-11-2026 | **advies** | Hosting: één VPS (± €20 per maand) met HTTPS. Supabase Free alleen voor accounts. Geen Vercel of serverless. | Playwright heeft een volwaardige server nodig. Eén machine is het eenvoudigst te beheren. |
| D-010 | 20-11-2026 | **advies** | Google Fonts, Leaflet en de kaarttegels zelf hosten of via een betaalde tegelprovider. | Privacy (IP-adressen naar Google) en het OSM-gebruiksbeleid. |
| D-011 | 20-11-2026 | **advies** | Betaalde marketing alleen met meting en een stopregel (meer dan €2 per MAU na €150 = stoppen). | Paid acquisition verdient zich niet terug via Pro (±€55 per betalende klant tegenover ±€9 LTV). |
