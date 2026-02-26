import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function deepSearchSubtypes() {
  console.log('🔍 [CHRIS-PROTOCOL] Deep Search: Looking for legacy telephony subtypes...');

  try {
    // 1. Check 'styles' tabel (vaak gebruikt voor voice-over types)
    try {
      const styles = await sql`SELECT * FROM public.styles WHERE name ILIKE '%IVR%' OR name ILIKE '%voicemail%' OR name ILIKE '%telefoon%'`;
      console.log('\n--- STYLES TABLE MATCHES ---');
      console.table(styles);
    } catch (e) { console.log('ℹ️ No styles table or no matches.'); }

    // 2. Check 'categories' tabel
    try {
      const categories = await sql`SELECT * FROM public.categories WHERE name ILIKE '%telephony%' OR name ILIKE '%telefonie%'`;
      console.log('\n--- CATEGORIES TABLE MATCHES ---');
      console.table(categories);
    } catch (e) { console.log('ℹ️ No categories table or no matches.'); }

    // 3. Check 'tags' tabel
    try {
      const tags = await sql`SELECT * FROM public.tags WHERE name ILIKE '%IVR%' OR name ILIKE '%voicemail%'`;
      console.log('\n--- TAGS TABLE MATCHES ---');
      console.table(tags);
    } catch (e) { console.log('ℹ️ No tags table or no matches.'); }

    // 4. Check 'voice_tones' (bestaande tabel uit eerdere scans)
    try {
      const tones = await sql`SELECT * FROM public.voice_tones ORDER BY id`;
      console.log('\n--- VOICE TONES ---');
      console.table(tones);
    } catch (e) { console.log('ℹ️ No voice_tones table.'); }

    // 5. Scan actor_demos voor bestaande 'type' of 'category' kolommen
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'actor_demos' AND table_schema = 'public'
    `;
    console.log('\n--- ACTOR_DEMOS COLUMNS ---');
    columns.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

  } catch (error) {
    console.error('❌ Deep search failed:', error);
  } finally {
    await sql.end();
  }
}

deepSearchSubtypes();
