import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 🕵️‍♂️ DUPLICATE PHOTO DETECTOR (2026)
 * 
 * Doel: Opsporen van dubbele foto's in de photos map.
 * Checkt op: Exacte inhoud (hash) en zelfde afmetingen per ID.
 */

const PHOTOS_DIR = './1-SITE/assets/visuals/active/photos';

function getHash(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function getDimensions(filePath: string) {
  try {
    const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const w = output.match(/pixelWidth: (\d+)/);
    const h = output.match(/pixelHeight: (\d+)/);
    if (w && h) return `${w[1]}x${h[1]}`;
  } catch (e) {}
  return 'unknown';
}

async function findDuplicates() {
  console.log("🔍 Zoeken naar dubbele foto's in de photos map...");
  
  if (!fs.existsSync(PHOTOS_DIR)) return;

  const files = fs.readdirSync(PHOTOS_DIR);
  const hashes: { [hash: string]: string[] } = {};
  const dimensionsPerId: { [id: string]: { [dims: string]: string[] } } = {};

  files.forEach(fileName => {
    const filePath = path.join(PHOTOS_DIR, fileName);
    if (fs.statSync(filePath).isDirectory()) return;

    // 1. Check op exacte inhoud (Hash)
    const hash = getHash(filePath);
    if (!hashes[hash]) hashes[hash] = [];
    hashes[hash].push(fileName);

    // 2. Check op afmetingen per ID
    const id = fileName.split('-')[0];
    const dims = getDimensions(filePath);
    if (!dimensionsPerId[id]) dimensionsPerId[id] = {};
    if (!dimensionsPerId[id][dims]) dimensionsPerId[id][dims] = [];
    dimensionsPerId[id][dims].push(fileName);
  });

  console.log("\n💎 EXACTE DUBBELEN (Zelfde inhoud):");
  let exactCount = 0;
  for (const hash in hashes) {
    if (hashes[hash].length > 1) {
      console.log(`- [${hash.substring(0, 8)}] ${hashes[hash].join('  <->  ')}`);
      exactCount++;
    }
  }
  if (exactCount === 0) console.log("  Geen exacte dubbelen gevonden.");

  console.log("\n📏 POTENTIËLE DUBBELEN (Zelfde ID + Zelfde afmetingen):");
  let potentialCount = 0;
  for (const id in dimensionsPerId) {
    for (const dims in dimensionsPerId[id]) {
      if (dimensionsPerId[id][dims].length > 1) {
        // Alleen tonen als ze niet al bij de exacte dubbelen stonden
        console.log(`- ID ${id} (${dims}): ${dimensionsPerId[id][dims].join('  <->  ')}`);
        potentialCount++;
      }
    }
  }
  if (potentialCount === 0) console.log("  Geen potentiële dubbelen gevonden.");
}

findDuplicates().catch(console.error);
