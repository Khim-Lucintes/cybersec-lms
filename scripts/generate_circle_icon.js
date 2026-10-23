const sharp = require('sharp');
const fs = require('fs');

async function makeCircleIcons() {
  const size = 1024;
  const radius = 506;
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="#ffffff" /></svg>`
  );

  console.log('Masking public/fsuu_seal.jpg with circular mask...');
  const circular1024 = await sharp('public/fsuu_seal.jpg')
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(circular1024).resize(512, 512).toFile('public/icon-512.png');
  await sharp(circular1024).resize(192, 192).toFile('public/icon-192.png');
  await sharp(circular1024).resize(192, 192).toFile('public/icon-circle.png');
  await sharp(circular1024).resize(180, 180).toFile('app/apple-icon.png');
  await sharp(circular1024).resize(180, 180).toFile('public/apple-icon.png');
  await sharp(circular1024).resize(32, 32).toFile('app/icon.png');
  await sharp(circular1024).resize(32, 32).toFile('public/icon.png');
  await sharp(circular1024).resize(32, 32).toFormat('png').toFile('public/favicon.ico');
  await sharp(circular1024).resize(32, 32).toFormat('png').toFile('app/favicon.ico');

  console.log('SUCCESS: All website tab icons and favicons are now perfectly circular with transparent backgrounds!');
}

makeCircleIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
