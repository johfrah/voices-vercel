import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 📸 THUMBNAIL RENAMER SCRIPT
 * 
 * Scant 4-KELDER op afbeeldingen met de afmetingen 230x350.
 * Voegt de prefix 'thumb-' toe aan de bestandsnaam.
 */

const SOURCE_DIR = './4-KELDER';
const ASSETS_DIR = './1-SITE/assets';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';
const TARGET_WIDTH = 230;
const TARGET_HEIGHT = 350;

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function getDimensions(filePath: string): { width: number, height: number } | null {
  try {
    const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const widthMatch = output.match(/pixelWidth: (\d+)/);
    const heightMatch = output.match(/pixelHeight: (\d+)/);
    if (widthMatch && heightMatch) {
      return {
        width: parseInt(widthMatch[1]),
        height: parseInt(heightMatch[1])
      };
    }
  } catch (e) {
    // skip files that aren't images or can't be read
  }
  return null;
}

async function renameThumbnails() {
  console.log(`🔍 Scannen van 4-KELDER en 1-SITE/assets op thumbnails (${TARGET_WIDTH}x${TARGET_HEIGHT})...`);
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  let renamedCount = 0;
  const renameMap: { [oldPath: string]: string } = {};

  const processFile = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (imageExtensions.includes(ext)) {
      const fileName = path.basename(filePath);
      if (fileName.startsWith('thumb-')) return; // Al gedaan

      const dims = getDimensions(filePath);
      if (dims && dims.width === TARGET_WIDTH && dims.height === TARGET_HEIGHT) {
        const dir = path.dirname(filePath);
        const newFileName = `thumb-${fileName}`;
        const newPath = path.join(dir, newFileName);

        console.log(`✨ Thumbnail gevonden: ${fileName} -> ${newFileName}`);
        
        try {
          fs.renameSync(filePath, newPath);
          renameMap[filePath] = newPath;
          renamedCount++;
        } catch (e) {
          console.error(`❌ Fout bij hernoemen van ${filePath}:`, e);
        }
      }
    }
  };

  walkDir(SOURCE_DIR, processFile);
  walkDir(ASSETS_DIR, processFile);

  console.log(`\n✅ Klaar! ${renamedCount} thumbnails hernoemd met prefix 'thumb-'.`);

  // Update manifest als het bestaat
  if (fs.existsSync(MANIFEST_PATH)) {
    console.log("📝 Bijwerken van photo-manifest.json...");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const updatedManifest = manifest.map((item: any) => {
      if (renameMap[item.path]) {
        const newPath = renameMap[item.path];
        return { 
          ...item, 
          path: newPath, 
          fileName: path.basename(newPath)
        };
      }
      return item;
    });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2));
    console.log("🚀 Manifest bijgewerkt.");
  }
}

renameThumbnails().catch(console.error);
