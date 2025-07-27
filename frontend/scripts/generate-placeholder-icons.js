/**
 * Generate Placeholder PWA Icons
 * Creates simple colored placeholder icons for development
 */

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size, backgroundColor = '#4f46e5', textColor = '#ffffff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size * 0.15}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-weight="bold" 
        font-size="${size * 0.4}" fill="${textColor}">L</text>
</svg>`;
}

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating placeholder PWA icons...');

// Generate main app icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generated ${filename}`);
});

// Generate shortcut icons
const shortcuts = [
  { name: 'learn', color: '#10b981', letter: '📚' },
  { name: 'test', color: '#f59e0b', letter: '✏️' },
  { name: 'progress', color: '#8b5cf6', letter: '📊' }
];

shortcuts.forEach(shortcut => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="${shortcut.color}" rx="14"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="48">${shortcut.letter}</text>
</svg>`;
  
  const filename = `shortcut-${shortcut.name}.png.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generated ${filename}`);
});

// Generate a README for the icons
const readmeContent = `# PWA Icons

This directory contains placeholder icons for the LexiLoop PWA.

## Current Icons
- Main app icons: 72x72 to 512x512 pixels
- Shortcut icons: 96x96 pixels for app shortcuts

## Usage
These are SVG-based placeholder icons for development. For production:

1. Create proper PNG/ICO icons using design tools
2. Ensure icons follow platform guidelines
3. Test on various devices and browsers

## Icon Guidelines
- Use consistent branding colors (#4f46e5)
- Ensure readability at small sizes
- Follow platform-specific padding requirements
- Test on both light and dark backgrounds

## Tools for Icon Generation
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);

console.log('📝 Generated icons README');
console.log('🎉 All placeholder icons generated successfully!');
console.log('\n💡 Note: These are SVG placeholders. Convert to PNG for production use.');
console.log('🔧 To convert: Use online tools or imagemagick: convert icon.svg icon.png');