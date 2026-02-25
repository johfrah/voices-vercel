import { db } from '../1-SITE/packages/database/src/index';
import { actors } from '../1-SITE/packages/database/schema';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function testConnection() {
  console.log('🚀 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
  
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(actors);
    console.log('✅ Connection successful!');
    console.log('Total actors in database:', result[0].count);
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    process.exit();
  }
}

testConnection();
