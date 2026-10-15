#!/usr/bin/env python3
"""Drive to step 2 and dump the real UI state (buttons, inputs, headings)."""
import time, json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

opts = Options()
opts.add_argument("-headless")
driver = webdriver.Firefox(options=opts)
driver.set_window_size(1920, 1080)
try:
    driver.get("http://localhost:3000")
    time.sleep(3)
    js_btn = """const rx=new RegExp(arguments[0],'i');
      const b=[...document.querySelectorAll('button,a,[role=button]')].find(e=>rx.test((e.innerText||'').trim()));
      if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};"""
    b = driver.execute_script(js_btn, "start estimating")
    driver.execute_script("document.elementFromPoint(arguments[0],arguments[1])?.closest('button,a')?.click();", *b.values()); time.sleep(3)
    b = driver.execute_script(js_btn, "demo roof")
    driver.execute_script("document.elementFromPoint(arguments[0],arguments[1])?.closest('button,a')?.click();", *b.values()); time.sleep(8)
    b = driver.execute_script(js_btn, "trace")
    driver.execute_script("document.elementFromPoint(arguments[0],arguments[1])?.closest('button,a')?.click();", *b.values()); time.sleep(1)
    mc = driver.execute_script("const c=document.querySelector('.maplibregl-canvas');const r=c.getBoundingClientRect();return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};")
    from selenium.webdriver.common.action_chains import ActionChains
    for dx, dy in [(-38,-26),(42,-30),(46,28),(-34,32)]:
        ActionChains(driver).move_to_element_with_offset(driver.find_element("css selector","body"), mc["cx"]+dx-960, mc["cy"]+dy-540).click().perform(); time.sleep(0.7)
    b = driver.execute_script(js_btn, "finish")
    driver.execute_script("document.elementFromPoint(arguments[0],arguments[1])?.closest('button,a')?.click();", *b.values()); time.sleep(2.5)
    b = driver.execute_script(js_btn, "continue")
    print("continue btn:", b)
    driver.execute_script("document.elementFromPoint(arguments[0],arguments[1])?.closest('button,a')?.click();", *b.values()); time.sleep(3)
    state = driver.execute_script("""
        return {
          headings: [...document.querySelectorAll('h1,h2,h3')].map(h=>h.innerText.trim()).filter(Boolean).slice(0,8),
          buttons: [...document.querySelectorAll('button')].map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,20),
          inputs: [...document.querySelectorAll('input')].map(i=>({type:i.type, ph:i.placeholder, id:i.id, visible:!!i.offsetParent})),
        };
    """)
    print(json.dumps(state, indent=1)[:2200])
finally:
    driver.quit()
