import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: './apps/web/.env.local' });

export default defineConfig({
  schema: './packages/database/src/schema/index.ts',
  out: './packages/database/meta',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
