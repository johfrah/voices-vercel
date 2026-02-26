import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function startTheGreatHarvest() {
  console.log('🚀 [MASTERCLASS] Starting The Great Harvest: Deep Scan (All Time)...');

  try {
    // 1. Haal de beste kandidaten op. We zoeken in meta_data->'briefing' OF meta_data->'script'
    // We filteren op orders die overduidelijk telefonie zijn
    const candidates = await sql`
      SELECT 
        oi.id as item_id,
        oi.order_id,
        oi.actor_id,
        oi.meta_data,
        o.wp_order_id,
        a.first_name,
        a.last_name,
        u.customer_insights->>'sector' as sector,
        u.customer_insights->>'company' as company_hint
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE (
        oi.meta_data->>'usage' ILIKE '%telefonie%' OR 
        oi.meta_data->>'usage' ILIKE '%telefooncentrale%' OR
        oi.name ILIKE '%telefoon%' OR
        oi.name ILIKE '%voicemail%' OR
        oi.name ILIKE '%IVR%' OR
        oi.meta_data->>'briefing' ILIKE '%welkom%' OR
        oi.meta_data->>'briefing' ILIKE '%keuzemenu%'
      )
      ORDER BY o.created_at DESC
      LIMIT 200
    `;

    console.log(`✅ Identified ${candidates.length} potential orders to harvest.`);

    let totalFragments = 0;
    for (const c of candidates) {
      // De tekst kan in 'script' of 'briefing' staan
      const rawText = c.meta_data?.script || c.meta_data?.briefing;
      if (!rawText || typeof rawText !== 'string') continue;

      const messages = splitText(rawText);
      
      for (let i = 0; i < messages.length; i++) {
        const originalMsg = messages[i];
        const anonMsg = anonymize(originalMsg, c.company_hint);
        const subtypeId = categorize(anonMsg);
        
        // Simuleer Dropbox pad voor de 48khz WAV
        const wavPath = `/Voices Telephony/${c.wp_order_id || c.order_id} - ${c.first_name}/Final/48khz/${(i+1).toString().padStart(2, '0')}.wav`;

        // Registreer in Audit Trail (met ON CONFLICT DO NOTHING op order_item_id + index indien we die uniek zouden maken, 
        // maar voor nu gewoon inserten als we fragmenten loggen)
        await sql`
          INSERT INTO public.discovery_import_logs (order_item_id, actor_id, source_path, status, quality, metadata)
          VALUES (${c.item_id}, ${c.actor_id}, ${wavPath}, 'pending', '48khz', ${JSON.stringify({
            anonymized_text: anonMsg,
            subtype_id: subtypeId,
            sector: c.sector || 'Algemeen',
            fragment_index: i + 1
          })})
        `;
        
        totalFragments++;
        if (totalFragments >= 500) break;
      }
      if (totalFragments >= 500) break;
    }

    console.log(`\n🏁 HARVEST COMPLETE: ${totalFragments} fragments registered in Audit Trail.`);
    console.log(`- Status: 'pending' (Ready for 48khz -> MP3 conversion)`);

  } catch (error) {
    console.error('❌ Harvest failed:', error);
  } finally {
    await sql.end();
  }
}

function splitText(text: string): string[] {
  // Splits op dubbele enters of nummering
  return text.split(/\n\s*\n|\d+\.|\d+\)/).map(m => m.trim()).filter(m => m.length > 15);
}

function anonymize(text: string, hint?: string): string {
  let clean = text;
  if (hint && hint.length > 2) {
    clean = clean.replace(new RegExp(hint, 'gi'), '{{company_name}}');
  }
  // Algemene patronen
  clean = clean.replace(/Welkom bij (.*?)\./gi, 'Welkom bij {{company_name}}.')
               .replace(/Bedankt voor het bellen naar (.*?)\./gi, 'Bedankt voor het bellen naar {{company_name}}.')
               .replace(/U bent verbonden met (.*?)\./gi, 'U bent verbonden met {{company_name}}.');
  return clean;
}

function categorize(text: string): number {
  const t = text.toLowerCase();
  if (t.includes('welkom')) return 1;
  if (t.includes('keuzemenu') || t.includes('druk 1') || t.includes('optie')) return 2;
  if (t.includes('wacht') || t.includes('ogenblik') || t.includes('geduld')) return 3;
  if (t.includes('gesloten') || t.includes('vakantie') || t.includes('afwezig')) return 6;
  if (t.includes('lunch') || t.includes('pauze')) return 9;
  if (t.includes('bezet') || t.includes('lijn')) return 12;
  if (t.includes('buiten kantooruren') || t.includes('avond')) return 8;
  return 5; // Default: Voicemail Algemeen
}

startTheGreatHarvest();
