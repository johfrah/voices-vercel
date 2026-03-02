import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Handmatig de .env.local parsen omdat we in een monorepo structuur zitten
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars in', envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkErrors() {
  console.log('🔍 Checking recent system events via Supabase...');
  try {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .eq('level', 'error')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    console.log('Recent Errors:');
    data.forEach(event => {
      console.log(`[${event.created_at}] ${event.message}`);
      if (event.details) {
        console.log('Details:', JSON.stringify(event.details, null, 2));
      }
      console.log('---');
    });
  } catch (err) {
    console.error('Failed to fetch events:', err);
  }
}

checkErrors();
