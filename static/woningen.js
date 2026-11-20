// HuurHub — zoekpagina (lijst + kaart) en Mijn woningen.
mountChrome("woningen");
document.querySelectorAll("[data-i]").forEach((e) => (e.outerHTML = icon(e.dataset.i)));

const DEF = { plaats: "", km: 0, min: 0, max: 1300, type: "", kamers: 0, m2: 0, besch: "", toew: [], sectors: [], prov: "", hide: true, toeslag: false, kans: false, nieuw: false, fav: false, sort: "relevant" };
const S = Object.assign(structuredClone(DEF), store.get("zoek2", {}));
(function fromUrl() {
  const p = new URLSearchParams(location.search);
  if (![...p.keys()].length) return;
  Object.assign(S, structuredClone(DEF));
  if (p.get("plaats")) S.plaats = p.get("plaats");
  if (p.get("km")) S.km = +p.get("km");
  if (p.has("max")) S.max = +p.get("max");
  if (p.get("type")) { const t = p.get("type"); if (t === "2plus") { S.type = "zelfstandig"; S.kamers = 2; } else S.type = t; }
  if (p.get("prov")) S.prov = p.get("prov");
  if (p.get("kans")) S.kans = true;
  if (p.get("sector")) S.sectors = [p.get("sector")];
  if (p.get("sort")) { S.sort = p.get("sort"); if (!p.has("max")) S.max = 0; }
  history.replaceState(null, "", location.pathname + location.hash);
})();

let ALL = [], FILTERED = [], VERSION = -1, limit = 40, activeId = null, CENTER = null;
const NL = [[50.75, 3.35], [53.55, 7.22]];
const PROVB = {
  "Groningen": [[53.0, 6.15], [53.55, 7.25]], "Friesland": [[52.8, 5.3], [53.5, 6.45]], "Drenthe": [[52.6, 6.1], [53.2, 7.1]],
  "Overijssel": [[52.2, 5.8], [52.85, 7.1]], "Flevoland": [[52.25, 5.1], [52.85, 6.0]], "Gelderland": [[51.75, 5.0], [52.5, 6.85]],
  "Utrecht": [[51.95, 4.78], [52.3, 5.65]], "Noord-Holland": [[52.17, 4.5], [53.2, 5.35]], "Zuid-Holland": [[51.68, 3.85], [52.35, 5.0]],
  "Zeeland": [[51.2, 3.35], [51.78, 4.3]], "Noord-Brabant": [[51.2, 4.2], [51.85, 6.05]], "Limburg": [[50.74, 5.55], [51.8, 6.25]],
};

// ---------------------------------------------------------------- kaart
const map = L.map("map", { minZoom: 7, maxBounds: [[49.8, 1.5], [54.5, 9.0]], zoomControl: false }).fitBounds(NL);
L.control.zoom({ position: "topright" }).addTo(map);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "tiles-soft", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50, disableClusteringAtZoom: 15, chunkedLoading: true });
map.addLayer(cluster);
const mcache = new Map(); let circle = null;
new ResizeObserver(() => map.invalidateSize()).observe($("map"));
map.on("zoomend", () => { const z = map.getZoom(); $("map").classList.toggle("zoom-hi", z >= 14); $("maphint").hidden = z >= 12; });

