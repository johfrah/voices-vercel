import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function startAuthorityHarvest() {
  console.log('🚀 [MASTERCLASS] Starting Authority Harvest: Deep Brand Scan (All Time)...');

  const A_BRANDS = [
    'KBC', 'CBC', 'NZVL', 'BMW', 'VOLVO', 'IKEA', 'PROXIMUS', 'TELENET', 'DELHAIZE', 
    'COLRUYT', 'RANDSTAD', 'ADECCO', 'BPOST', 'NMBS', 'SNCB', 'ENGIE', 'LUMINUS',
    'VLAAMSE OVERHEID', 'STAD ANTWERPEN', 'STAD GENT', 'STAD BRUSSEL', 'NIKE', 'ADIDAS',
    'ARGENTA', 'BELFIUS', 'ING', 'AXA', 'ALLIANZ', 'COOLBLUE', 'BOL.COM', 'ZALANDO'
  ];

  try {
    // We scannen ALLE orders (geen limit op datum) om de echte A-merken te vinden
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
        u.customer_insights->>'company' as company_name,
        o.created_at
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE (oi.meta_data IS NOT NULL)
      ORDER BY o.created_at DESC
      LIMIT 10000
    `;

    console.log(`🔍 Scanned ${orders.length} historical orders for brands.`);

    const prioritizedCandidates = orders.map(o => {
      let score = 0;
      const company = (o.company_name || "").toUpperCase();
      const briefing = (o.meta_data?.briefing || "").toUpperCase();
      const script = (o.meta_data?.script || "").toUpperCase();
      
      if (A_BRANDS.some(brand => company.includes(brand) || briefing.includes(brand) || script.includes(brand))) {
        score = 100;
      }
      
      return { ...o, authority_score: score };
    }).sort((a, b) => b.authority_score - a.authority_score);

    const actorCounts = new Map<number, number>();
    const MAX_FRAGMENTS_PER_ACTOR = 8;
    let totalFragments = 0;
    let aBrandCount = 0;

    for (const c of prioritizedCandidates) {
      if ((actorCounts.get(c.actor_id) || 0) >= MAX_FRAGMENTS_PER_ACTOR) continue;

      const rawText = c.meta_data?.script || c.meta_data?.briefing || c.meta_data?.text;
      if (!rawText || typeof rawText !== 'string' || rawText.length < 20) continue;

      if (!rawText.toLowerCase().match(/welkom|voicemail|wacht|keuzemenu|druk|gesloten|vakantie|bellen|verbonden|telefoon/)) continue;

      const messages = splitText(rawText);
      for (let i = 0; i < messages.length; i++) {
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
            is_authority: c.authority_score > 0
          })})
          ON CONFLICT DO NOTHING
        `;
        
        if (c.authority_score > 0) aBrandCount++;
        actorCounts.set(c.actor_id, (actorCounts.get(c.actor_id) || 0) + 1);
        totalFragments++;
        if (totalFragments >= 500) break;
      }
      if (totalFragments >= 500) break;
    }

    console.log(`\n🏁 AUTHORITY HARVEST COMPLETE: ${totalFragments} fragments registered.`);
    console.log(`💎 A-Brand Fragments: ${aBrandCount}`);
    console.log(`📊 Unique Actors: ${actorCounts.size}`);

  } catch (error) {
    console.error('❌ Authority Harvest failed:', error);
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

startAuthorityHarvest();
