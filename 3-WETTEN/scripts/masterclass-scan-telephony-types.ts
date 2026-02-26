import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanTelephonyTypes() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning for existing Telephony Type IDs (Corrected)...');

  try {
    // 1. Check media_types tabel
    const mediaTypes = await sql`SELECT * FROM public.media_types ORDER BY id`;
    console.log('\n--- MEDIA TYPES ---');
    console.table(mediaTypes);

    // 2. Check of er een specifieke categories tabel is (voor blueprints)
    try {
      const categories = await sql`SELECT * FROM public.categories ORDER BY id`;
      console.log('\n--- CATEGORIES ---');
      console.table(categories);
    } catch (e) {
      console.log('\nℹ️ No specific categories table found.');
    }

    // 3. Check de script_blueprints voor category_id en titles
    const blueprints = await sql`
      SELECT id, title, category_id 
      FROM public.script_blueprints 
      WHERE title ILIKE '%voicemail%' OR title ILIKE '%keuzemenu%' OR title ILIKE '%welkomst%'
      LIMIT 10
    `;
    console.log('\n--- BLUEPRINT SAMPLES ---');
    console.table(blueprints);

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanTelephonyTypes();
