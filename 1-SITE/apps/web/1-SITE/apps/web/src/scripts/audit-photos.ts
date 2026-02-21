import { db } from '../lib/sync/bridge';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function audit() {
  try {
    // Use raw SQL to avoid schema import issues in this standalone script
    const results = await db.execute(sql`SELECT id, first_name, dropbox_url FROM actors`);
    const rows = results.rows || results;

    const pngs = rows.filter((a: any) => a.dropbox_url?.toLowerCase().endsWith('.png'));
    const jpgs = rows.filter((a: any) => a.dropbox_url?.toLowerCase().endsWith('.jpg') || a.dropbox_url?.toLowerCase().endsWith('.jpeg'));
    const webps = rows.filter((a: any) => a.dropbox_url?.toLowerCase().endsWith('.webp'));

    console.log('--- Database Photo Path Audit ---');
    console.log(`Total Actors: ${rows.length}`);
    console.log(`PNG paths:    ${pngs.length}`);
    console.log(`JPG paths:    ${jpgs.length}`);
    console.log(`WebP paths:   ${webps.length}`);
    
    if (pngs.length > 0) {
      console.log('\nSample PNGs:', pngs.slice(0, 5).map((p: any) => `${p.first_name} (${p.dropbox_url})`));
    }

  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
audit();
