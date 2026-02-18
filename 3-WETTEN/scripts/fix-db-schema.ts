import { db } from '../../1-SITE/apps/web/src/lib/api-server';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function fixDatabase() {
  console.log('🚀 Starting database fix...');

  try {
    // 1. Create visitor_logs table if it doesn't exist
    console.log('Creating visitor_logs table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id SERIAL PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        path TEXT NOT NULL,
        referrer TEXT,
        user_agent TEXT,
        ip_address TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ visitor_logs table ready.');

    // 2. Add missing columns to orders table
    console.log('Checking orders table columns...');
    await db.execute(sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS vies_validated_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS vies_country_code TEXT;
    `);
    console.log('✅ orders table columns updated.');

    console.log('🎉 Database fix completed successfully!');
  } catch (error) {
    console.error('❌ Database fix failed:', error);
  }
}

fixDatabase();
