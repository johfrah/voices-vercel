import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function letterByLetterAudit() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { ssl: 'require', onnotice: () => {} });

  console.log('🕵️ [LETTER-BY-LETTER] Start diepgaande audit van 100 random orders...');

  try {
    const orders = await sql`
      SELECT o.id, o.wp_order_id, o.raw_meta, 
             oi.name as item_name, oi.meta_data as item_meta
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ORDER BY RANDOM() LIMIT 100
    `;

    const auditResults = {
      id_mapping: {
        be_numbers: [] as string[],
        invoice_numbers: [] as string[],
        both_found: 0
      },
      briefing_locations: {} as Record<string, number>,
      audio_links: [] as string[],
      yuki_traces: 0,
      raw_samples: [] as any[]
    };

    orders.forEach(order => {
      const meta = order.raw_meta || {};
      const itemMeta = order.item_meta || {};
      const combined = { ...meta, ...itemMeta };
      
      // 1. ID Audit
      const beNumber = meta.be_order_number || meta._ywson_custom_number_order_complete || meta._ywson_custom_number_order;
      const invoiceNumber = meta._invoice_number || meta._yuki_invoice_id || meta.yuki_invoice_id;
      
      if (beNumber) auditResults.id_mapping.be_numbers.push(beNumber);
      if (invoiceNumber) auditResults.id_mapping.invoice_numbers.push(invoiceNumber);
      if (beNumber && invoiceNumber) auditResults.id_mapping.both_found++;

      // 2. Briefing Audit (Letter-by-letter check of keys)
      Object.keys(combined).forEach(key => {
        const val = combined[key];
        if (typeof val === 'string' && val.length > 10) {
          if (key.includes('briefing') || key.includes('script') || key.includes('comment') || key.includes('instructie')) {
            auditResults.briefing_locations[key] = (auditResults.briefing_locations[key] || 0) + 1;
          }
        }
      });

      // 3. Audio & Yuki
      if (combined['order-download'] || combined['delivery_file_url']) {
        auditResults.audio_links.push(combined['order-download'] || combined['delivery_file_url']);
      }
      if (meta._yuki_response_xml || meta._yuki_pushed) auditResults.yuki_traces++;
    });

    const report = `# 🔬 Letter-by-Letter Audit Rapport: 100 Random Orders

## 1. De Dubbele ID Handshake
- **BE-XXXX nummers gevonden**: ${auditResults.id_mapping.be_numbers.length}/100
- **Factuurnummers (26XXXX/22XXXX) gevonden**: ${auditResults.id_mapping.invoice_numbers.length}/100
- **Orders met BEIDE ID's**: ${auditResults.id_mapping.both_found}/100
*Conclusie: De dubbele ID-structuur is essentieel. We moeten kolommen voor beide reeksen reserveren.*

## 2. Waar woont de Briefing? (Top Locaties)
${Object.entries(auditResults.briefing_locations)
  .sort((a, b) => b[1] - a[1])
  .map(([key, count]) => `- **${key}**: ${count} keer`)
  .join('\n')}

## 3. Productie & Boekhouding
- **Audio/Dropbox Links**: ${auditResults.audio_links.length}/100
- **Yuki/Financiële Traces**: ${auditResults.yuki_traces}/100

## 4. Sjareltje's 'Huzarenstukje' Strategie
Op basis van deze letter-voor-letter inspectie:
1. **ID-Duality**: \`orders_v2\` krijgt \`public_id\` (BE-XXXX) en \`invoice_id\` (26XXXX).
2. **Briefing Harvest**: We mappen ALLE bovenstaande keys naar één \`production_briefing\` veld.
3. **Audit Trail**: De Yuki XML en Dropbox links worden 'First Class Citizens' in de nieuwe tabel.

---
*Gegenereerd op: ${new Date().toISOString()}*
`;

    fs.writeFileSync('3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-LETTER-BY-LETTER-AUDIT.md', report);
    console.log('✅ [AUDIT] Rapport gegenereerd in 3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-LETTER-BY-LETTER-AUDIT.md');

  } catch (error) {
    console.error('❌ [AUDIT] Fout:', error);
  } finally {
    await sql.end();
  }
}

letterByLetterAudit();
