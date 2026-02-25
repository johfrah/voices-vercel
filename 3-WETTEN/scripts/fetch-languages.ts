import { db, languages } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { asc } from 'drizzle-orm';

async function main() {
  const results = await db.select().from(languages).orderBy(asc(languages.code));
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
