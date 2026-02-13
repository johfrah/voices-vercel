import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}
console.log('🔌 DB Connection String:', process.env.DATABASE_URL?.substring(0, 20) + '...');

/**
 * DATABASE CONNECTION (Voices)
 */

const connectionString = process.env.DATABASE_URL!;

// Voor server-side queries (Next.js SSR)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
