import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: './apps/web/.env.local' });

export default defineConfig({
  schema: './packages/database/src/schema/index.ts',
  out: './packages/database/meta',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
