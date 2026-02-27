/**
 * Check Johfrah's Database Status
 * 
 * Directly query the database to see:
 * 1. If Johfrah exists as an actor
 * 2. His status and visibility settings
 * 3. All assigned demos
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJohfrah() {
  try {
    console.log('🔍 Checking Johfrah in database...\n');
    
    // Query for Johfrah
    const { data: actors, error: actorError } = await supabase
      .from('actors')
      .select('*')
      .ilike('first_name', '%johfrah%');
    
    if (actorError) {
      console.error('❌ Error querying actors:', actorError);
      return;
    }
    
    if (!actors || actors.length === 0) {
      console.log('❌ No actor found with first_name containing "johfrah"');
      
      // Try to find all actors
      const { data: allActors } = await supabase
        .from('actors')
        .select('id, first_name, last_name, status, is_public')
        .order('first_name');
      
      console.log('\n📋 All actors in database:');
      allActors?.forEach(a => {
        console.log(`   - ${a.first_name} ${a.last_name || ''} (status: ${a.status}, public: ${a.is_public})`);
      });
      
      return;
    }
    
    console.log(`✅ Found ${actors.length} actor(s):\n`);
    
    for (const actor of actors) {
      console.log('='.repeat(80));
      console.log(`🎭 Actor: ${actor.first_name} ${actor.last_name || ''}`);
      console.log('='.repeat(80));
      console.log(`ID: ${actor.id}`);
      console.log(`Status: ${actor.status}`);
      console.log(`Is Public: ${actor.is_public}`);
      console.log(`Slug: ${actor.slug || 'N/A'}`);
      console.log(`Created: ${actor.created_at}`);
      console.log('');
      
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
        .eq('actor_id', actor.id)
        .order('menu_order');
      
      if (demoError) {
        console.error('❌ Error querying demos:', demoError);
        continue;
      }
      
      if (!demos || demos.length === 0) {
        console.log('⚠️  No demos found for this actor\n');
        continue;
      }
      
      console.log(`📼 Demos (${demos.length} total):\n`);
      
      for (const demo of demos) {
        console.log(`   ${demo.menu_order || '?'}. ${demo.name || 'Untitled'}`);
        console.log(`      Type: ${demo.type || 'N/A'}`);
        console.log(`      Demo URL field: ${demo.url || 'N/A'}`);
        console.log(`      Media ID: ${demo.media_id || 'N/A'}`);
        if (demo.media) {
          console.log(`      Media File: ${demo.media.file_name}`);
          console.log(`      Media Path: ${demo.media.file_path}`);
          console.log(`      Media Type: ${demo.media.file_type || 'N/A'}`);
        } else {
          console.log(`      Media: Not linked`);
        }
        console.log(`      Status: ${demo.status || 'N/A'}`);
        console.log(`      Public: ${demo.is_public !== undefined ? demo.is_public : 'N/A'}`);
        console.log('');
      }
      
      // Check which demos are visible (status=approved AND is_public=true)
      const visibleDemos = demos.filter(d => 
        d.status === 'approved' && d.is_public === true
      );
      
      console.log(`✅ Visible demos (status=approved AND is_public=true): ${visibleDemos.length}/${demos.length}`);
      
      if (visibleDemos.length < demos.length) {
        const hiddenDemos = demos.filter(d => 
          d.status !== 'approved' || d.is_public !== true
        );
        console.log(`⚠️  Hidden demos: ${hiddenDemos.length}`);
        hiddenDemos.forEach(d => {
          console.log(`   - ${d.name}: status=${d.status}, public=${d.is_public}`);
        });
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

checkJohfrah();
