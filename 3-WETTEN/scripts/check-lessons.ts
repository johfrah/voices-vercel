import { db } from '../1-SITE/packages/database';
import { lessons } from '../1-SITE/packages/database/schema';

async function main() {
  try {
    const allLessons = await db.select().from(lessons);
    console.log(`TOTAL_LESSONS: ${allLessons.length}`);
    allLessons.forEach(l => {
      console.log(`- ID: ${l.id}, Title: ${l.title}, Order: ${l.displayOrder}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
