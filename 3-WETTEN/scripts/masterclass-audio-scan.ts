import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanOrdersForAudio() {
  console.log('🔍 [CHRIS-PROTOCOL] Deep Scan: Searching for ANY audio in raw_meta of orders (no journey filter)...');

  try {
    const samples = await sql`
      SELECT 
        id, 
        raw_meta,
        journey,
        dropbox_folder_url
      FROM public.orders
      WHERE (raw_meta::text ILIKE '%dropbox%' OR raw_meta::text ILIKE '%.wav%' OR raw_meta::text ILIKE '%.mp3%')
      LIMIT 10
    `;

    console.log(`✅ Found ${samples.length} orders with potential audio in raw_meta.`);
    samples.forEach(s => {
      console.log(`ID: ${s.id} | Journey: ${s.journey}`);
      console.log(`Dropbox Folder: ${s.dropbox_folder_url}`);
      console.log(`Raw Meta: ${JSON.stringify(s.raw_meta, null, 2).substring(0, 500)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanOrdersForAudio();
