import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function forensicAtomicTruthScan() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { ssl: 'require', onnotice: () => {} });

  console.log('🕵️ [FORENSIC ATOMIC TRUTH] Start scan van 4000+ orders...');

  try {
    const allData = await sql`
      SELECT 
        o.id, 
        o.wp_order_id,
        o.raw_meta,
        oi.meta_data as item_meta,
        oi.name as item_name,
        oi.actor_id,
        oi.product_id
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.raw_meta IS NOT NULL
    `;

    const truthMap = {
      ids: new Set<string>(),
      briefing_keys: new Set<string>(),
      financial_keys: new Set<string>(),
      workflow_keys: new Set<string>(),
      asset_keys: new Set<string>(),
      yuki_keys: new Set<string>(),
      utm_keys: new Set<string>()
    };

    allData.forEach(row => {
      const meta = row.raw_meta || {};
      const itemMeta = row.item_meta || {};
      const combined = { ...meta, ...itemMeta };

      Object.keys(combined).forEach(key => {
        const lowerKey = key.toLowerCase();
        const val = combined[key];

        // Categorize keys based on content and naming patterns
        if (lowerKey.includes('briefing') || lowerKey.includes('script') || lowerKey.includes('instructie') || lowerKey.includes('opmerking') || lowerKey.includes('message')) {
          truthMap.briefing_keys.add(key);
        } else if (lowerKey.includes('total') || lowerKey.includes('tax') || lowerKey.includes('cost') || lowerKey.includes('profit') || lowerKey.includes('price') || lowerKey.includes('cog')) {
          truthMap.financial_keys.add(key);
        } else if (lowerKey.includes('status') || lowerKey.includes('completed') || lowerKey.includes('paid') || lowerKey.includes('notified') || lowerKey.includes('sent')) {
          truthMap.workflow_keys.add(key);
        } else if (lowerKey.includes('download') || lowerKey.includes('url') || lowerKey.includes('dropbox') || lowerKey.includes('file') || lowerKey.includes('attachment')) {
          truthMap.asset_keys.add(key);
        } else if (lowerKey.includes('yuki') || lowerKey.includes('invoice')) {
          truthMap.yuki_keys.add(key);
        } else if (lowerKey.includes('utm') || lowerKey.includes('source') || lowerKey.includes('medium') || lowerKey.includes('campaign') || lowerKey.includes('gclid')) {
          truthMap.utm_keys.add(key);
        } else if (lowerKey.includes('number') || lowerKey.includes('id') || lowerKey.includes('key')) {
          truthMap.ids.add(key);
        }
      });
    });

    const report = `# 🔬 Forensic Atomic Truth: De Definitieve Metadata Mapping (V2)

Dit document bevat de atomaire blauwdruk van alle metadata die we uit de 4223 legacy orders gaan extraheren en verankeren in **Orders V2**. Geen slop, alleen de zuivere waarheid.

## 1. De Identiteits-Handshake (The Anchor IDs)
Deze ID's worden de primaire sleutels in de nieuwe architectuur.
${Array.from(truthMap.ids).filter(k => ['be_order_number', '_ywson_custom_number_order_complete', '_invoice_number', '_order_key', 'wp_order_id'].includes(k)).map(k => `- **${k}** → \`public_id\` & \`legacy_wp_id\``).join('\n')}

## 2. De Regie-Kamer (Briefings & Instructies)
Al deze velden worden samengevoegd tot één atomaire \`production_briefing\` kolom.
${Array.from(truthMap.briefing_keys).sort().map(k => `- **${k}**`).join('\n')}

## 3. De Kassa (Financiële Waarheid)
Deze velden voeden de nieuwe \`total_net\`, \`total_tax\` en \`total_profit\` kolommen.
${Array.from(truthMap.financial_keys).sort().map(k => `- **${k}**`).join('\n')}

## 4. De Productie-Lijn (Workflow & Assets)
De weg naar de audio en de status van de stem.
${Array.from(truthMap.asset_keys).sort().map(k => `- **${k}**`).join('\n')}
${Array.from(truthMap.workflow_keys).sort().map(k => `- **${k}**`).join('\n')}

## 5. De Boekhouding (Yuki & Facturatie)
Directe koppelingen naar de financiële administratie.
${Array.from(truthMap.yuki_keys).sort().map(k => `- **${k}**`).join('\n')}

## 6. De Footprints (Marketing & Intelligence)
Visitor intelligence voor Mat en Laya.
${Array.from(truthMap.utm_keys).sort().map(k => `- **${k}**`).join('\n')}

---
### Sjareltje's Belofte
Elk van deze gevonden keys wordt in het migratie-script gemapt naar een gestructureerde kolom in V2. Wat niet in een specifieke kolom past, verhuist mee naar de \`legacy_gold_dump\` JSONB kolom. **Niets gaat verloren.**

*Gegenereerd op: ${new Date().toISOString()}*
`;

    fs.writeFileSync('3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-FORENSIC-ATOMIC-TRUTH.md', report);
    console.log('✅ [FORENSIC] Rapport gegenereerd in 3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-FORENSIC-ATOMIC-TRUTH.md');

  } catch (error) {
    console.error('❌ [FORENSIC] Fout:', error);
  } finally {
    await sql.end();
  }
}

forensicAtomicTruthScan();
