// WebGL probe v2: args from env GLARGS (space-separated)
import { chromium } from 'playwright-core';
const EXE = '/home/mitesh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const extra = (process.env.GLARGS || '').split(' ').filter(Boolean);
const browser = await chromium.launch({
  executablePath: EXE,
  headless: process.env.HEADED === '0',
  args: ['--no-sandbox', '--disable-dev-shm-usage', ...extra],
});
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
await page.goto('data:text/html,<canvas id=c></canvas>');
await page.waitForTimeout(800);
const gl = await page.evaluate(() => !!(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')));
console.log('WEBGL:', gl, '| args:', extra.join(' ') || '(none)');
await browser.close();
process.exit(0);
