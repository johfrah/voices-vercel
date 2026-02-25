import { db } from './1-SITE/packages/database/src/index';
import { users } from './1-SITE/packages/database/src/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, 'johfrah@voices.be')).limit(1);
    console.log('User data:', JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('Error checking user:', e);
  }
}

checkAdmin();
