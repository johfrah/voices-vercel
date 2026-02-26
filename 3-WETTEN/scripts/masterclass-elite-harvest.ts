import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function startActiveEliteHarvest() {
  console.log('🚀 [MASTERCLASS] Starting Active Elite Harvest: Focusing on proven performers...');

  try {
    // 1. Identificeer de 'Actieve Elite': Acteurs met minstens 5 afgeronde order_items
    const activeActors = await sql`
      SELECT oi.actor_id, a.first_name, a.last_name, COUNT(oi.id) as order_count
      FROM public.order_items oi
      JOIN public.actors a ON oi.actor_id = a.id
      WHERE a.status = 'live'
      GROUP BY oi.actor_id, a.first_name, a.last_name
      HAVING COUNT(oi.id) >= 5
      ORDER BY order_count DESC
    `;

    console.log(`🔍 Identified ${activeActors.length} active elite actors with proven history.`);

    const eliteIds = activeActors.map(a => a.actor_id);
    
    // 2. Oogst fragmenten specifiek van deze elite groep
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
        u.customer_insights->>'company' as company_name
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE oi.actor_id = ANY(${eliteIds})
        AND (oi.meta_data IS NOT NULL)
      ORDER BY o.created_at DESC
      LIMIT 5000
    `;

    const actorCounts = new Map<number, number>();
    const MAX_FRAGMENTS_PER_ACTOR = 10;
    let totalFragments = 0;

    await sql`DELETE FROM public.discovery_import_logs WHERE status = 'pending'`;

    for (const c of orders) {
      if (totalFragments >= 500) break;
      if ((actorCounts.get(c.actor_id) || 0) >= MAX_FRAGMENTS_PER_ACTOR) continue;

      const meta = c.meta_data;
      const rawText = meta?.script || meta?.briefing || meta?.text || (typeof meta === 'string' ? meta : null);
      
      if (!rawText || typeof rawText !== 'string' || rawText.length < 20) continue;

      if (!rawText.toLowerCase().match(/welkom|voicemail|wacht|keuzemenu|druk|gesloten|vakantie|bellen|telefoon/)) continue;

      const messages = splitText(rawText);
      for (let i = 0; i < messages.length; i++) {
        if (totalFragments >= 500) break;
        if ((actorCounts.get(c.actor_id) || 0) >= MAX_FRAGMENTS_PER_ACTOR) break;

        const anonMsg = anonymize(messages[i], c.company_name);
        const subtypeId = categorize(anonMsg);
        const wavPath = `/Voices Telephony/${c.wp_order_id || c.order_id} - ${c.first_name}/Final/48khz/${(i+1).toString().padStart(2, '0')}.wav`;

        await sql`
          INSERT INTO public.discovery_import_logs (order_item_id, actor_id, source_path, status, quality, metadata)
          VALUES (${c.item_id}, ${c.actor_id}, ${wavPath}, 'pending', '48khz', ${JSON.stringify({
            anonymized_text: anonMsg,
            subtype_id: subtypeId,
            sector: c.sector || 'Algemeen',
            original_company: c.company_name,
            is_elite: true
          })})
        `;
        
        actorCounts.set(c.actor_id, (actorCounts.get(c.actor_id) || 0) + 1);
        totalFragments++;
      }
    }

    console.log(`\n🏁 ELITE HARVEST COMPLETE: ${totalFragments} fragments registered.`);
    console.log(`📊 Elite Actors Represented: ${actorCounts.size}`);
    
    const sortedElite = activeActors.slice(0, 15);
    console.log('\n--- TOP ELITE PERFORMERS IN HARVEST ---');
    sortedElite.forEach(a => {
      const harvested = actorCounts.get(a.actor_id) || 0;
      console.log(`${a.first_name} ${a.last_name}: ${a.order_count} total orders | ${harvested} fragments harvested`);
    });

  } catch (error) {
    console.error('❌ Elite Harvest failed:', error);
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

startActiveEliteHarvest();
