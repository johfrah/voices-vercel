import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function checkLiveDemos() {
  console.log('🔍 [CHRIS-PROTOCOL] Checking Live Discovery Engine Status...');

  try {
    // 1. Hoeveel demo's staan er in totaal in de tabel?
    const [totalCount] = await sql`SELECT COUNT(*) FROM public.actor_demos`;
    
    // 2. Hoeveel daarvan zijn 'telephony' en hebben een transcript?
    const [enrichedCount] = await sql`
      SELECT COUNT(*) 
      FROM public.actor_demos ad
      JOIN public.media_intelligence mi ON ad.id = mi.demo_id
      WHERE ad.type = 'telephony'
    `;

    // 3. Haal de laatste 5 live demo's op om te zien wat er echt in staat
    const latestDemos = await sql`
      SELECT 
        ad.id, 
        ad.name, 
        a.first_name, 
        mi.transcript, 
        ad.url,
        st.name as subtype
      FROM public.actor_demos ad
      JOIN public.actors a ON ad.actor_id = a.id
      JOIN public.media_intelligence mi ON ad.id = mi.demo_id
      LEFT JOIN public.telephony_subtypes st ON ad.telephony_subtype_id = st.id
      ORDER BY ad.id DESC
      LIMIT 5
    `;

    console.log(`\n📊 Discovery Engine Stats:`);
    console.log(`- Totaal demo's in database: ${totalCount.count}`);
    console.log(`- Verrijkte telefonie demo's (met tekst): ${enrichedCount.count}`);

    console.log('\n--- LAATSTE 5 LIVE DEMO\'S ---');
    latestDemos.forEach(d => {
      console.log(`ID: ${d.id} | Acteur: ${d.first_name} | Type: ${d.subtype}`);
      console.log(`Naam: ${d.name}`);
      console.log(`Tekst: ${d.transcript?.substring(0, 100)}...`);
      console.log(`Audio: ${d.url}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await sql.end();
  }
}

checkLiveDemos();
