import sharp from 'sharp'
import path from 'path'

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT_DIR = 'public'
const LOGO_PATH = path.join(OUT_DIR, 'logo.png')
const TEAL = { r: 13, g: 148, b: 136, alpha: 1 }
const VERSION = 'v5'

async function main() {
  // Trim transparent edges from logo first, then make it square
  const trimmedLogo = await sharp(LOGO_PATH)
    .trim({ threshold: 10 })
    .png()
    .toBuffer()

  const logoMeta = await sharp(trimmedLogo).metadata()
  const logoW = logoMeta.width || 800
  const logoH = logoMeta.height || 800
  const logoMax = Math.max(logoW, logoH)
  const logoMin = Math.min(logoW, logoH)
  
  // Create a square version by extending the shorter side with transparency
  const extendPx = Math.round((logoMax - logoMin) / 2)
  const squareLogo = await sharp(trimmedLogo)
    .extend({
      top: logoW > logoH ? 0 : extendPx,
      bottom: logoW > logoH ? 0 : extendPx,
      left: logoH > logoW ? 0 : extendPx,
      right: logoH > logoW ? 0 : extendPx,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(800, 800)
    .png()
    .toBuffer()

  for (const iconSize of SIZES) {
    // Green background
    const bg = await sharp({
      create: { width: iconSize, height: iconSize, channels: 4, background: TEAL },
    }).png().toBuffer()

    // Logo inside with tight padding (10% — logo fills 80% of icon)
    const padLogo = Math.round(iconSize * 0.10)
    const logoInner = iconSize - padLogo * 2

    const logoResized = await sharp(squareLogo)
      .resize(logoInner, logoInner)
      .png()
      .toBuffer()

    await sharp(bg)
      .composite([{ input: logoResized, top: padLogo, left: padLogo }])
      .png()
      .toFile(path.join(OUT_DIR, `pwa-${iconSize}-${VERSION}.png`))

    // Maskable (safe area: 20% padding)
    const padMask = Math.round(iconSize * 0.20)
    const maskInner = iconSize - padMask * 2
    const logoMasked = await sharp(squareLogo)
      .resize(maskInner, maskInner)
      .png()
      .toBuffer()

    await sharp(bg)
      .composite([{ input: logoMasked, top: padMask, left: padMask }])
      .png()
      .toFile(path.join(OUT_DIR, `pwa-${iconSize}-${VERSION}-maskable.png`))

    console.log(`Generated ${iconSize}x${iconSize}`)
  }
  
  // Clean up old-style icons  
  for (const iconSize of SIZES) {
    const fs = await import('fs')
    for (const name of [`icon-${iconSize}.png`, `icon-${iconSize}-maskable.png`]) {
      try { fs.unlinkSync(path.join(OUT_DIR, name)) } catch {}
    }
  }
  console.log('Cleaned up old icons')
}

main().catch(console.error)
