import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ ACTIVE PHOTO AUDIT (2026)
 * 
 * Doel: Identificeren welke actieve stemmen nog een foto missen in de visuals map.
 */

const ACTIVE_VOICES_FILE = './3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
const VISUALS_ACTIVE_DIR = './1-SITE/assets/visuals/active';

function audit() {
  console.log("📊 Audit van actieve stemmen starten...");

  const activeVoices: { id: string, name: string, slug: string }[] = [];
  if (fs.existsSync(ACTIVE_VOICES_FILE)) {
    const content = fs.readFileSync(ACTIVE_VOICES_FILE, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 6) {
        const id = parts[5];
        const name = parts[1];
        const slug = parts[2];
        if (id && !isNaN(parseInt(id))) {
          activeVoices.push({ id, name, slug });
        }
      }
    });
  }

  const existingIds = new Set<string>();
  if (fs.existsSync(VISUALS_ACTIVE_DIR)) {
    fs.readdirSync(VISUALS_ACTIVE_DIR).forEach(f => {
      const match = f.match(/^(\d+)-/);
      if (match) existingIds.add(match[1]);
    });
  }

  const missing = activeVoices.filter(v => !existingIds.has(v.id));

  console.log(`\n✅ Totaal actieve stemmen: ${activeVoices.length}`);
  console.log(`📸 Stemmen MET foto: ${activeVoices.length - missing.length}`);
  console.log(`❌ Stemmen ZONDER foto: ${missing.length}`);

  if (missing.length > 0) {
    console.log("\n📋 Lijst van missende stemmen:");
    missing.forEach(v => console.log(`- [${v.id}] ${v.name} (${v.slug})`));
  }

  // Opslaan voor de volgende stap
  fs.writeFileSync('./3-WETTEN/scripts/maintenance/missing-active-photos.json', JSON.stringify(missing, null, 2));
}

audit();
