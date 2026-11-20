#!/usr/bin/env python3
"""Huurhub: lokale server die het huuraanbod van 26 Nederlandse portalen live bijhoudt.

Start:   .venv/bin/python server.py        (open daarna http://localhost:8765)
Opties:  HUURHUB_PORT=8765  HUURHUB_INTERVAL_MIN=15  HUURHUB_BROWSER_INTERVAL_MIN=30
"""
import asyncio, json, os, threading, time, traceback, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

import sources as S

ROOT = Path(__file__).parent
DATA = ROOT / "data"; DATA.mkdir(exist_ok=True)
PORT = int(os.environ.get("HUURHUB_PORT", 8765))
FAST_MIN = float(os.environ.get("HUURHUB_INTERVAL_MIN", 5))
BROWSER_MIN = float(os.environ.get("HUURHUB_BROWSER_INTERVAL_MIN", 10))

lock = threading.RLock()
by_source = {}      # bron -> [items]
status = {n: {"ok": None, "count": 0, "error": None, "lastOk": None, "lastTry": None, "ms": None} for n in S.ALL_SOURCES}
first_seen = {}     # id -> iso
geocache = {}       # key -> [lat, lon, provincie] | None
version = 0
refreshing = {"fast": False, "browser": False}
last_refresh = {"fast": None, "browser": None}
progress = {"fast": [0, 0], "browser": [0, 0]}
tracker = {}       # id -> {status, notitie, bijgewerkt, item}


def load(name, default):
    try:
        return json.loads((DATA / name).read_text())
    except Exception:
        return default


def save(name, obj):
    tmp = DATA / (name + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False))
    tmp.replace(DATA / name)


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S")


# ---------------------------------------------------------------- geocoding (PDOK Locatieserver, gratis overheidsdienst)
PDOK = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free"


def pdok(q, fq):
    url = PDOK + "?" + urllib.parse.urlencode({"q": q, "fq": fq, "rows": 1, "fl": "centroide_ll,provincienaam"})
    with urllib.request.urlopen(urllib.request.Request(url, headers=S.UA), timeout=15) as r:
        docs = json.load(r)["response"]["docs"]
    if not docs:
        return None
    lon, lat = map(float, docs[0]["centroide_ll"][6:-1].split())
    return [lat, lon, docs[0].get("provincienaam")]


def geo(key, q, fq):
    if key in geocache:
        return geocache[key]
    try:
        res = pdok(q, fq)
    except Exception:
        return None  # niet cachen; volgende ronde opnieuw
    geocache[key] = res
    return res


def enrich(items):
    for i in items:
        plaats = i.get("plaats") or ""
        if i.get("lat") is None:
            nr = i.get("huisnr") or "".join(ch for ch in (i.get("adres") or "").split(" ")[-1] if ch.isdigit()) or ""
            # adres zoeken: eerst op postcode+nummer, dan op tekst
            g, prec = None, "adres"
            if i.get("postcode") and nr:
                g = geo(f"pc:{i['postcode']}:{nr}", f"{i['postcode']} {nr}", "type:adres")
            if not g and i.get("adres"):
                g = geo(f"adr:{i['adres']}|{plaats}", f"{i['adres']} {plaats}", "type:adres")
            if not g and plaats:
                g, prec = geo(f"wp:{plaats}", plaats, "type:woonplaats"), "plaats"
            if g:
                i["lat"], i["lon"], i["provincie"] = g[0], g[1], g[2]
                i["geoPrecisie"] = prec
        if not i.get("provincie") and plaats:
            g = geo(f"wp:{plaats}", plaats, "type:woonplaats")
            i["provincie"] = g[2] if g else None
    return items


# ---------------------------------------------------------------- verversen
def store(naam, items, err, t0):
    global version
    if items is not None:
        items = enrich(items)  # buiten de lock: dit kan even duren
    with lock:
        st = status.setdefault(naam, {})
        st["lastTry"] = now(); st["ms"] = int((time.time() - t0) * 1000)
        if items is None:
            st.update(ok=False, error=err)
        else:
            ts = now()
            eerste_keer = naam not in by_source  # bron nog nooit gezien: dan is "nieuw" de publicatiedatum
            for i in items:
                if i["id"] not in first_seen:
                    pub = (i.get("geplaatst") or "").replace(" ", "T")[:19]
                    first_seen[i["id"]] = min(pub, ts) if pub else ("2000-01-01T00:00:00" if eerste_keer else ts)
                i["nieuwSinds"] = first_seen[i["id"]]
            by_source[naam] = items
            st.update(ok=True, error=None, count=len(items), lastOk=ts)
        version += 1
    persist()


