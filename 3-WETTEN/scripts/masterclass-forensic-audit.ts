import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function forensicDataAudit() {
  console.log('🔍 [CHRIS-PROTOCOL] Forensic Audit: Investigating "Onbekend" and "null" values...');

  try {
    // 1. Onderzoek de 'Onbekend' klanten
    const unknownCustomers = await sql`
      SELECT 
        l.id, 
        l.order_item_id, 
        o.id as order_id,
        o.user_id,
        u.customer_insights,
        oi.meta_data->>'briefing' as briefing
      FROM public.discovery_import_logs l
      JOIN public.order_items oi ON l.order_item_id = oi.id
      JOIN public.orders o ON oi.order_id = o.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE l.metadata->>'original_company' IS NULL OR l.metadata->>'original_company' = ''
      LIMIT 5
    `;

    console.log('\n--- UNKNOWN CUSTOMER INVESTIGATION ---');
    unknownCustomers.forEach(c => {
      console.log(`Log ID: ${c.id} | Order: ${c.order_id}`);
      console.log(`User ID: ${c.user_id}`);
      console.log(`Customer Insights: ${JSON.stringify(c.customer_insights)}`);
      console.log(`Briefing Snippet: ${c.briefing?.substring(0, 100)}`);
      console.log('---');
    });

    // 2. Onderzoek de 'null' types
    const nullSubtypes = await sql`
      SELECT l.id, l.metadata->>'anonymized_text' as text
      FROM public.discovery_import_logs l
      WHERE l.metadata->>'subtype_id' IS NULL
      LIMIT 5
    `;

    console.log('\n--- NULL SUBTYPE INVESTIGATION ---');
    nullSubtypes.forEach(s => {
      console.log(`Log ID: ${s.id}`);
      console.log(`Text: ${s.text?.substring(0, 100)}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    await sql.end();
  }
}

forensicDataAudit();
