import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local from 1-SITE/apps/web/.env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    // Check if columns exist
    const colQuery = {
      text: "SELECT column_name FROM information_schema.columns WHERE table_name = 'actors' AND column_name IN ('instagram', 'linkedin', 'youtube_url')",
    };
    const colRes = await pool.query(colQuery);
    const existingCols = colRes.rows.map(r => r.column_name);
    console.log('Existing columns in database:', existingCols);

    // Build query based on existing columns
    let selectFields = ['id', 'slug'];
    if (existingCols.includes('linkedin')) selectFields.push('linkedin');
    if (existingCols.includes('youtube_url')) selectFields.push('youtube_url');
    if (existingCols.includes('instagram')) selectFields.push('instagram');

    const query = {
      text: `SELECT ${selectFields.join(', ')} FROM actors WHERE id = 1760 OR slug = $1`,
      values: ['johfrah'],
    };

    const res = await pool.query(query);
    console.log('Result for Johfrah:', JSON.stringify(res.rows, null, 2));

  } catch (error) {
    console.error('Error fetching Johfrah socials:', error);
  } finally {
    await pool.end();
  }
}

main();
