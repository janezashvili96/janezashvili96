const { chromium } = require('playwright');
const names = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('error:', e.message));
  for (const n of names) {
    await p.goto(`http://localhost:8765/index.html?s=${n}`);
    await p.waitForFunction('window.DONE === true', null, { timeout: 120000 });
    await p.locator('canvas').screenshot({ path: `out/${n}.png`, omitBackground: true });
    console.log('ok', n);
  }
  await b.close();
})();
