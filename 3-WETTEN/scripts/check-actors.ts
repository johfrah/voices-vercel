import { db } from '@voices/database/client';
import { actors } from '@voices/database/schema';
import { eq, and } from 'drizzle-orm';

async function checkActors() {
  const johfrah = await db.select().from(actors).where(
    and(
      eq(actors.slug, 'johfrah'),
      eq(actors.status, 'live'),
      eq(actors.is_public, true)
    )
  ).limit(1);

  const youssef = await db.select().from(actors).where(
    and(
      eq(actors.slug, 'youssef'),
      eq(actors.status, 'live'),
      eq(actors.is_public, true)
    )
  ).limit(1);

  console.log('Johfrah:', johfrah.length > 0 ? 'FOUND (live + public)' : 'NOT FOUND or not live+public');
  console.log('Youssef:', youssef.length > 0 ? 'FOUND (live + public)' : 'NOT FOUND or not live+public');

  if (johfrah.length > 0) {
    console.log('Johfrah details:', { 
      slug: johfrah[0].slug, 
      status: johfrah[0].status, 
      is_public: johfrah[0].is_public, 
      first_name: johfrah[0].first_name 
    });
  }
  if (youssef.length > 0) {
    console.log('Youssef details:', { 
      slug: youssef[0].slug, 
      status: youssef[0].status, 
      is_public: youssef[0].is_public, 
      first_name: youssef[0].first_name 
    });
  }
}

checkActors().catch(console.error);
