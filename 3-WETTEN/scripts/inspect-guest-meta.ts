import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function inspectGuestMeta() {
  console.log('🚀 [GUEST INSPECTION] Inspecting raw_meta for guest orders...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    const samples = await sql`
      SELECT id, wp_order_id, raw_meta 
      FROM orders 
      WHERE user_id IS NULL 
      AND raw_meta IS NOT NULL 
      LIMIT 5
    `;

    console.log('\n📦 RAW META SAMPLES:');
    samples.forEach(s => {
      console.log(`\nOrder ID: ${s.id} (WP #${s.wp_order_id})`);
      console.log('Meta:', typeof s.raw_meta === 'string' ? s.raw_meta.substring(0, 200) : JSON.stringify(s.raw_meta).substring(0, 200));
    });

  } catch (error: any) {
    console.error('❌ Inspection failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

inspectGuestMeta();
