#!/usr/bin/env python3
"""Maakt de screenshots voor de startpagina (static/img/). Huurhub moet draaien.

Gebruik:  .venv/bin/python tools/screenshots.py
"""
import asyncio, json, sys, urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://localhost:8765"
OUT = Path(__file__).resolve().parent.parent / "static" / "img"
OUT.mkdir(parents=True, exist_ok=True)


def api(path, body=None):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json"}, method="POST" if body is not None else "GET")
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


async def settle(pg, ms=2500):
    await pg.wait_for_load_state("networkidle")
    await pg.wait_for_timeout(ms)


async def main():
    items = api("/api/listings")["items"]
    utrecht = [i for i in items if i.get("plaats") == "Utrecht" and i.get("foto") and i["huur"] <= 900 and i.get("lat")
               and i.get("doelgroep") not in ("senioren", "zorg", "gezinnen")]
    voorbeeld = sorted(utrecht, key=lambda i: (i["type"] == "kamer", -(i.get("m2") or 0)))[0] if utrecht else items[0]

    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, color_scheme="light", locale="nl-NL")
        pg = await ctx.new_page()

        # 1. hoofdscherm: Utrecht + 10 km
        await pg.goto(f"{BASE}/woningen?plaats=Utrecht&km=10&max=1100")
        await pg.wait_for_selector(".pcard img", timeout=30000)
        await settle(pg, 3000)
        await pg.screenshot(path=OUT / "hub-desktop.png")

        # 2. woning op de kaart met ballon
        await pg.evaluate("""(id) => { const i = ALL.find((x) => x.id === id); select(i.id); const m = marker(i); if (!cluster.hasLayer(m)) cluster.addLayer(m); cluster.zoomToShowLayer(m, () => m.openPopup()); }""", voorbeeld["id"])
        await pg.wait_for_timeout(3500)
        await pg.screenshot(path=OUT / "hub-popup.png", clip={"x": 600, "y": 150, "width": 840, "height": 640})

        # 3. filterpaneel
        await pg.evaluate("map.closePopup()")
        await pg.click("#openf")
        await pg.click("#o-toew .chip[data-v='loting']")
        await pg.click("#o-kamers .chip[data-v='2']")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=OUT / "hub-filters.png", clip={"x": 600, "y": 0, "width": 840, "height": 760})
        await pg.click("#closef")

        # 4. mijn reacties met voorbeeldwoningen (worden daarna weer verwijderd)
        voor = api("/api/tracker")
        demo = [i for i in items if i.get("foto") and i["huur"] <= 900 and i.get("doelgroep") not in ("senioren", "zorg")][:9]
        statussen = ["bewaard", "bewaard", "gereageerd", "gereageerd", "gereageerd", "bezichtiging", "aangeboden", "afgewezen", "bewaard"]
        notes = {"bezichtiging": "Bezichtiging dinsdag 16:00", "gereageerd": "Reactie verstuurd", "aangeboden": "Contract ondertekenen vóór vrijdag"}
        added = []
        for i, st in zip(demo, statussen):
            if i["id"] in voor:
                continue
            api("/api/tracker", {"id": i["id"], "status": st, "notitie": notes.get(st, ""), "item": {k: i.get(k) for k in ("id", "adres", "plaats", "huur", "foto", "url", "sluit")}})
            added.append(i["id"])
        try:
            await pg.goto(f"{BASE}/")
            await pg.goto(f"{BASE}/woningen#mijn")
            await pg.wait_for_selector(".tc", timeout=20000)
            await settle(pg, 2000)
            await pg.screenshot(path=OUT / "hub-reacties.png", clip={"x": 0, "y": 0, "width": 1440, "height": 860})
        finally:
            for tid in added:
                api("/api/tracker", {"id": tid, "status": ""})

        # 5. telefoon
        m = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, color_scheme="light", locale="nl-NL")
        mp = await m.new_page()
        await mp.goto(f"{BASE}/woningen?plaats=Amsterdam&km=10&max=1100")
        await mp.wait_for_selector(".pcard img", timeout=30000)
        await settle(mp, 3000)
        await mp.screenshot(path=OUT / "hub-mobile.png")
        await mp.goto(f"{BASE}/")
        await settle(mp, 2000)
        await mp.screenshot(path=OUT / "start-mobile.png", full_page=False)

        # 6. controle-screenshots (niet gebruikt op de site)
        chk = OUT.parent.parent / "data" / "check"; chk.mkdir(exist_ok=True)
        await pg.goto(f"{BASE}/"); await settle(pg, 3000)
        await pg.screenshot(path=chk / "home.png", full_page=True)
        await pg.goto(f"{BASE}/woning?id={voorbeeld['id']}"); await settle(pg, 2500)
        await pg.screenshot(path=chk / "detail.png", full_page=True)
        await pg.goto(f"{BASE}/hoe-werkt-het"); await settle(pg, 1500)
        await pg.screenshot(path=chk / "hoe.png", full_page=True)
        await pg.goto(f"{BASE}/woning-plaatsen"); await settle(pg, 1000)
        await pg.screenshot(path=chk / "plaatsen.png", full_page=True)
        await mp.goto(f"{BASE}/woning?id={voorbeeld['id']}"); await settle(mp, 2000)
        await mp.screenshot(path=chk / "detail-mobile.png")
        await b.close()
    print("Screenshots opgeslagen in", OUT)


if __name__ == "__main__":
    asyncio.run(main())
