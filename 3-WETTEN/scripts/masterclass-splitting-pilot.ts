import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

function splitBriefingIntoMessages(text: string): string[] {
  if (!text) return [];
  
  // Splits op dubbele enters of duidelijke nummering
  let messages = text
    .split(/\n\s*\n/) 
    .map(m => m.trim())
    .filter(m => m.length > 15);

  // Als er maar 1 blok is, check of er nummering in zit (1., 2., etc)
  if (messages.length === 1) {
    const numbered = text.split(/\d+\.|\d+\)/).map(m => m.trim()).filter(m => m.length > 15);
    if (numbered.length > 1) messages = numbered;
  }

  return messages;
}

async function runSplittingPilot() {
  console.log('🛡️ [CHRIS-PROTOCOL] Deep Scan for Multi-Message Briefings...');

  try {
    const samples = await sql`
      SELECT oi.id, oi.meta_data->>'briefing' as briefing, oi.name
      FROM public.order_items oi
      WHERE (oi.meta_data->>'briefing' ILIKE '%1.%' 
         OR oi.meta_data->>'briefing' ILIKE '%welkom%'
         OR oi.meta_data->>'briefing' ILIKE '%keuzemenu%')
        AND length(oi.meta_data->>'briefing') > 100
      LIMIT 5
    `;

    console.log(`\n✅ Found ${samples.length} potential multi-message briefings.`);

    samples.forEach((s, idx) => {
      console.log(`\n--- BRIEFING ${idx + 1} (ID: ${s.id} | Product: ${s.name}) ---`);
      const individualMessages = splitBriefingIntoMessages(s.briefing);
      console.log(`✂️  Split into ${individualMessages.length} messages:`);
      
      individualMessages.forEach((msg, mIdx) => {
        console.log(`   [${mIdx + 1}]: ${msg.substring(0, 100).replace(/\n/g, ' ')}...`);
      });
    });

  } catch (error) {
    console.error('❌ Splitting pilot failed:', error);
  } finally {
    await sql.end();
  }
}

runSplittingPilot();
