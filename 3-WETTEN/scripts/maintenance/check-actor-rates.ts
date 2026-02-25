import * as dotenv from 'dotenv';
import path from 'path';

// 📧 Load environment variables
const envPath = path.join(process.cwd(), '1-ZOLDER/apps/web/.env.local');
dotenv.config({ path: envPath });

async function checkActorRates() {
  console.log('🔍 CHECKING ACTOR RATES IN SUPABASE...');

  try {
    const dbPath = path.join(process.cwd(), '1-ZOLDER/packages/database/src/index');
    const { db } = await import(dbPath);
    const { actors } = await import(path.join(process.cwd(), '1-ZOLDER/packages/database/src/schema/index'));

    const results = await db.select().from(actors);
    
    console.log('--- ACTOR RATES SUMMARY ---');
    results.forEach(a => {
      console.log(`Actor: ${a.firstName} | Unpaid: ${a.priceUnpaid} | IVR: ${a.priceIvr}`);
    });

  } catch (error) {
    console.error('❌ CHECK FAILED:', error);
  }
  process.exit(0);
}

checkActorRates();
