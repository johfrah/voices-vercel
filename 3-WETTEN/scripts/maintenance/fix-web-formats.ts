import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 🕵️‍♂️ LOUIS WEB-FORMAT FIXER (2026)
 * 
 * Doel: Alle WebP en PNG bronbestanden forceren naar geoptimaliseerde JPG's.
 * Dit lost de 404's op voor bestanden die sips niet direct kon croppen.
 */

const SOURCE_DIR = './1-SITE/assets/visuals/active/photos';
const TARGET_DIR = './1-SITE/assets/visuals/active/photos/optimised';
const VOICECARDS_DIR = './1-SITE/assets/visuals/active/voicecards';
const TEMP_DIR = './1-SITE/assets/visuals/active/photos/temp_fix';

async function fixWebFormats() {
  console.log("🚀 Louis start de Web-Format Fixer...");

  if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });
  if (!fs.existsSync(VOICECARDS_DIR)) fs.mkdirSync(VOICECARDS_DIR, { recursive: true });
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const files = fs.readdirSync(SOURCE_DIR);
  let count = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.webp', '.png'].includes(ext)) continue;
    
    const sourcePath = path.resolve(SOURCE_DIR, file);
    const fileNameNoExt = path.parse(file).name;
    const tempJPG = path.resolve(TEMP_DIR, `${fileNameNoExt}_fix.jpg`);
    const targetSquare = path.resolve(TARGET_DIR, `${fileNameNoExt}.jpg`);
    const voiceCardPath = path.resolve(VOICECARDS_DIR, `${fileNameNoExt}.jpg`);

    try {
      console.log(`📸 Fixen: ${file}...`);
      
      // 1. Forceer conversie naar JPG (dit lost de sips crop issues op)
      execSync(`sips -s format jpeg "${sourcePath}" --out "${tempJPG}" > /dev/null 2>&1`);

      // 2. Haal dimensies op van de tijdelijke JPG
      const dimsOutput = execSync(`sips -g pixelWidth -g pixelHeight "${tempJPG}"`).toString();
      const srcW = parseInt(dimsOutput.match(/pixelWidth: (\d+)/)![1]);
      const srcH = parseInt(dimsOutput.match(/pixelHeight: (\d+)/)![1]);

      // 3. Center crop naar square
      const squareSize = Math.min(srcW, srcH);
      const cropX = (srcW - squareSize) / 2;
      const cropY = (srcH - squareSize) / 2;

      // Extraheer square en resize naar 800px
      execSync(`sips --cropOffset ${Math.round(cropY)} ${Math.round(cropX)} -c ${Math.round(squareSize)} ${Math.round(squareSize)} "${tempJPG}" --out "${targetSquare}" > /dev/null 2>&1`);
      execSync(`sips -Z 800 "${targetSquare}" > /dev/null 2>&1`);

      // Kopieer naar voicecards map
      fs.copyFileSync(targetSquare, voiceCardPath);

      // 4. Aspect Ratio (16:9 of 9:16)
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

      execSync(`sips --cropOffset ${Math.round(finalY)} ${Math.round(finalX)} -c ${Math.round(targetH)} ${Math.round(targetW)} "${tempJPG}" --out "${targetAspect}" > /dev/null 2>&1`);
      execSync(`sips -Z 1200 "${targetAspect}" > /dev/null 2>&1`);

      if (fs.existsSync(tempJPG)) fs.unlinkSync(tempJPG);
      count++;
    } catch (error: any) {
      console.error(`❌ Fout bij fixen ${file}:`, error.message);
    }
  }

  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log(`\n✅ Web-Format Fixer voltooid! ${count} bestanden hersteld.`);
}

fixWebFormats().catch(console.error);
