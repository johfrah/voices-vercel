import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}

/**
 * DATABASE CONNECTION (Voices)
 */

const connectionString = process.env.DATABASE_URL!;

// Voor server-side queries (Next.js SSR)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
