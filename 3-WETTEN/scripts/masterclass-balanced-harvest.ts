import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function startBalancedHarvest() {
  console.log('🚀 [MASTERCLASS] Starting Balanced Harvest: Deep Legacy Scan...');

  try {
    // We scannen ALLE orders, ook de hele oude, om variatie in acteurs te vinden
    const orders = await sql`
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
      WHERE (oi.meta_data IS NOT NULL)
      ORDER BY o.created_at DESC
      LIMIT 5000
    `;

    console.log(`🔍 Scanned ${orders.length} historical orders.`);

    const actorCounts = new Map<number, number>();
    const MAX_FRAGMENTS_PER_ACTOR = 8; // Nog strenger voor meer variatie
    let totalFragments = 0;

    for (const c of orders) {
      const currentActorCount = actorCounts.get(c.actor_id) || 0;
      if (currentActorCount >= MAX_FRAGMENTS_PER_ACTOR) continue;

      // De tekst kan diep in meta_data zitten, we proberen verschillende keys
      const meta = c.meta_data;
      const rawText = meta?.script || meta?.briefing || meta?.text || (typeof meta === 'string' ? meta : null);
      
      if (!rawText || typeof rawText !== 'string' || rawText.length < 20) continue;

      // Check of het telefonie-achtig is
      const isTelephony = rawText.toLowerCase().match(/welkom|voicemail|wacht|keuzemenu|druk|gesloten|vakantie|bellen|verbonden|telefoon/);
      if (!isTelephony) continue;

      const messages = splitText(rawText);
      
      for (let i = 0; i < messages.length; i++) {
        if ((actorCounts.get(c.actor_id) || 0) >= MAX_FRAGMENTS_PER_ACTOR) break;

        const anonMsg = anonymize(messages[i], c.company_hint);
        const subtypeId = categorize(anonMsg);
        const wavPath = `/Voices Telephony/${c.wp_order_id || c.order_id} - ${c.first_name}/Final/48khz/${(i+1).toString().padStart(2, '0')}.wav`;

        await sql`
          INSERT INTO public.discovery_import_logs (order_item_id, actor_id, source_path, status, quality, metadata)
          VALUES (${c.item_id}, ${c.actor_id}, ${wavPath}, 'pending', '48khz', ${JSON.stringify({
            anonymized_text: anonMsg,
            subtype_id: subtypeId,
            sector: c.sector || 'Algemeen',
            fragment_index: i + 1
          })})
          ON CONFLICT DO NOTHING
        `;
        
        actorCounts.set(c.actor_id, (actorCounts.get(c.actor_id) || 0) + 1);
        totalFragments++;
        if (totalFragments >= 500) break;
      }
      if (totalFragments >= 500) break;
    }

    console.log(`\n🏁 BALANCED HARVEST COMPLETE: ${totalFragments} fragments registered.`);
    console.log(`📊 Unique Actors Harvested: ${actorCounts.size}`);
    
    const sortedActors = Array.from(actorCounts.entries()).sort((a, b) => b[1] - a[1]);
    for (const [actorId, count] of sortedActors.slice(0, 15)) {
      const [actor] = await sql`SELECT first_name, last_name FROM public.actors WHERE id = ${actorId}`;
      console.log(`- ${actor?.first_name || 'Unknown'} ${actor?.last_name || ''}: ${count} fragments`);
    }

  } catch (error) {
    console.error('❌ Harvest failed:', error);
  } finally {
    await sql.end();
  }
}

function splitText(text: string): string[] {
  return text.split(/\n\s*\n|\d+\.|\d+\)/).map(m => m.trim()).filter(m => m.length > 15);
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

startBalancedHarvest();
