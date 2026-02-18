import * as dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
console.log("Connecting to:", connectionString.replace(/:[^:]+@/, ':****@'));

const sql = postgres(connectionString, { prepare: false });

async function test() {
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log("✅ Connection successful:", result);
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await sql.end();
  }
}

test();
