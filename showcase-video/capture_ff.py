#!/usr/bin/env python3
"""Drive the Oman Solar Estimator in Firefox (headless, WebGL OK).
Full demo choreography: hero -> wizard -> Demo roof fly-in -> trace 4 corners
-> finish polygon -> details -> bill -> calculate -> results scroll-through.
Screenshots per state + actions.json with exact click coords for the video."""
import json, os, time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.action_chains import ActionChains

BASE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(BASE, "assets")
os.makedirs(A, exist_ok=True)
actions = []

opts = Options()
opts.add_argument("-headless")
for k, v in {
    "layout.css.devPixelsPerPx": "1",
    "permissions.default.desktop-notification": 2,
    "dom.push.enabled": False,
    "dom.webnotifications.enabled": False,
    "browser.warnOnQuit": False,
    "media.volume_scale": "0.0",
}.items():
    opts.set_preference(k, v)

driver = webdriver.Firefox(options=opts)
driver.set_window_size(1920, 1080)
try:
    driver.get("http://localhost:3000")
    time.sleep(3)
    iw, ih = driver.execute_script("return [window.innerWidth, window.innerHeight]")
    driver.set_window_size(1920 + (1920 - iw), 1080 + (1080 - ih))
    time.sleep(1)
    print("viewport:", driver.execute_script("return [window.innerWidth, window.innerHeight]"),
          "webgl:", driver.execute_script("return !!(document.createElement('canvas').getContext('webgl2')||document.createElement('canvas').getContext('webgl'))"))

    def shot(name):
        driver.get_screenshot_as_file(os.path.join(A, name + ".png"))
        print("shot:", name, flush=True)

    def find_btn(pattern):
        ok = driver.execute_script("""
            const rx = new RegExp(arguments[0], 'i');
            const b = [...document.querySelectorAll('button, a, [role=button]')].find(e => rx.test((e.innerText||'').trim()));
            if (!b) return false;
            window.__btn = b;
            b.scrollIntoView({block:'center'});
            const r = b.getBoundingClientRect();
            window.__btnRect = {x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)};
            return true;
        """, pattern)
        if not ok:
            return None
        r = driver.execute_script("return window.__btnRect")
        r["text"] = driver.execute_script("return (window.__btn.innerText||'').trim().slice(0,40)")
        return r

    def click_btn(b):
        actions.append({"from": SHOT[-1] if SHOT else "?", "click": {k: b[k] for k in ("x", "y")}, "label": b["text"]})
        driver.execute_script("window.__btn.click();")

    def real_click(x, y, label, frm):
        ActionChains(driver).move_to_element_with_offset(
            driver.find_element("css selector", "body"), x - 960, y - 540).click().perform()
        actions.append({"from": frm, "click": {"x": x, "y": y}, "label": label})
        print("click:", label, x, y, flush=True)

    def hide_readout_pill():
        # app layout bug at 1920x1080: the map's bottom-right area pill collides
        # with the floating side panel; the panel already shows the same stats.
        driver.execute_script("""
          [...document.querySelectorAll('div')].forEach(e => {
            const c = e.className || '';
            if (typeof c === 'string' && c.includes('bottom-3') && c.includes('right-3')
                && c.includes('bg-dune-950/85') && c.includes('backdrop-blur')) e.style.display = 'none';
          });
        """)

    SHOT = []
    def snap(name):
        SHOT.append(name); shot(name)

    # S1 hero
    driver.execute_script("window.scrollTo(0,0)")
    time.sleep(1.2)
    snap("01-hero")

    b = find_btn("start estimating")
    assert b, "no start estimating"
    click_btn(b); time.sleep(3)
    snap("02-wizard")

    # Demo roof: fly to ISM campus
    b = find_btn("demo roof")
    assert b, "no demo roof btn"
    click_btn(b); time.sleep(9)  # flyTo ease ~ several seconds
    hide_readout_pill()
    snap("03-campus")

    # Trace my roof
    b = find_btn("trace my roof|trace roof|trace")
    assert b, "no trace btn"
    click_btn(b); time.sleep(1.5)

    # 4 corners around map center (~35-45 m roof at z17.5)
    mc = driver.execute_script("""
        const c = document.querySelector('.maplibregl-canvas');
        const r = c.getBoundingClientRect();
        return {cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2)};
    """)
    cx, cy = mc["cx"], mc["cy"]
    corners = [(cx - 32, cy - 22), (cx + 34, cy - 25), (cx + 37, cy + 23), (cx - 29, cy + 26)]
    for i, (x, y) in enumerate(corners, 1):
        real_click(x, y, f"Corner {i}", "03-campus")
        time.sleep(0.8)
    hide_readout_pill()
    snap("04-corners")

    # Finish polygon
    b = find_btn("finish")
    assert b, "no finish btn"
    click_btn(b); time.sleep(2.5)  # area calc + governorate detect
    hide_readout_pill()
    snap("05-traced")
    print("readout:", driver.execute_script(
        "const m=document.body.innerText.match(/[^\\n]*(m\\u00b2|panel|capacity|usable)[^\\n]*/gi); return (m||[]).slice(0,6)"), flush=True)

    # Continue to details
    b = find_btn("continue")
    assert b, "no continue btn"
    click_btn(b); time.sleep(2.5)
    snap("06-details")

    # Bill input
    inp = driver.execute_script("""
        const els = [...document.querySelectorAll('input')].filter(e => e.offsetParent);
        const i = els.find(e => (e.type||'').match(/number|decimal|text/) && /bill|omr|amount/i.test((e.placeholder||'') + ' ' + (e.name||'') + ' ' + (e.id||''))) || els.find(e => (e.type||'') === 'number');
        if (!i) return null;
        i.scrollIntoView({block:'center'});
        const r = i.getBoundingClientRect();
        i.focus();
        return {x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), ph: i.placeholder || '', id: i.id};
    """)
    if inp:
        actions.append({"from": "06-details", "click": {k: inp[k] for k in ("x", "y")}, "label": "Bill input", "type": "150"})
        el = driver.switch_to.active_element
        el.clear(); el.send_keys("150")
        time.sleep(1.8)
        snap("07-bill")

    # Calculate
    b = find_btn("calculate|see results|show results|get estimate")
    assert b, "no calculate btn"
    # ensure the button is actually visible in-frame for the video cursor
    for _ in range(3):
        r = driver.execute_script("const r=window.__btn.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)}")
        if 0 < r["y"] < 1000:
            break
        driver.execute_script("window.scrollTo(0, window.scrollY + window.__btn.getBoundingClientRect().y - 800)")
        time.sleep(0.7)
    b.update(r)
    click_btn(b); time.sleep(5)
    snap("08-results")
    for name, frac in [("09-results-mid", 0.33), ("10-results-chart", 0.55), ("11-results-impact", 0.8)]:
        driver.execute_script("window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * arguments[0])", frac)
        time.sleep(1.6)
        snap(name)

    with open(os.path.join(BASE, "actions.json"), "w") as f:
        json.dump({"browser": "firefox-headless-webgl", "viewport": [1920, 1080], "actions": actions}, f, indent=2)
    print("ACTIONS:", json.dumps(actions), flush=True)
finally:
    driver.quit()
print("DONE")
