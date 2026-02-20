// Use tsx to run this if possible, or just node if we can handle the imports
// But wait, the bridge uses ESM. 
// Let's use a simple shell command to grep the sync file for PNGs if we can't run the script easily.

// Actually, let's try one more time with a clean TS script and no project config, just direct execution.
import { db } from '../1-SITE/apps/web/src/lib/sync/bridge';
import { actors } from '../packages/database/schema';

async function audit() {
  try {
    const results = await db.select({ 
      id: actors.id, 
      name: actors.firstName, 
      photo: actors.dropboxUrl 
    }).from(actors);

    const pngs = results.filter((a: any) => a.photo?.toLowerCase().endsWith('.png'));
    const jpgs = results.filter((a: any) => a.photo?.toLowerCase().endsWith('.jpg') || a.photo?.toLowerCase().endsWith('.jpeg'));
    const webps = results.filter((a: any) => a.photo?.toLowerCase().endsWith('.webp'));

    console.log('--- Database Photo Path Audit ---');
    console.log(`Total Actors: ${results.length}`);
    console.log(`PNG paths:    ${pngs.length}`);
    console.log(`JPG paths:    ${jpgs.length}`);
    console.log(`WebP paths:   ${webps.length}`);
    
    if (pngs.length > 0) {
      console.log('\nSample PNGs:', pngs.slice(0, 5).map((p: any) => `${p.name} (${p.photo})`));
    }

  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
audit();
