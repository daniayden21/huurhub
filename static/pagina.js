// HuurHub — inhoudspagina's. Eén sjabloon, inhoud per adres.
const slug = location.pathname.replace(/^\/|\/$/g, "");
const head = (t, p) => `<section class="phead"><div class="container"><h1>${t}</h1>${p ? `<p>${p}</p>` : ""}</div></section>`;
const li = (t) => `<li>${icon("check")}<span>${t}</span></li>`;
const CTA = `<div class="ctabox"><div><h2>Klaar om te zoeken?</h2><p>Bekijk alle huurwoningen op de kaart.</p></div><a class="btn btn-primary btn-lg" href="/woningen">Naar de woningen</a></div>`;

const FAQ = [
  ["Wat is HuurHub?", "HuurHub verzamelt huurwoningen van woningcorporaties en studentenhuisvesters in heel Nederland en zet ze overzichtelijk op één kaart. Zo hoef je niet elke site apart af te zoeken."],
  ["Kan ik via HuurHub reageren op een woning?", "Nee. Bij elke woning staat een knop naar de site van de aanbieder. Daar reageer je, meestal met een account bij dat portaal."],
  ["Wat kost HuurHub?", "Zoeken op HuurHub is gratis."],
  ["Wie komt in aanmerking voor sociale huur?", "In 2026 mag je bruto jaarinkomen maximaal €51.537 zijn als je alleen woont, of €56.910 met meerdere personen. Je schrijft je in bij het woningportaal van de regio waar je wilt wonen."],
  ["Wat betekenen inschrijfduur, loting en direct reageren?", "Bij de meeste sociale huurwoningen krijgt degene die het langst staat ingeschreven de woning. Bij loting beslist het lot en bij direct reageren wie het snelst is. In die gevallen telt je inschrijfduur niet. Deze woningen zijn op HuurHub oranje gemarkeerd."],
  ["Kan ik huurtoeslag krijgen?", "Bij een woning met eigen keuken, toilet en douche meestal wel, afhankelijk van je inkomen en vermogen. De toeslag wordt berekend over maximaal €932,93 huur, en onder de 21 jaar over maximaal €498,20. Voor een kamer met gedeelde voorzieningen krijg je meestal geen toeslag. Doe een proefberekening op toeslagen.nl."],
  ["Hoe actueel is het aanbod?", "De verhuurportalen worden elke vijf tot tien minuten opnieuw bekeken. Een woning die bij de aanbieder offline gaat, verdwijnt ook van HuurHub."],
  ["Waar worden mijn favorieten opgeslagen?", "Op dit moment op het apparaat waarop je HuurHub gebruikt. Met een account kun je ze straks ook op andere apparaten zien."],
  ["Wat mag een verhuurder niet vragen?", "Je betaalt geen bemiddelingskosten of sleutelgeld, en de borg is maximaal twee keer de kale huur. Maak nooit geld over voordat je de woning hebt bekeken en het contract hebt getekend."],
];

