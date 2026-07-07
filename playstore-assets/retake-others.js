const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname);

async function dismissOverlays(page) {
  try { const a = page.locator('button:has-text("Aceitar Todos")'); if (await a.isVisible({ timeout: 2000 })) { await a.click(); await page.waitForTimeout(500); } } catch {}
  try { const f = page.locator('[aria-label="Fechar"]'); if (await f.isVisible({ timeout: 2000 })) { await f.click(); await page.waitForTimeout(500); } } catch {}
  try { const p = page.locator('button:has-text("Pular tour")'); if (await p.isVisible({ timeout: 2000 })) { await p.click(); await page.waitForTimeout(500); } } catch {}
}

async function screenshot(page, name) {
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`  ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await ctx.newPage();

  // Login psychologist
  await page.goto('https://psihumanis.com.br/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await page.fill('input[type="email"]', 'psi_mariojunior@hotmail.com');
  await page.fill('input[type="password"]', 'Marinhoo1993..');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    localStorage.setItem('psihumanis-onboarding-dismissed', 'true');
    localStorage.setItem('psihumanis-onboarding-done', 'true');
  });

  // Agenda
  console.log('Agenda...');
  await page.goto('https://psihumanis.com.br/agenda', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await screenshot(page, '06-agenda');

  // Pacientes
  console.log('Pacientes...');
  await page.goto('https://psihumanis.com.br/pacientes', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await screenshot(page, '07-pacientes');

  // Login patient
  console.log('Paciente login...');
  await page.goto('https://psihumanis.com.br/paciente/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await page.screenshot({ path: path.join(OUT, '11-login-paciente.png') });
  console.log('  11-login-paciente.png');

  await page.fill('input[type="email"]', 'paciente.teste@email.com');
  await page.fill('input[type="password"]', 'Teste123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/paciente**', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { localStorage.setItem('psihumanis-patient-tour', 'true'); });

  // Patient dashboard
  console.log('Paciente dashboard...');
  await page.goto('https://psihumanis.com.br/paciente', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '12-paciente-dashboard');

  // Patient agenda
  console.log('Paciente agenda...');
  await page.goto('https://psihumanis.com.br/paciente/agenda', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '13-paciente-agenda');

  await browser.close();
  console.log('\nDone!');
})();
