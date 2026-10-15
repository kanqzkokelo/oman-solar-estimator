#!/usr/bin/env python3
"""Probe: does system Firefox render WebGL? Tries xvfb-headed first, then pure headless."""
import sys, os
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

def probe(headless):
    opts = Options()
    if headless:
        opts.add_argument("-headless")
    opts.add_argument("--width=1920")
    opts.add_argument("--height=1080")
    driver = webdriver.Firefox(options=opts)  # selenium-manager auto-fetches geckodriver
    try:
        driver.get("data:text/html,<canvas id=c></canvas>")
        driver.execute_script("window._r = false; try { const c=document.createElement('canvas'); const g=c.getContext('webgl2')||c.getContext('webgl'); window._r = !!g; window._n = g ? (g.getExtension('WEBGL_debug_renderer_info') ? g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : '?') : ''; } catch(e) { window._n = 'ERR '+e.message; }")
        res = driver.execute_script("return [window._r, window._n]")
        print(f"headless={headless} WEBGL: {res}")
        return res[0]
    finally:
        driver.quit()

mode = sys.argv[1] if len(sys.argv) > 1 else "headless"
ok = probe(mode == "headless")
sys.exit(0 if ok else 1)
