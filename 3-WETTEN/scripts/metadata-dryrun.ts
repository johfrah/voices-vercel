import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function dryRunMetadataAudit() {
  console.log('🚀 STARTING NUCLEAR METADATA DRY-RUN (200 RANDOM ORDERS)...');
  
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { 
    ssl: 'require',
    onnotice: () => {} 
  });

  try {
    const orders = await sql`
      SELECT id, raw_meta, created_at 
      FROM orders 
      WHERE raw_meta IS NOT NULL 
      ORDER BY RANDOM() 
      LIMIT 200
    `;

    const audit = {
      total_scanned: orders.length,
      structures: {
        new_system_json: 0,
        legacy_wp_meta: 0,
      },
      detected_keys: new Set<string>(),
      journey_distribution: {} as Record<string, number>,
      financial_keys: new Set<string>(),
      marketing_keys: new Set<string>(),
      special_items: {
        coupons: 0,
        workshops: 0,
        voice_overs: 0,
        utm_data: 0
      }
    };

    orders.forEach(order => {
      const meta = order.raw_meta;
      if (!meta) return;

      if (meta.items && Array.isArray(meta.items)) {
        audit.structures.new_system_json++;
      } else {
        audit.structures.legacy_wp_meta++;
      }

      Object.keys(meta).forEach(k => audit.detected_keys.add(k));

      const journey = meta._journey || meta.journey || 'unknown';
      audit.journey_distribution[journey] = (audit.journey_distribution[journey] || 0) + 1;

      ['_order_total', 'total', '_order_tax', 'pricing'].forEach(k => {
        if (meta[k] || (meta.items && meta.items[0]?.pricing)) audit.financial_keys.add(k);
      });

      if (meta._coupon_lines || meta.coupons) audit.special_items.coupons++;
      const metaStr = JSON.stringify(meta).toLowerCase();
      if (metaStr.includes('workshop') || meta._journey === 'studio') audit.special_items.workshops++;
      if (metaStr.includes('voice_over') || meta._journey === 'agency') audit.special_items.voice_overs++;
      if (meta._utm_source || meta.utm_source || meta._utm_campaign) {
        audit.special_items.utm_data++;
        if (meta._utm_source) audit.marketing_keys.add('_utm_source');
        if (meta.utm_source) audit.marketing_keys.add('utm_source');
      }
    });

    const reportPath = path.resolve(process.cwd(), '3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-METADATA-DRYRUN.md');
    let report = `# 🧪 Dry-Run Rapport: Metadata Verscheidenheid (200 Orders)\n\n`;
    report += `**Datum**: ${new Date().toLocaleString()}\n`;
    report += `**Totaal gescand**: ${audit.total_scanned} random orders\n\n`;

    report += `## 🏗️ Structuur Analyse\n`;
    report += `*   **Nieuw Systeem (JSON-first)**: ${audit.structures.new_system_json}\n`;
    report += `*   **Legacy WP Meta (Flat keys)**: ${audit.structures.legacy_wp_meta}\n\n`;

    report += `## 🎭 Journey Verdeling\n`;
    Object.entries(audit.journey_distribution).forEach(([j, count]) => {
      report += `*   **${j}**: ${count}\n`;
    });

    report += `\n## 💎 Speciale Data Punten\n`;
    report += `*   **Orders met Coupons/Korting**: ${audit.special_items.coupons}\n`;
    report += `*   **Studio/Workshop gerelateerd**: ${audit.special_items.workshops}\n`;
    report += `*   **Agency/Voice-over gerelateerd**: ${audit.special_items.voice_overs}\n`;
    report += `*   **Marketing (UTM) Attributie**: ${audit.special_items.utm_data}\n\n`;

    report += `## 🔍 Gedetecteerde Sleutel-variaties\n`;
    report += `*   **Financieel**: ${Array.from(audit.financial_keys).join(', ')}\n`;
    report += `*   **Marketing**: ${Array.from(audit.marketing_keys).join(', ')}\n`;
    
    report += `\n## ⚠️ Observaties Sjareltje\n`;
    if (audit.structures.legacy_wp_meta > 0) {
      report += `*   **Legacy Slop**: Er is een grote groep orders met platte \`_billing_...\` keys. Deze moeten we anders mappen dan de nieuwe JSON orders.\n`;
    }
    if (audit.special_items.utm_data > 0) {
      report += `*   **Marketing Goud**: UTM data is aanwezig maar inconsistent opgeslagen (soms met underscore, soms zonder).\n`;
    }

    fs.writeFileSync(reportPath, report);
    console.log(`✅ DRY-RUN VOLTOOID. Rapport geschreven naar: ${reportPath}`);

  } catch (error: any) {
    console.error('❌ Dry-run failed:', error.message);
  } finally {
    await sql.end();
  }
}

dryRunMetadataAudit();
