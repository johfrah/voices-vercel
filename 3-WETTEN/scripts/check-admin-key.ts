import { db, users } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { eq } from 'drizzle-orm';

async function checkAdminKey() {
  const key = 'ak_8f5b4ebdb5c246848302bbcc5bd8d869';
  
  console.log(`🔍 Checking for admin_key: ${key.substring(0, 10)}...`);
  
  const result = await db.select({ 
    id: users.id, 
    email: users.email, 
    role: users.role, 
    admin_key: users.admin_key 
  })
  .from(users)
  .where(eq(users.admin_key, key))
  .limit(1);

  if (result.length === 0) {
    console.log('❌ Admin key NOT found in database');
    
    // Check all admin users
    const admins = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      admin_key: users.admin_key
    })
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(5);
    
    console.log('\n📋 All admin users:');
    admins.forEach(admin => {
      console.log(`  - ${admin.email} (ID: ${admin.id})`);
      console.log(`    admin_key: ${admin.admin_key || 'NULL'}`);
    });
  } else {
    console.log('✅ Admin key found:');
    console.log(`  - Email: ${result[0].email}`);
    console.log(`  - Role: ${result[0].role}`);
    console.log(`  - ID: ${result[0].id}`);
  }
  
  process.exit(0);
}

checkAdminKey().catch(console.error);
