// Drives the Oman Solar Estimator in headless Chromium (SwiftShader WebGL),
// clicks through the demo flow, screenshots each state, records an actions manifest.
import { chromium } from 'playwright-core';
import fs from 'fs';

const EXE = '/home/mitesh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const A = new URL('./assets/', import.meta.url).pathname;
const actions = [];
fs.mkdirSync(A, { recursive: true });

const browser = await chromium.launch({
  executablePath: EXE,
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
         '--hide-scrollbars', '--mute-audio', '--window-size=1920,1080', '--force-color-profile=srgb'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log('goto:', e.message));
await page.waitForTimeout(3000);

const gl = await page.evaluate(() => !!(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')));
console.log('WEBGL:', gl);

const shoot = (name) => page.screenshot({ path: `${A}/${name}.png` });
async function centerOf(loc) {
  const b = await loc.boundingBox();
  return b ? { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } : null;
}

// ---- S1 hero ----
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await shoot('01-hero');
const startBtn = page.getByRole('button', { name: /start estimating/i }).or(page.getByRole('link', { name: /start estimating/i })).first();
const startC = await centerOf(startBtn);
actions.push({ from: '01-hero', click: startC, label: 'Start estimating' });
await startBtn.click();
await page.waitForTimeout(2500);

// ---- S2 wizard with map ----
await shoot('02-wizard');
const demoBtn = page.getByRole('button', { name: /demo\s*roof/i }).first();
if (await demoBtn.count() === 0) {
  // dump candidates for debugging
  const btns = await page.evaluate(() => [...document.querySelectorAll('button,[role=button],a')].map(b => (b.innerText || '').trim()).filter(Boolean));
  console.log('NO DEMO ROOF BTN. Buttons:', JSON.stringify(btns));
} else {
  await demoBtn.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(800);
  const demoC = await centerOf(demoBtn);
  actions.push({ from: '02-wizard', click: demoC, label: 'Demo roof' });
  await demoBtn.click();
  await page.waitForTimeout(9000); // fly-in + polygon snap + area calc
  await shoot('03-traced');
  const area = await page.evaluate(() => (document.body.innerText.match(/[^\n]*(m²|panels)[^\n]*/gi) || []).slice(0, 6));
  console.log('TRACE READOUT:', JSON.stringify(area));

  // ---- S3 continue to details ----
  const contBtn = page.getByRole('button', { name: /continue/i }).first();
  if (await contBtn.count()) {
    await contBtn.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(600);
    const contC = await centerOf(contBtn);
    actions.push({ from: '03-traced', click: contC, label: 'Continue to details' });
    await contBtn.click();
    await page.waitForTimeout(2000);
  }
  await shoot('04-details');

  // ---- S4 fill bill ----
  const bill = page.locator('input[type=number], input[inputmode=decimal], input[placeholder*="ill" i]').first();
  if (await bill.count()) {
    await bill.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);
    const billC = await centerOf(bill);
    actions.push({ from: '04-details', click: billC, label: 'Bill input', type: '150' });
    await bill.fill('150');
    await page.waitForTimeout(1500); // kWh auto-convert
    await shoot('05-bill');

    // ---- S5 calculate ----
    const calcBtn = page.getByRole('button', { name: /calculate|see results|estimate/i }).first();
    if (await calcBtn.count()) {
      await calcBtn.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(600);
      const calcC = await centerOf(calcBtn);
      actions.push({ from: '05-bill', click: calcC, label: 'Calculate' });
      await calcBtn.click();
      await page.waitForTimeout(4000);
      await shoot('06-results');

      // ---- S6/S7 scroll through results ----
      for (const [name, y] of [['07-results-mid', 0.33], ['08-results-chart', 0.55], ['09-results-impact', 0.8]]) {
        await page.evaluate((f) => window.scrollTo(0, (document.body.scrollHeight - innerHeight) * f), y);
        await page.waitForTimeout(1500);
        await shoot(name);
      }
    } else console.log('NO CALC BUTTON');
  } else console.log('NO BILL INPUT');
}

fs.writeFileSync(new URL('./actions.json', import.meta.url), JSON.stringify({ webgl: gl, actions }, null, 2));
console.log('ACTIONS:', JSON.stringify(actions));
await browser.close();
console.log('DONE');
