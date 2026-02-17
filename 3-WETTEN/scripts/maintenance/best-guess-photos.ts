import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ LOUIS BEST GUESS OPTIMIZER (2026)
 * 
 * Doel: Foto's die Vision niet kon detecteren toch optimaliseren.
 * Strategie: Center-crop (best guess) naar square en aspect ratios.
 */

const SOURCE_DIR = './1-SITE/assets/visuals/active/photos';
const TARGET_DIR = './1-SITE/assets/visuals/active/photos/optimised';
const VOICECARDS_DIR = './1-SITE/assets/visuals/active/voicecards';

async function bestGuessMasterclass() {
  console.log("🚀 Louis start de 'Best Guess' optimalisatie...");

  if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });
  if (!fs.existsSync(VOICECARDS_DIR)) fs.mkdirSync(VOICECARDS_DIR, { recursive: true });

  const files = fs.readdirSync(SOURCE_DIR);
  let count = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
    
    const sourcePath = path.resolve(SOURCE_DIR, file);
    const fileNameNoExt = path.parse(file).name;
    const targetSquare = path.resolve(TARGET_DIR, `${fileNameNoExt}.jpg`);
    const voiceCardPath = path.resolve(VOICECARDS_DIR, `${fileNameNoExt}.jpg`);

    // Sla over als de geoptimaliseerde versie al bestaat (door Vision gedaan)
    if (fs.existsSync(targetSquare)) {
      // Zorg wel dat hij in de voicecards map staat
      if (!fs.existsSync(voiceCardPath)) {
        fs.copyFileSync(targetSquare, voiceCardPath);
      }
      continue;
    }

    try {
      console.log(`🎲 Best Guess: ${file}...`);
      
      // 1. Haal bron dimensies op
      const dimsOutput = execSync(`sips -g pixelWidth -g pixelHeight "${sourcePath}"`).toString();
      const srcW = parseInt(dimsOutput.match(/pixelWidth: (\d+)/)![1]);
      const srcH = parseInt(dimsOutput.match(/pixelHeight: (\d+)/)![1]);

      // 2. Center crop naar square
      const squareSize = Math.min(srcW, srcH);
      const cropX = (srcW - squareSize) / 2;
      const cropY = (srcH - squareSize) / 2;

      // Extraheer square
      execSync(`sips --cropOffset ${Math.round(cropY)} ${Math.round(cropX)} -c ${Math.round(squareSize)} ${Math.round(squareSize)} "${sourcePath}" --out "${targetSquare}" > /dev/null 2>&1`);
      // Resize naar 800px (Moby's ideale maat)
      execSync(`sips -Z 800 "${targetSquare}" > /dev/null 2>&1`);

      // Kopieer naar de centrale voicecards map
      fs.copyFileSync(targetSquare, voiceCardPath);

      // 3. Aspect Ratio (16:9 of 9:16) - Best Guess
      const isVertical = srcH > srcW;
      const aspectName = isVertical ? '9x16' : '16x9';
      const targetAspect = path.resolve(TARGET_DIR, `${fileNameNoExt}-${aspectName}.jpg`);
      
      let targetW, targetH;
      if (isVertical) {
        targetW = squareSize;
        targetH = (targetW / 9) * 16;
        if (targetH > srcH) {
          targetH = srcH;
          targetW = (targetH / 16) * 9;
        }
      } else {
        targetH = squareSize;
        targetW = (targetH / 9) * 16;
        if (targetW > srcW) {
          targetW = srcW;
          targetH = (targetW / 16) * 9;
        }
      }

      const finalX = (srcW - targetW) / 2;
      const finalY = (srcH - targetH) / 2;

      execSync(`sips --cropOffset ${Math.round(finalY)} ${Math.round(finalX)} -c ${Math.round(targetH)} ${Math.round(targetW)} "${sourcePath}" --out "${targetAspect}" > /dev/null 2>&1`);
      execSync(`sips -Z 1200 "${targetAspect}" > /dev/null 2>&1`);

      count++;
    } catch (error: any) {
      console.error(`❌ Fout bij best guess ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Best Guess voltooid! ${count} extra foto's geoptimaliseerd.`);
  console.log(`📂 Alle ideale Moby-foto's staan nu ook in: ${VOICECARDS_DIR}`);
}

bestGuessMasterclass().catch(console.error);
