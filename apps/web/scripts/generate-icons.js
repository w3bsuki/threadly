const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const publicDir = path.join(__dirname, '../public');
  const svgPath = path.join(publicDir, 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG icons
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  console.log('✅ Generated icon.png');

  // Generate screenshots (simple black rectangles)
  await sharp({
    create: {
      width: 320,
      height: 568,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
  .png()
  .toFile(path.join(publicDir, 'screenshot-mobile.png'));

  await sharp({
    create: {
      width: 1280,
      height: 800,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
  .png()
  .toFile(path.join(publicDir, 'screenshot-desktop.png'));

  console.log('✅ Generated screenshots');
}

generateIcons().catch(console.error);