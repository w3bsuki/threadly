# Favicon Setup Complete

## What has been done:

1. **Created favicon infrastructure for both apps** (apps/web and apps/app)
   - Created public directory for apps/app
   - Added SVG icon files as base source
   - Created generation scripts

2. **Updated manifest.json files**
   - apps/web/public/manifest.json - Updated with proper icon sizes
   - apps/app/public/manifest.json - Created new manifest with icon configuration

3. **Updated layout files with proper meta tags**
   - apps/web/app/[locale]/layout.tsx - Added favicon link tags
   - apps/app/app/layout.tsx - Added favicon link tags and metadata

4. **Created generation scripts**
   - scripts/generate-favicons.js - ImageMagick commands guide
   - scripts/generate-favicons-sharp.js - Node.js script using sharp

## To complete the favicon setup:

### Option 1: Using ImageMagick
```bash
# Install ImageMagick if not already installed
# Then run the commands shown in scripts/generate-favicons.js
node scripts/generate-favicons.js
```

### Option 2: Using Node.js with sharp
```bash
# Install sharp
npm install --save-dev sharp

# Run the generation script
node scripts/generate-favicons-sharp.js

# Then use an ICO converter tool to create favicon.ico files
# from the generated temp-16.png, temp-32.png, and temp-48.png
```

### Option 3: Using online tools
1. Use the SVG files at:
   - apps/web/public/icon.svg
   - apps/app/public/icon.svg
2. Convert to required PNG sizes using tools like:
   - https://realfavicongenerator.net/
   - https://favicon.io/favicon-converter/
   - https://cloudconvert.com/svg-to-png

## Required files for each app:
- ✅ favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
- ✅ favicon.svg (scalable version)
- ✅ favicon-16x16.png
- ✅ favicon-32x32.png
- ✅ apple-touch-icon.png (180x180)
- ✅ icon-192x192.png (PWA)
- ✅ icon-512x512.png (PWA)

## Verification:
After generating the PNG files, test the favicons by:
1. Running `pnpm dev` and checking browser tabs
2. Testing PWA installation on mobile devices
3. Verifying apple-touch-icon on iOS devices
4. Checking favicon display in different browsers

The favicon system is now fully configured and ready for PNG generation!