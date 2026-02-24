
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const draftEmails = [
  'silke.gordon@gmail.com',
  'alfonso.giansanti@gmail.com',
  'mail@mariameulders.be',
  'michelecuvelier@hotmail.com',
  'aliciabader68@gmail.com',
  'dhoudemond@yahoo.ca',
  'sylvain.voix@gmail.com',
  'camillejames.voixoff@gmail.com',
  'info@klaptoos.be',
  'info@spotbox.be',
  'info@berdienschepers.be',
  'stephan@sdewes.de'
];

async function main() {
  console.log("🛠️ Fixing status for actors that should be 'pending' (draft in WooCommerce)...");

  for (const email of draftEmails) {
    const { data, error } = await supabase
      .from('actors')
      .update({ status: 'pending', is_public: false })
      .ilike('email', email)
      .select();

    if (error) {
      console.error(`❌ Error updating ${email}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${email} to 'pending'.`);
    } else {
      console.log(`⚠️ No actor found with email ${email}.`);
    }
  }

  console.log("🏁 Status fix completed.");
}

main();
