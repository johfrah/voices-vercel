
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try to find .env.local in multiple locations
const envPaths = [
  path.resolve(process.cwd(), '1-SITE/apps/web/.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), 'apps/web/.env.local')
];

let envPath = '';
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    envPath = p;
    break;
  }
}

if (envPath) {
  console.log(`Loading env from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error('Could not find .env.local');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing in env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSlugColumn() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING TRACKS SCHEMA FIX ---');
  
  // Since we can't easily run arbitrary SQL via the SDK without an RPC function,
  // we'll try to update a dummy record to see if the column exists.
  const { error: checkError } = await supabase
    .from('ademing_tracks')
    .select('slug')
    .limit(1);

  if (checkError && checkError.message.includes('column "slug" does not exist')) {
    console.log('Column "slug" does not exist. Please add it manually in the Supabase SQL Editor:');
    console.log('ALTER TABLE ademing_tracks ADD COLUMN slug TEXT UNIQUE;');
    
    // We can try to use the RPC if it exists
    const { error: rpcError } = await supabase.rpc('execute_sql', {
      sql_query: 'ALTER TABLE ademing_tracks ADD COLUMN slug TEXT UNIQUE;'
    });
    
    if (rpcError) {
      console.error('RPC execute_sql failed. You must add the column manually.');
    } else {
      console.log('Successfully added slug column via RPC.');
    }
  } else if (checkError) {
    console.error('Error checking for slug column:', checkError);
  } else {
    console.log('Column "slug" already exists.');
  }
}

addSlugColumn();
