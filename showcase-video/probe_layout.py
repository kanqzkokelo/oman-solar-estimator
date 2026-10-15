#!/usr/bin/env python3
"""Drive to the traced state and measure layout overflow + panel rects."""
import time, json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.action_chains import ActionChains

opts = Options()
opts.add_argument("-headless")
driver = webdriver.Firefox(options=opts)
driver.set_window_size(1920, 1080)
try:
    driver.get("http://localhost:3000")
    time.sleep(3)
    js_btn = """const rx=new RegExp(arguments[0],'i');
      const b=[...document.querySelectorAll('button,a,[role=button]')].find(e=>rx.test((e.innerText||'').trim()));
      if(!b) return false; window.__btn=b; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
      window.__btnRect={x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}; return true;"""
    def click(pattern):
        ok = driver.execute_script(js_btn, pattern)
        assert ok, pattern
        c = driver.execute_script("return window.__btnRect")
        driver.execute_script("window.__btn.click()")
        return c
    click("start estimating"); time.sleep(3)
    click("demo roof"); time.sleep(8)
    click("trace"); time.sleep(1)
    mc = driver.execute_script("const c=document.querySelector('.maplibregl-canvas');const r=c.getBoundingClientRect();return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};")
    for dx, dy in [(-32,-22),(34,-25),(37,23),(-29,26)]:
        ActionChains(driver).move_to_element_with_offset(driver.find_element("css selector","body"), mc["cx"]+dx-960, mc["cy"]+dy-540).click().perform(); time.sleep(0.7)
    click("finish"); time.sleep(4)
    m = driver.execute_script("""
        const aside = document.querySelector('aside');
        const doc = document.documentElement;
        const r = el => { const b = el.getBoundingClientRect(); return {x:Math.round(b.x), y:Math.round(b.y), w:Math.round(b.width), h:Math.round(b.height)}; };
        return {
          innerWidth: window.innerWidth, scrollWidth: doc.scrollWidth,
          bodyScrollW: document.body.scrollWidth,
          aside: aside ? r(aside) : null,
          asideCards: aside ? [...aside.children].map(r) : [],
          mapCanvas: (()=>{ const c=document.querySelector('.maplibregl-canvas'); return c? r(c):null; })(),
        };
    """)
    print(json.dumps(m, indent=1))
finally:
    driver.quit()
