# TODO

_Prioriteit: P1 = vóór de lancering, P2 = eerste maanden, P3 = later. **[jij]** = actie voor de eigenaar (kost geld, vraagt een handtekening of is contact met een derde)._

## P1: vóór de publieke lancering (december 2026 – januari 2027)
- [ ] **[jij]** Jurist met IE- en privacyervaring vragen om advies over databankrecht, bronvoorwaarden, AVG en foto's (D-004). Begroting €1.000–2.500.
- [ ] **[jij]** Merknaam controleren in het BOIP-register. Besluiten over domein en naam (D-008).
- [ ] **[jij]** Aanmelden bij Daisycon als publisher. Campagnes Huurwoningen.nl (17650), Kamer.nl (19459), Huurzone (15142) en Kamernet (447) aanvragen. Feedvoorwaarden lezen.
- [ ] **[jij]** Mail aan ZIG Websoftware, WoningNet (DĀK) en Embrace: toestemming en een eventuele officiële feed. (Ik kan conceptmails schrijven.)
- [ ] **[jij]** Offertes voor een VPS (4 vCPU/8 GB) en een kaarttegelprovider. Besluit Pro-prijs (D-006). KOR-status van Optivue navragen bij de boekhouder.
- [ ] Affiliatefeed-fetcher bouwen (XML/CSV) zodra de feedtoegang er is.
- [ ] Ontdubbelen op postcode + huisnummer + toevoeging (DATA_SOURCES.md §5).
- [ ] Bronbewaking: melding bij een daling van meer dan 50% of 3 mislukte rondes. Pas na 2 gemiste rondes verwijderen.
- [ ] Lettertype en Leaflet zelf hosten; overstappen op de gekozen tegelprovider.
- [ ] Cookieloze statistieken (Umami of GoatCounter, zelf gehost) met MAU-definitie en UTM.
- [ ] Deployment: VPS, systemd-service, HTTPS (Caddy), automatische back-up van `data/`.
- [ ] SEO: stadspagina's en provinciepagina's (server-side gerenderd), sitemap.xml, robots.txt, meta-tags en structured data.
- [ ] Footer: socialmedia-links invullen of weghalen. Juridische concepten laten controleren.

## P2: eerste maanden (februari – april 2027)
- [ ] Accounts (Supabase Auth) en favorieten per account in plaats van per apparaat.
- [ ] HuurHub Pro: meldingen per e-mail (dagelijkse samenvatting), 7 dagen proef, betalen via Mollie of Stripe.
- [ ] Referral: "deel met een vriend, allebei een maand Pro".
- [ ] Ontbrekende regio's: Friesland, Drenthe, Flevoland buiten Almere, Noord-Holland-Noord, Entree (nieuwe site).
- [ ] Engelstalige stadspagina's.
- [ ] Contextuele partnerlinks op de detailpagina (verhuizen, energie, internet).

## P3: later
- [ ] Inbound-feed voor makelaars en verhuurders (XML) via "Woning plaatsen".
- [ ] Gesprekken met Pararius, Funda en institutionele verhuurders, met gebruikerscijfers.
- [ ] Snelle meldingen (binnen 5 minuten) als extra Pro-functie, als gebruikers erom vragen.

## Klaar
- [x] 26 bronnen gekoppeld, live verversing (5/10 min), kaart, filters, detailpagina's, Mijn woningen (19–20 november 2026)
- [x] Huisstijl en logo, homepage volgens de brief (20 november 2026)
- [x] Op GitHub gezet, `.gitignore` voor geheimen en persoonsgegevens (20 november 2026)
- [x] Eerste businessmodel, financieel model en groeiplan (20 november 2026)