_last_save = {"t": 0.0}


def persist(force=False):
    """Schrijf hooguit eens per 5 seconden naar schijf; aan het eind van een ronde altijd."""
    if not force and time.time() - _last_save["t"] < 5:
        return
    _last_save["t"] = time.time()
    with lock:
        snap = {"by_source": by_source, "status": status}
        save("snapshot.json", snap)
        save("seen.json", first_seen)
        save("geocache.json", geocache)


def refresh_fast():
    if refreshing["fast"]:
        return
    refreshing["fast"] = True
    try:
        jobs = {S.ZIG[h][0]: (lambda h=h: S.fetch_zig(h)) for h in S.ZIG}
        jobs["SSH (Utrecht, Rotterdam, Zwolle e.a.)"] = S.fetch_ssh
        progress["fast"] = [0, len(jobs)]

        def run(naam):
            t0 = time.time()
            try:
                return naam, jobs[naam](), None, t0
            except Exception as e:
                return naam, None, f"{type(e).__name__}: {e}"[:200], t0
        with ThreadPoolExecutor(len(jobs)) as ex:
            for naam, items, err, t0 in ex.map(run, jobs):
                store(naam, items, err, t0)
                progress["fast"][0] += 1
                print(f"[{now()}] {naam}: {'%d woningen' % len(items) if items is not None else 'FOUT ' + err}", flush=True)
        last_refresh["fast"] = now()
    finally:
        refreshing["fast"] = False
        persist(force=True)


def refresh_browser():
    if refreshing["browser"]:
        return
    refreshing["browser"] = True
    progress["browser"] = [0, len(S.DAK) + 1]
    t0 = time.time()

    def report(naam, items, err):
        store(naam, items, err, t0)
        progress["browser"][0] += 1
        print(f"[{now()}] {naam}: {'%d woningen' % len(items) if items is not None else 'FOUT ' + str(err)}", flush=True)
    try:
        asyncio.run(S.fetch_browser_sources(report))
        last_refresh["browser"] = now()
    except Exception:
        traceback.print_exc()
    finally:
        refreshing["browser"] = False
        persist(force=True)


def loop(fn, minutes):
    while True:
        try:
            fn()
        except Exception:
            traceback.print_exc()
        time.sleep(minutes * 60)


def all_items():
    with lock:
        return [i for L in by_source.values() for i in L]


ZWAAR = ("fotos", "omschrijving", "kenmerken")


def light(i):
    d = {k: v for k, v in i.items() if k not in ZWAAR}
    d["nFotos"] = len(i.get("fotos") or [])
    return d


STEDEN = ["Amsterdam", "Rotterdam", "Utrecht", "Eindhoven", "Groningen", "Den Haag"]
ROUTES = {"/": "index.html", "/woningen": "woningen.html", "/woning": "woning.html", "/hub": "woningen.html"}
PAGINAS = ("hoe-werkt-het", "over-ons", "contact", "veelgestelde-vragen", "privacy", "voorwaarden", "woning-plaatsen", "inloggen")


def summary():
    items = all_items()
    cutoff = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(time.time() - 2 * 86400))
    nieuw = sorted((i for i in items if (i.get("nieuwSinds") or "") >= cutoff and i.get("foto")
                    and i.get("doelgroep") not in ("senioren", "zorg") and i["huur"] <= 1000),
                   key=lambda i: i.get("nieuwSinds") or "", reverse=True)
    prov = {}
    for i in items:
        if i.get("provincie"):
            prov[i["provincie"]] = prov.get(i["provincie"], 0) + 1
    plaatsen = sorted({i["plaats"] for i in items if i.get("plaats")})
    def pop_score(i):
        return (1 if i.get("toewijzing") in S.KANSRIJK else 0, i.get("nieuwSinds") or "")
    populair = sorted((i for i in items if i.get("foto") and i.get("type") == "zelfstandig" and 400 <= i["huur"] <= 1100
                       and i.get("doelgroep") not in ("senioren", "zorg", "gezinnen") and (i.get("m2") or 0) >= 25),
                      key=pop_score, reverse=True)
    gezien, pop = set(), []
    for i in populair:  # spreiden over plaatsen
        if i.get("plaats") in gezien and len(pop) < 6:
            continue
        gezien.add(i.get("plaats")); pop.append(light(i))
        if len(pop) == 8:
            break
    steden = {st: sum(1 for i in items if i.get("plaats") == st) for st in STEDEN}
    return {"totaal": len(items), "portalen": sum(1 for s in status.values() if s.get("ok")),
            "populair": pop, "steden": steden,
            "nieuw48u": sum(1 for i in items if (i.get("nieuwSinds") or "") >= cutoff),
            "zonderWachttijd": sum(1 for i in items if i.get("toewijzing") in S.KANSRIJK),
            "onder900": sum(1 for i in items if i["huur"] <= 900),
            "provincies": prov, "plaatsen": plaatsen, "nieuw": [light(i) for i in nieuw[:8]]}