function marker(i) {
  let m = mcache.get(i.id); if (m) return m;
  const c = SECCOLOR[i.sector] || "var(--c-vrij)", k = KANS.has(i.toewijzing);
  m = L.marker([i.lat, i.lon], { icon: L.divIcon({ className: "", iconSize: [18, 18], html: `<div class="pin ${k ? "kans" : ""}" style="background:${c}"></div><span class="price-pin ${k ? "kans" : ""}">${eur0(i.huur)}</span>` }), title: `${eur0(i.huur)} · ${i.adres}` });
  m.bindPopup(() => popup(i), { maxWidth: 290, minWidth: 280, autoPanPaddingTopLeft: [20, 60], autoPanPaddingBottomRight: [20, 20] });
  m.on("popupopen", () => select(i.id, true));
  mcache.set(i.id, m); return m;
}
function popup(i) {
  const fav = !!Tracker.get(i.id), dl = deadline(i);
  return `<div class="pop">${i.foto ? `<img src="${esc(i.foto)}" alt="" onerror="this.remove()">` : ""}<div class="b">
    <div class="pr">${eur(i.huur)} <small>/ maand</small></div><div class="ad">${esc(i.adres)}</div><div class="pl">${esc(i.plaats)}${i.wijk && i.wijk !== i.plaats ? ", " + esc(i.wijk) : ""}</div>
    <div class="fx">${kamersText(i) ? `<span>${icon("bed")}${esc(kamersText(i))}</span>` : ""}${i.m2 ? `<span>${icon("area")}${Math.round(i.m2)} m²</span>` : ""}${dl && !dl.closed ? `<span>${icon("clock")}${esc(dl.text)}</span>` : ""}</div>
    ${KANS.has(i.toewijzing) ? `<div style="margin-top:6px"><span class="badge badge-orange">${KANS_LABEL[i.toewijzing]}</span></div>` : ""}
    <div class="acts"><a class="btn btn-primary" href="/woning?id=${encodeURIComponent(i.id)}">Bekijk woning</a><button class="icon-btn ${fav ? "on" : ""}" type="button" data-fav="${esc(i.id)}" aria-label="${fav ? "Verwijder uit favorieten" : "Bewaar als favoriet"}">${icon("heart")}</button></div>
  </div></div>`;
}

// ---------------------------------------------------------------- filteren
const dist = (a, b) => { const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLon = (b[1] - a[1]) * Math.PI / 180, x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
function match(i) {
  if (S.max && i.huur > S.max) return false;
  if (S.min && i.huur < S.min) return false;
  const dl = deadline(i); if (dl && dl.closed) return false;
  if (S.type && i.type !== S.type) return false;
  if (S.kamers && (i.type === "kamer" || (i.kamers || 1) < S.kamers)) return false;
  if (S.m2 && (i.m2 || 0) < S.m2) return false;
  if (S.besch) {
    const d = parseDate(i.beschikbaar); if (!d || isNaN(d)) return false;
    const lim = { direct: 0, "1m": 31, "3m": 92 }[S.besch]; if ((d - Date.now()) / 864e5 > lim) return false;
  }
  if (S.toew.length && !S.toew.includes(i.toewijzing)) return false;
  if (S.sectors.length && !S.sectors.includes(i.sector)) return false;
  if (S.prov && i.provincie !== S.prov) return false;
  if (S.hide && ["senioren", "zorg", "gezinnen"].includes(i.doelgroep)) return false;
  if (S.toeslag && !i.huurtoeslag) return false;
  if (S.kans && !KANS.has(i.toewijzing)) return false;
  if (S.nieuw && !isNew(i)) return false;
  if (S.fav && !Tracker.get(i.id)) return false;
  const q = S.plaats.trim().toLowerCase();
  if (q) {
    if (S.km && CENTER) { if (i.lat == null || dist(CENTER, [i.lat, i.lon]) > S.km) return false; }
    else if (!`${i.plaats} ${i.wijk} ${i.postcode} ${i.adres}`.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, ""))) return false;
  }
  return true;
}
const score = (i) => (KANS.has(i.toewijzing) ? 3 : 0) + (isNew(i) ? 2 : 0) + (i.foto ? 1 : 0) - i.huur / 2500;
function sorted(list) {
  const f = { relevant: (a, b) => score(b) - score(a), "prijs-op": (a, b) => a.huur - b.huur, "prijs-af": (a, b) => b.huur - a.huur,
    nieuw: (a, b) => (b.nieuwSinds || "").localeCompare(a.nieuwSinds || ""), sluit: (a, b) => (parseDate(a.sluit) || 9e15) - (parseDate(b.sluit) || 9e15), m2: (a, b) => (b.m2 || 0) - (a.m2 || 0) }[S.sort] || ((a, b) => 0);
  return [...list].sort(f);
}
async function resolveCenter() {
  CENTER = null; const q = S.plaats.trim(); if (!q || !S.km) return;
  const hit = ALL.filter((i) => i.plaats && i.plaats.toLowerCase() === q.toLowerCase() && i.lat != null);
  if (hit.length) { CENTER = [hit.reduce((s, i) => s + i.lat, 0) / hit.length, hit.reduce((s, i) => s + i.lon, 0) / hit.length]; return; }
  try { const g = await (await fetch("/api/geocode?q=" + encodeURIComponent(q))).json(); if (g) CENTER = [g.lat, g.lon]; } catch {}
}
const nFilters = () => (S.min ? 1 : 0) + (S.kamers ? 1 : 0) + (S.m2 ? 1 : 0) + (S.besch ? 1 : 0) + S.toew.length + (S.prov ? 1 : 0) + (S.hide ? 0 : 1) + (S.toeslag ? 1 : 0);

