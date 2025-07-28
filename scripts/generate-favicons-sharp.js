#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const APPS = ['web', 'app'];
const SIZES = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'icon-192x192.png': 192,
  'icon-512x512.png': 512,
};

async function generateFavicons() {
  for (const app of APPS) {
    const publicDir = path.join('apps', app, 'public');
    const iconSvgPath = path.join(publicDir, 'icon.svg');
    
    try {
      // Check if SVG exists
      await fs.access(iconSvgPath);
      console.log(`Generating favicons for ${app}...`);
      
      // Generate PNG files
      for (const [filename, size] of Object.entries(SIZES)) {
        const outputPath = path.join(publicDir, filename);
        
        await sharp(iconSvgPath)
          .resize(size, size)
          .png()
          .toFile(outputPath);
          
        console.log(`  ✓ Generated ${filename} (${size}x${size})`);
      }
      
      // Generate ICO file (multi-resolution)
      const ico16Path = path.join(publicDir, 'temp-16.png');
      const ico32Path = path.join(publicDir, 'temp-32.png');
      const ico48Path = path.join(publicDir, 'temp-48.png');
      
      await sharp(iconSvgPath).resize(16, 16).png().toFile(ico16Path);
      await sharp(iconSvgPath).resize(32, 32).png().toFile(ico32Path);
      await sharp(iconSvgPath).resize(48, 48).png().toFile(ico48Path);
      
      console.log(`  ✓ Generated temporary ICO source files`);
      console.log(`  ℹ️  Use ico-converter tool to create favicon.ico from:`);
      console.log(`     - ${ico16Path}`);
      console.log(`     - ${ico32Path}`);
      console.log(`     - ${ico48Path}`);
      
    } catch (error) {
      console.error(`Error processing ${app}:`, error.message);
    }
  }
}

// Run the script
generateFavicons().catch(console.error);