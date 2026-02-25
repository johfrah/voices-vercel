import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: NUCLEAR DATABASE INTEGRITY SCAN (v2.14.538)
 * 
 * Doel: Elke actieve tabel scannen op 'Hybrid Slop' en 'Handshake Violations'.
 * We zoeken naar kolommen die URL-strings bevatten terwijl ze media_id zouden moeten gebruiken.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runNuclearAudit() {
  console.log('🚀 [NUCLEAR-AUDIT] Starting Full Platform Integrity Scan...');

  const report: any = {};

  // 1. ACTORS TABLE
  const { data: actors } = await supabase.from('actors').select('*');
  report.actors = {
    total: actors?.length || 0,
    slop_dropbox_url: actors?.filter(a => a.dropbox_url && a.dropbox_url !== '').length || 0,
    slop_missing_photo_id: actors?.filter(a => !a.photo_id).length || 0,
    slop_missing_email: actors?.filter(a => !a.email).length || 0,
    slop_literal_null_lang: actors?.filter(a => a.native_lang === 'NULL').length || 0,
  };

  // 2. DEMOS TABLE
  const { data: demos } = await supabase.from('actor_demos').select('*');
  report.demos = {
    total: demos?.length || 0,
    slop_hardcoded_url: demos?.filter(d => d.url && d.url !== '').length || 0,
    slop_missing_media_id: demos?.filter(d => !d.media_id).length || 0,
  };

  // 3. VIDEOS TABLE
  const { data: videos } = await supabase.from('actor_videos').select('*');
  report.videos = {
    total: videos?.length || 0,
    slop_hardcoded_url: videos?.filter(v => v.url && v.url !== '').length || 0,
    slop_missing_media_id: videos?.filter(v => !v.media_id).length || 0,
  };

  // 4. WORKSHOPS TABLE
  const { data: workshops } = await supabase.from('workshops').select('*');
  report.workshops = {
    total: workshops?.length || 0,
    slop_hardcoded_photo: workshops?.filter(w => w.photo_url && w.photo_url !== '').length || 0,
    slop_missing_media_id: workshops?.filter(w => !w.media_id).length || 0,
  };

  // 5. MEDIA TABLE (The Truth)
  const { data: media } = await supabase.from('media').select('id, file_path');
  report.media = {
    total: media?.length || 0,
    broken_paths: media?.filter(m => !m.file_path).length || 0,
  };

  // 6. CONTENT ARTICLES
  const { data: articles } = await supabase.from('content_articles').select('*');
  report.articles = {
    total: articles?.length || 0,
    slop_missing_media_id: articles?.filter(a => !a.media_id && a.image_url).length || 0,
  };

  console.log('\n📊 [AUDIT REPORT]');
  console.table(report);

  console.log('\n🔍 [CRITICAL FINDINGS]');
  if (report.actors.slop_dropbox_url > 0) console.warn(`⚠️  ACTORS: ${report.actors.slop_dropbox_url} records still have legacy dropbox_url strings!`);
  if (report.demos.slop_hardcoded_url > 0) console.warn(`⚠️  DEMOS: ${report.demos.slop_hardcoded_url} records still have legacy URL strings!`);
  if (report.videos.slop_hardcoded_url > 0) console.warn(`⚠️  VIDEOS: ${report.videos.slop_hardcoded_url} records still have legacy URL strings!`);
  
  console.log('\n🏁 [AUDIT COMPLETE]');
}

runNuclearAudit().catch(console.error);
