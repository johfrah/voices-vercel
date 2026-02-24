import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../apps/web/.env.local') });

export default defineConfig({
  schema: path.join(__dirname, './schema.ts'),
  out: './meta',
  dialect: 'postgresql',
  dbCredentials: {
    url: (process.env.DATABASE_URL || "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true").replace('pgbouncer=true', 'sslmode=require'),
  },
});
