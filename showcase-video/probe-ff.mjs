// WebGL probe: Playwright Firefox
import { firefox } from 'playwright-core';
const EXE = '/home/mitesh/.cache/ms-playwright/firefox-1490/firefox/firefox';
const browser = await firefox.launch({ executablePath: EXE, headless: process.env.HEADED !== '1', firefoxUserPrefs: {
  'webgl.force-enabled': true,
  'layers.acceleration.force-enabled': true,
} });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('data:text/html,<canvas id=c></canvas>');
await page.waitForTimeout(1500);
const gl = await page.evaluate(() => {
  const c = document.createElement('canvas');
  const g = c.getContext('webgl2') || c.getContext('webgl');
  if (!g) return { ok: false };
  const dbg = g.getExtension('WEBGL_debug_renderer_info');
  return { ok: true, renderer: dbg ? g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER) };
});
console.log('FIREFOX WEBGL:', JSON.stringify(gl));
await browser.close();
process.exit(0);
