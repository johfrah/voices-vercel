import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function generateDetailedAuditLog() {
  console.log('🔍 [CHRIS-PROTOCOL] Generating High-Fidelity Audit Log...');

  try {
    const logs = await sql`
      SELECT 
        l.id,
        l.source_path,
        l.metadata,
        a.first_name,
        a.last_name,
        o.id as order_id
      FROM public.discovery_import_logs l
      JOIN public.actors a ON l.actor_id = a.id
      JOIN public.order_items oi ON l.order_item_id = oi.id
      JOIN public.orders o ON oi.order_id = o.id
      WHERE l.status = 'pending'
      ORDER BY l.id ASC
    `;

    let mdContent = `# 🛡️ Discovery Engine: Kwaliteitscontrole High-Fidelity Batch\n\n`;
    mdContent += `Dit document bevat de gezuiverde lijst van fragmenten met **volledige scripts** en **unieke orders**.\n\n`;
    mdContent += `| ID | Acteur | Klant | Type | Transcript (Geanonimiseerd) | Audio Bron (48khz) |\n`;
    mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const log of logs) {
      const meta = log.metadata;
      const actorName = `${log.first_name} ${log.last_name}`;
      const company = meta.original_company || "Elite Klant";
      const transcript = meta.anonymized_text?.replace(/\n/g, ' ');
      const source = log.source_path;

      mdContent += `| ${log.id} | **${actorName}** | ${company} | ${meta.subtype_label || 'Telefonie'} | "${transcript}" | \`${source}\` |\n`;
    }

    fs.writeFileSync(path.resolve(process.cwd(), '3-WETTEN/docs/DISCOVERY-ENGINE-AUDIT-LOG.md'), mdContent);
    console.log('✅ High-Fidelity Audit Log generated.');

  } catch (error) {
    console.error('❌ Failed to generate audit log:', error);
  } finally {
    await sql.end();
  }
}

generateDetailedAuditLog();
