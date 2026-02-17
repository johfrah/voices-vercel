import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🚀 LEGACY UPLOADS RESTORER (2026)
 * 
 * Doel: Herstellen van visuals uit de originele legacy-uploads folder.
 * Gebruikt de SQL-mapping om WooCommerce IDs te koppelen.
 * Splitsing in 'photos' en 'thumbnails' voor de actieve map.
 */

const SOURCE_DIR = './4-KELDER/legacy-uploads';
const TARGET_BASE = './1-SITE/assets/visuals';
const MAPPING_FILE = './3-WETTEN/scripts/maintenance/sql-image-mapping.json';
const ACTIVE_VOICES_FILE = './3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';

const activeTalentIds = new Set<string>();
const sqlMapping: { [fileName: string]: string } = {};

function loadData() {
  console.log("🧠 Data laden...");
  
  // 1. SQL Mapping laden
  if (fs.existsSync(MAPPING_FILE)) {
    Object.assign(sqlMapping, JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8')));
  }

  // 2. Actieve stemmen laden
  if (fs.existsSync(ACTIVE_VOICES_FILE)) {
    const content = fs.readFileSync(ACTIVE_VOICES_FILE, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 6) {
        const id = parts[5];
        if (id && !isNaN(parseInt(id))) activeTalentIds.add(id);
      }
    });
  }
  console.log(`✅ Data geladen: ${Object.keys(sqlMapping).length} SQL links, ${activeTalentIds.size} actieve stemmen.`);
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

const nameCounters: { [key: string]: number } = {};

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

async function restoreFromLegacy() {
  loadData();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  let totalProcessed = 0;
  const moveMap: { [oldPath: string]: string } = {};

  const processFile = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!imageExtensions.includes(ext)) return;
    
    // Bepaal of het een thumbnail is op basis van de bestandsnaam (WP conventie)
    const isWpThumb = filePath.match(/-(150x150|230x350)\.(jpg|png|webp|jpeg)$/i);
    
    const dims = getDimensions(filePath);
    if (!dims) return;

    // Als het geen WP thumb is, check dan op exacte afmetingen voor de 230x350 thumbs
    const isSizeThumb = (dims.width === 230 && dims.height === 350);
    const type = (isWpThumb || isSizeThumb) ? 'thumb' : 'photo';

    const orientation = getOrientation(dims.width, dims.height);
    const fileName = path.basename(filePath);
    let id = sqlMapping[fileName] || '000000';
    
    // Sortering
    let targetSubDir = 'inactive';
    if (activeTalentIds.has(id)) {
      targetSubDir = type === 'thumb' ? 'active/thumbnails' : 'active/photos';
    } else if (filePath.includes('gravity_forms')) {
      targetSubDir = 'submissions';
    }

    const baseKey = `${id}-${type}-${orientation}`;
    nameCounters[baseKey] = (nameCounters[baseKey] || 0) + 1;
    const newFileName = `${baseKey}-${nameCounters[baseKey]}${ext}`;
    const newPath = path.join(TARGET_BASE, targetSubDir, newFileName);

    try {
      if (!fs.existsSync(path.dirname(newPath))) fs.mkdirSync(path.dirname(newPath), { recursive: true });
      fs.copyFileSync(filePath, newPath); 
      moveMap[filePath] = newPath;
      totalProcessed++;
    } catch (e) {
      console.error(`❌ Fout bij kopiëren van ${filePath}:`, e);
    }
  };

  console.log("🚀 Start herstel uit legacy-uploads (inclusief thumbnails)...");
  walkDir(SOURCE_DIR, processFile);

  console.log(`✨ Klaar! ${totalProcessed} bestanden hersteld uit legacy-uploads.`);
}

restoreFromLegacy().catch(console.error);
