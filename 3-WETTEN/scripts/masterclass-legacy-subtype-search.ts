import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function findLegacyTelephonySubtypes() {
  console.log('🔍 [CHRIS-PROTOCOL] Deep Scan: Searching for legacy telephony/voicemail types...');

  try {
    // 1. Zoek naar alle tabellen in public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\n--- ALL TABLES ---');
    console.log(tables.map(t => t.table_name).join(', '));

    // 2. Check of er een 'voicemail' of 'telephony' gerelateerde info in 'actor_demos' staat (als platte tekst)
    const demoTypes = await sql`
      SELECT DISTINCT type FROM public.actor_demos 
      WHERE type IS NOT NULL AND type != 'telephony'
    `;
    console.log('\n--- UNIQUE ACTOR_DEMO TYPES ---');
    console.table(demoTypes);

    // 3. Check de 'media' tabel op unieke labels
    const mediaLabels = await sql`
      SELECT DISTINCT labels FROM public.media 
      WHERE labels IS NOT NULL
      LIMIT 20
    `;
    console.log('\n--- MEDIA LABEL SAMPLES ---');
    console.table(mediaLabels);

    // 4. Check 'order_items' op unieke productnamen
    const productNames = await sql`
      SELECT name, COUNT(*) as count FROM public.order_items 
      WHERE name ILIKE '%voicemail%' OR name ILIKE '%begroeting%' OR name ILIKE '%wacht%'
      GROUP BY name
      ORDER BY count DESC
    `;
    console.log('\n--- TELEPHONY PRODUCT NAMES ---');
    console.table(productNames);

  } catch (error) {
    console.error('❌ Search failed:', error);
  } finally {
    await sql.end();
  }
}

findLegacyTelephonySubtypes();
