import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function deepDiveGuestEmails() {
  console.log('🚀 [DEEP DIVE] Searching for emails in ALL guest orders...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    // We scannen ALLE orders zonder user_id
    const guests = await sql`
      SELECT id, wp_order_id, raw_meta, created_at 
      FROM orders 
      WHERE user_id IS NULL 
      AND raw_meta IS NOT NULL
    `;

    console.log(`📊 Scanning ${guests.length} guest orders for emails...`);

    let foundEmail = 0;
    let noEmail = 0;
    const examplesWithEmail = [];
    const examplesWithoutEmail = [];

    for (const g of guests) {
      const metaStr = typeof g.raw_meta === 'string' ? g.raw_meta : JSON.stringify(g.raw_meta);
      
      // We zoeken breed in de tekst naar iets dat op een email lijkt
      const emailMatch = metaStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (emailMatch) {
        foundEmail++;
        if (examplesWithEmail.length < 5) {
          examplesWithEmail.push({
            id: g.id,
            wp: g.wp_order_id,
            email: emailMatch[0],
            date: g.created_at
          });
        }
      } else {
        noEmail++;
        if (examplesWithoutEmail.length < 5) {
          examplesWithoutEmail.push({
            id: g.id,
            wp: g.wp_order_id,
            meta_snippet: metaStr.substring(0, 100)
          });
        }
      }
    }

    console.log(`\n✅ GEVONDEN: ${foundEmail} guest orders MET een emailadres ergens in de meta.`);
    console.log(`❌ NIET GEVONDEN: ${noEmail} guest orders zonder herkenbaar emailadres.`);

    if (examplesWithEmail.length > 0) {
      console.log('\n📧 VOORBEELDEN MET EMAIL:');
      console.table(examplesWithEmail);
    }

    if (examplesWithoutEmail.length > 0) {
      console.log('\n👻 VOORBEELDEN ZONDER EMAIL (De echte ghosts):');
      console.table(examplesWithoutEmail);
    }

  } catch (error: any) {
    console.error('❌ Deep dive failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

deepDiveGuestEmails();
