import fs from 'fs';
import path from 'path';

/**
 * 📂 VISUALS SORTER (2026)
 * 
 * Verplaatst afbeeldingen in 1-SITE/assets/visuals naar submappen (active, inactive, articles)
 * ZONDER de bestandsnamen te veranderen.
 */

const VISUALS_DIR = '1-SITE/assets/visuals';
const MANIFEST_PATH = '1-SITE/apps/web/public/photo-manifest.json';

// --- 🧠 KNOWLEDGE BASE ---
const activeTalentIds = new Set<string>();

function loadActiveTalent() {
  // 1. ACTIVE_VOICE_ACTORS.md
  const activePath = '3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
  if (fs.existsSync(activePath)) {
    const content = fs.readFileSync(activePath, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        const id = parts[5];
        if (id && !isNaN(parseInt(id))) activeTalentIds.add(id);
      }
    });
  }

  // 2. ATOMIC-VOICES-LIST.md
  const atomicPath = '3-WETTEN/docs/5-CONTENT-AND-MARKETING/01-ATOMIC-VOICES-LIST.md';
  if (fs.existsSync(atomicPath)) {
    const content = fs.readFileSync(atomicPath, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        const wpId = parts[3];
        const dbId = parts[5];
        const status = parts[4]?.toLowerCase();
        if (status === 'live') {
          if (wpId && wpId !== '-' && !isNaN(parseInt(wpId))) activeTalentIds.add(wpId);
          else if (dbId && !isNaN(parseInt(dbId))) activeTalentIds.add(dbId);
        }
      }
    });
  }
  console.log(`✅ ${activeTalentIds.size} actieve talent ID's geladen.`);
}

async function sortVisuals() {
  loadActiveTalent();
  
  if (!fs.existsSync(VISUALS_DIR)) return;

  const files = fs.readdirSync(VISUALS_DIR);
  let movedCount = 0;
  const moveMap: { [oldPath: string]: string } = {};

  for (const file of files) {
    const oldPath = path.join(VISUALS_DIR, file);
    if (fs.statSync(oldPath).isDirectory()) continue;

    let targetSubDir = '';

    if (file.startsWith('article-') || file.startsWith('page-')) {
      targetSubDir = 'articles';
    } else if (file.match(/^\d{4,6}-/)) {
      // Het is talent (begint met ID)
      const id = file.split('-')[0];
      targetSubDir = activeTalentIds.has(id) ? 'active' : 'inactive';
    } else if (file.startsWith('agency-')) {
      targetSubDir = 'inactive'; // Fallback voor agency zonder ID
    }

    if (targetSubDir) {
      const newDir = path.join(VISUALS_DIR, targetSubDir);
      const newPath = path.join(newDir, file);
      
      try {
        fs.renameSync(oldPath, newPath);
        moveMap[oldPath] = newPath;
        movedCount++;
      } catch (e) {
        console.error(`❌ Fout bij verplaatsen van ${file}:`, e);
      }
    }
  }

  console.log(`✨ Klaar! ${movedCount} bestanden gesorteerd zonder hernoeming.`);

  if (fs.existsSync(MANIFEST_PATH)) {
    console.log("📝 Bijwerken van photo-manifest.json...");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const updatedManifest = manifest.map((item: any) => {
      if (moveMap[item.path]) {
        return { ...item, path: moveMap[item.path] };
      }
      return item;
    });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2));
    console.log("🚀 Manifest bijgewerkt.");
  }
}

sortVisuals().catch(console.error);
