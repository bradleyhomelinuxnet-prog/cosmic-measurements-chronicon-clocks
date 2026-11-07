/* Draws docs/social-preview.png (1280×640), the image shown when the site is shared.
   Needs Playwright, which is not a dependency of the app: npx playwright install chromium; node tools/make-social-card.js */
const { chromium } = require('playwright');
(async () => {
  const path = require('path'); const R = path.resolve(__dirname, '..');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 640 } });
  await p.goto('file://' + R + '/index.html#plates'); await p.waitForTimeout(500);
  const svg = await p.$eval('.plate svg', s => s.outerHTML);
  const css = require('fs').readFileSync(R + '/css/cc.css', 'utf8');
  await p.setContent(`<!doctype html><html><head><link rel="stylesheet" href="file://${R}/fonts/fonts.css"><style>${css}
  body{margin:0;width:1280px;height:640px;overflow:hidden;background:radial-gradient(ellipse at 75% 40%,#2a1f0c 0,#08080d 60%);display:flex;align-items:center;gap:40px;padding:0 56px;box-sizing:border-box}
  .l{flex:1 1 0}.k{font:12px 'IBM Plex Mono';letter-spacing:.3em;color:#938c77;text-transform:uppercase}
  h1{font:600 64px/1.05 Cinzel;letter-spacing:.08em;color:#e8c770;margin:14px 0 18px}
  p{font:24px/1.4 'EB Garamond';color:#d6cfbb;margin:0 0 22px;max-width:34ch}
  .n{font:15px 'IBM Plex Mono';color:#c9a54a;letter-spacing:.06em}.n b{color:#d0573f;font-weight:500}
  .plate{width:520px;flex:none;padding:10px}</style></head><body>
  <div class="l"><div class="k">Measured · Timed · Mirrored</div><h1>Cosmic<br>Chronicon</h1>
  <p>The Great Pyramid from Petrie's 1883 survey, six chronologies on one clock, and the book <i>Cosmic Measurements</i>.</p>
  <div class="n">138 × 43 = <b>AM 5,934</b> = 2040 AD · 19 sections · 1 axis</div></div>
  <div class="plate">${svg}</div></body></html>`);
  await p.waitForTimeout(500);
  await p.screenshot({ path: R + '/docs/social-preview.png' });
  await b.close();
})();
