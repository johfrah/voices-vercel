import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ PHOTO & THUMB NAME ENRICHER (2026)
 * 
 * Doel: Bestandsnamen in visuals/active/photos en thumbnails verrijken met voor- en achternaam.
 * Formaat: [ID]-[Naam]-[Slug]-[type]-[orientation]-[index].[ext]
 */

const PHOTOS_DIR = './1-SITE/assets/visuals/active/photos';
const THUMBS_DIR = './1-SITE/assets/visuals/active/thumbnails';
const ACTIVE_VOICES_FILE = './3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';

function loadActiveVoicesMap() {
  const voices: { [id: string]: { name: string, slug: string } } = {};
  if (fs.existsSync(ACTIVE_VOICES_FILE)) {
    const content = fs.readFileSync(ACTIVE_VOICES_FILE, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 6 && parts[0].length === 2) {
        const id = parts[5];
        const name = parts[3];
        const slug = parts[4];
        voices[id] = { name, slug };
      }
    });
  }
  return voices;
}

function normalize(str: string) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Accentjes weg
    .replace(/[^a-z0-9]/g, '-') // Alleen letters en cijfers
    .replace(/-+/g, '-') // Geen dubbele streepjes
    .replace(/^-|-$/g, ''); // Geen streepjes aan begin of eind
}

async function enrichNames() {
  console.log("🧠 Namen laden uit Source of Truth...");
  const voicesMap = loadActiveVoicesMap();
  let renamedCount = 0;

  [PHOTOS_DIR, THUMBS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) return;
    console.log(`📂 Verwerken van map: ${dir}`);

    const files = fs.readdirSync(dir);
    
    files.forEach(fileName => {
      // Match ID-namePart-type-orientation-index.ext
      // We moeten de regex aanpassen om de reeds verrijkte namen te vangen
      const match = fileName.match(/^(\d+)-(.+)-(photo|thumb)-(vertical|horizontal|square)-(\d+)(\.[a-z]+)$/i);
      if (match) {
        const id = match[1];
        const currentNamePart = match[2];
        const type = match[3];
        const orientation = match[4];
        const index = match[5];
        const ext = match[6].toLowerCase();

        if (voicesMap[id]) {
          const voice = voicesMap[id];
          const cleanName = normalize(voice.name);
          const cleanSlug = normalize(voice.slug);
          
          // Bepaal de naam-string: als slug en naam hetzelfde zijn, gebruik er maar één
          const namePart = (cleanName === cleanSlug) ? cleanName : `${cleanName}-${cleanSlug}`;
          
          // Nieuw formaat: [ID]-[Naam]-[type]-[orientation]-[index].[ext]
          const newFileName = `${id}-${namePart}-${type}-${orientation}-${index}${ext}`;
          const oldPath = path.join(dir, fileName);
          const newPath = path.join(dir, newFileName);

          if (oldPath !== newPath) {
            fs.renameSync(oldPath, newPath);
            console.log(`✅ Verfijnd: ${fileName} -> ${newFileName}`);
            renamedCount++;
          }
        } else {
          console.log(`⚠️ Geen naam gevonden voor ID ${id} (bestand: ${fileName})`);
        }
      }
    });
  });

  console.log(`\n✨ Klaar! ${renamedCount} bestanden voorzien van voor- en achternaam.`);
}

enrichNames().catch(console.error);
