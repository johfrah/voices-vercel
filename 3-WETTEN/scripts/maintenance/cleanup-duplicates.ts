import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

/**
 * 🧹 DUPLICATE CLEANUP SCRIPT
 * 
 * Scant 4-KELDER op identieke afbeeldingen (MD5 hash).
 * Verplaatst dubbels naar 5-DUBBELS met behoud van mappenstructuur.
 */

const SOURCE_DIR = './4-KELDER';
const TARGET_DIR = './5-DUBBELS';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';

function getMd5(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

async function cleanupDuplicates() {
  console.log("🔍 Scannen van 4-KELDER op dubbele foto's...");
  
  const fileHashes: { [hash: string]: string[] } = {};
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

  walkDir(SOURCE_DIR, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (imageExtensions.includes(ext)) {
      try {
        const hash = getMd5(filePath);
        if (!fileHashes[hash]) {
          fileHashes[hash] = [];
        }
        fileHashes[hash].push(filePath);
      } catch (e) {
        console.error(`❌ Kon hash niet berekenen voor ${filePath}:`, e);
      }
    }
  });

  let movedCount = 0;
  const movedFiles: { [oldPath: string]: string } = {};

  for (const hash in fileHashes) {
    const paths = fileHashes[hash];
    if (paths.length > 1) {
      // We houden de eerste (meestal de 'originele' of die we het eerst vonden)
      const [keep, ...duplicates] = paths;
      
      console.log(`✨ Gevonden: ${paths.length} exemplaren van dezelfde foto.`);
      console.log(`   ✅ Behouden: ${keep}`);

      for (const dupPath of duplicates) {
        const relativePath = path.relative(SOURCE_DIR, dupPath);
        const targetPath = path.join(TARGET_DIR, relativePath);
        const targetSubDir = path.dirname(targetPath);

        console.log(`   📦 Verplaatsen naar dubbels: ${dupPath}`);
        
        if (!fs.existsSync(targetSubDir)) {
          fs.mkdirSync(targetSubDir, { recursive: true });
        }

        try {
          fs.renameSync(dupPath, targetPath);
          movedFiles[dupPath] = targetPath;
          movedCount++;
        } catch (e) {
          console.error(`❌ Fout bij verplaatsen van ${dupPath}:`, e);
        }
      }
    }
  }

  console.log(`\n✅ Klaar! ${movedCount} dubbele foto's verplaatst naar 5-DUBBELS.`);

  // Update manifest als het bestaat
  if (fs.existsSync(MANIFEST_PATH)) {
    console.log("📝 Bijwerken van photo-manifest.json...");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const updatedManifest = manifest.map((item: any) => {
      if (movedFiles[item.path]) {
        return { ...item, path: movedFiles[item.path], source: 'Dubbel' };
      }
      return item;
    });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2));
    console.log("🚀 Manifest bijgewerkt.");
  }
}

cleanupDuplicates().catch(console.error);
