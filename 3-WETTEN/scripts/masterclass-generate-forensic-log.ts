import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function generateForensicAuditLog() {
  console.log('🔍 [CHRIS-PROTOCOL] Generating Forensic Audit Log: No Slop, Pure Data...');

  try {
    // 1. Haal de meest recente orders op met VOLLEDIGE data
    const logs = await sql`
      SELECT 
        oi.id as item_id,
        o.id as order_id,
        o.wp_order_id,
        a.first_name || ' ' || a.last_name as actor_name,
        u.customer_insights->>'company' as company_name,
        o.billing_vat_number,
        oi.meta_data->>'script' as script,
        oi.meta_data->>'briefing' as briefing,
        oi.name as product_name,
        o.created_at
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE (oi.meta_data->>'script' IS NOT NULL OR oi.meta_data->>'briefing' IS NOT NULL)
        AND (oi.meta_data->>'usage' ILIKE '%telefonie%' OR oi.name ILIKE '%telefoon%' OR oi.name ILIKE '%voicemail%')
      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    let mdContent = `# 🛡️ Discovery Engine: Forensische Audit Log (Masterclass)\n\n`;
    mdContent += `Dit document bevat de **ruwe brongegevens** van de orders die ik wil omzetten naar demo's. Geen filters, geen anonimisering (nog niet), puur de waarheid.\n\n`;
    mdContent += `| Order ID | Acteur | Bedrijf / BTW | Product | Script / Briefing (RUW) | Dropbox Pad (Verwacht) |\n`;
    mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const log of logs) {
      const company = log.company_name || log.billing_vat_number || "Onbekend";
      const text = (log.script || log.briefing || "GEEN TEKST GEVONDEN").replace(/\n/g, ' ').substring(0, 200);
      const dropboxPath = `/Voices Telephony/${log.wp_order_id || log.order_id} - ${log.actor_name.trim()}/Final/48khz/01.wav`;

      mdContent += `| ${log.order_id} | **${log.actor_name}** | ${company} | ${log.product_name} | "${text}..." | \`${dropboxPath}\` |\n`;
    }

    fs.writeFileSync(path.join(process.cwd(), '3-WETTEN/docs/DISCOVERY-ENGINE-AUDIT-LOG.md'), mdContent);
    console.log('✅ Forensic Audit Log generated at 3-WETTEN/docs/DISCOVERY-ENGINE-AUDIT-LOG.md');

  } catch (error) {
    console.error('❌ Failed to generate audit log:', error);
  } finally {
    await sql.end();
  }
}

generateForensicAuditLog();
