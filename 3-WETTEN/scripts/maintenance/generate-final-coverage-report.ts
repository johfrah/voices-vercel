import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ MASTER PHOTO AUDIT (2026)
 * 
 * Doel: Een 100% correct overzicht genereren van ALLE actieve stemmen en hun visuals.
 * Scant: photos, logos en thumbnails mappen.
 * Bron: ACTIVE_VOICE_ACTORS.md (en Michèle/Brecht handmatig toegevoegd).
 */

const ACTIVE_VOICES_FILE = './3-WETTEN/docs/ACTIVE_VOICE_ACTORS.md';
const BASE_DIR = './1-SITE/assets/visuals/active';
const REPORT_FILE = './3-WETTEN/docs/5-CONTENT-AND-MARKETING/12-FINAL-PHOTO-COVERAGE-REPORT.md';

function generateReport() {
  console.log("📊 Master foto-audit starten...");

  const activeVoices: any[] = [];
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

  // Voeg Michèle en Brecht handmatig toe als ze ontbreken (ze zijn live in Atomic list)
  if (!activeVoices.find(v => v.id === '207660')) {
    activeVoices.push({ land: 'BE', taal: 'nl', geslacht: 'female', naam: 'Michèle', slug: 'michele', id: '207660' });
  }
  if (!activeVoices.find(v => v.id === '238957')) {
    activeVoices.push({ land: 'BE', taal: 'nl', geslacht: 'male', naam: 'Brecht', slug: 'brecht-v', id: '238957' });
  }

  const idToAssets: { [id: string]: { photos: string[], logos: string[], thumbs: string[] } } = {};
  
  const scanDir = (subDir: string, key: 'photos' | 'logos' | 'thumbs') => {
    const dirPath = path.join(BASE_DIR, subDir);
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(f => {
        const match = f.match(/^(\d+)-/);
        if (match) {
          const id = match[1];
          if (!idToAssets[id]) idToAssets[id] = { photos: [], logos: [], thumbs: [] };
          idToAssets[id][key].push(f);
        }
      });
    }
  };

  scanDir('photos', 'photos');
  scanDir('logos', 'logos');
  scanDir('thumbnails', 'thumbs');

  const covered = activeVoices.filter(v => idToAssets[v.id] && (idToAssets[v.id].photos.length > 0 || idToAssets[v.id].logos.length > 0));
  const onlyThumbs = activeVoices.filter(v => idToAssets[v.id] && idToAssets[v.id].photos.length === 0 && idToAssets[v.id].logos.length === 0 && idToAssets[v.id].thumbs.length > 0);
  const trulyMissing = activeVoices.filter(v => !idToAssets[v.id]);

  let md = `# 📸 Master Foto-Dekking Rapport (2026)\n\n`;
  md += `Dit rapport is de enige bron van waarheid voor de visuele status van onze actieve stemmen.\n\n`;
  
  md += `## 📊 Kerncijfers\n\n`;
  md += `- **Totaal Actieve Stemmen**: ${activeVoices.length}\n`;
  md += `- **Stemmen MET kwaliteitsfoto/logo**: ${covered.length}\n`;
  md += `- **Stemmen met ALLEEN een thumbnail**: ${onlyThumbs.length}\n`;
  md += `- **Stemmen ZONDER enige visual**: ${trulyMissing.length}\n\n`;

  md += `## ✅ Stemmen MET Kwaliteitsfoto of Logo\n\n`;
  md += `| ID | Naam | Type | Bestanden |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  covered.sort((a,b) => a.naam.localeCompare(b.naam)).forEach(v => {
    const assets = idToAssets[v.id];
    const type = assets.photos.length > 0 ? 'Photo' : 'Logo';
    const allFiles = [...assets.photos, ...assets.logos];
    md += `| ${v.id} | ${v.naam} | ${type} | ${allFiles.join(', ')} |\n`;
  });

  md += `\n\n## ⚠️ Stemmen met ALLEEN een Thumbnail (Check Google!)\n\n`;
  md += `| ID | Naam | Slug | Land | Bestanden |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  onlyThumbs.forEach(v => {
    md += `| ${v.id} | ${v.naam} | ${v.slug} | ${v.land} | ${idToAssets[v.id].thumbs.join(', ')} |\n`;
  });

  md += `\n\n## ❌ Stemmen ZONDER enige visual\n\n`;
  md += `| ID | Naam | Slug | Land | Taal |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  trulyMissing.forEach(v => {
    md += `| ${v.id} | ${v.naam} | ${v.slug} | ${v.land} | ${v.taal} |\n`;
  });

  md += `\n\n---\n*Gegenereerd door Louis & Chris op ${new Date().toLocaleDateString()}*`;

  fs.writeFileSync(REPORT_FILE, md);
  console.log(`✅ Master rapport gegenereerd: ${REPORT_FILE}`);
}

generateReport();
