import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from web directory
dotenv.config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

async function checkAdminKey() {
  const key = 'ak_8f5b4ebdb5c246848302bbcc5bd8d869';
  
  console.log(`🔍 Checking for admin_key: ${key.substring(0, 10)}...`);
  
  const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
  const sql = postgres(connectionString, { ssl: 'require' });
  
  try {
    const result = await sql`
      SELECT id, email, role, admin_key 
      FROM users 
      WHERE admin_key = ${key}
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log('❌ Admin key NOT found in database');
      
      // Check all admin users
      const admins = await sql`
        SELECT id, email, role, admin_key
        FROM users
        WHERE role = 'admin'
        LIMIT 5
      `;
      
      console.log('\n📋 All admin users:');
      admins.forEach((admin: any) => {
        console.log(`  - ${admin.email} (ID: ${admin.id})`);
        console.log(`    admin_key: ${admin.admin_key || 'NULL'}`);
      });
    } else {
      console.log('✅ Admin key found:');
      console.log(`  - Email: ${result[0].email}`);
      console.log(`  - Role: ${result[0].role}`);
      console.log(`  - ID: ${result[0].id}`);
    }
  } finally {
    await sql.end();
  }
}

checkAdminKey().catch(console.error);
