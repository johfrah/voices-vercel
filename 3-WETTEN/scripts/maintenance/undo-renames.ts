import fs from 'fs';
import path from 'path';

/**
 * ⏪ UNDO SCRIPT (2026)
 * 
 * Verplaatst bestanden terug naar hun originele locatie op basis van proposals.json.
 */

const PROPOSALS_PATH = './proposals.json';
const MANIFEST_PATH = './1-SITE/apps/web/public/photo-manifest.json';

async function undoRenames() {
  if (!fs.existsSync(PROPOSALS_PATH)) {
    console.error("❌ Geen proposals.json gevonden. Kan undo niet uitvoeren.");
    return;
  }

  const proposals = JSON.parse(fs.readFileSync(PROPOSALS_PATH, 'utf-8'));
  console.log(`⏪ Starten met het terugdraaien van ${proposals.length} bestanden...`);

  let successCount = 0;
  const undoMap: { [currentPath: string]: string } = {};

  for (const p of proposals) {
    try {
      // In de laatste actie was p.newPath de bestemming (in visuals/active of visuals/inactive)
      // p.oldPath was de locatie VOORDAT ik ze naar die submappen verplaatste.
      if (fs.existsSync(p.newPath)) {
        const originalDir = path.dirname(p.oldPath);
        if (!fs.existsSync(originalDir)) {
          fs.mkdirSync(originalDir, { recursive: true });
        }

        fs.renameSync(p.newPath, p.oldPath);
        undoMap[p.newPath] = p.oldPath;
        successCount++;
        if (successCount % 50 === 0) console.log(`✅ ${successCount} bestanden teruggezet...`);
      }
    } catch (e) {
      console.error(`❌ Fout bij terugdraaien van ${p.newPath}:`, e);
    }
  }

  console.log(`\n✨ Klaar! ${successCount} bestanden teruggezet naar hun vorige locatie.`);

  // We laten de manifest update even voor wat het is, of we herstellen hem als we een backup hebben.
  // Maar het belangrijkste is de bestanden terugkrijgen.
}

undoRenames().catch(console.error);
