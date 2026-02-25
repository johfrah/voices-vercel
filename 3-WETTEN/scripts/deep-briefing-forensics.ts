import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function deepForensicBriefingAnalysis() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { ssl: 'require', onnotice: () => {} });

  console.log('🕵️ [DEEP FORENSIC] Scannen van RAW_META voor briefings en instructies...');

  try {
    const allOrders = await sql`
      SELECT id, wp_order_id, raw_meta 
      FROM orders 
      WHERE raw_meta IS NOT NULL
    `;

    const briefingStats = {
      total_orders: allOrders.length,
      keys_found: {} as Record<string, number>,
      orders_with_briefing: 0,
      examples: [] as any[]
    };

    // Lijst van mogelijke keys waar briefings in kunnen zitten
    const possibleKeys = [
      'briefing', 'script', 'instructies', 'instructions', 'opmerkingen', 
      'order-script', 'order-instructie', 'order-opmerking', 'order-beschrijving',
      'ywraq_customer_message', 'customer_message', 'billing_comments',
      'order_comments', 'customer_note', 'notitie'
    ];

    allOrders.forEach(order => {
      const meta = order.raw_meta;
      if (typeof meta !== 'object' || meta === null) return;

      let foundInOrder = false;
      
      // Check alle keys in de meta
      Object.keys(meta).forEach(key => {
        const lowerKey = key.toLowerCase();
        const value = meta[key];

        // Als de key lijkt op een briefing key EN de waarde is een substantiële tekst
        if (possibleKeys.some(pk => lowerKey.includes(pk)) && value && String(value).length > 5) {
          briefingStats.keys_found[key] = (briefingStats.keys_found[key] || 0) + 1;
          foundInOrder = true;
        }
      });

      if (foundInOrder) {
        briefingStats.orders_with_briefing++;
        if (briefingStats.examples.length < 5) {
          briefingStats.examples.push({
            id: order.id,
            wp_id: order.wp_order_id,
            meta_sample: meta
          });
        }
      }
    });

    const report = `# 🔬 Deep Forensic Briefing Rapport

## 1. Briefing Detectie (Raw Meta)
- **Totaal aantal Orders gescand**: ${briefingStats.total_orders}
- **Orders met gedetecteerde Briefing/Instructie**: ${briefingStats.orders_with_briefing}
- **Percentage**: ${((briefingStats.orders_with_briefing / briefingStats.total_orders) * 100).toFixed(2)}%

## 2. Gevonden Keys in de Goudmijn
Hier zijn de keys waar de briefings zich in verstoppen:
${Object.entries(briefingStats.keys_found)
  .sort((a, b) => b[1] - a[1])
  .map(([key, count]) => `- **${key}**: ${count} keer`)
  .join('\n')}

## 3. Sjareltje's Atomaire Strategie V2
Nu we weten waar het goud zit, gaan we in de migratie:
1. **Multi-Key Extraction**: We scannen niet op 1 veld, maar op de hele lijst hierboven.
2. **Concatenation**: Als er zowel een 'order-script' als een 'order-instructie' is, voegen we ze samen in de nieuwe \`script_text\` kolom.
3. **Cleanse**: We halen de HTML-tags en PHP-slop eruit zodat de acteur een schone tekst ziet.

---
*Gegenereerd op: ${new Date().toISOString()}*
`;

    fs.writeFileSync('3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-DEEP-BRIEFING-FORENSICS.md', report);
    console.log('✅ [FORENSIC] Rapport gegenereerd in 3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-DEEP-BRIEFING-FORENSICS.md');

  } catch (error) {
    console.error('❌ [FORENSIC] Fout tijdens analyse:', error);
  } finally {
    await sql.end();
  }
}

deepForensicBriefingAnalysis();
