import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

/**
 * CHRIS-PROTOCOL: Actor Demo Boost
 * Garandeert dat ELKE actieve acteur minstens 3 nieuwe telefonie-demo's krijgt.
 */
async function startActorDemoBoost() {
  console.log('🚀 [MASTERCLASS] Starting Actor Demo Boost: Aiming for 3 new demos per actor...');

  try {
    // 1. Haal alle actieve acteurs op
    const actors = await sql`SELECT id, first_name, last_name FROM public.actors WHERE status = 'live'`;
    console.log(`🔍 Target: ${actors.length} live actors.`);

    const actorCounts = new Map<number, number>();
    const MIN_TARGET_PER_ACTOR = 3;
    const MAX_LIMIT_PER_ACTOR = 10;
    let totalFragments = 0;

    // 2. Scan de historie op zoek naar matches voor deze specifieke acteurs
    for (const actor of actors) {
      const orders = await sql`
        SELECT 
          oi.id as item_id,
          oi.order_id,
          oi.meta_data,
          o.wp_order_id,
          u.customer_insights->>'sector' as sector,
          u.customer_insights->>'company' as company_hint
        FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        LEFT JOIN public.users u ON o.user_id = u.id
        WHERE oi.actor_id = ${actor.id}
          AND (oi.meta_data IS NOT NULL)
        ORDER BY o.created_at DESC
        LIMIT 50
      `;

      let actorFragments = 0;
      for (const o of orders) {
        const rawText = o.meta_data?.script || o.meta_data?.briefing || o.meta_data?.text;
        if (!rawText || typeof rawText !== 'string' || rawText.length < 20) continue;

        // Check of het telefonie is
        if (!rawText.toLowerCase().match(/welkom|voicemail|wacht|keuzemenu|druk|gesloten|vakantie|bellen|telefoon/)) continue;

        const messages = splitText(rawText);
        for (let i = 0; i < messages.length; i++) {
          if (actorFragments >= MAX_LIMIT_PER_ACTOR) break;

          const anonMsg = anonymize(messages[i], o.company_hint);
          const subtypeId = categorize(anonMsg);
          const wavPath = `/Voices Telephony/${o.wp_order_id || o.order_id} - ${actor.first_name}/Final/48khz/${(i+1).toString().padStart(2, '0')}.wav`;

          await sql`
            INSERT INTO public.discovery_import_logs (order_item_id, actor_id, source_path, status, quality, metadata)
            VALUES (${o.item_id}, ${actor.id}, ${wavPath}, 'pending', '48khz', ${JSON.stringify({
              anonymized_text: anonMsg,
              subtype_id: subtypeId,
              sector: o.sector || 'Algemeen',
              fragment_index: i + 1,
              is_boost: true
            })})
            ON CONFLICT DO NOTHING
          `;
          
          actorFragments++;
          totalFragments++;
        }
        if (actorFragments >= MIN_TARGET_PER_ACTOR) break; // We hebben het minimum doel voor deze acteur bereikt
      }

      if (actorFragments > 0) {
        console.log(`✅ Boosted ${actor.first_name} ${actor.last_name} with ${actorFragments} fragments.`);
      }
    }

    console.log(`\n🏁 BOOST COMPLETE: ${totalFragments} fragments registered for conversion.`);
    console.log(`🚀 Ready to populate actor profiles and the Discovery Engine.`);

  } catch (error) {
    console.error('❌ Boost failed:', error);
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

startActorDemoBoost();
