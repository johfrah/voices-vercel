
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/1-SITE/apps/web/.env.local';
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in', envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSlugColumn() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING TRACKS SCHEMA FIX ---');
  
  // Try adding the column directly via SQL if RPC is not available
  // Note: Supabase doesn't allow direct ALTER TABLE via SDK without a custom RPC function.
  // If this fails, we must rely on drizzle-kit push.
  
  console.log('Attempting to add slug column...');
  
  // Check if we can use the 'execute_sql' RPC (common in some Supabase setups)
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: 'ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;'
  });

  if (error) {
    console.error('Failed to add slug column via RPC:', error);
    console.log('Please run drizzle-kit push from the correct directory.');
  } else {
    console.log('Successfully added slug column to ademing_tracks');
  }
}

addSlugColumn();