function contactForm(soort) {
  const plaatsen = soort === "plaatsen";
  return `<form class="formcard" id="form" novalidate>
    ${plaatsen ? `<div class="two"><label class="label">Naam<span class="field"><input id="f-naam" required autocomplete="name"></span></label><label class="label">Organisatie <small>optioneel</small><span class="field"><input id="f-org" autocomplete="organization"></span></label></div>`
      : `<label class="label">Naam<span class="field"><input id="f-naam" required autocomplete="name"></span></label>`}
    <label class="label">E-mailadres<span class="field"><input id="f-mail" type="email" required autocomplete="email"></span></label>
    ${plaatsen ? `<div class="two"><label class="label">Plaats van de woning<span class="field"><input id="f-plaats" required></span></label><label class="label">Kale huur per maand<span class="field"><input id="f-huur" inputmode="decimal" placeholder="€"></span></label></div>
      <label class="label">Aantal woningen<span class="field"><select id="f-aantal"><option>1 woning</option><option>2 tot 10 woningen</option><option>Meer dan 10 woningen</option></select></span></label>` : ""}
    <label class="label">${plaatsen ? "Vertel iets over de woning" : "Je bericht"}<span class="field area"><textarea id="f-tekst" required></textarea></span></label>
    <p class="muted" style="font-size:13px">We gebruiken je gegevens alleen om op je bericht te reageren. Lees ons <a href="/privacy" style="color:var(--orange)">privacybeleid</a>.</p>
    <p id="f-err" class="badge badge-red" hidden style="height:auto;padding:8px 12px;justify-self:start"></p>
    <button class="btn btn-primary btn-lg" type="submit">${plaatsen ? "Aanmelding versturen" : "Bericht versturen"}</button>
  </form>`;
}
function wireForm(soort) {
  $("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = (id) => ($(id) ? $(id).value.trim() : "");
    const err = (m) => { $("f-err").textContent = m; $("f-err").hidden = false; };
    if (!v("f-naam")) return err("Vul je naam in.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("f-mail"))) return err("Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.");
    if (soort === "plaatsen" && !v("f-plaats")) return err("Vul de plaats van de woning in.");
    if (!v("f-tekst")) return err(soort === "plaatsen" ? "Vertel kort iets over de woning." : "Schrijf je bericht.");
    const body = { soort, naam: v("f-naam"), email: v("f-mail"), organisatie: v("f-org"), plaats: v("f-plaats"), huur: v("f-huur"), aantal: v("f-aantal"), tekst: v("f-tekst") };
    try {
      const r = await fetch("/api/bericht", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw 0;
      $("form").outerHTML = `<div class="formcard done"><div class="ok">${icon("check")}</div><h2 style="font-size:22px">${soort === "plaatsen" ? "Aanmelding ontvangen" : "Bericht verstuurd"}</h2><p class="muted">Bedankt, ${esc(body.naam)}. We nemen contact met je op via ${esc(body.email)}.</p><a class="btn" href="/">Terug naar de homepage</a></div>`;
    } catch { err("Versturen lukte niet. Controleer je verbinding en probeer het opnieuw."); }
  });
}

const PAGES = {
  "hoe-werkt-het": {
    title: "Hoe werkt het?", nav: "hoe",
    html: () => head("Hoe werkt HuurHub?", "Van zoeken tot sleutel, in drie stappen. HuurHub zet het aanbod van verhuurportalen in heel Nederland op één plek, zodat jij sneller vindt wat bij je past.") + `
      <section class="pbody"><div class="container"><div class="steps3">
        <div class="step"><div class="t"><div class="n">1</div><h2>Zoek op de kaart of in de lijst</h2><p>Typ een plaats of postcode en kies hoe ver je wilt reizen. Je ziet meteen alle woningen in de buurt, met foto, prijs en hoe lang je nog kunt reageren.</p>
          <ul>${li("Woningcorporaties en studentenhuisvesters uit heel Nederland")}${li("Zoom in en je ziet de huurprijs bij elke woning")}${li("Klik op een woning voor foto's, kenmerken en de locatie")}</ul></div>
          <div class="shot"><img src="/img/hub-popup.png" alt="Een woning op de kaart met foto, huurprijs en kamers" loading="lazy"></div></div>
        <div class="step"><div class="t"><div class="n">2</div><h2>Filter op wat bij je past</h2><p>Kamer, studio of samen een appartement. Stel je budget, het aantal kamers en de oppervlakte in. Met één klik zie je woningen waarvoor je geen jaren ingeschreven hoeft te staan.</p>
          <ul>${li("Minimale en maximale huur, kamers en oppervlakte")}${li("Loting, direct reageren en hospiteren apart te kiezen")}${li("Woningen voor senioren of zorg standaard verborgen")}</ul></div>
          <div class="shot"><img src="/img/hub-filters.png" alt="Het filterpaneel met prijs, type, kamers en oppervlakte" loading="lazy"></div></div>
        <div class="step"><div class="t"><div class="n">3</div><h2>Reageer en houd overzicht</h2><p>Reageren doe je bij de aanbieder zelf. Sla de woning op en zet hem door van gereageerd naar bezichtiging en aangeboden. HuurHub laat zien welke favorieten bijna sluiten.</p>
          <ul>${li("Al je reacties op alle sites in één overzicht")}${li("Notities per woning, zoals de datum van de bezichtiging")}${li("Blijft bewaard, ook als de advertentie offline gaat")}</ul></div>
          <div class="shot"><img src="/img/hub-reacties.png" alt="Het overzicht Mijn woningen met kolommen per status" loading="lazy"></div></div>
      </div>
      <div style="margin-top:96px"><div class="section-head"><div><h2>Goed om te weten over huren</h2><p>De belangrijkste regels voor 2026, kort uitgelegd.</p></div></div>
        <div class="cards">
          <div class="card"><h3>Sociale huur</h3><div class="fig">€51.537 / €56.910</div><p>Maximaal bruto jaarinkomen voor één persoon of meerdere personen. Meestal krijgt wie het langst staat ingeschreven de woning.</p></div>
          <div class="card"><h3>Huurtoeslag</h3><div class="fig">tot €932,93</div><p>Geen harde huurgrens meer, maar de toeslag wordt berekend over maximaal €932,93. Onder de 21 jaar over maximaal €498,20.</p></div>
          <div class="card"><h3>Middenhuur</h3><div class="fig">tot €1.228,07</div><p>De maximale huur volgt uit het puntenstelsel. Controleer de prijs met de huurprijscheck van de Huurcommissie.</p></div>
        </div></div>
      ${CTA}</div></section>`,
  },
  "over-ons": {
    title: "Over ons", nav: "over",
    html: () => head("Over HuurHub", "Een huurwoning vinden in Nederland betekent tientallen websites afzoeken, elk met een eigen inschrijving en eigen regels. HuurHub brengt dat aanbod samen.") + `
      <section class="pbody"><div class="container"><div class="prose">
        <h2>Waarom we HuurHub maken</h2>
        <p>Woningzoekenden, en vooral studenten en starters, verliezen veel tijd met het bijhouden van verschillende verhuurportalen. Een woning met loting of direct reageren is vaak binnen een paar dagen weg. HuurHub laat het aanbod van al die portalen op één kaart zien, zodat je sneller ziet wat er is en niets mist.</p>
        <h2>Waar het aanbod vandaan komt</h2>
        <p>We tonen woningen die openbaar worden aangeboden op de sites van woningcorporaties en studentenhuisvesters. Bij elke woning staat de aanbieder en een link naar de originele advertentie. Reageren doe je altijd daar.</p>
        <div class="srcs" id="srcs"></div>
        <h2>Wat HuurHub niet is</h2>
        <p>HuurHub is geen verhuurder en geen makelaar. We vragen geen bemiddelingskosten en bemoeien ons niet met de toewijzing van woningen.</p>
        <h2>Foto's</h2>
        <p>De foto's van steden en de foto op de homepage komen van Wikimedia Commons en worden gebruikt onder hun vrije licentie. Foto's van woningen zijn van de aanbieders.</p>
        <div class="credits" id="credits"></div>
      </div>${CTA}</div></section>`,
    after: async () => {
      $("credits").innerHTML = Object.entries(FOTOS).map(([k, f]) => `<a href="${f.bron}" target="_blank" rel="noopener">${k === "hero" ? "Homepage" : k}: ${esc(f.maker)}, ${f.licentie}</a>`).join("");
      try { const st = await (await fetch("/api/status")).json(); $("srcs").innerHTML = Object.keys(st.status).sort((a, b) => a.localeCompare(b, "nl")).map((n) => `<span>${esc(n)}</span>`).join(""); } catch {}
    },
  },
  contact: {
    title: "Contact",
    html: () => head("Contact", "Een vraag, een tip of iets dat niet klopt? Laat het ons weten.") + `
      <section class="pbody"><div class="container formgrid"><div>${contactForm("contact")}</div>
        <div class="prose"><h2 style="margin-top:0">Veelgestelde vragen</h2><p>Misschien staat je antwoord er al tussen.</p><p><a href="/veelgestelde-vragen">Bekijk de veelgestelde vragen</a></p>
        <h2>Vraag over een woning?</h2><p>HuurHub verhuurt zelf geen woningen. Voor vragen over een woning, je inschrijving of een reactie neem je contact op met de aanbieder. Die staat bij elke woning vermeld.</p></div>
      </div></section>`,
    after: () => wireForm("contact"),
  },
  "veelgestelde-vragen": {
    title: "Veelgestelde vragen",
    html: () => head("Veelgestelde vragen", "Antwoorden op de vragen die we het vaakst krijgen.") + `
      <section class="pbody"><div class="container"><div class="faq">${FAQ.map(([q, a], k) => `<details ${k === 0 ? "open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
      <p class="muted" style="margin-top:28px">Staat je vraag er niet tussen? <a href="/contact" style="color:var(--orange);font-weight:700">Neem contact op</a>.</p></div></section>`,
  },
  "woning-plaatsen": {
    title: "Woning plaatsen",
    html: () => head("Woning plaatsen", "Verhuur je een woning of kamer? Meld je aan, dan nemen we contact met je op over het plaatsen van je aanbod op HuurHub.") + `
      <section class="pbody"><div class="container formgrid"><div>${contactForm("plaatsen")}</div>
        <div class="prose"><h2 style="margin-top:0">Voor wie</h2><ul><li>Woningcorporaties en studentenhuisvesters</li><li>Beleggers en beheerders met middenhuur</li><li>Particuliere verhuurders van een woning of kamer</li></ul>
        <h2>Wat we vragen</h2><p>Een huurprijs die past bij de regels van de Wet betaalbare huur, een vast of passend contract, en geen bemiddelingskosten of sleutelgeld voor de huurder.</p>
        <p class="note">Corporaties en studentenhuisvesters met een eigen portaal staan vaak al op HuurHub. Neem contact op als je aanbod ontbreekt of niet goed wordt weergegeven.</p></div>
      </div></section>`,
    after: () => wireForm("plaatsen"),
  },
  inloggen: {
    title: "Inloggen",
    html: () => head("Inloggen", "") + `
      <section class="pbody"><div class="container"><div class="formcard" style="max-width:520px">
        <div style="width:48px;height:48px;border-radius:14px;background:var(--blue-bg);display:grid;place-items:center">${icon("user")}</div>
        <h2 style="font-size:24px">Accounts komen binnenkort</h2>
        <p class="muted">Met een HuurHub-account kun je straks je favorieten en reacties op al je apparaten zien en meldingen krijgen van nieuwe woningen. Tot die tijd worden je favorieten op dit apparaat bewaard.</p>
        <a class="btn btn-primary btn-lg" href="/woningen#mijn">Naar Mijn woningen</a>
        <a class="btn btn-lg" href="/woningen">Woningen zoeken</a>
      </div></div></section>`,
  },
  privacy: {
    title: "Privacybeleid",
    html: () => head("Privacybeleid", "Laatst bijgewerkt: november 2026") + `
      <section class="pbody"><div class="container"><div class="prose">
        <p class="note">Dit is een conceptversie. Laat de tekst controleren voordat HuurHub publiek wordt gelanceerd.</p>
        <h2>Welke gegevens we verwerken</h2>
        <ul><li><strong>Favorieten en reacties</strong> die je in Mijn woningen opslaat, inclusief je notities.</li><li><strong>Contactgegevens</strong> die je invult in het contactformulier of bij Woning plaatsen: naam, e-mailadres en je bericht.</li><li><strong>Zoekvoorkeuren</strong>, zoals je laatste filters. Die worden in je browser bewaard.</li></ul>
        <h2>Waarvoor we ze gebruiken</h2><p>Om je favorieten te tonen, om op je bericht te reageren en om HuurHub te verbeteren. We verkopen je gegevens niet en gebruiken geen advertentiecookies.</p>
        <h2>Diensten van derden</h2><p>De kaart wordt geladen van OpenStreetMap. Foto's van woningen worden geladen van de sites van de aanbieders. Adressen worden op de kaart geplaatst met de PDOK Locatieserver van de overheid.</p>
        <h2>Bewaartermijn</h2><p>Berichten bewaren we maximaal twaalf maanden. Favorieten blijven bewaard tot je ze verwijdert.</p>
        <h2>Je rechten</h2><p>Je kunt je gegevens inzien, laten aanpassen of laten verwijderen. Neem daarvoor <a href="/contact">contact</a> met ons op.</p>
      </div></div></section>`,
  },
  voorwaarden: {
    title: "Algemene voorwaarden",
    html: () => head("Algemene voorwaarden", "Laatst bijgewerkt: november 2026") + `
      <section class="pbody"><div class="container"><div class="prose">
        <p class="note">Dit is een conceptversie. Laat de tekst controleren voordat HuurHub publiek wordt gelanceerd.</p>
        <h2>1. Wat HuurHub doet</h2><p>HuurHub toont een overzicht van huurwoningen die openbaar worden aangeboden door derden. HuurHub is geen partij bij een huurovereenkomst en bemiddelt niet.</p>
        <h2>2. Juistheid van het aanbod</h2><p>We doen ons best om het aanbod actueel en juist te tonen. De informatie op de site van de aanbieder is leidend. Aan de gegevens op HuurHub kunnen geen rechten worden ontleend.</p>
        <h2>3. Reageren op woningen</h2><p>Reageren gebeurt op de site van de aanbieder, onder de voorwaarden van die aanbieder.</p>
        <h2>4. Gebruik van de site</h2><p>Het is niet toegestaan de site te gebruiken op een manier die de werking verstoort of het aanbod voor commerciële doeleinden over te nemen.</p>
        <h2>5. Aansprakelijkheid</h2><p>HuurHub is niet aansprakelijk voor schade die ontstaat door het gebruik van de informatie op de site of op sites van derden.</p>
        <h2>6. Contact</h2><p>Vragen over deze voorwaarden? <a href="/contact">Neem contact op</a>.</p>
      </div></div></section>`,
  },
};

const P = PAGES[slug] || { title: "Pagina niet gevonden", html: () => head("Pagina niet gevonden", "Deze pagina bestaat niet (meer).") + `<section class="pbody"><div class="container"><a class="btn btn-primary" href="/">Naar de homepage</a></div></section>` };
mountChrome(P.nav);
document.title = P.title + " · HuurHub";
$("page").innerHTML = P.html();
if (P.after) P.after();
