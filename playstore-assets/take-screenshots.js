const { chromium } = require('playwright');
const path = require('path');

const BASE = 'https://psihumanis.com.br';
const OUT = path.join(__dirname);
const PHONE = { width: 390, height: 844 };

async function screenshot(page, name) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`  ✅ ${name}.png`);
}

async function fullScreenshot(page, name) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log(`  ✅ ${name}.png (full-page)`);
}

async function dismissOverlays(page) {
  try {
    const aceitar = page.locator('button:has-text("Aceitar Todos")');
    if (await aceitar.isVisible({ timeout: 2000 })) { await aceitar.click(); await page.waitForTimeout(500); }
  } catch {}
  try {
    const fechar = page.locator('[aria-label="Fechar"]');
    if (await fechar.isVisible({ timeout: 2000 })) { await fechar.click(); await page.waitForTimeout(500); }
  } catch {}
  try {
    const pular = page.locator('button:has-text("Pular tour")');
    if (await pular.isVisible({ timeout: 2000 })) { await pular.click(); await page.waitForTimeout(500); }
  } catch {}
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: PHONE,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();

  // ========== 1. LANDING PAGE ==========
  console.log('\n📸 Landing page...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '01-landing-hero');
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(1000);
  await dismissOverlays(page);
  await screenshot(page, '02-landing-servicos');
  await page.evaluate(() => window.scrollBy(0, 1200));
  await page.waitForTimeout(1000);
  await dismissOverlays(page);
  await screenshot(page, '03-landing-cta');

  // ========== 2. LOGIN PSICÓLOGO ==========
  console.log('\n📸 Login psicólogo...');
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await screenshot(page, '04-login-psy');

  // Login
  await page.fill('input[type="email"]', 'psi_mariojunior@hotmail.com');
  await page.fill('input[type="password"]', 'Marinhoo1993..');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { localStorage.setItem('psihumanis-onboarding-dismissed', 'true'); localStorage.setItem('psihumanis-onboarding-done', 'true'); });

  // ========== 3. DASHBOARD - full page then clip ==========
  console.log('\n📸 Dashboard...');
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  await dismissOverlays(page);

  // Take full page, then we'll crop
  const dashboardPath = path.join(OUT, '05-dashboard-full.png');
  await page.screenshot({ path: dashboardPath, fullPage: true });
  console.log('  ✅ 05-dashboard-full.png (full-page)');

  // Clip top portion for hero
  await page.screenshot({
    path: path.join(OUT, '05-dashboard-hero.png'),
    clip: { x: 0, y: 0, width: 390, height: 844 }
  });
  console.log('  ✅ 05-dashboard-hero.png (clipped top)');

  // ========== 4. AGENDA ==========
  console.log('\n📸 Agenda...');
  await page.goto(`${BASE}/agenda`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '06-agenda');

  // ========== 5. PACIENTES ==========
  console.log('\n📸 Pacientes...');
  await page.goto(`${BASE}/pacientes`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '07-pacientes');

  // ========== 6. PRONTUÁRIOS ==========
  console.log('\n📸 Prontuários...');
  await page.goto(`${BASE}/prontuarios`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '08-prontuarios');

  // ========== 7. SALA VIRTUAL ==========
  console.log('\n📸 Sala Virtual...');
  await page.goto(`${BASE}/sala-virtual`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '09-sala-virtual');

  // ========== 8. CONFIGURAÇÕES ==========
  console.log('\n📸 Configurações...');
  await page.goto(`${BASE}/configuracoes`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '10-configuracoes');

  // ========== 9. LOGIN PACIENTE ==========
  console.log('\n📸 Login paciente...');
  await page.goto(`${BASE}/paciente/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await screenshot(page, '11-login-paciente');

  // Login paciente
  await page.fill('input[type="email"]', 'paciente.teste@email.com');
  await page.fill('input[type="password"]', 'Teste123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/paciente**', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { localStorage.setItem('psihumanis-patient-tour', 'true'); });

  // ========== 10. PACIENTE DASHBOARD ==========
  console.log('\n📸 Paciente dashboard...');
  await page.goto(`${BASE}/paciente`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '12-paciente-dashboard');

  // ========== 11. AGENDA PACIENTE ==========
  console.log('\n📸 Agenda paciente...');
  await page.goto(`${BASE}/paciente/agenda`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '13-paciente-agenda');

  // ========== 12. BOOKING PÚBLICO ==========
  console.log('\n📸 Booking público...');
  await page.goto(`${BASE}/agendar`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await dismissOverlays(page);
  await screenshot(page, '14-booking-publico');

  await browser.close();
  console.log('\n🎉 Todas as screenshots salvas!');
})();
