const sharp = require("sharp");
const path = require("path");

async function regenerateFavicons() {
  const svgPath = path.join(__dirname, "..", "public", "favicon.svg");
  const svgBuffer = require("fs").readFileSync(svgPath);

  await sharp(svgBuffer).resize(32, 32).png().toFile("public/favicon-32.png");
  console.log("favicon-32.png");

  await sharp(svgBuffer).resize(16, 16).png().toFile("public/favicon-16.png");
  console.log("favicon-16.png");

  await sharp(svgBuffer).resize(180, 180).png().toFile("public/apple-touch-icon.png");
  console.log("apple-touch-icon.png");

  await sharp(svgBuffer).resize(512, 512).png().toFile("public/icon-512.png");
  console.log("icon-512.png");

  await sharp(svgBuffer).resize(192, 192).png().toFile("public/icon-192.png");
  console.log("icon-192.png");

  console.log("All favicons regenerated from favicon.svg");
}
regenerateFavicons().catch(e => console.error(e));