async function apply(o = {}) {
  store.set("zoek2", S); limit = 40;
  if (o.center !== false) await resolveCenter();
  FILTERED = ALL.filter(match);
  cluster.clearLayers(); cluster.addLayers(FILTERED.filter((i) => i.lat != null).map(marker));
  if (circle) { map.removeLayer(circle); circle = null; }
  if (CENTER && S.km) {
    circle = L.circle(CENTER, { radius: S.km * 1000, color: "#072045", weight: 1.5, dashArray: "4 6", fillColor: "#FD7502", fillOpacity: 0.04, interactive: false }).addTo(map);
    if (o.fit !== false) map.fitBounds(circle.getBounds(), { padding: [16, 16] });
  } else if (o.fit !== false) {
    if (S.prov && PROVB[S.prov]) map.fitBounds(PROVB[S.prov]);
    else if (S.plaats.trim() && FILTERED.some((i) => i.lat != null)) map.fitBounds(L.latLngBounds(FILTERED.filter((i) => i.lat != null).map((i) => [i.lat, i.lon])).pad(0.2), { maxZoom: 13 });
    else map.fitBounds(NL);
  }
  sync(); render();
}
function sync() {
  $("plaats").value = S.plaats; $("km").value = String(S.km); $("km").disabled = !S.plaats.trim();
  $("max").value = String(S.max); $("type").value = S.type; $("sort").value = S.sort;
  document.querySelectorAll("#chips .chip").forEach((b) => { const q = b.dataset.q; b.setAttribute("aria-pressed", q.startsWith("sec:") ? S.sectors.includes(q.slice(4)) : !!S[q]); });
  const n = nFilters(); $("fcount").textContent = n; $("fcount").hidden = !n;
}
function title(n) {
  const w = S.plaats.trim() ? ` in ${S.plaats.trim()}${S.km ? " en omgeving" : ""}` : S.prov ? ` in ${S.prov}` : " in Nederland";
  return `${n.toLocaleString("nl-NL")} ${n === 1 ? "huurwoning" : "huurwoningen"}${w}`;
}
function render() {
  const list = sorted(FILTERED);
  $("rtitle").textContent = title(list.length);
  const last = LIVE_LAST ? `Bijgewerkt ${ago(LIVE_LAST)}` : "";
  $("rsub").innerHTML = `<i></i>${[S.max ? "tot " + eur0(S.max) : "", last].filter(Boolean).join(" · ")}`;
  window.ITEMS_BY_ID = new Map(ALL.map((i) => [i.id, i]));
  if (!ALL.length) { $("list").innerHTML = Array.from({ length: 5 }, () => `<div class="skeleton sk-row"></div>`).join(""); return; }
  if (!list.length) {
    $("list").innerHTML = `<div class="empty"><b>Geen woningen gevonden</b>Probeer een hogere maximale huur, een grotere afstand of minder filters.<br><button class="btn" type="button" id="wis">Wis alle filters</button></div>`;
    $("wis").onclick = () => { Object.assign(S, structuredClone(DEF), { max: 0 }); apply(); }; return;
  }
  $("list").innerHTML = list.slice(0, limit).map((i) => PropertyCard(i, { variant: "row", active: i.id === activeId })).join("") +
    (list.length > limit ? `<button class="btn more" id="more" type="button">Meer woningen laden (${(list.length - limit).toLocaleString("nl-NL")})</button>` : "");
  const mb = $("more"); if (mb) mb.onclick = () => { limit += 40; render(); };
}
// klik op kaart in de lijst: kaart naar de woning (titel en knop openen de detailpagina)
$("list").addEventListener("click", (e) => {
  if (e.target.closest("a, button")) return;
  const c = e.target.closest(".pcard"); if (!c) return;
  const i = ALL.find((x) => x.id === c.dataset.id); if (!i) return;
  if (innerWidth <= 960 || i.lat == null) { location.href = "/woning?id=" + encodeURIComponent(i.id); return; }
  select(i.id); const m = marker(i); if (!cluster.hasLayer(m)) cluster.addLayer(m); cluster.zoomToShowLayer(m, () => m.openPopup());
});
$("list").addEventListener("mouseover", (e) => { const c = e.target.closest(".pcard"); if (!c) return; const m = mcache.get(c.dataset.id); if (m && m._icon) m._icon.style.zIndex = 9999; });
function select(id, scroll) {
  activeId = id; document.querySelectorAll(".pcard.active").forEach((c) => c.classList.remove("active"));
  const c = document.querySelector(`.pcard[data-id="${CSS.escape(id)}"]`); if (c) { c.classList.add("active"); if (scroll) c.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
}
document.addEventListener("tracker", () => { if (S.fav) apply({ fit: false, center: false }); if (!$("v-mijn").hidden) renderMijn(); });

// ---------------------------------------------------------------- bediening
let tq; $("plaats").addEventListener("input", () => { clearTimeout(tq); tq = setTimeout(() => { S.plaats = $("plaats").value; if (S.plaats && !S.km && /^\d{4}/.test(S.plaats)) S.km = 5; apply(); }, 400); });
$("km").onchange = () => { S.km = +$("km").value; apply(); };
$("max").onchange = () => { S.max = +$("max").value; apply({ fit: false, center: false }); };
$("type").onchange = () => { S.type = $("type").value; apply({ fit: false, center: false }); };
$("sort").onchange = () => { S.sort = $("sort").value; store.set("zoek2", S); render(); };
document.querySelectorAll("#chips .chip").forEach((b) => b.addEventListener("click", () => {
  const q = b.dataset.q;
  if (q.startsWith("sec:")) { const v = q.slice(4), k = S.sectors.indexOf(v); k >= 0 ? S.sectors.splice(k, 1) : S.sectors.push(v); } else S[q] = !S[q];
  apply({ fit: false, center: false });
}));
// filterpaneel
const opt = (el, list, key, multi) => {
  $(el).innerHTML = list.map(([v, l]) => `<button class="chip" type="button" data-v="${esc(v)}">${l}</button>`).join("");
  $(el).onclick = (e) => { const b = e.target.closest(".chip"); if (!b) return; const v = isNaN(+b.dataset.v) || b.dataset.v === "" ? b.dataset.v : +b.dataset.v;
    if (multi) { const k = D[key].indexOf(v); k >= 0 ? D[key].splice(k, 1) : D[key].push(v); } else D[key] = D[key] === v ? (typeof v === "number" ? 0 : "") : v; dsync(); };
};
let D = {};
opt("o-type", [["", "Alle typen"], ["kamer", "Kamer"], ["zelfstandig", "Studio of appartement"]], "type");
opt("o-kamers", [[0, "Maakt niet uit"], [1, "1+"], [2, "2+"], [3, "3+"], [4, "4+"]], "kamers");
opt("o-m2", [[0, "Maakt niet uit"], [20, "20 m²+"], [30, "30 m²+"], [45, "45 m²+"], [60, "60 m²+"], [80, "80 m²+"]], "m2");
opt("o-besch", [["", "Maakt niet uit"], ["direct", "Direct"], ["1m", "Binnen 1 maand"], ["3m", "Binnen 3 maanden"]], "besch");
opt("o-toew", [["loting", "Loting"], ["wie eerst komt", "Direct reageren"], ["hospiteren", "Hospiteren"], ["inschrijfduur", "Inschrijfduur"], ["vrije sector", "Vrije sector"]], "toew", true);
$("dprov").insertAdjacentHTML("beforeend", Object.keys(PROVB).map((p) => `<option>${p}</option>`).join(""));
function dsync() {
  $("dmin").value = String(D.min); $("dmax").value = String(D.max); $("dprov").value = D.prov; $("dhide").checked = D.hide; $("dtoeslag").checked = D.toeslag;
  [["o-type", "type"], ["o-kamers", "kamers"], ["o-m2", "m2"], ["o-besch", "besch"]].forEach(([el, k]) => $(el).querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(D[k]) === b.dataset.v)));
  $("o-toew").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", D.toew.includes(b.dataset.v)));
  const n = ALL.filter((i) => { const s = { ...S }; Object.assign(S, D); const r = match(i); Object.assign(S, s); return r; }).length;
  $("applyf").textContent = `Toon ${n.toLocaleString("nl-NL")} woningen`;
}
["dmin", "dmax"].forEach((id) => ($(id).onchange = () => { D[id === "dmin" ? "min" : "max"] = +$(id).value; dsync(); }));
$("dprov").onchange = () => { D.prov = $("dprov").value; dsync(); };
$("dhide").onchange = () => { D.hide = $("dhide").checked; dsync(); };
$("dtoeslag").onchange = () => { D.toeslag = $("dtoeslag").checked; dsync(); };
const openD = () => { D = structuredClone(S); dsync(); $("drawer").hidden = false; }, closeD = () => { $("drawer").hidden = true; };
$("openf").onclick = openD; $("closef").onclick = closeD; $("dbg").onclick = closeD;
addEventListener("keydown", (e) => { if (e.key === "Escape") closeD(); });
$("applyf").onclick = () => { const provChanged = D.prov !== S.prov; Object.assign(S, D); closeD(); apply({ fit: provChanged, center: false }); };
$("resetf").onclick = () => { Object.assign(D, { min: 0, type: "", kamers: 0, m2: 0, besch: "", toew: [], prov: "", hide: true, toeslag: false }); dsync(); };
// mobiel
function setM(v) { document.body.dataset.m = v; $("mswitch").innerHTML = v === "kaart" ? `${icon("list")}Toon lijst` : `${icon("map")}Toon kaart`; }
$("mswitch").onclick = () => setM(document.body.dataset.m === "kaart" ? "lijst" : "kaart"); setM("lijst");

