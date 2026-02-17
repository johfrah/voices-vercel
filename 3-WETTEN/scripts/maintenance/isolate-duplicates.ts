import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 🕵️‍♂️ DUPLICATE PHOTO ISOLATOR (2026)
 * 
 * Doel: Dubbele foto's identificeren en verplaatsen naar een 'dubbels' map.
 */

const PHOTOS_DIR = './1-SITE/assets/visuals/active/photos';
const DUBBELS_DIR = './1-SITE/assets/visuals/active/dubbels';

function getHash(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function isolateDuplicates() {
  console.log("🔍 Dubbele foto's isoleren...");
  
  if (!fs.existsSync(PHOTOS_DIR)) return;
  if (!fs.existsSync(DUBBELS_DIR)) fs.mkdirSync(DUBBELS_DIR, { recursive: true });

  const files = fs.readdirSync(PHOTOS_DIR);
  const hashes: { [hash: string]: string[] } = {};

  files.forEach(fileName => {
    const filePath = path.join(PHOTOS_DIR, fileName);
    if (fs.statSync(filePath).isDirectory()) return;

    const hash = getHash(filePath);
    if (!hashes[hash]) hashes[hash] = [];
    hashes[hash].push(fileName);
  });

  let movedCount = 0;
  for (const hash in hashes) {
    if (hashes[hash].length > 1) {
      // Bewaar de eerste (laagste index of eerste in lijst), verplaats de rest
      const [original, ...duplicates] = hashes[hash];
      console.log(`💎 Origineel behouden: ${original}`);
      
      duplicates.forEach(dupName => {
        const oldPath = path.join(PHOTOS_DIR, dupName);
        const newPath = path.join(DUBBELS_DIR, dupName);
        fs.renameSync(oldPath, newPath);
        console.log(`   ➡️ Verplaatst naar dubbels: ${dupName}`);
        movedCount++;
      });
    }
  }

  console.log(`\n✨ Klaar! ${movedCount} dubbele bestanden geïsoleerd in ${DUBBELS_DIR}.`);
}

isolateDuplicates().catch(console.error);
