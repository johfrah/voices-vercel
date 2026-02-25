import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function forensicDataAudit() {
  console.log('🕵️ [FORENSIC AUDIT] Scanning for specific data anomalies...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'db.vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    // CATEGORIE 1: De "Tijdreizigers" (Datums die buiten de logica vallen)
    const timeTravelers = await sql`
      SELECT id, wp_order_id, created_at 
      FROM orders 
      WHERE created_at < '2010-01-01' OR created_at > NOW() + interval '1 day'
      LIMIT 5
    `;

    // CATEGORIE 2: De "Gratis" Paradox (Geen totaalbedrag maar status 'completed')
    const freePaidOrders = await sql`
      SELECT id, wp_order_id, total, status 
      FROM orders 
      WHERE (total::numeric = 0 OR total IS NULL OR total::text = '') 
      AND status = 'completed'
      LIMIT 5
    `;

    // CATEGORIE 3: De "Identiteitslozen" (Geen user_id én geen billing info in meta)
    const ghostGuests = await sql`
      SELECT id, wp_order_id, raw_meta::text as meta_preview
      FROM orders 
      WHERE user_id IS NULL 
      AND (raw_meta IS NULL OR raw_meta::text NOT LIKE '%billing%')
      LIMIT 5
    `;

    // CATEGORIE 4: De "Zonder Journey" (Geen journey gekoppeld)
    const journeyLess = await sql`
      SELECT id, wp_order_id, journey 
      FROM orders 
      WHERE journey IS NULL OR journey = ''
      LIMIT 5
    `;

    console.log('\n--- 🚨 DATA ANOMALIEËN VOOR JOHFRAH ---');
    
    console.log('\n📅 1. TIJDREIZIGERS (Datums die mogelijk corrupt zijn):');
    if (timeTravelers.length > 0) console.table(timeTravelers); else console.log('Geen gevonden.');

    console.log('\n💰 2. GRATIS PARADOX (Bedrag 0 maar status "completed"):');
    if (freePaidOrders.length > 0) console.table(freePaidOrders); else console.log('Geen gevonden.');

    console.log('\n👻 3. GHOST GUESTS (Geen user_id en GEEN billing info in meta):');
    if (ghostGuests.length > 0) {
      ghostGuests.forEach(g => {
        console.log(`ID: ${g.id} (WP #${g.wp_order_id}) - Meta: ${g.meta_preview?.substring(0, 100)}...`);
      });
    } else console.log('Geen gevonden.');

    console.log('\n🎭 4. ZONDER JOURNEY (Geen journey-type bekend):');
    if (journeyLess.length > 0) console.table(journeyLess); else console.log('Geen gevonden.');

  } catch (error: any) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

forensicDataAudit();
