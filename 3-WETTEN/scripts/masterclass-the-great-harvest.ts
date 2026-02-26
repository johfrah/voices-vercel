import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function startGoldHarvestV6() {
  console.log('🚀 [MASTERCLASS] Starting Data Gold Harvest V6: Broad Text Search...');

  try {
    await sql`DELETE FROM public.discovery_import_logs WHERE status = 'pending'`;
    
    // We zoeken in ALLE orders naar tekst die lang genoeg is om een script te zijn
    const orders = await sql`
      SELECT 
        oi.id as item_id,
        oi.order_id,
        oi.actor_id,
        oi.meta_data,
        a.first_name,
        a.last_name,
        u.customer_insights->>'company' as company_name,
        o.wp_order_id,
        o.created_at
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE (
        (oi.meta_data->>'script' IS NOT NULL AND length(oi.meta_data->>'script') > 20) OR
        (oi.meta_data->>'briefing' IS NOT NULL AND length(oi.meta_data->>'briefing') > 20)
      )
      ORDER BY o.created_at DESC
      LIMIT 1000
    `;

    console.log(`🔍 Found ${orders.length} orders with potential data gold.`);

    let totalFragments = 0;
    const actorCounts = new Map<number, number>();

    for (const o of orders) {
      if (totalFragments >= 100) break;
      if ((actorCounts.get(o.actor_id) || 0) >= 5) continue;

      // Extract de rijkste tekstbron
      const rawText = o.meta_data.script || o.meta_data.briefing;
      if (!rawText || rawText.toLowerCase().includes('undefined')) continue;

      // Check of het telefonie is
      if (!rawText.toLowerCase().match(/welkom|voicemail|wacht|keuzemenu|druk|gesloten|vakantie|bellen/)) continue;

      const messages = splitText(rawText);
      if (messages.length === 0) continue;

      const bestMessage = messages[0];
      const anonMsg = anonymize(bestMessage, o.company_name);
      const subtypeId = categorize(anonMsg);
      
      const wavPath = `/Voices Telephony/${o.wp_order_id || o.order_id} - ${o.first_name}/Final/48khz/01.wav`;

      await sql`
        INSERT INTO public.discovery_import_logs (order_item_id, actor_id, source_path, status, quality, metadata)
        VALUES (${o.item_id}, ${o.actor_id}, ${wavPath}, 'pending', '48khz', ${JSON.stringify({
          anonymized_text: anonMsg,
          subtype_id: subtypeId,
          original_company: o.company_name || 'Elite Klant',
          original_text: bestMessage,
          fragment_index: 1
        })})
      `;
      
      actorCounts.set(o.actor_id, (actorCounts.get(o.actor_id) || 0) + 1);
      totalFragments++;
    }

    console.log(`\n🏁 GOLD HARVEST V6 COMPLETE: ${totalFragments} rich fragments registered.`);

  } catch (error) {
    console.error('❌ Harvest failed:', error);
  } finally {
    await sql.end();
  }
}

function splitText(text: string): string[] {
  return text.split(/\n\s*\n|\d+\.|\d+\)/).map(m => m.trim()).filter(m => m.length > 20);
}

function anonymize(text: string, hint?: string): string {
  let clean = text;
  if (hint && hint.length > 2) {
    try { clean = clean.replace(new RegExp(hint, 'gi'), '{{company_name}}'); } catch(e) {}
  }
  return clean.replace(/Welkom bij (.*?)\./gi, 'Welkom bij {{company_name}}.')
              .replace(/Bedankt voor het bellen naar (.*?)\./gi, 'Bedankt voor het bellen naar {{company_name}}.');
}

function categorize(text: string): number {
  const t = text.toLowerCase();
  if (t.includes('welkom')) return 1;
  if (t.includes('keuzemenu') || t.includes('druk 1')) return 2;
  if (t.includes('wacht') || t.includes('ogenblik')) return 3;
  if (t.includes('gesloten') || t.includes('vakantie')) return 6;
  return 5;
}

startGoldHarvestV6();
