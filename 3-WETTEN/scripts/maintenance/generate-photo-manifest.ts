import fs from 'fs';
import path from 'path';

/**
 * 📜 PHOTO MANIFEST GENERATOR (2026)
 * 
 * Doel: Een centraal JSON manifest genereren van alle actieve visuals.
 * Scant: photos, thumbnails, logos en optimised mappen.
 * Output: 1-SITE/apps/web/public/assets/visuals/photo-manifest.json
 */

const BASE_DIR = './1-SITE/assets/visuals/active';
const OUTPUT_FILE = './1-SITE/apps/web/public/assets/visuals/photo-manifest.json';

function generateManifest() {
  console.log("📜 Photo manifest genereren...");

  const manifest: any = {
    generatedAt: new Date().toISOString(),
    voices: {}
  };

  const categories = [
    { dir: 'photos', key: 'portfolio' },
    { dir: 'photos/optimised', key: 'optimised' },
    { dir: 'thumbnails', key: 'thumbnails' },
    { dir: 'logos', key: 'logos' }
  ];

  categories.forEach(({ dir, key }) => {
    const dirPath = path.join(BASE_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const match = file.match(/^(\d+)-(.+)-(photo|thumb)-(vertical|horizontal|square)-(\d+)\.([a-z]+)$/i);
        if (match) {
          const id = match[1];
          const namePart = match[2];
          const type = match[3];
          const orientation = match[4];
          const index = match[5];
          const ext = match[6];

          if (!manifest.voices[id]) {
            manifest.voices[id] = {
              id,
              namePart,
              portfolio: [],
              optimised: [],
              thumbnails: [],
              logos: []
            };
          }

          // Pad relatief aan de public assets folder voor de frontend
          const publicPath = `/assets/visuals/active/${dir}/${file}`;
          
          manifest.voices[id][key].push({
            file,
            path: publicPath,
            orientation,
            type,
            index: parseInt(index),
            ext
          });
        }
      });
    }
  });

  // Sorteer de arrays op index
  Object.values(manifest.voices).forEach((voice: any) => {
    voice.portfolio.sort((a: any, b: any) => a.index - b.index);
    voice.optimised.sort((a: any, b: any) => a.index - b.index);
    voice.thumbnails.sort((a: any, b: any) => a.index - b.index);
    voice.logos.sort((a: any, b: any) => a.index - b.index);
  });

  // Zorg dat de output directory bestaat
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest succesvol gegenereerd: ${OUTPUT_FILE}`);
  console.log(`📊 Totaal aantal stemmen in manifest: ${Object.keys(manifest.voices).length}`);
}

generateManifest();
