import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.vcbxyyjsxuquytcsskpj:u%26438%258tHthTe5U@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
const sql = postgres(DATABASE_URL, {
  connect_timeout: 10,
  idle_timeout: 10,
});

async function fetchActors() {
  console.log('Connecting to Supabase...');
  try {
    const actors = await sql`
      SELECT id, first_name, last_name, gender, slug, status 
      FROM actors 
      WHERE first_name ILIKE '%Rory%' 
         OR last_name ILIKE '%Jonkergouw%'
    `;
    console.log('START_JSON');
    console.log(JSON.stringify(actors, null, 2));
    console.log('END_JSON');
  } catch (error) {
    console.error('Error fetching actors:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

fetchActors();
