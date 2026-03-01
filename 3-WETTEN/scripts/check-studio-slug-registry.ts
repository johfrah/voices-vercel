#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudioSlug() {
  console.log('🔍 Checking Studio slug registry...\n');
  
  const { data, error } = await supabase
    .from('slug_registry')
    .select('*')
    .eq('slug', 'studio');
  
  if (error) {
    console.error('❌ Query error:', error);
    return;
  }
  
  console.log('📊 Studio slug registry entries:');
  console.log(JSON.stringify(data, null, 2));
  
  // Check the first article entry
  const articleEntry = data?.find((d: any) => d.routing_type === 'article' || d.routing_type === 'blog');
  if (articleEntry) {
    console.log('\n🔍 Checking article data for entity_id:', articleEntry.entity_id);
    const { data: article, error: articleError } = await supabase
      .from('content_articles')
      .select('*')
      .eq('id', articleEntry.entity_id)
      .single();
    
    if (articleError) {
      console.error('❌ Article query error:', articleError);
    } else {
      console.log('📄 Article data:');
      console.log(JSON.stringify(article, null, 2));
    }
  }
}

checkStudioSlug();
