import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

async function sendTest() {
  const { error } = await supabase
    .from('system_events')
    .insert([
      {
        level: 'INFO',
        source: 'Chris-Protocol',
        message: '🚀 TEST: Terminal is nu 100% live en verbonden.',
        details: { test: true }
      }
    ]);

  if (error) console.error('Error sending test:', error);
  else console.log('Test event sent successfully!');
}

sendTest();
