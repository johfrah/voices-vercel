import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function checkRls() {
  let connectionString = process.env.DATABASE_URL!;
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    console.log('--- 🛡️ RLS CHECK ---');
    const rls = await sql`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders'`;
    console.log('Orders RLS:', rls[0]);

    console.log('\n--- 📁 SCHEMA CONTEXT ---');
    const context = await sql`SELECT current_schema(), current_database(), current_user`;
    console.log('Context:', context[0]);

    console.log('\n--- 📊 POLICIES ---');
    const policies = await sql`SELECT * FROM pg_policies WHERE tablename = 'orders'`;
    console.log('Policies:', policies);

    console.log('\n--- 🔑 GRANTS ---');
    const grants = await sql`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'orders'`;
    console.log('Grants:', grants);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkRls();
