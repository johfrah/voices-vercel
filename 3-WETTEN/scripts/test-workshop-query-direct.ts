#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWorkshopQuery() {
  console.log('🔍 Testing workshop query with instructor photo join...\n');
  
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        media:media_id(*),
        editions:workshop_editions(
          *,
          instructor:instructors!workshop_editions_instructor_id_instructors_id_fk(
            id, 
            name, 
            first_name, 
            last_name, 
            bio, 
            photo_id,
            photo:photo_id(*)
          ),
          location:locations(id, name, address, city, zip, country)
        )
      `)
      .eq('status', 'live')
      .order('id', { ascending: true })
      .limit(5);
    
    if (error) {
      console.error('❌ Query Error:', error);
      return;
    }
    
    console.log('✅ Query successful!');
    console.log(`📊 Found ${data?.length || 0} workshops\n`);
    
    if (data && data.length > 0) {
      console.log('First workshop:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testWorkshopQuery();
