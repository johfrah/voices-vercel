import { db } from '../../packages/database/src';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'apps/web/.env.local') });

async function test() {
  try {
    console.log('Testing connection to:', process.env.DATABASE_URL);
    const result = await db.execute(sql`SELECT 1`);
    console.log('Connection successful:', result);
  } catch (err) {
    console.error('Connection failed:', err);
  }
  process.exit(0);
}

test();