# ---------------------------------------------------------------- http
class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT / "static"), **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        if not self.path.startswith("/img/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def meta(self):
        return {"version": version, "server": now(), "refreshing": refreshing, "progress": progress,
                "lastRefresh": last_refresh, "intervalMin": {"fast": FAST_MIN, "browser": BROWSER_MIN}, "status": status}

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        path, qs = u.path, urllib.parse.parse_qs(u.query)
        if path == "/api/listings":
            return self.send_json({**self.meta(), "items": [light(i) for i in all_items()]})
        if path == "/api/woning":
            wid = (qs.get("id") or [""])[0]
            items = all_items()
            i = next((x for x in items if x["id"] == wid), None)
            if not i:
                t = tracker.get(wid)
                return self.send_json({"offline": True, "item": (t or {}).get("item")}, 404)
            buren = sorted((x for x in items if x["id"] != wid and x.get("lat") and i.get("lat") and x.get("foto")
                            and x.get("doelgroep") not in ("senioren", "zorg") and abs(x["huur"] - i["huur"]) < 250),
                           key=lambda x: (x["lat"] - i["lat"]) ** 2 + ((x["lon"] - i["lon"]) * 0.62) ** 2)[:4]
            return self.send_json({"item": i, "vergelijkbaar": [light(x) for x in buren]})
        if path == "/api/status":
            with lock:
                return self.send_json(self.meta())
        if path == "/api/summary":
            return self.send_json({**summary(), "lastRefresh": last_refresh})
        if path == "/api/tracker":
            with lock:
                return self.send_json(tracker)
        if path == "/api/geocode":
            q = (qs.get("q") or [""])[0].strip()
            if not q:
                return self.send_json(None)
            g = geo(f"wp:{q}", q, "type:woonplaats") or geo(f"vrij:{q}", q, "type:(woonplaats OR adres OR postcode)")
            return self.send_json({"lat": g[0], "lon": g[1], "provincie": g[2]} if g else None)
        p2 = path.rstrip("/") or "/"
        if p2 in ROUTES:
            self.path = "/" + ROUTES[p2]
        elif p2.lstrip("/") in PAGINAS:
            self.path = "/pagina.html"
        return super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/refresh":
            threading.Thread(target=refresh_fast, daemon=True).start()
            threading.Thread(target=refresh_browser, daemon=True).start()
            return self.send_json({"started": True})
        if path == "/api/bericht":
            try:
                body = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length") or 0), 20000)) or b"{}")
                assert isinstance(body, dict) and body.get("soort") in ("contact", "plaatsen")
            except Exception:
                return self.send_json({"error": "Ongeldige invoer"}, 400)
            with lock:
                berichten = load("berichten.json", [])
                berichten.append({**{k: str(v)[:4000] for k, v in body.items()}, "ontvangen": now()})
                save("berichten.json", berichten)
            return self.send_json({"ok": True})
        if path == "/api/tracker":
            try:
                body = json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)) or b"{}")
                tid = str(body["id"])
            except Exception:
                return self.send_json({"error": "Ongeldige invoer"}, 400)
            with lock:
                if not body.get("status"):
                    tracker.pop(tid, None)
                else:
                    oud = tracker.get(tid, {})
                    tracker[tid] = {"status": body["status"], "notitie": body.get("notitie", oud.get("notitie", "")),
                                    "bijgewerkt": now(), "sinds": oud.get("sinds") if oud.get("status") == body["status"] else now(),
                                    "item": body.get("item") or oud.get("item")}
                save("tracker.json", tracker)
                return self.send_json(tracker.get(tid) or {})
        self.send_error(404)


def main():
    global first_seen, geocache, by_source, tracker
    snap = load("snapshot.json", {})
    by_source = snap.get("by_source", {})
    for k, v in (snap.get("status") or {}).items():
        status.setdefault(k, {}).update(v)
    first_seen = load("seen.json", {})
    geocache = load("geocache.json", {})
    tracker = load("tracker.json", {})
    threading.Thread(target=loop, args=(refresh_fast, FAST_MIN), daemon=True).start()
    threading.Thread(target=loop, args=(refresh_browser, BROWSER_MIN), daemon=True).start()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    print(f"Huurhub draait op http://localhost:{PORT}  (ververst elke {FAST_MIN:g} min, browserbronnen elke {BROWSER_MIN:g} min)", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
