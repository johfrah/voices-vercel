import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 🚀 FINAL VISUALS RESTORER (2026)
 * 
 * Doel: Herstellen van visuals uit backupkelder en public/assets.
 * Behoudt de naam-mandate (WooCommerce ID + Oriëntatie).
 * Sorteert in de juiste mappen.
 */

const SOURCES = [
  './4-KELDER/backupkelder',
  './1-SITE/apps/web/public/assets',
  './1-SITE/assets/visuals' // Ook de bestanden die al in visuals staan meenemen in sortering
];

const TARGET_BASE = './1-SITE/assets/visuals';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';

// --- 🧠 KNOWLEDGE BASE ---
const nameToIdMap: { [name: string]: string } = {};
const activeTalentIds = new Set<string>();
const manualMapping: { [name: string]: string } = {};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadKnowledgeBase() {
  console.log("🧠 Knowledge Base laden...");
  
  const manualPath = '3-WETTEN/scripts/maintenance/manual-mapping.json';
  if (fs.existsSync(manualPath)) {
    const manual = JSON.parse(fs.readFileSync(manualPath, 'utf-8'));
    Object.assign(manualMapping, manual);
  }
  
  const activePath = '3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
  if (fs.existsSync(activePath)) {
    const content = fs.readFileSync(activePath, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 6) {
        const name = normalize(parts[3]);
        const slug = normalize(parts[4]);
        const id = parts[5];
        if (id && !isNaN(parseInt(id))) {
          nameToIdMap[name] = id;
          nameToIdMap[slug] = id;
          activeTalentIds.add(id);
        }
      }
    });
  }

  const atomicPath = '3-WETTEN/docs/5-CONTENT-AND-MARKETING/01-ATOMIC-VOICES-LIST.md';
  if (fs.existsSync(atomicPath)) {
    const content = fs.readFileSync(atomicPath, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 6) {
        const fullName = normalize(parts[1]);
        const firstName = fullName.split('-')[0];
        const wpId = parts[3];
        const dbId = parts[5];
        const status = parts[4]?.toLowerCase();
        
        const finalId = (wpId && wpId !== '-' && !isNaN(parseInt(wpId))) ? wpId : dbId;

        if (finalId && !isNaN(parseInt(finalId))) {
          if (!nameToIdMap[fullName] || (finalId.length >= 6 && nameToIdMap[fullName].length < 6)) {
            nameToIdMap[fullName] = finalId;
          }
          if (!nameToIdMap[firstName] || (finalId.length >= 6 && nameToIdMap[firstName].length < 6)) {
            nameToIdMap[firstName] = finalId;
          }
          if (status === 'live') activeTalentIds.add(finalId);
        }
      }
    });
  }
  console.log(`✅ Knowledge Base geladen: ${Object.keys(nameToIdMap).length} namen gemapt.`);
}

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

function extractContext(filePath: string) {
  const parts = filePath.split(path.sep);
  const parentDir = parts[parts.length - 2];
  let name = 'unknown';
  let id = '000000';

  if (parentDir) {
    const normalizedParent = normalize(parentDir);
    if (manualMapping[normalizedParent]) return { name: normalizedParent, id: manualMapping[normalizedParent] };

    const idMatch = parentDir.match(/(.*)[- ]([A-Z]-|live-)?(\d{5,6})$/i);
    if (idMatch) {
      name = normalize(idMatch[1]);
      id = idMatch[3];
    } else {
      name = normalize(parentDir);
      if (nameToIdMap[name]) {
        id = nameToIdMap[name];
      } else {
        const keys = Object.keys(nameToIdMap).sort((a, b) => b.length - a.length);
        const foundKey = keys.find(key => key.length > 3 && (name.includes(key) || key.includes(name)));
        if (foundKey) {
          id = nameToIdMap[foundKey];
          name = foundKey;
        } else {
          const firstName = name.split('-')[0];
          if (firstName.length > 2 && nameToIdMap[firstName]) id = nameToIdMap[firstName];
        }
      }
    }
  }
  return { name, id };
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

async function restoreAndSort() {
  loadKnowledgeBase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const moveMap: { [oldPath: string]: string } = {};
  const nameCounters: { [key: string]: number } = {};
  let totalProcessed = 0;

  const processFile = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!imageExtensions.includes(ext)) return;
    if (filePath.includes('.next') || filePath.includes('node_modules')) return;

    const dims = getDimensions(filePath);
    if (!dims) return;

    const orientation = getOrientation(dims.width, dims.height);
    const { name, id } = extractContext(filePath);
    
    // SKIP files that were already incorrectly named "visuals"
    if (name === 'visuals' || path.basename(filePath).includes('-visuals-')) {
      return;
    }
    
    let type = 'photo';
    if ((dims.width === 230 && dims.height === 350) || path.basename(filePath).startsWith('thumb-')) type = 'thumb';
    else if (filePath.includes('/partners/') || path.basename(filePath).includes('logo')) type = 'logo';
    else if (filePath.includes('/icons/') || path.basename(filePath).includes('icon') || path.basename(filePath).includes('avatar')) type = 'icon';

    let finalId = id;
    let targetSubDir = ''; 

    if (filePath.includes('/branding/') || filePath.includes('/common/')) {
      finalId = 'branding';
      targetSubDir = 'branding';
    } else if (filePath.includes('/ademing/')) {
      finalId = 'ademing';
      targetSubDir = 'articles';
    } else if (filePath.includes('/content/pages/')) {
      finalId = 'page';
      targetSubDir = 'articles';
    } else if (filePath.includes('/content/article/') || filePath.includes('/content/blog/') || filePath.includes('/content/library/')) {
      finalId = 'article';
      targetSubDir = 'articles';
    } else if (type === 'icon') {
      finalId = 'icon';
      targetSubDir = 'icons';
    } else if (type === 'logo') {
      finalId = 'logo';
      targetSubDir = filePath.includes('/partners/') ? 'partners' : 'logos';
    } else {
      if (finalId === '000000' && filePath.includes('/agency/')) finalId = 'agency';
      const isActive = activeTalentIds.has(finalId) || activeTalentIds.has(name);
      targetSubDir = isActive ? 'active' : 'inactive';
    }

    const baseKey = `${finalId}-${name}-${type}-${orientation}`;
    nameCounters[baseKey] = (nameCounters[baseKey] || 0) + 1;
    const newFileName = `${baseKey}-${nameCounters[baseKey]}${ext}`;
    const newPath = path.join(TARGET_BASE, targetSubDir, newFileName);

    try {
      if (!fs.existsSync(path.dirname(newPath))) fs.mkdirSync(path.dirname(newPath), { recursive: true });
      if (filePath !== newPath) {
        fs.renameSync(filePath, newPath);
        moveMap[filePath] = newPath;
        totalProcessed++;
      }
    } catch (e) {
      console.error(`❌ Fout bij verwerken van ${filePath}:`, e);
    }
  };

  SOURCES.forEach(source => walkDir(source, processFile));

  console.log(`✨ Klaar! ${totalProcessed} bestanden hersteld en gesorteerd.`);

  if (fs.existsSync(MANIFEST_PATH)) {
    console.log("📝 Bijwerken van photo-manifest.json...");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const updatedManifest = manifest.map((item: any) => {
      if (moveMap[item.path]) return { ...item, path: moveMap[item.path], fileName: path.basename(moveMap[item.path]) };
      return item;
    });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2));
    console.log("🚀 Manifest bijgewerkt.");
  }
}

restoreAndSort().catch(console.error);
