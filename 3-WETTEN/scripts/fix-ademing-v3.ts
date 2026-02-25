
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAndSync() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING TRACKS SCHEMA & DATA FIX ---');
  
  // 1. Try to add the column via RPC
  console.log('Attempting to add slug column...');
  const { error: rpcError } = await supabase.rpc('execute_sql', {
    sql_query: 'ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;'
  });

  if (rpcError) {
    console.warn('RPC execute_sql failed (likely no permission or function missing).');
    console.warn('Error:', rpcError);
  } else {
    console.log('Successfully added slug column (or it already existed).');
  }

  // 2. Sync slugs
  console.log('Syncing slugs...');
  const tracks = [
    { id: 1, slug: 'aarde-1' },
    { id: 2, slug: 'aarde-2' },
    { id: 3, slug: 'aarde-dummy' },
    { id: 4, slug: 'stiltemeditatie' },
    { id: 5, slug: 'vuur-1' }
  ];

  for (const track of tracks) {
    const { error } = await supabase
      .from('ademing_tracks')
      .update({ slug: track.slug })
      .eq('id', track.id);

    if (error) {
      console.error(`Failed to update track ${track.id}:`, error.message);
    } else {
      console.log(`Updated track ${track.id} with slug ${track.slug}`);
    }
  }
}

fixAndSync();
