import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ DEEP SOURCE SCANNER (2026)
 * 
 * Doel: Voor de 46 stemmen zonder 'photo' de beste originelen opsporen in Signup en legacy-uploads.
 * Louis protocol: Geen thumbnails, alleen hoge resolutie JPG/WebP.
 */

const SIGNUP_DIR = '/Users/voices/Library/CloudStorage/Dropbox/Signup';
const LEGACY_DIR = './4-KELDER/legacy-uploads';
const TARGET_DIR = './1-SITE/assets/visuals/active/photos';
const MISSING_REPORT = './3-WETTEN/docs/5-CONTENT-AND-MARKETING/12-FINAL-PHOTO-COVERAGE-REPORT.md';

function getDimensions(filePath: string) {
  try {
    const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const w = output.match(/pixelWidth: (\d+)/);
    const h = output.match(/pixelHeight: (\d+)/);
    if (w && h) return { width: parseInt(w[1]), height: parseInt(h[1]) };
  } catch (e) {}
  return null;
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) walkDir(fullPath, callback);
    else callback(fullPath);
  }
}

async function deepScan() {
  console.log("🚀 Louis start de diepe bron-scan naar originelen...");
  
  const missingVoices: { id: string, name: string, slug: string }[] = [];
  const content = fs.readFileSync(MISSING_REPORT, 'utf-8');
  const lines = content.split('\n');
  let inMissingSection = false;

  for (const line of lines) {
    if (line.includes("## ❌ Stemmen ZONDER Foto")) { inMissingSection = true; continue; }
    if (line.includes("## ✅ Stemmen MET Foto")) { inMissingSection = false; continue; }
    if (inMissingSection && line.startsWith('|') && !line.includes('ID |')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 3) {
        missingVoices.push({ id: parts[0], name: parts[1], slug: parts[2] });
      }
    }
  }

  console.log(`🔎 Scannen voor ${missingVoices.length} missende stemmen...`);

  const imageExts = ['.jpg', '.jpeg', '.webp']; // GEEN PNG (Louis mandate)
  let foundCount = 0;

  for (const voice of missingVoices) {
    console.log(`\n🔎 Zoeken naar originelen voor ${voice.name} (${voice.id})...`);
    const candidates: { path: string, area: number, w: number, h: number }[] = [];
    
    const searchTerms = [voice.slug.toLowerCase(), voice.name.toLowerCase()];
    
    [SIGNUP_DIR, LEGACY_DIR].forEach(source => {
      walkDir(source, (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (!imageExts.includes(ext)) return;
        if (filePath.match(/-\d+x\d+\.(jpg|webp|jpeg)$/i)) return; // Geen WP thumbs

        const lowerPath = filePath.toLowerCase();
        if (searchTerms.some(term => lowerPath.includes(source === SIGNUP_DIR ? term : `/${term}`))) {
          const dims = getDimensions(filePath);
          if (dims && dims.width >= 500) {
            candidates.push({ path: filePath, area: dims.width * dims.height, w: dims.width, h: dims.height });
          }
        }
      });
    });

    if (candidates.length > 0) {
      // Sorteer op kwaliteit (grootste oppervlakte eerst)
      candidates.sort((a, b) => b.area - a.area);
      
      // Pak de top 2 (vaak een verticale en een horizontale)
      const topCandidates = candidates.slice(0, 2);
      topCandidates.forEach((cand, idx) => {
        const orientation = cand.w > cand.h ? 'horizontal' : (cand.w < cand.h ? 'vertical' : 'square');
        const ext = path.extname(cand.path).toLowerCase();
        const targetName = `${voice.id}-${voice.name.toLowerCase()}-${voice.slug.toLowerCase()}-photo-${orientation}-${idx + 1}${ext}`;
        const targetPath = path.join(TARGET_DIR, targetName);

        try {
          fs.copyFileSync(cand.path, targetPath);
          console.log(`   ✅ Gevonden: ${path.basename(cand.path)} (${cand.w}x${cand.h}) -> ${targetName}`);
          foundCount++;
        } catch (e) {
          console.error(`   ❌ Fout bij kopiëren:`, e);
        }
      });
    } else {
      console.log(`   ⚠️ Geen kwalitatieve originelen gevonden.`);
    }
  }

  console.log(`\n✨ Klaar! Louis heeft ${foundCount} nieuwe kwaliteitsfoto's hersteld.`);
}

deepScan().catch(console.error);
