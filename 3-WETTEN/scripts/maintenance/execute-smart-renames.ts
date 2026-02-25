import fs from 'fs';
import path from 'path';

/**
 * 🚀 EXECUTE SMART RENAMES (2026)
 * 
 * Voert de hernoemingen uit die zijn opgeslagen in proposals.json.
 */

const PROPOSALS_PATH = './proposals.json';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';

async function executeRenames() {
  if (!fs.existsSync(PROPOSALS_PATH)) {
    console.error("❌ Geen proposals.json gevonden. Run eerst propose-smart-renames.ts.");
    return;
  }

  const proposals = JSON.parse(fs.readFileSync(PROPOSALS_PATH, 'utf-8'));
  console.log(`🚀 Starten met het hernoemen van ${proposals.length} bestanden...`);

  let successCount = 0;
  const renameMap: { [oldPath: string]: string } = {};

  for (const p of proposals) {
    try {
      if (fs.existsSync(p.oldPath)) {
        // Zorg dat we niet overschrijven als het bestand al bestaat
        if (fs.existsSync(p.newPath) && p.oldPath !== p.newPath) {
            console.warn(`⚠️ Overslaan: ${p.newPath} bestaat al.`);
            continue;
        }
        
        fs.renameSync(p.oldPath, p.newPath);
        renameMap[p.oldPath] = p.newPath;
        successCount++;
        if (successCount % 50 === 0) console.log(`✅ ${successCount} bestanden verwerkt...`);
      }
    } catch (e) {
      console.error(`❌ Fout bij hernoemen van ${p.oldPath}:`, e);
    }
  }

  console.log(`\n✨ Klaar! ${successCount} bestanden succesvol hernoemd.`);

  if (fs.existsSync(MANIFEST_PATH)) {
    console.log("📝 Bijwerken van photo-manifest.json...");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const updatedManifest = manifest.map((item: any) => {
      if (renameMap[item.path]) {
        const newPath = renameMap[item.path];
        return { 
          ...item, 
          path: newPath, 
          fileName: path.basename(newPath)
        };
      }
      return item;
    });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2));
    console.log("🚀 Manifest bijgewerkt.");
  }
}

executeRenames().catch(console.error);
