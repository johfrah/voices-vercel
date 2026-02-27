import { db, actors } from '../../1-SITE/packages/database/index.js';
import { eq, ilike } from 'drizzle-orm';

async function checkJohfrah() {
  try {
    const result = await db.select({ 
      id: actors.id, 
      slug: actors.slug, 
      first_name: actors.first_name,
      status: actors.status,
      is_public: actors.is_public
    }).from(actors).where(ilike(actors.first_name, '%johfrah%')).limit(5);
    
    console.log('Johfrah actors found:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkJohfrah();
