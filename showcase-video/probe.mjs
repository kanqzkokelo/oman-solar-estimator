// WebGL probe: headed Chrome under Xvfb
import { chromium } from 'playwright-core';
const EXE = '/home/mitesh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const browser = await chromium.launch({
  executablePath: EXE,
  headless: false,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=default'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('data:text/html,<canvas id=c></canvas><script>document.title=!!(document.getElementById("c").getContext("webgl2")||document.getElementById("c").getContext("webgl"))</script>');
await page.waitForTimeout(1500);
const gl = await page.evaluate(() => !!(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')));
const renderer = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl'); return c ? c.getParameter(c.RENDERER) + ' | ' + c.getParameter(c.VERSION) : 'n/a'; });
console.log('WEBGL:', gl, '| renderer:', renderer);
await browser.close();
