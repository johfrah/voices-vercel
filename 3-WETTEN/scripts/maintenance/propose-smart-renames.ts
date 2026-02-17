import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 📸 SMART PHOTO RENAMER (2026) - WOOCOMMERCE EDITION
 * 
 * Doel: Hernoemen van foto's op basis van WooCommerce Product ID, naam en oriëntatie.
 * Gebruikt ACTIVE_VOICE_ACTORS.md en ATOMIC-VOICES-LIST.md voor ID-lookups.
 * Elimineert alle 000000 IDs door diepe lookup en journey prefixes.
 */

const SOURCE_DIR = './4-KELDER';
const ASSETS_DIR = './1-SITE/assets';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';

// --- 🧠 KNOWLEDGE BASE ---
const nameToIdMap: { [name: string]: string } = {};
const manualMapping: { [name: string]: string } = {};
const activeTalentIds = new Set<string>();

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Verwijder accenten
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadKnowledgeBase() {
  console.log("🧠 Knowledge Base laden...");
  
  // 0. Manual Mapping
  const manualPath = '3-WETTEN/scripts/maintenance/manual-mapping.json';
  if (fs.existsSync(manualPath)) {
    const manual = JSON.parse(fs.readFileSync(manualPath, 'utf-8'));
    Object.assign(manualMapping, manual);
    Object.values(manual).forEach(id => activeTalentIds.add(id as string));
  }
  
  // 1. ACTIVE_VOICE_ACTORS.md
  const activePath = '3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
  if (fs.existsSync(activePath)) {
    const content = fs.readFileSync(activePath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach(line => {
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

  // 2. ATOMIC-VOICES-LIST.md
  const atomicPath = '3-WETTEN/docs/5-CONTENT-AND-MARKETING/01-ATOMIC-VOICES-LIST.md';
  if (fs.existsSync(atomicPath)) {
    const content = fs.readFileSync(atomicPath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach(line => {
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
          if (status === 'live') {
            activeTalentIds.add(finalId);
          }
        }
      }
    });
  }
  
  console.log(`✅ Knowledge Base geladen: ${Object.keys(nameToIdMap).length} namen gemapt. ${activeTalentIds.size} actieve ID's.`);
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
    
    // 0. Check Manual Mapping eerst
    if (manualMapping[normalizedParent]) {
      return { name: normalizedParent, id: manualMapping[normalizedParent] };
    }

    // 1. Probeer ID uit mapnaam te halen (bijv. naam-A-123456)
    const idMatch = parentDir.match(/(.*)[- ]([A-Z]-|live-)?(\d{5,6})$/i);
    if (idMatch) {
      name = normalize(idMatch[1]);
      id = idMatch[3];
    } else {
      name = normalize(parentDir);
      
      // 2. Lookup in Knowledge Base
      if (nameToIdMap[name]) {
        id = nameToIdMap[name];
      } else {
        const normalizedParent = normalize(parentDir);
        const keys = Object.keys(nameToIdMap).sort((a, b) => b.length - a.length);
        const foundKey = keys.find(key => 
          key.length > 3 && (normalizedParent.includes(key) || key.includes(normalizedParent))
        );
        
        if (foundKey) {
          id = nameToIdMap[foundKey];
          name = foundKey;
        } else {
          const firstName = name.split('-')[0];
          if (firstName.length > 2 && nameToIdMap[firstName]) {
            id = nameToIdMap[firstName];
          }
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
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

async function proposeRenames() {
  loadKnowledgeBase();
  console.log("🔍 Analyse van 4-KELDER en 1-SITE/assets voor WooCommerce-ID hernoeming...");
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const proposals: any[] = [];
  const nameCounters: { [key: string]: number } = {};

  const processFile = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (imageExtensions.includes(ext)) {
      const dims = getDimensions(filePath);
      if (!dims) return;

      const orientation = getOrientation(dims.width, dims.height);
      const { name, id } = extractContext(filePath);
      
      let type = 'photo';
      if ((dims.width === 230 && dims.height === 350) || filePath.includes('thumb-')) {
        type = 'thumb';
      } else if (filePath.includes('/partners/') || path.basename(filePath).includes('logo')) {
        type = 'logo';
      } else if (filePath.includes('/icons/') || path.basename(filePath).includes('icon') || path.basename(filePath).includes('avatar')) {
        type = 'icon';
      }

      let finalId = id;
      let targetSubDir = ''; 

      if (filePath.includes('/branding/') || filePath.includes('/common/')) {
        finalId = 'branding';
      } else if (filePath.includes('/ademing/')) {
        finalId = 'ademing';
      } else if (filePath.includes('/content/pages/')) {
        finalId = 'page';
      } else if (filePath.includes('/content/article/') || filePath.includes('/content/blog/') || filePath.includes('/content/library/')) {
        finalId = 'article';
      } else if (type === 'icon' || type === 'logo') {
        finalId = type;
      } else {
        if (finalId === '000000' && filePath.includes('/agency/')) {
          finalId = 'agency';
        }
        
        const isActive = activeTalentIds.has(finalId) || activeTalentIds.has(name);
        targetSubDir = isActive ? 'active' : 'inactive';
      }

      const baseKey = `${finalId}-${name}-${type}-${orientation}`;
      nameCounters[baseKey] = (nameCounters[baseKey] || 0) + 1;
      
      const newFileName = `${baseKey}-${nameCounters[baseKey]}${ext}`;
      const targetDir = path.join('1-SITE/assets/visuals', targetSubDir);
      const newPath = path.join(targetDir, newFileName);

      if (path.basename(filePath) !== newFileName || !filePath.includes(targetDir)) {
        proposals.push({
          oldPath: filePath,
          newPath: newPath,
          oldName: path.basename(filePath),
          newName: newFileName,
          dims: `${dims.width}x${dims.height}`,
          orientation,
          id: finalId,
          status: targetSubDir || 'general'
        });
      }
    }
  };

  walkDir(SOURCE_DIR, processFile);
  walkDir(ASSETS_DIR, processFile);

  console.log(`\n📊 Gevonden voorstellen: ${proposals.length}`);
  console.log("--------------------------------------------------");
  
  const activeCount = proposals.filter(p => p.status === 'active').length;
  const inactiveCount = proposals.filter(p => p.status === 'inactive').length;
  console.log(`✅ Actief talent: ${activeCount}`);
  console.log(`❌ Inactief talent: ${inactiveCount}`);

  proposals.slice(0, 10).forEach(p => {
    console.log(`FROM: ${p.oldName} (${p.dims})`);
    console.log(`TO:   ${p.status}/${p.newName} [${p.orientation.toUpperCase()}]`);
    console.log("");
  });

  fs.writeFileSync('./proposals.json', JSON.stringify(proposals, null, 2));
  console.log("\n📝 Voorstellen opgeslagen in proposals.json. Geef 'GO' om uit te voeren.");
}

proposeRenames().catch(console.error);
