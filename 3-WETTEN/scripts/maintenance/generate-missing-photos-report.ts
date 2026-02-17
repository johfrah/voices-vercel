import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ MISSING PHOTOS REPORT GENERATOR (2026)
 * 
 * Doel: Een Markdown rapport genereren van actieve stemmen die nog geen foto hebben.
 */

const ACTIVE_VOICES_FILE = './3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
const PHOTOS_DIR = './1-SITE/assets/visuals/active/photos';
const REPORT_FILE = './3-WETTEN/docs/5-CONTENT-AND-MARKETING/11-MISSING-ACTIVE-PHOTOS-REPORT.md';

function generateReport() {
  console.log("📊 Missende foto's rapport genereren...");

  const activeVoices: { land: string, taal: string, geslacht: string, naam: string, slug: string, id: string }[] = [];
  if (fs.existsSync(ACTIVE_VOICES_FILE)) {
    const content = fs.readFileSync(ACTIVE_VOICES_FILE, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 6 && parts[0].length === 2) {
        activeVoices.push({
          land: parts[0],
          taal: parts[1],
          geslacht: parts[2],
          naam: parts[3],
          slug: parts[4],
          id: parts[5]
        });
      }
    });
  }

  const existingIds = new Set<string>();
  if (fs.existsSync(PHOTOS_DIR)) {
    fs.readdirSync(PHOTOS_DIR).forEach(f => {
      const match = f.match(/^(\d+)-/);
      if (match) existingIds.add(match[1]);
    });
  }

  const missing = activeVoices.filter(v => !existingIds.has(v.id));

  let md = `# 📸 Missende Actieve Foto's Rapport (2026)\n\n`;
  md += `Dit rapport toont de actieve stemmen uit de "Source of Truth" die momenteel nog **geen** kwaliteitsfoto hebben in \`1-SITE/assets/visuals/active/photos\`.\n\n`;
  md += `## 📊 Statistieken\n\n`;
  md += `- **Totaal Actieve Stemmen**: ${activeVoices.length}\n`;
  md += `- **Stemmen MET Foto**: ${activeVoices.length - missing.length}\n`;
  md += `- **Stemmen ZONDER Foto**: ${missing.length}\n\n`;

  md += `## ❌ Lijst van Missende Foto's\n\n`;
  md += `| ID | Naam | Slug | Land | Taal | Geslacht |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  missing.forEach(v => {
    md += `| ${v.id} | ${v.naam} | ${v.slug} | ${v.land} | ${v.taal} | ${v.geslacht} |\n`;
  });

  md += `\n\n---\n*Gegenereerd door Louis & Chris op ${new Date().toLocaleDateString()}*`;

  fs.writeFileSync(REPORT_FILE, md);
  console.log(`✅ Rapport gegenereerd: ${REPORT_FILE}`);
}

generateReport();
