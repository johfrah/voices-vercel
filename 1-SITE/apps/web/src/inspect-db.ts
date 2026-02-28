import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import postgres from 'postgres';

async function inspectArtists() {
  console.log("🚀 Inspecting artists table structure...");

  const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
  const sqlDirect = postgres(connectionString, { ssl: 'require' });

  try {
    const columns = await sqlDirect`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artists'
    `;
    console.log("Columns in 'artists' table:", columns);

    const sample = await sqlDirect`SELECT * FROM artists LIMIT 1`;
    console.log("Sample artist record:", sample[0]);

  } catch (error) {
    console.error("❌ Inspection failed:", error);
  } finally {
    await sqlDirect.end();
  }
}

inspectArtists().then(() => process.exit(0));
