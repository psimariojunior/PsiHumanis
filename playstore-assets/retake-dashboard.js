const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const OUT = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await ctx.newPage();

  await page.goto('https://psihumanis.com.br/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  try { await page.locator('button:has-text("Aceitar Todos")').click({ timeout: 3000 }); } catch {}
  await page.fill('input[type="email"]', 'psi_mariojunior@hotmail.com');
  await page.fill('input[type="password"]', 'Marinhoo1993..');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    localStorage.setItem('psihumanis-onboarding-dismissed', 'true');
    localStorage.setItem('psihumanis-onboarding-done', 'true');
  });

  await page.goto('https://psihumanis.com.br/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  try { await page.locator('[aria-label="Fechar"]').click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(500);

  const buf = await page.screenshot({ fullPage: true });
  await sharp(buf).extract({ left: 0, top: 0, width: 780, height: 1387 }).toFile(path.join(OUT, '05-dashboard-hero.png'));
  console.log('Dashboard hero saved');

  await browser.close();
  console.log('Done!');
})();
