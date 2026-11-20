// HuurHub — gedeelde hulpfuncties en componenten (Navbar, Footer, PropertyCard, SearchBar).
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const eur = (n) => "€" + Number(n).toLocaleString("nl-NL", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const eur0 = (n) => "€" + Math.round(Number(n)).toLocaleString("nl-NL");
const store = {
  get(k, d) { try { const v = localStorage.getItem("huurhub:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("huurhub:" + k, JSON.stringify(v)); } catch {} },
};

const KANS = new Set(["loting", "wie eerst komt", "hospiteren"]);
const KANS_LABEL = { loting: "Loting", "wie eerst komt": "Direct reageren", hospiteren: "Hospiteren" };
const TOEWIJZING = { inschrijfduur: "Op inschrijfduur", loting: "Loting", "wie eerst komt": "Wie het eerst reageert", hospiteren: "Hospiteren", "vrije sector": "Vrije sector", punten: "Op punten", overig: "Zie advertentie" };
const SECTOR = { sociaal: "Sociale huur", student: "Studentenwoning", middenhuur: "Middenhuur", "vrije sector": "Vrije sector" };
const SECCOLOR = { sociaal: "var(--c-sociaal)", student: "var(--c-student)", middenhuur: "var(--c-midden)", "vrije sector": "var(--c-vrij)" };
const STATUSSEN = [["bewaard", "Favoriet"], ["gereageerd", "Gereageerd"], ["bezichtiging", "Bezichtiging"], ["aangeboden", "Aangeboden"], ["afgewezen", "Afgewezen"]];

// ---------- iconen (één lijnstijl)
const I = {
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  bed: '<path d="M3 18V6M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10" r="1.6"/>',
  area: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  heart: '<path d="M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.1c0 5.8-8 10.4-8 10.4z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.7 2.3 4.4 5 4.6"/>',
};
const icon = (n, cls = "icon") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;

// ---------- datum en tijd
function parseDate(s) { return s ? new Date(String(s).replace(" ", "T")) : null; }
function ago(iso) {
  if (!iso) return "nog niet";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  return s < 60 ? "zojuist" : s < 3600 ? Math.round(s / 60) + " min geleden" : s < 86400 ? Math.round(s / 3600) + " uur geleden" : Math.round(s / 86400) + " dagen geleden";
}
function deadline(i) {
  const d = parseDate(i.sluit); if (!d || isNaN(d)) return null;
  const ms = d - Date.now(); if (ms < 0) return { text: "Gesloten", soon: true, closed: true };
  const h = ms / 36e5;
  if (h < 24) return { text: h < 1 ? "Sluit binnen het uur" : `Sluit over ${Math.round(h)} uur`, soon: true };
  const days = Math.floor(h / 24);
  return { text: days === 1 ? "Sluit morgen" : `Nog ${days} dagen`, soon: days <= 2, date: d };
}
function isNew(i, hours = 48) { return i.nieuwSinds && (Date.now() - parseDate(i.nieuwSinds).getTime()) < hours * 36e5; }
function beschikbaarText(i) {
  const d = parseDate(i.beschikbaar); if (!d || isNaN(d)) return null;
  return d <= new Date() ? "Direct beschikbaar" : "Per " + d.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}
function kamersText(i) { return i.type === "kamer" ? "Kamer" : i.kamers ? `${i.kamers} ${i.kamers === 1 ? "kamer" : "kamers"}` : null; }

// ---------- favorieten en reacties (op deze computer opgeslagen via de server)
const Tracker = {
  data: {}, ready: null,
  load() { this.ready = fetch("/api/tracker").then((r) => r.json()).then((d) => { this.data = d || {}; }).catch(() => { this.data = {}; }).then(() => { this.badge(); document.dispatchEvent(new CustomEvent("tracker")); }); return this.ready; },
  get(id) { return this.data[id]; },
  async set(item, status, notitie) {
    const body = { id: item.id, status, notitie, item: item.item || slim(item) };
    const res = await (await fetch("/api/tracker", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
    if (status) this.data[item.id] = res; else delete this.data[item.id];
    this.badge(); document.dispatchEvent(new CustomEvent("tracker", { detail: item.id }));
    return res;
  },
  async toggleFav(item) {
    const t = this.get(item.id);
    if (!t) { await this.set(item, "bewaard"); toast("Opgeslagen in Mijn woningen", { label: "Bekijk", href: "/woningen#mijn" }); return true; }
    if (t.status === "bewaard") { await this.set(item, ""); return false; }
    location.href = "/woningen#mijn"; return true;
  },
  badge() {
    const n = Object.keys(this.data).length;
    document.querySelectorAll("[data-favcount]").forEach((b) => { b.textContent = n; b.hidden = !n; });
  },
};
function slim(i) {
  const k = ["id", "bron", "adres", "plaats", "wijk", "huur", "m2", "kamers", "type", "toewijzing", "sector", "sluit", "foto", "url", "lat", "lon"];
  return Object.fromEntries(k.map((x) => [x, i[x]]));
}
// klik op een hartje waar dan ook op de site
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-fav]"); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const item = (window.ITEMS_BY_ID && window.ITEMS_BY_ID.get(b.dataset.fav)) || JSON.parse(b.dataset.item || "null");
  if (!item) return;
  const on = await Tracker.toggleFav(item);
  document.querySelectorAll(`[data-fav="${CSS.escape(item.id)}"]`).forEach((x) => { x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); x.setAttribute("aria-label", on ? "Verwijder uit favorieten" : "Bewaar als favoriet"); });
});

function toast(msg, action) {
  let t = $("toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.innerHTML = `<span>${esc(msg)}</span>${action ? (action.href ? `<a class="btn btn-sm btn-primary" href="${esc(action.href)}">${esc(action.label)}</a>` : `<button class="btn btn-sm btn-primary" type="button" id="toastbtn">${esc(action.label)}</button>`) : ""}`;
  t.hidden = false; if (action && action.fn) $("toastbtn").onclick = () => { action.fn(); t.hidden = true; };
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 5000);
}

// ---------- component: Navbar
function Navbar(active) {
  const links = [["/woningen", "Woningen", "woningen"], ["/hoe-werkt-het", "Hoe werkt het?", "hoe"], ["/over-ons", "Over ons", "over"]];
  return `<header class="nav"><div class="container nav-in">
    <a class="nav-logo" href="/" aria-label="HuurHub, naar de homepage"><img src="/img/logo.png" alt="HuurHub" width="640" height="179"></a>
    <nav class="nav-links" aria-label="Hoofdmenu">${links.map(([h, l, k]) => `<a href="${h}" ${active === k ? 'aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
    <div class="nav-right">
      <a class="btn btn-ghost nav-fav" href="/woningen#mijn" aria-label="Mijn woningen" title="Mijn woningen" style="width:44px;padding:0">${icon("heart")}<span class="count" data-favcount hidden>0</span></a>
      <a class="btn btn-ghost hide-m" href="/inloggen">Inloggen</a>
      <a class="btn btn-primary hide-m" href="/woning-plaatsen">Woning plaatsen</a>
      <button class="btn btn-ghost nav-burger" id="burger" type="button" aria-label="Menu openen" aria-expanded="false" style="width:44px;padding:0">${icon("menu")}</button>
    </div></div>
    <div class="mobile-menu" id="mmenu">
      ${links.map(([h, l]) => `<a class="ml" href="${h}">${l}${icon("arrow")}</a>`).join("")}
      <a class="ml" href="/woningen#mijn">Mijn woningen${icon("arrow")}</a>
      <div class="btns"><a class="btn btn-lg" href="/inloggen">Inloggen</a><a class="btn btn-lg btn-primary" href="/woning-plaatsen">Woning plaatsen</a></div>
    </div></header>`;
}
// ---------- component: Footer
function Footer() {
  return `<footer class="footer"><div class="container">
    <div class="footer-grid">
      <div><a class="footer-logo" href="/"><img src="/img/logo.png" alt="HuurHub" width="640" height="179"></a>
        <p>Alle huurwoningen van Nederland overzichtelijk op één plek. Voor studenten, starters en iedereen die een huurwoning zoekt.</p>
        <div class="socials"><a href="#" aria-label="Instagram">${icon("instagram")}</a><a href="#" aria-label="LinkedIn">${icon("linkedin")}</a><a href="#" aria-label="TikTok">${icon("tiktok")}</a></div></div>
      <div><h4>HuurHub</h4><ul><li><a href="/woningen">Woningen zoeken</a></li><li><a href="/hoe-werkt-het">Hoe werkt het?</a></li><li><a href="/over-ons">Over ons</a></li><li><a href="/contact">Contact</a></li></ul></div>
      <div><h4>Hulp</h4><ul><li><a href="/veelgestelde-vragen">Veelgestelde vragen</a></li><li><a href="/woning-plaatsen">Woning plaatsen</a></li><li><a href="/woningen#mijn">Mijn woningen</a></li></ul></div>
      <div><h4>Juridisch</h4><ul><li><a href="/privacy">Privacybeleid</a></li><li><a href="/voorwaarden">Algemene voorwaarden</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} HuurHub · HuurHub is een product van Optivue</span><span>Woningaanbod van de genoemde verhuurportalen · Kaart © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></span></div>
  </div></footer>`;
}
function mountChrome(active) {
  document.body.insertAdjacentHTML("afterbegin", Navbar(active));
  const f = $("footer-slot"); if (f) f.outerHTML = Footer();
  const b = $("burger"), m = $("mmenu");
  b.addEventListener("click", () => { const o = m.classList.toggle("open"); b.setAttribute("aria-expanded", o); b.innerHTML = icon(o ? "x" : "menu"); document.body.style.overflow = o ? "hidden" : ""; });
  Tracker.load();
}

// ---------- component: PropertyCard
function PropertyCard(i, { variant = "grid", active = false } = {}) {
  const fav = !!Tracker.get(i.id), dl = deadline(i), t = Tracker.get(i.id);
  const badges = [
    KANS.has(i.toewijzing) ? `<span class="badge badge-orange">${KANS_LABEL[i.toewijzing]}</span>` : "",
    isNew(i) ? `<span class="badge badge-white">Nieuw</span>` : "",
    t && t.status !== "bewaard" ? `<span class="badge badge-white">${esc(STATUSSEN.find((s) => s[0] === t.status)?.[1] || "")}</span>` : "",
  ].join("");
  const facts = [
    kamersText(i) ? `<span>${icon("bed")}${esc(kamersText(i))}</span>` : "",
    i.m2 ? `<span>${icon("area")}${Math.round(i.m2)} m²</span>` : "",
    dl && !dl.closed ? `<span style="${dl.soon ? "color:var(--red)" : ""}">${icon("clock")}${esc(dl.text)}</span>` : "",
  ].join("");
  const href = `/woning?id=${encodeURIComponent(i.id)}`;
  return `<article class="pcard ${variant === "row" ? "row" : ""} ${active ? "active" : ""}" data-id="${esc(i.id)}">
    <div class="pcard-img">${i.foto ? `<img src="${esc(i.foto)}" alt="" loading="lazy" onerror="this.remove()">` : ""}<div class="noimg" ${i.foto ? 'style="z-index:-1"' : ""}>${icon("home")}</div>
      <div class="pcard-badges">${badges}</div>
      <button class="icon-btn pcard-fav ${fav ? "on" : ""}" type="button" data-fav="${esc(i.id)}" aria-pressed="${fav}" aria-label="${fav ? "Verwijder uit favorieten" : "Bewaar als favoriet"}">${icon("heart")}</button></div>
    <div class="pcard-body">
      <div class="pcard-place">${icon("pin")}${esc(i.plaats)}${i.wijk && i.wijk !== i.plaats ? ", " + esc(i.wijk) : ""}</div>
      <h3 class="pcard-title"><a href="${href}" data-open="${esc(i.id)}">${esc(i.adres)}</a></h3>
      <div class="pcard-price">${eur(i.huur)} <small>/ maand</small></div>
      <div class="pcard-facts">${facts}</div>
      <div class="pcard-foot"><span class="pcard-src">${esc(SECTOR[i.sector] || "")} · ${esc(i.bron)}</span><a class="btn btn-sm" href="${href}">Bekijk woning</a></div>
    </div></article>`;
}

// ---------- component: SearchBar (homepage)
function SearchBar() {
  return `<form class="searchbar" id="searchbar" role="search" action="/woningen">
    <label class="field sb-where">${icon("pin")}<input name="plaats" list="dl-plaatsen" placeholder="Plaats of postcode" autocomplete="off" aria-label="Plaats of postcode"></label>
    <datalist id="dl-plaatsen"></datalist>
    <label class="field">${icon("euro")}<select name="max" aria-label="Maximale huurprijs"><option value="700">Tot €700</option><option value="900">Tot €900</option><option value="1100">Tot €1.100</option><option value="1300" selected>Tot €1.300</option><option value="1600">Tot €1.600</option><option value="0">Geen maximum</option></select></label>
    <label class="field">${icon("home")}<select name="type" aria-label="Type woning"><option value="">Alle woningen</option><option value="kamer">Kamer</option><option value="zelfstandig">Studio of appartement</option><option value="2plus">2 of meer kamers</option></select></label>
    <button class="btn btn-primary btn-lg" type="submit">${icon("search")}Zoek woningen</button>
  </form>`;
}
function wireSearchBar(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form), p = new URLSearchParams();
    const plaats = String(f.get("plaats") || "").trim();
    if (plaats) { p.set("plaats", plaats); p.set("km", /^\d{4}/.test(plaats) ? "5" : "10"); }
    p.set("max", f.get("max")); if (f.get("type")) p.set("type", f.get("type"));
    location.href = "/woningen?" + p.toString();
  });
}

// ---------- foto's (Wikimedia Commons, vrije licenties; naamsvermelding op /over-ons)
const WM = "https://thumb.wikimedia.org/wikipedia/commons/thumb/";
const FOTOS = {
  hero: { src: WM + "2/2f/Amsterdam_Townhouses_%28Jan_Olphert_Vaillantlaan%2C_Steigereiland%29_Maisons_en_rang%C3%A9e%2C_Amsterdam_%28Jan_Olphert_Vaillantlaan%2C_Steigereiland%29_%2820504421512%29.jpg/1920px-Amsterdam_Townhouses_%28Jan_Olphert_Vaillantlaan%2C_Steigereiland%29_Maisons_en_rang%C3%A9e%2C_Amsterdam_%28Jan_Olphert_Vaillantlaan%2C_Steigereiland%29_%2820504421512%29.jpg", alt: "Moderne rijtjeshuizen aan het water op IJburg, Amsterdam", maker: "Municipal Affairs and Housing", licentie: "CC BY 2.0", bron: "https://commons.wikimedia.org/wiki/File:Amsterdam_Townhouses_(Jan_Olphert_Vaillantlaan,_Steigereiland)_Maisons_en_rang%C3%A9e,_Amsterdam_(Jan_Olphert_Vaillantlaan,_Steigereiland)_(20504421512).jpg" },
  Amsterdam: { src: WM + "9/90/View_on_reflecting_canal_water_and_bridge_over_de_Nieuwe_Achtergracht_in_Amsterdam_old_city%2C_Free_photo_Fons_Heijnsbroek%2C_28_April_2022.tif/lossy-page1-960px-View_on_reflecting_canal_water_and_bridge_over_de_Nieuwe_Achtergracht_in_Amsterdam_old_city%2C_Free_photo_Fons_Heijnsbroek%2C_28_April_2022.tif.jpg", maker: "Fons Heijnsbroek", licentie: "CC BY 4.0", bron: "https://commons.wikimedia.org/wiki/File:View_on_reflecting_canal_water_and_bridge_over_de_Nieuwe_Achtergracht_in_Amsterdam_old_city,_Free_photo_Fons_Heijnsbroek,_28_April_2022.tif" },
  Rotterdam: { src: WM + "5/56/Erasmus_bridge_and_Rotterdam_skyline_%2821458216300%29.jpg/960px-Erasmus_bridge_and_Rotterdam_skyline_%2821458216300%29.jpg", maker: "Kristoffer Trolle", licentie: "CC BY 2.0", bron: "https://commons.wikimedia.org/wiki/File:Erasmus_bridge_and_Rotterdam_skyline_(21458216300).jpg" },
  Utrecht: { src: WM + "c/cc/Utrecht_Oudegracht_aan_de_Werf_next_to_Jansbrug_seen_from_the_west.jpg/960px-Utrecht_Oudegracht_aan_de_Werf_next_to_Jansbrug_seen_from_the_west.jpg", maker: "Ymblanter", licentie: "CC BY-SA 4.0", bron: "https://commons.wikimedia.org/wiki/File:Utrecht_Oudegracht_aan_de_Werf_next_to_Jansbrug_seen_from_the_west.jpg" },
  Eindhoven: { src: WM + "f/ff/PiazzaBlob_Eindhoven.jpg/960px-PiazzaBlob_Eindhoven.jpg", maker: "Curt Woyte", licentie: "CC BY 3.0", bron: "https://commons.wikimedia.org/wiki/File:PiazzaBlob_Eindhoven.jpg" },
  Groningen: { src: WM + "3/3d/20100523_Grote_Markt_en_Martinitoren_Groningen_NL.jpg/960px-20100523_Grote_Markt_en_Martinitoren_Groningen_NL.jpg", maker: "Wutsje", licentie: "CC BY-SA 3.0", bron: "https://commons.wikimedia.org/wiki/File:20100523_Grote_Markt_en_Martinitoren_Groningen_NL.jpg" },
  "Den Haag": { src: WM + "5/5f/Den_Haag_-_Buitenhof_-_View_on_Hofvijver_%26_Binnenhof.jpg/960px-Den_Haag_-_Buitenhof_-_View_on_Hofvijver_%26_Binnenhof.jpg", maker: "Txllxt TxllxT", licentie: "CC BY-SA 4.0", bron: "https://commons.wikimedia.org/wiki/File:Den_Haag_-_Buitenhof_-_View_on_Hofvijver_%26_Binnenhof.jpg" },
};
const PROVINCIES = {
  "Groningen": [53.22, 6.74], "Friesland": [53.1, 5.82], "Drenthe": [52.86, 6.6], "Overijssel": [52.44, 6.45],
  "Flevoland": [52.53, 5.6], "Gelderland": [52.06, 5.95], "Utrecht": [52.08, 5.2], "Noord-Holland": [52.6, 4.87],
  "Zuid-Holland": [51.98, 4.5], "Zeeland": [51.5, 3.85], "Noord-Brabant": [51.56, 5.2], "Limburg": [51.2, 5.93],
};
