import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function dryRunAllOrders() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { ssl: 'require', onnotice: () => {} });

  console.log('🚀 [DRY-RUN] Start analyse van 4000+ orders...');

  try {
    // 1. Haal alle orders en hun items op
    const allOrders = await sql`
      SELECT 
        o.id as order_id, 
        o.wp_order_id,
        o.raw_meta as order_meta,
        oi.product_id,
        oi.actor_id,
        oi.name as item_name,
        oi.meta_data as item_meta
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ORDER BY o.created_at DESC
    `;

    console.log(`📦 Totaal aantal records gevonden: ${allOrders.length}`);

    const stats = {
      total_orders: new Set(allOrders.map(o => o.order_id)).size,
      linkage: {
        has_actor_id: 0,
        has_product_id: 0,
        has_neither: 0
      },
      metadata_patterns: {
        has_briefing: 0,
        has_usage: 0,
        has_audio_link: 0,
        has_yuki_info: 0,
        has_surcharges: 0
      },
      journeys: {} as Record<string, number>,
      slop_detectie: {
        empty_meta: 0,
        unparsed_json: 0
      }
    };

    for (const row of allOrders) {
      // Linkage check
      if (row.actor_id) stats.linkage.has_actor_id++;
      else if (row.product_id) stats.linkage.has_product_id++;
      else stats.linkage.has_neither++;

      // Metadata analyse (Order level)
      const oMeta = row.order_meta;
      if (!oMeta || Object.keys(oMeta).length === 0) {
        stats.slop_detectie.empty_meta++;
      } else {
        if (oMeta._ywpi_invoice_number || oMeta.yuki_invoice_id) stats.metadata_patterns.has_yuki_info++;
        if (oMeta._journey) {
          stats.journeys[oMeta._journey] = (stats.journeys[oMeta._journey] || 0) + 1;
        }
      }

      // Metadata analyse (Item level)
      const iMeta = row.item_meta;
      if (iMeta) {
        if (iMeta.briefing || iMeta.script) stats.metadata_patterns.has_briefing++;
        if (iMeta.usage || iMeta.usage_id) stats.metadata_patterns.has_usage++;
        if (iMeta.audio_link || iMeta.delivery_file_url) stats.metadata_patterns.has_audio_link++;
        if (iMeta.wordSurcharge || iMeta.musicSurcharge) stats.metadata_patterns.has_surcharges++;
      }
    }

    const report = `# 📊 Nuclear Dry-Run Rapport: 4000+ Orders Analysis

## 1. Algemene Statistieken
- **Totaal aantal Orders geanalyseerd**: ${stats.total_orders}
- **Totaal aantal Order Items**: ${allOrders.length}

## 2. Linkage Integriteit (De Handshake)
- **Items met Actor ID**: ${stats.linkage.has_actor_id} (Direct koppelbaar aan actors tabel)
- **Items met Product ID**: ${stats.linkage.has_product_id} (Direct koppelbaar aan products/workshops)
- **Items zonder ID**: ${stats.linkage.has_neither} (Deze vereisen tekst-matching of blijven 'legacy-only')

## 3. Gouden Data Patronen (Metadata)
- **Orders met Yuki/Factuur info**: ${stats.metadata_patterns.has_yuki_info}
- **Items met Briefing/Script**: ${stats.metadata_patterns.has_briefing}
- **Items met Usage/Rechten**: ${stats.metadata_patterns.has_usage}
- **Items met Audio/Download links**: ${stats.metadata_patterns.has_audio_link}
- **Items met Kassa Surcharges**: ${stats.metadata_patterns.has_surcharges}

## 4. Journey Verdeling
${Object.entries(stats.journeys).map(([j, count]) => `- **${j}**: ${count}`).join('\n')}

## 5. Sjareltje's Atomaire Strategie
Op basis van deze 4000+ orders stel ik voor:
1. **Auto-Link**: Alle items met een \`actor_id\` of \`product_id\` worden direct 'Nuclear' gemapt.
2. **Briefing Extraction**: De ${stats.metadata_patterns.has_briefing} briefings worden verplaatst naar de \`script_text\` kolom voor de Studio.
3. **Usage Normalisatie**: We mappen de tekstuele 'usage' velden naar onze nieuwe \`usage_id\` tabel via een lookup-tabel.
4. **Legacy Shadow**: De ${stats.linkage.has_neither} items zonder ID blijven in hun huidige vorm bestaan in een \`legacy_item_meta\` kolom om geen data te verliezen.

---
*Gegenereerd op: ${new Date().toISOString()}*
`;

    fs.writeFileSync('3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-NUCLEAR-DRYRUN-4000.md', report);
    console.log('✅ [DRY-RUN] Rapport gegenereerd in 3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-NUCLEAR-DRYRUN-4000.md');

  } catch (error) {
    console.error('❌ [DRY-RUN] Fout tijdens analyse:', error);
  } finally {
    await sql.end();
  }
}

dryRunAllOrders();
