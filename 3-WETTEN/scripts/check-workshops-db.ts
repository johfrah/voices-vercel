import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from 1-SITE/apps/web/.env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkshops() {
  console.log('🔍 Querying workshops table (selecting all columns)...');
  const { data, error } = await supabase
    .from('workshops')
    .select('*');

  if (error) {
    console.error('Error fetching workshops:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No workshops found in the database.');
    return;
  }

  console.log(`Found ${data.length} workshops:\n`);
  data.forEach((w: any) => {
    console.log(`- ID: ${w.id}`);
    console.log(`  Title: ${w.title}`);
    console.log(`  Status: ${w.status}`);
    console.log(`  Slug: ${w.slug}`);
    console.log('---');
  });

  const radioshow = data.find((w: any) => (w.title?.toLowerCase().includes('radioshow') || w.slug?.toLowerCase().includes('radioshow')));
  console.log(`\n3. Bestaat 'Maak je eigen radioshow'? ${radioshow ? '✅ JA' : '❌ NEE'}`);
  if (radioshow) console.log(`   Exacte titel: ${radioshow.title}, Slug: ${radioshow.slug}, Status: ${radioshow.status}`);

  const opMaat = data.find((w: any) => (w.title?.toLowerCase().includes('op maat') || w.slug?.toLowerCase().includes('op-maat')));
  const storytelling = data.find((w: any) => (w.title?.toLowerCase().includes('storytelling') || w.slug?.toLowerCase().includes('storytelling')));

  console.log(`\n4. 'Workshop op maat' aanwezig? ${opMaat ? '✅ JA' : '❌ NEE'}`);
  if (opMaat) console.log(`   Exacte titel: ${opMaat.title}, Status: ${opMaat.status}`);

  console.log(`   'Storytelling' aanwezig? ${storytelling ? '✅ JA' : '❌ NEE'}`);
  if (storytelling) console.log(`   Exacte titel: ${storytelling.title}, Status: ${storytelling.status}`);
}

checkWorkshops();
