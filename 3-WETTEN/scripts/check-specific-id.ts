import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function checkId() {
  const id = '096939229';
  console.log(`🔍 Checking ID: ${id}`);

  try {
    const actor = await sql`SELECT id, first_name, slug FROM actors WHERE id::text = ${id} OR slug = ${id}`;
    console.log('Actors:', actor);

    const article = await sql`SELECT id, title, slug FROM content_articles WHERE id::text = ${id} OR slug = ${id}`;
    console.log('Articles:', article);

    const order = await sql`SELECT id FROM orders_v2 WHERE id::text = ${id}`;
    console.log('Orders:', order);

    const castingList = await sql`SELECT id, name FROM casting_lists WHERE hash = ${id}`;
    console.log('Casting Lists:', castingList);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkId();
