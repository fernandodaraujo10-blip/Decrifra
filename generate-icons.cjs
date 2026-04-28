const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO = path.join(__dirname, 'public', 'logo.png');

const MIPMAP_SIZES = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const RES_BASE = path.join(__dirname, 'android-twa', 'app', 'src', 'main', 'res');

async function generate() {
  console.log('Gerando ícones Android...\n');

  for (const { folder, size } of MIPMAP_SIZES) {
    const dir = path.join(RES_BASE, folder);
    fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png — ícone quadrado padrão
    await sharp(LOGO)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png — ícone circular (Android O+)
    const circle = Buffer.from(
      `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`
    );
    await sharp(LOGO)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
      .composite([{ input: circle, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    console.log(`✓ ${folder} (${size}x${size}px)`);
  }

  // Ícone de foreground para Adaptive Icon (API 26+)
  const adaptiveDir = path.join(RES_BASE, 'mipmap-anydpi-v26');
  fs.mkdirSync(adaptiveDir, { recursive: true });
  fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/splash_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`);

  // Foreground 108x108 para adaptive icon
  const foregroundDir = path.join(RES_BASE, 'mipmap-xxxhdpi');
  await sharp(LOGO)
    .resize(108, 108, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 0 } })
    .png()
    .toFile(path.join(foregroundDir, 'ic_launcher_foreground.png'));
  console.log(`✓ ic_launcher_foreground (108x108px)`);

  console.log('\n✅ Todos os ícones gerados com sucesso!');
  console.log(`   Pasta: ${RES_BASE}`);
}

generate().catch(console.error);
