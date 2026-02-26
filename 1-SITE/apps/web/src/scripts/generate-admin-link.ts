import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL!;

async function generateLink() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`🚀 Genereren van admin auto-login link voor: ${adminEmail}`);

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: adminEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voices.be'}/admin/live-chat`
    }
  });

  if (error) {
    console.error('❌ Fout bij genereren link:', error.message);
    return;
  }

  console.log('\n✅ Link succesvol gegenereerd!');
  console.log('-----------------------------------');
  console.log(data.properties.action_link);
  console.log('-----------------------------------');
  console.log('\nOpen deze link op je smartphone om direct in de Live Chat Watcher te landen.');
}

generateLink();
