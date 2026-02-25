import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function exportMarch2025() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { ssl: 'require', onnotice: () => {} });

  console.log('🕵️ [FORENSIC] Start onverkorte export van Maart 2025...');

  try {
    const orders = await sql`
      SELECT o.id, o.wp_order_id, o.created_at, o.raw_meta, 
             oi.name as item_name, oi.meta_data as item_meta
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= '2025-03-01' AND o.created_at <= '2025-03-31'
      ORDER BY o.created_at ASC
    `;

    let mdContent = `# 🔬 Forensic Audit: Maart 2025 (Volledig & Onverkort)\n\n`;
    mdContent += `Dit document bevat ALLE bestellingen uit maart 2025, letter-voor-letter gereconstrueerd uit de database. Niets is vervormd, niets is afgekort.\n\n`;

    orders.forEach((order, index) => {
      const meta = order.raw_meta || {};
      const itemMeta = typeof order.item_meta === 'string' ? JSON.parse(order.item_meta) : (order.item_meta || {});
      
      mdContent += `## Order ${index + 1}: ID ${order.id} (WP ${order.wp_order_id})\n`;
      mdContent += `- **Datum:** ${order.created_at}\n`;
      mdContent += `- **Public ID:** ${meta.be_order_number || meta._ywson_custom_number_order_complete || 'N/A'}\n`;
      mdContent += `- **Invoice ID:** ${meta._invoice_number || meta._yuki_invoice_id || 'N/A'}\n`;
      mdContent += `- **Klant:** ${meta._billing_first_name || ''} ${meta._billing_last_name || ''} (${meta._billing_company || 'Particulier'})\n`;
      mdContent += `- **Financieel:** Totaal: ${meta._order_total || '0'}, Tax: ${meta._order_tax || '0'}, COG: ${meta._alg_wc_cog_order_cost || '0'}\n`;
      mdContent += `- **Item:** ${order.item_name || 'N/A'}\n`;
      
      // Briefing/Script - ONVERKORT
      const script = itemMeta.script || itemMeta.briefing || meta._billing_order_comments || 'Geen tekst gevonden';
      mdContent += `### 📜 Onverkorte Tekst/Briefing\n${script}\n\n`;
      
      // Dropbox
      if (meta['order-download']) {
        mdContent += `- **Audio Link:** ${meta['order-download']}\n`;
      }
      
      mdContent += `---\n\n`;
    });

    fs.writeFileSync('3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-MARCH-2025-FULL-AUDIT.md', mdContent);
    console.log('✅ [FORENSIC] Volledig rapport gegenereerd in 3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-MARCH-2025-FULL-AUDIT.md');

  } catch (error) {
    console.error('❌ [FORENSIC] Fout:', error);
  } finally {
    await sql.end();
  }
}

exportMarch2025();
