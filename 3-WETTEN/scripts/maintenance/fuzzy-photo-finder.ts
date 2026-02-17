import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 🕵️‍♂️ FUZZY PHOTO FINDER (2026)
 * 
 * Doel: Opsporen van missende foto's voor actieve stemmen op basis van naam/slug
 * in de legacy-uploads mappen.
 */

const SOURCE_DIR = './4-KELDER/legacy-uploads';
const TARGET_BASE = './1-SITE/assets/visuals/active';
const MISSING_FILE = './3-WETTEN/scripts/maintenance/missing-active-photos.json';

function getDimensions(filePath: string): { width: number, height: number } | null {
  try {
    const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const widthMatch = output.match(/pixelWidth: (\d+)/);
    const heightMatch = output.match(/pixelHeight: (\d+)/);
    if (widthMatch && heightMatch) {
      return { width: parseInt(widthMatch[1]), height: parseInt(heightMatch[1]) };
    }
  } catch (e) {}
  return null;
}

function getOrientation(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 1.1) return 'horizontal';
  if (ratio < 0.9) return 'vertical';
  return 'square';
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

async function fuzzyFind() {
  if (!fs.existsSync(MISSING_FILE)) return;
  const missing = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf-8'));
  
  console.log(`🔍 Fuzzy search starten voor ${missing.length} stemmen in ${SOURCE_DIR}...`);

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  let foundCount = 0;

  const nameCounters: { [key: string]: number } = {};

  missing.forEach((voice: any) => {
    const slug = voice.slug.toLowerCase();
    const nameParts = voice.name.toLowerCase().split(' ');
    const firstName = nameParts[0];

    // SKIP generieke taalcodes of te korte namen
    if (firstName.length <= 2 || ['fr', 'nl', 'de', 'es', 'en', 'it', 'pl', 'da'].includes(firstName)) {
      console.log(`⏩ Overslaan van generieke naam: ${voice.name} (${slug})`);
      return;
    }

    console.log(`🔎 Zoeken naar: ${voice.name} (${slug})...`);

    const matches: string[] = [];

    walkDir(SOURCE_DIR, (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!imageExtensions.includes(ext)) return;
      if (filePath.match(/-\d+x\d+\.(jpg|png|webp|jpeg)$/i)) return; // Geen thumbs

      const baseName = path.basename(filePath).toLowerCase();
      
      // Match op slug of volledige naam
      if (baseName.includes(slug) || baseName.includes(firstName)) {
        matches.push(filePath);
      }
    });

    if (matches.length > 0) {
      // Sorteer op grootte (grootste eerst)
      const bestMatches = matches.map(m => ({ path: m, dims: getDimensions(m) }))
        .filter(m => m.dims !== null)
        .sort((a, b) => (b.dims!.width * b.dims!.height) - (a.dims!.width * a.dims!.height));

      if (bestMatches.length > 0) {
        const best = bestMatches[0];
        const orientation = getOrientation(best.dims!.width, best.dims!.height);
        const ext = path.extname(best.path).toLowerCase();
        
        const baseKey = `${voice.id}-photo-${orientation}`;
        nameCounters[baseKey] = (nameCounters[baseKey] || 0) + 1;
        const newFileName = `${baseKey}-${nameCounters[baseKey]}${ext}`;
        const newPath = path.join(TARGET_BASE, newFileName);

        try {
          fs.copyFileSync(best.path, newPath);
          console.log(`   ✅ Gevonden: ${path.basename(best.path)} -> ${newFileName} (${best.dims!.width}x${best.dims!.height})`);
          foundCount++;
        } catch (e) {
          console.error(`   ❌ Fout bij kopiëren:`, e);
        }
      }
    } else {
      console.log(`   ⚠️ Niets gevonden.`);
    }
  });

  console.log(`\n✨ Klaar! ${foundCount} extra foto's gevonden via fuzzy matching.`);
}

fuzzyFind().catch(console.error);