// ---------------------------------------------------------------- Mijn woningen
function route() {
  const mijn = location.hash === "#mijn";
  $("v-zoeken").hidden = mijn; $("v-mijn").hidden = !mijn; $("bar").hidden = mijn;
  document.title = (mijn ? "Mijn woningen" : "Woningen") + " · HuurHub";
  if (mijn) renderMijn(); else setTimeout(() => map.invalidateSize(), 30);
}
addEventListener("hashchange", route);
function renderMijn() {
  const E = Object.entries(Tracker.data).map(([id, t]) => ({ id, ...t, live: ALL.find((x) => x.id === id) }));
  const c = (s) => E.filter((e) => e.status === s).length;
  $("tstats").innerHTML = [["bewaard", "Favorieten"], ["gereageerd", "Gereageerd"], ["bezichtiging", "Bezichtigingen"], ["aangeboden", "Aangeboden"]].map(([v, l]) => `<div class="stat"><b class="num">${c(v)}</b><span>${l}</span></div>`).join("");
  const urgent = E.filter((e) => e.status === "bewaard" && e.live && deadline(e.live)?.soon && !deadline(e.live)?.closed);
  $("talert").innerHTML = urgent.length ? `<div class="alert"><h3>Nog niet gereageerd en bijna gesloten</h3>${urgent.map((e) => `<div>${esc(e.live.adres)}, ${esc(e.live.plaats)}: ${esc(deadline(e.live).text.toLowerCase())} · <a href="${esc(e.live.url)}" target="_blank" rel="noopener">Nu reageren</a></div>`).join("")}</div>` : "";
  $("board").innerHTML = STATUSSEN.map(([v, l]) => {
    const it = E.filter((e) => e.status === v).sort((a, b) => (b.bijgewerkt || "").localeCompare(a.bijgewerkt || ""));
    return `<div class="col"><h3>${l}<span>${it.length}</span></h3>${it.length ? it.map(tcard).join("") : `<div class="colempty">${v === "bewaard" ? "Klik op het hartje bij een woning om hem hier op te slaan." : "Nog niets."}</div>`}</div>`;
  }).join("");
}
function tcard(e) {
  const i = e.live || e.item || {}, dl = e.live ? deadline(e.live) : null;
  return `<div class="tc" data-tid="${esc(e.id)}"><a href="/woning?id=${encodeURIComponent(e.id)}"><div class="img" style="${i.foto ? `background-image:url('${esc(i.foto).replace(/'/g, "%27")}')` : ""}"></div></a>
    <div class="b"><div class="pr">${i.huur ? eur(i.huur) : ""} <small class="muted" style="font-weight:600">/ maand</small></div>
    <div class="ad">${esc(i.adres)}<small>${esc(i.plaats || "")}${e.live ? "" : " · advertentie offline"}</small></div>
    ${dl && !dl.closed ? `<div><span class="badge ${dl.soon ? "badge-red" : ""}">${esc(dl.text)}</span></div>` : ""}
    <select data-st aria-label="Status">${STATUSSEN.map(([v, l]) => `<option value="${v}" ${e.status === v ? "selected" : ""}>${l}</option>`).join("")}</select>
    <textarea data-note placeholder="Notitie, bijvoorbeeld de datum van de bezichtiging">${esc(e.notitie || "")}</textarea>
    <div class="row"><span>Sinds ${e.sinds ? new Date(e.sinds).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "–"}</span><span><a href="${esc(i.url || "#")}" target="_blank" rel="noopener">Advertentie</a> · <a href="#" data-del>Verwijder</a></span></div></div></div>`;
}
$("board").addEventListener("change", async (e) => { const c = e.target.closest(".tc"); if (!c || !e.target.matches("[data-st]")) return; const t = Tracker.get(c.dataset.tid); await Tracker.set({ id: c.dataset.tid, item: t.item }, e.target.value, t.notitie); });
$("board").addEventListener("focusout", async (e) => { const c = e.target.closest(".tc"); if (!c || !e.target.matches("[data-note]")) return; const t = Tracker.get(c.dataset.tid); if ((t.notitie || "") === e.target.value) return; await Tracker.set({ id: c.dataset.tid, item: t.item }, t.status, e.target.value); toast("Notitie opgeslagen"); });
$("board").addEventListener("click", async (e) => { if (!e.target.matches("[data-del]")) return; e.preventDefault(); const c = e.target.closest(".tc"); const t = Tracker.get(c.dataset.tid); await Tracker.set({ id: c.dataset.tid, item: t.item }, ""); });

