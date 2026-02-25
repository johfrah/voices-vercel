
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function main() {
  let connectionString = process.env.DATABASE_URL!;
  if (!connectionString) {
    console.error("❌ DATABASE_URL not found");
    return;
  }

  // Bypass pooler if needed
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'db.vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { 
    prepare: false, 
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔍 Checking column types for 'actors'...");
    const columns = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'actors'
    `;
    console.log(JSON.stringify(columns, null, 2));

    console.log("🔍 Checking enum values for 'experience_level'...");
    const enums = await sql`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'experience_level'
    `;
    console.log("experience_level values:", enums.map(e => e.enumlabel));

    const enums2 = await sql`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'status'
    `;
    console.log("status values:", enums2.map(e => e.enumlabel));

  } catch (error) {
    console.error("❌ Error executing SQL:", error.message);
  } finally {
    await sql.end();
  }
}

main();
