import * as dotenv from 'dotenv';
import path from 'path';
import { eq } from 'drizzle-orm';

const envPath = path.join(process.cwd(), 'apps/web/.env.local');
dotenv.config({ path: envPath });

async function checkMedia() {
  const { db } = await import('../packages/database/src/index');
  const { media } = await import('../packages/database/src/schema/index');

  const music = await db.select().from(media).where(eq(media.category, 'music'));
  console.log(JSON.stringify(music, null, 2));
  process.exit(0);
}

checkMedia();
