import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ VISION MASTERCLASS OPTIMIZER (2026) - NO DISTORTION VERSION
 * 
 * Doel: Foto's automatisch kadreren op basis van de briefing.
 * 
 * CRITICAL FIX: We gebruiken GEEN sips -z of -c meer direct op de bron.
 * We gebruiken 'sips --cropArea' om een perfect vierkant/rechthoek te EXTRAHEREN uit de bron.
 * Omdat we de uitsnede al in de juiste verhouding extraheren, hoeft sips daarna NIET meer te vervormen.
 */

const SOURCE_DIR = './1-SITE/assets/visuals/active/photos';
const TARGET_DIR = './1-SITE/assets/visuals/active/photos/optimised';
const TEMP_DIR = './1-SITE/assets/visuals/active/photos/temp_vision_v3';
const VISION_SCRIPT = './3-WETTEN/scripts/maintenance/face-detector.swift';

async function visionMasterclass() {
  console.log("🚀 Louis start de NO-DISTORTION Vision Masterclass run...");

  if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const files = fs.readdirSync(SOURCE_DIR);
  let count = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
    
    const sourcePath = path.resolve(SOURCE_DIR, file);
    const fileNameNoExt = path.parse(file).name;
    const tempJPG = path.resolve(TEMP_DIR, `${fileNameNoExt}_temp.jpg`);

    try {
      console.log(`✨ Vision analyse: ${file}...`);
      
      // 1. Maak tijdelijke JPG voor Vision
      execSync(`sips -s format jpeg "${sourcePath}" --out "${tempJPG}" > /dev/null 2>&1`);

      // 2. Detecteer gezicht
      let faceData: any[] = [];
      try {
        const output = execSync(`swift "${VISION_SCRIPT}" "${tempJPG}"`, { timeout: 15000 }).toString();
        faceData = JSON.parse(output);
      } catch (e) {}

      // 3. Haal bron dimensies op
      const dimsOutput = execSync(`sips -g pixelWidth -g pixelHeight "${tempJPG}"`).toString();
      const srcW = parseInt(dimsOutput.match(/pixelWidth: (\d+)/)![1]);
      const srcH = parseInt(dimsOutput.match(/pixelHeight: (\d+)/)![1]);

      let centerX = srcW / 2;
      let centerY = srcH / 2;
      let faceSize = Math.min(srcW, srcH) * 0.3;

      if (faceData.length > 0) {
        const face = faceData[0];
        centerX = face.x * srcW + (face.width * srcW / 2);
        centerY = (1 - face.y) * srcH - (face.height * srcH / 2);
        faceSize = face.width * srcW;
      }

      // --- SQUARE CROP (800x800) ---
      // We bepalen de grootte van het vierkant (minimaal 2.5x gezichtsgrootte voor ademruimte)
      const squareSize = Math.min(srcW, srcH, faceSize * 3);
      
      // Bereken de X en Y offset (center-weighted op gezicht)
      // Ogen op 35% van de hoogte van het vierkant
      let cropX = Math.max(0, Math.min(srcW - squareSize, centerX - squareSize / 2));
      let cropY = Math.max(0, Math.min(srcH - squareSize, centerY - (squareSize * 0.35)));

      const targetSquare = path.resolve(TARGET_DIR, `${fileNameNoExt}.jpg`);
      
      /**
       * DE NO-DISTORTION METHODE:
       * 1. We extraheren een perfect vierkant met --cropOffset en -c.
       * 2. We resizen dit vierkant naar 800x800 met -Z (behoudt aspect ratio).
       * Omdat de bron al een vierkant is, is -Z 800 exact 800x800 zonder vervorming.
       */
      execSync(`sips --cropOffset ${Math.round(cropY)} ${Math.round(cropX)} -c ${Math.round(squareSize)} ${Math.round(squareSize)} "${tempJPG}" --out "${targetSquare}" > /dev/null 2>&1`);
      execSync(`sips -Z 800 "${targetSquare}" > /dev/null 2>&1`);

      // --- ASPECT RATIO CROP (16:9 of 9:16) ---
      const isVertical = srcH > srcW;
      const aspectName = isVertical ? '9x16' : '16x9';
      const targetAspect = path.resolve(TARGET_DIR, `${fileNameNoExt}-${aspectName}.jpg`);
      
      let targetW, targetH;
      if (isVertical) {
        // 9:16
        targetW = squareSize * 0.8;
        targetH = (targetW / 9) * 16;
      } else {
        // 16:9
        targetH = squareSize * 0.8;
        targetW = (targetH / 9) * 16;
      }

      // Zorg dat de uitsnede binnen de bronbestanden blijft
      const finalW = Math.min(srcW, targetW);
      const finalH = Math.min(srcH, targetH);
      const finalX = Math.max(0, Math.min(srcW - finalW, centerX - finalW / 2));
      const finalY = Math.max(0, Math.min(srcH - finalH, centerY - (finalH * 0.35)));

      execSync(`sips --cropOffset ${Math.round(finalY)} ${Math.round(finalX)} -c ${Math.round(finalH)} ${Math.round(finalW)} "${tempJPG}" --out "${targetAspect}" > /dev/null 2>&1`);
      execSync(`sips -Z 1200 "${targetAspect}" > /dev/null 2>&1`);

      if (fs.existsSync(tempJPG)) fs.unlinkSync(tempJPG);
      count++;
    } catch (error: any) {
      console.error(`❌ Fout bij ${file}:`, error.message);
    }
  }

  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log(`\n✅ Vision Masterclass voltooid! ${count} stemmen verwerkt zonder vervorming.`);
}

visionMasterclass().catch(console.error);
