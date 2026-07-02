const sharp = require("sharp");

async function regenerateFavicons() {
  const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D9488"/><stop offset="100%" stop-color="#0F766E"/>
    </linearGradient></defs>
    <rect width="32" height="32" rx="8" fill="url(#g)"/>
    <text x="16" y="23" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="18" fill="white">&#x3A8;</text>
  </svg>`);

  await sharp(svgBuffer).resize(32, 32).png().toFile("public/favicon-32.png");
  console.log("favicon-32.png");

  await sharp(svgBuffer).resize(16, 16).png().toFile("public/favicon-16.png");
  console.log("favicon-16.png");

  await sharp(svgBuffer).resize(180, 180).png().toFile("public/apple-touch-icon.png");
  console.log("apple-touch-icon.png");

  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0D9488"/>
    <text x="600" y="280" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="72" fill="white">&#x3A8;</text>
    <text x="600" y="360" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" fill="white" opacity="0.9">PsiHumanis</text>
    <text x="600" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="white" opacity="0.7">Plataforma para Psicologos</text>
  </svg>`;

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { r: 13, g: 148, b: 136, alpha: 1 } }
  })
    .composite([{ input: Buffer.from(ogSvg), gravity: "center" }])
    .png()
    .toFile("public/og-image.png");
  console.log("og-image.png");
}
regenerateFavicons().catch(e => console.error(e));
