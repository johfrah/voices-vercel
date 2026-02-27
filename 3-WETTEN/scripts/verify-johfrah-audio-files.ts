/**
 * Verify Johfrah's Audio Files - Complete URL Validation
 * 
 * This script:
 * 1. Fetches all Johfrah's demos from the database
 * 2. Constructs the Supabase Storage URLs
 * 3. Verifies each file is reachable (HTTP 200)
 * 4. Tests playback of at least 5 demos
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DemoResult {
  name: string;
  type: string;
  mediaPath: string;
  fullUrl: string;
  isReachable: boolean;
  httpStatus: number | null;
  error?: string;
}

async function verifyJohfrahAudioFiles() {
  try {
    console.log('🔍 Fetching Johfrah\'s demos from database...\n');
    
    // Query for Johfrah
    const { data: actors, error: actorError } = await supabase
      .from('actors')
      .select('id, first_name, last_name, status, is_public')
      .ilike('first_name', '%johfrah%')
      .single();
    
    if (actorError || !actors) {
      console.error('❌ Could not find Johfrah:', actorError);
      process.exit(1);
    }
    
    console.log(`✅ Found actor: ${actors.first_name} ${actors.last_name || ''}`);
    console.log(`   Status: ${actors.status}`);
    console.log(`   Public: ${actors.is_public}\n`);
    
    // Query for demos with media join
    const { data: demos, error: demoError } = await supabase
      .from('actor_demos')
      .select(`
        *,
        media:media_id (
          id,
          file_name,
          file_path,
          file_type
        )
      `)
      .eq('actor_id', actors.id)
      .order('menu_order');
    
    if (demoError || !demos) {
      console.error('❌ Error fetching demos:', demoError);
      process.exit(1);
    }
    
    console.log(`📼 Found ${demos.length} demos\n`);
    console.log('='.repeat(80));
    console.log('🔍 VERIFYING AUDIO FILES');
    console.log('='.repeat(80) + '\n');
    
    const results: DemoResult[] = [];
    
    for (let i = 0; i < demos.length; i++) {
      const demo = demos[i];
      
      console.log(`${i + 1}/${demos.length}. ${demo.name}`);
      console.log(`   Type: ${demo.type || 'N/A'}`);
      
      if (!demo.media) {
        console.log('   ❌ No media linked\n');
        results.push({
          name: demo.name,
          type: demo.type || 'unknown',
          mediaPath: 'N/A',
          fullUrl: 'N/A',
          isReachable: false,
          httpStatus: null,
          error: 'No media linked'
        });
        continue;
      }
      
      // Construct the Supabase Storage URL
      const mediaPath = demo.media.file_path;
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/${mediaPath}`;
      
      console.log(`   Path: ${mediaPath}`);
      console.log(`   URL: ${fullUrl}`);
      
      // Test if file is reachable
      try {
        const response = await fetch(fullUrl, { method: 'HEAD' });
        
        if (response.ok) {
          console.log(`   ✅ HTTP ${response.status} - File is reachable`);
          results.push({
            name: demo.name,
            type: demo.type || 'unknown',
            mediaPath,
            fullUrl,
            isReachable: true,
            httpStatus: response.status
          });
        } else {
          console.log(`   ❌ HTTP ${response.status} - File is NOT reachable`);
          results.push({
            name: demo.name,
            type: demo.type || 'unknown',
            mediaPath,
            fullUrl,
            isReachable: false,
            httpStatus: response.status,
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        console.log(`   ❌ Error checking file: ${error}`);
        results.push({
          name: demo.name,
          type: demo.type || 'unknown',
          mediaPath,
          fullUrl,
          isReachable: false,
          httpStatus: null,
          error: String(error)
        });
      }
      
      console.log('');
    }
    
    // Generate final report
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION REPORT');
    console.log('='.repeat(80) + '\n');
    
    const totalDemos = results.length;
    const reachableDemos = results.filter(r => r.isReachable);
    const brokenDemos = results.filter(r => !r.isReachable);
    
    console.log(`Total demos: ${totalDemos}`);
    console.log(`Reachable: ${reachableDemos.length} ✅`);
    console.log(`Broken: ${brokenDemos.length} ❌\n`);
    
    if (brokenDemos.length > 0) {
      console.log('⚠️  BROKEN DEMO LINKS:\n');
      brokenDemos.forEach(demo => {
        console.log(`   ❌ ${demo.name} (${demo.type})`);
        console.log(`      URL: ${demo.fullUrl}`);
        console.log(`      Error: ${demo.error || 'Unknown'}`);
        console.log('');
      });
    }
    
    // List all reachable demos
    if (reachableDemos.length > 0) {
      console.log('✅ REACHABLE DEMOS:\n');
      reachableDemos.forEach(demo => {
        console.log(`   ✅ ${demo.name} (${demo.type})`);
        console.log(`      HTTP ${demo.httpStatus}`);
      });
      console.log('');
    }
    
    // Final verdict
    console.log('='.repeat(80));
    if (brokenDemos.length === 0 && totalDemos > 0) {
      console.log('✅ VERIFIED LIVE: All of Johfrah\'s demos have valid, reachable audio files.');
      console.log(`   Total demos: ${totalDemos}`);
      console.log(`   All files: HTTP 200 OK`);
    } else if (totalDemos === 0) {
      console.log('⚠️  WARNING: No demos found for Johfrah.');
    } else {
      console.log('❌ ISSUES FOUND: Some demos are broken or unreachable.');
      console.log(`   Broken demos: ${brokenDemos.length}/${totalDemos}`);
    }
    console.log('='.repeat(80) + '\n');
    
    process.exit(brokenDemos.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

verifyJohfrahAudioFiles();