// ---------------------------------------------------------------- live data
let LIVE_LAST = null;
async function load() {
  const d = await (await fetch("/api/listings", { cache: "no-store" })).json();
  LIVE_LAST = Object.values(d.status || {}).map((s) => s.lastOk).filter(Boolean).sort().pop();
  const first = !ALL.length, before = new Set(ALL.map((i) => i.id)), prev = new Map(ALL.map((i) => [i.id, i]));
  for (const i of d.items) { const p = prev.get(i.id); if (p && (p.huur !== i.huur || p.lat !== i.lat)) mcache.delete(i.id); }
  VERSION = d.version;
  $("dl").innerHTML = [...new Set(d.items.map((i) => i.plaats).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl")).map((p) => `<option value="${esc(p)}">`).join("");
  ALL = d.items;
  if (first) { await apply(); return; }
  const fresh = ALL.filter((i) => !before.has(i.id) && match(i));
  if (fresh.length) {
    $("newbar").innerHTML = `<div class="newbar"><span>${fresh.length} ${fresh.length === 1 ? "nieuwe woning past" : "nieuwe woningen passen"} bij je zoekopdracht</span><button class="btn btn-sm btn-primary" type="button" id="shownew">Toon</button></div>`;
    $("shownew").onclick = () => { $("newbar").innerHTML = ""; S.sort = "nieuw"; apply({ fit: false, center: false }); };
  } else { FILTERED = ALL.filter(match); render(); cluster.clearLayers(); cluster.addLayers(FILTERED.filter((i) => i.lat != null).map(marker)); }
  if (!$("v-mijn").hidden) renderMijn();
}
async function poll() {
  try { const st = await (await fetch("/api/status", { cache: "no-store" })).json(); if (st.version !== VERSION) await load(); } catch {}
}
sync(); render(); route();
Tracker.ready.then(load).then(route);
setInterval(poll, 20000);
