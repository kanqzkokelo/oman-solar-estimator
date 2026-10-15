#!/usr/bin/env python3
"""Measure the area-readout pill vs the map container and aside."""
import time, json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.action_chains import ActionChains

opts = Options(); opts.add_argument("-headless")
d = webdriver.Firefox(options=opts); d.set_window_size(1920, 1080)
try:
    js = """const rx=new RegExp(arguments[0],'i');
      const b=[...document.querySelectorAll('button, a, [role=button]')].find(e=>rx.test((e.innerText||'').trim()));
      if(!b) return false; window.__btn=b; b.scrollIntoView({block:'center'}); return true;"""
    d.get("http://localhost:3000")
    for _ in range(10):
        if d.execute_script(js, "start estimating"):
            break
        time.sleep(1.5)
    time.sleep(3)
    def click(p):
        assert d.execute_script(js, p), p
        d.execute_script("window.__btn.click()")
    click("start estimating"); time.sleep(3)
    click("demo roof"); time.sleep(8)
    click("trace"); time.sleep(1)
    mc = d.execute_script("const c=document.querySelector('.maplibregl-canvas');const r=c.getBoundingClientRect();return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};")
    for dx, dy in [(-32, -22), (34, -25), (37, 23), (-29, 26)]:
        ActionChains(d).move_to_element_with_offset(d.find_element("css selector", "body"), mc["cx"] + dx - 960, mc["cy"] + dy - 540).click().perform(); time.sleep(0.7)
    click("finish"); time.sleep(4)
    m = d.execute_script("""
        const pill = [...document.querySelectorAll('div')].find(e => /ROOFTOP AREA/i.test(e.innerText) && e.querySelector('p') && e.innerText.length < 120);
        const mapWrap = document.querySelector('.maplibregl-canvas')?.parentElement?.parentElement;
        const r = el => { if(!el) return null; const b = el.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
        return { pill: r(pill), pillText: pill ? pill.innerText.slice(0,90) : null,
                 mapWrap: r(mapWrap), aside: r(document.querySelector('aside')) };
    """)
    print(json.dumps(m, indent=1))
finally:
    d.quit()
