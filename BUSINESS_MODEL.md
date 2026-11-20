# Verdienmodel en prijsstrategie

_Laatst bijgewerkt: 20 november 2026. Cijfers komen uit `tools/financieel_model.py`. Aannames zijn gemarkeerd._

## 1. Samenvatting
- **Gratis:** zoeken, kaart, alle woningen en doorklikken naar de aanbieder. Dit is de motor voor groei en moet gratis blijven.
- **HuurHub Pro:** meldingen bij nieuwe woningen, onbeperkt bewaren, uitgebreide filters en geen advertenties.
- **Affiliate-inkomsten:** een vergoeding als een gebruiker zich via HuurHub aanmeldt bij Huurwoningen.nl, Kamer.nl, Kamernet en vergelijkbare platforms. Dat is **net zo belangrijk als Pro** en kost de gebruiker niets.
- **Advertenties:** advies is om bij de lancering **geen** advertenties te tonen (zie §4).

## 2. Markt en concurrenten (prijzen gevonden, niet bij de bron zelf geverifieerd)
| Dienst | Wat je krijgt | Prijs | Bron |
|---|---|---|---|
| Rentbird | Meldingen vrije sector | ±€29/maand | [Uprent-review](https://uprent.nl/rental-platform-overview/rentbird), [NLCompass](https://www.nlcompass.com/guides/rentbird-vs-huurwoningen-netherlands) |
| Uprent | Meldingen | ±€22,95/maand | [Stekkies](https://www.stekkies.com/en/blog/advantages-of-stekkies-vs-uprent) |
| Huurportaal | Meldingen | ±€29,99/maand | [Uprent](https://uprent.nl/rental-platform-overview/huurportaal) |
| Huurwoningen.nl Premium | Reageren | ±€29,95/maand, 7 dagen gratis proef | [IamExpat](https://www.iamexpat.nl/housing/property-news/dutch-rental-sites-charge-house-hunters-contact-agents-investigation-finds), [proefperiode](https://www.huurwoningen.com/en/content/proefperiode) |
| Kamernet Premium | Reageren op kamers | ±€38 per 4 weken | [Inburgering.org](https://inburgering.org/nl/guides/find-rental-netherlands-guide) |

**Wat opvalt:** concurrenten vragen €23–38 per maand, maar richten zich bijna allemaal op de vrije sector. HuurHub is uniek met **sociale huur en studentenhuisvesting** van corporaties. Dat aanbod is gratis toegankelijk, maar versnipperd over tientallen portalen. Dit is je positie.

**Toezicht:** de Consumentenbond en media kaarten aan dat huursites onduidelijk zijn over kosten en over het verschil tussen een zoekdienst en contact met de verhuurder ([Emerce](https://www.emerce.nl/?p=4243902), [Consumentenbond](https://www.consumentenbond.nl/acties-claims/nieuws/2025/onduidelijkheid-bij-woningverhuursites-over-de-kosten)). HuurHub Pro moet dus heel duidelijk zijn: "Je betaalt voor meldingen en gemak. Reageren op een woning doe je altijd gratis of via de aanbieder."

## 3. Prijsadvies HuurHub Pro
Unit economics (AANNAME: 40% opzegging per maand, omdat mensen stoppen zodra ze een woning hebben; betaalkosten €0,35 per transactie):

| Prijs (incl. btw) | Netto per maand | Waarde per klant (LTV) |
|---|---|---|
| €4,99 | €3,77 | €9,43 |
| €5,99 | €4,60 | €11,50 |
| €7,99 | €6,25 | €15,63 |
| €9,99 | €7,91 | €19,77 |

**Advies:**
1. **€4,99 is goed als introductieprijs, maar aan de lage kant.** Het is een zesde van wat concurrenten vragen. Bij €4,99 gaat €0,87 naar btw en ±€0,35 naar de betaalprovider.
2. **Verkoop zoekpassen in plaats van (of naast) een doorlopend abonnement:** "Pro 1 maand €5,99" en "Pro 3 maanden €14,99", eenmalig betaald zonder automatische verlenging. Woningzoeken is tijdelijk, dus een pas past bij het gedrag. Het voorkomt ergernis en klachten over opzeggen, en eenmalige iDEAL/Wero-betalingen zijn eenvoudiger dan incasso. Let op: iDEAL gaat over naar Wero, met afronding tussen eind 2027 en 2028 ([Stripe](https://stripe.com/nl/resources/more/direct-debit-initiated-via-ideal), [IO+](https://ioplus.nl/nl/posts/pay-by-bank-het-goedkopere-alternatief-voor-ideal-en-wero)).
3. **Proefperiode:** 7 dagen gratis Pro bij aanmelding, zonder betaalgegevens. RevenueCat meet een mediane conversie van 2,1% bij freemium tegenover 10,7% bij een harde betaalmuur ([RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)). Een harde muur past niet bij het doel van zoveel mogelijk gebruikers, dus kies freemium met een proefperiode.
4. **Jaarabonnement:** weinig zinvol voor tijdelijke zoekers. Hooguit later, voor "altijd op de hoogte"-gebruikers.
5. **Beslissing nodig:** prijs en vorm (zie DECISIONS.md D-006).

## 4. Advertenties
- **De advertentie bij doorverwijzen ("even geduld, we verwijzen je door") mag niet met Google AdSense.** Google verbiedt advertenties op schermen zonder eigen content, en noemt "exit"- en tussenpagina's daarbij expliciet ([Google-beleid](https://support.google.com/publisherpolicies/answer/11112688)). Overtreding leidt tot beperkte of geen advertentieweergave.
- **Opbrengst is laag:** er is geen betrouwbaar Nederlands RPM-cijfer gevonden. Met een AANNAME van €1,50 per 1.000 pageviews levert 5.000 MAU × 12 pageviews ongeveer **€90 per maand** op.
- **Kosten:** advertenties met tracking vragen om een cookiebanner (toestemming), maken de site trager en minder rustig, en verlagen de waarde van de gratis versie.
- **Advies:** geen advertentienetwerk bij de lancering. Gebruik in plaats daarvan **contextuele partnerlinks zonder tracking** op de detailpagina, bijvoorbeeld een verhuisbedrijf, energie of internet vergelijken via Daisycon of TradeTracker. Heroverweeg advertenties pas boven 20.000 MAU, en dan direct verkocht (bijvoorbeeld aan een verhuisbedrijf) in plaats van via een netwerk.

## 5. Affiliate (aanbevolen tweede inkomstenbron)
- Doorverwijzingen naar platforms met een affiliateprogramma leveren €1–20 per lead op (zie DATA_SOURCES.md).
- AANNAME: 4 doorkliks per MAU per maand, waarvan 15% naar een affiliateplatform, met 1,5% conversie en €5 per lead. Dat is **±€0,045 per MAU per maand**, ofwel ±€225 per maand bij 5.000 MAU.
- Dit wordt pas betrouwbaar na 1–2 maanden meten.

## 6. Toekomstige premiumfuncties (alleen als gebruikers erom vragen)
- Een melding binnen 5 minuten in plaats van één samenvatting per dag
- Een "reageer-assistent": een checklist met de documenten per corporatie
- Een overzicht van je inschrijfduur per portaal, met een herinnering om te verlengen
- Niet doen: reageren namens de gebruiker of automatisch reageren. Dat is juridisch riskant en vergt veel onderhoud.
