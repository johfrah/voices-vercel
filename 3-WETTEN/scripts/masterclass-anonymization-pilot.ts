import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

/**
 * CHRIS-PROTOCOL: Smart Anonymizer
 * Herkent bedrijfsnamen en patronen in briefings en vervangt ze door {{company_name}}.
 */
function anonymizeText(text: string, companyHint?: string): string {
  if (!text) return "";
  
  let clean = text;

  // 1. Verwijder specifieke hint indien meegegeven (bijv. NZVL)
  if (companyHint) {
    const regex = new RegExp(companyHint, 'gi');
    clean = clean.replace(regex, '{{company_name}}');
  }

  // 2. Veelvoorkomende patronen in briefings
  const patterns = [
    /Welkom bij (.*?)\./gi,
    /Bedankt voor het bellen naar (.*?)\./gi,
    /U bent verbonden met (.*?)\./gi,
    /Surf naar www\.(.*?)\.be/gi,
    /via mijn\.(.*?)\.be/gi
  ];

  patterns.forEach(p => {
    clean = clean.replace(p, (match, group) => match.replace(group, '{{company_name}}'));
  });

  return clean;
}

async function runAnonymizationPilot() {
  console.log('🛡️ [CHRIS-PROTOCOL] Running Anonymization Pilot for Discovery Engine...');

  try {
    // Haal de recente NZVL orders op als testcase
    const samples = await sql`
      SELECT oi.id, oi.meta_data->>'briefing' as briefing, u.customer_insights->>'company' as company_name
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.users u ON o.user_id = u.id
      WHERE oi.meta_data->>'briefing' ILIKE '%NZVL%'
      LIMIT 3
    `;

    console.log('\n--- ANONYMIZATION RESULTS ---');
    samples.forEach(s => {
      console.log(`Original ID: ${s.id}`);
      const anon = anonymizeText(s.briefing, s.company_name);
      console.log(`Anon Result: ${anon.substring(0, 150)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Pilot failed:', error);
  } finally {
    await sql.end();
  }
}

runAnonymizationPilot();
