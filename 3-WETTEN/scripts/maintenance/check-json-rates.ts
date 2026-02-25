import * as dotenv from 'dotenv';
import path from 'path';

// 📧 Load environment variables
const envPath = path.join(process.cwd(), '1-ZOLDER/apps/web/.env.local');
dotenv.config({ path: envPath });

async function checkJsonRates() {
  console.log('🔍 CHECKING JSON RATES IN SUPABASE...');

  try {
    const dbPath = path.join(process.cwd(), '1-ZOLDER/packages/database/src/index');
    const { db } = await import(dbPath);
    const { actors } = await import(path.join(process.cwd(), '1-ZOLDER/packages/database/src/schema/index'));

    const [actor] = await db.select().from(actors).limit(1);
    
    console.log('--- JSON RATES SAMPLE ---');
    console.log(JSON.stringify(actor.rates, null, 2));

  } catch (error) {
    console.error('❌ CHECK FAILED:', error);
  }
  process.exit(0);
}

checkJsonRates();
