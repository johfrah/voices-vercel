import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanEntityTypes() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning "entity_types" and "app_configs" for telephony mappings...');

  try {
    const entityTypes = await sql`SELECT * FROM public.entity_types`;
    console.log('\n--- ENTITY TYPES ---');
    console.table(entityTypes);

    const configs = await sql`SELECT key, value FROM public.app_configs WHERE key ILIKE '%telephony%' OR key ILIKE '%voicemail%'`;
    console.log('\n--- TELEPHONY CONFIGS ---');
    configs.forEach(c => {
      console.log(`Key: ${c.key}`);
      console.log(`Value: ${JSON.stringify(c.value, null, 2).substring(0, 200)}...`);
      console.log('---');
    });

    const categories = await sql`SELECT DISTINCT category FROM public.products WHERE category IS NOT NULL`;
    console.log('\n--- PRODUCT CATEGORIES ---');
    console.table(categories);

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanEntityTypes();
