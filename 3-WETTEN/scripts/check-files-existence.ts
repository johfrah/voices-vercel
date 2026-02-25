
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificFiles() {
  const filesToCheck = [
    'active/voicecards/189009-birgit-photo-square-1.jpg',
    'active/voicecards/196832-christina-photo-vertical-1.jpg',
    'active/voicecards/258121-mona-photo-horizontal-1.jpg',
    'active/voicecards/189058-hannelore-photo-square-1.jpg',
    'active/voicecards/228397-annelies-photo-horizontal-1.jpg',
    'active/voicecards/190797-veerle-photo-square-1.jpg'
  ];

  console.log("🔍 Checking specific files in 'voices' bucket...");
  
  for (const filePath of filesToCheck) {
    const parts = filePath.split('/');
    const fileName = parts.pop()!;
    const folder = parts.join('/');
    
    const { data, error } = await supabase.storage.from('voices').list(folder, {
      search: fileName
    });
    
    if (data && data.length > 0) {
      console.log(`✅ FOUND: ${filePath}`);
    } else {
      console.log(`❌ NOT FOUND: ${filePath}`);
      // List folder to see what's there
      const { data: folderData } = await supabase.storage.from('voices').list(folder, { limit: 5 });
      console.log(`   (First 5 in ${folder}: ${folderData?.map(f => f.name).join(', ')})`);
    }
  }
  
  process.exit(0);
}

checkSpecificFiles();
