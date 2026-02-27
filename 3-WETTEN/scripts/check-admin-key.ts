import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local from the web app directory
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminKey() {
  console.log('🔍 Checking admin_key for Johfrah...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, admin_key')
      .ilike('email', '%johfrah%');

    if (error) throw error;

    if (!users || users.length === 0) {
      console.log('❌ No user found with email containing "johfrah"');
    } else {
      console.log(`📥 Found ${users.length} user(s):`);
      users.forEach((user: any) => {
        console.log(`[${user.id}] ${user.email} | Role: ${user.role} | Key: ${user.admin_key || 'MISSING'}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error querying users:', error.message);
  }
}

checkAdminKey();
