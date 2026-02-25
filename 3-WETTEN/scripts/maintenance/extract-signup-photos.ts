import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 🕵️‍♂️ SIGNUP PHOTO EXTRACTOR (2026)
 * 
 * Doel: Foto's vinden in de Signup folder voor actieve stemmen en KOPIËREN naar visuals.
 * STRIKT: Alleen lezen uit Signup, NOOIT wijzigen of verplaatsen.
 */

const SIGNUP_DIR = '/Users/voices/Library/CloudStorage/Dropbox/Signup';
const TARGET_DIR = './1-SITE/assets/visuals/active';
const ACTIVE_VOICES_FILE = './3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';

function loadActiveVoices() {
  const voices: { id: string, name: string, slug: string }[] = [];
  if (fs.existsSync(ACTIVE_VOICES_FILE)) {
    const content = fs.readFileSync(ACTIVE_VOICES_FILE, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      // Check of de regel begint met een landcode (bijv. BE, NL, DE)
      if (parts.length >= 6 && parts[0].length === 2) {
        voices.push({ id: parts[5], name: parts[3], slug: parts[4] });
      }
    });
  }
  return voices;
}

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

async function run() {
  console.log("🚀 Start scan van Signup folder (READ-ONLY)...");
  const activeVoices = loadActiveVoices();
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];
  let copiedCount = 0;

  // We houden per ID bij hoeveel foto's we al hebben om de index te bepalen
  const idCounters: { [id: string]: number } = {};
  
  // Eerst kijken wat er al in de target staat om dubbel werk te voorkomen
  if (fs.existsSync(TARGET_DIR)) {
    fs.readdirSync(TARGET_DIR).forEach(f => {
      const match = f.match(/^(\d+)-/);
      if (match) {
        const id = match[1];
        idCounters[id] = Math.max(idCounters[id] || 0, 1); // We beginnen bij 1
      }
    });
  }

  activeVoices.forEach(voice => {
    const slug = voice.slug.toLowerCase();
    const firstName = voice.name.split(' ')[0].toLowerCase();
    
    // Alleen zoeken als het een echte naam is
    if (firstName.length <= 2) return;

    console.log(`🔎 Zoeken voor ${voice.name}...`);
    
    const candidates: string[] = [];
    walkDir(SIGNUP_DIR, (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!imageExts.includes(ext)) return;
      
      const lowerPath = filePath.toLowerCase();
      // Match als de slug of voornaam in het pad of de bestandsnaam zit
      if (lowerPath.includes(slug) || lowerPath.includes(firstName)) {
        candidates.push(filePath);
      }
    });

    candidates.forEach(sourcePath => {
      const dims = getDimensions(sourcePath);
      if (!dims || dims.width < 300) return; // Te klein overslaan

      const orientation = dims.width > dims.height ? 'horizontal' : (dims.width < dims.height ? 'vertical' : 'square');
      const ext = path.extname(sourcePath).toLowerCase();
      
      const nextIndex = (idCounters[voice.id] || 0) + 1;
      const targetName = `${voice.id}-photo-${orientation}-${nextIndex}${ext}`;
      const targetPath = path.join(TARGET_DIR, targetName);

      try {
        fs.copyFileSync(sourcePath, targetPath);
        idCounters[voice.id] = nextIndex;
        copiedCount++;
        console.log(`   ✅ Gekopieerd: ${path.basename(sourcePath)} -> ${targetName}`);
      } catch (e) {
        console.error(`   ❌ Fout bij kopiëren ${voice.name}:`, e);
      }
    });
  });

  console.log(`\n✨ Klaar! ${copiedCount} foto's veilig gekopieerd uit Signup.`);
}

run().catch(console.error);
