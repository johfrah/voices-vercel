import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🏷️ FINDER TAG SCANNER
 * 
 * Scant de lokale mappen op macOS Finder tags ("Behouden" / Groen)
 * en update de photo-manifest.json zodat de Photo-Matcher ze kan filteren.
 */

const MANIFEST_PATH = '1-SITE/apps/web/public/photo-manifest.json';
const SCAN_ROOTS = [
  './4-KELDER',
  './1-SITE/assets'
];

async function scanFinderTags() {
  console.log("🔍 Scanning for Finder tags ('Behouden')...");

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("❌ Manifest not found. Run generate-photo-manifest.ts first.");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  let taggedCount = 0;

  // We scannen alleen de items die in de manifest staan om consistent te blijven
  const updatedManifest = manifest.map((item: any) => {
    try {
      // mdls is een macOS specifiek commando
      const output = execSync(`mdls -name kMDItemUserTags "${item.path}" 2>/dev/null`).toString();
      
      if (output.includes('Behouden') || output.includes('Green')) {
        taggedCount++;
        return { ...item, finderTags: ['Behouden'] };
      }
    } catch (e) {
      // Bestand misschien niet lokaal aanwezig of geen macOS
    }
    return item;
  });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2));
  console.log(`✅ Scan voltooid! ${taggedCount} items gevonden met de tag 'Behouden'.`);
  console.log(`🚀 Herlaad de Photo-Matcher om ze te zien.`);
}

scanFinderTags().catch(console.error);
