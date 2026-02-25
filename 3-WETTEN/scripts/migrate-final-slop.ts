import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: VIDEO & WORKSHOP 1 TRUTH MIGRATION (v2.14.536)
 * 
 * Doel: De laatste restjes 'Hybrid Slop' in video's en workshops 
 * omzetten naar de media_id standaard.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateRemainingSlop() {
  console.log('🚀 [FINAL-MIGRATION] Starting Video & Workshop migration...');

  // 1. Migrate Videos (Johfrah's portfolio items)
  const { data: videos } = await supabase.from('actor_videos').select('*').is('media_id', null);
  console.log(`📺 Processing ${videos?.length || 0} videos...`);

  if (videos) {
    for (const video of videos) {
      if (!video.url) continue;
      
      // Clean path: /assets/common/... -> common/...
      const filePath = video.url.replace(/^\/assets\//, '');
      const fileName = filePath.split('/').pop() || 'video.mp4';

      const { data: existingMedia } = await supabase.from('media').select('id').eq('file_path', filePath).single();
      
      let mediaId;
      if (existingMedia) {
        mediaId = existingMedia.id;
      } else {
        const { data: newMedia } = await supabase.from('media').insert({
          file_name: fileName,
          file_path: filePath,
          file_type: 'video/mp4',
          journey: 'agency',
          category: 'voices',
          is_public: true,
          labels: ['migrated-video-portfolio']
        }).select().single();
        mediaId = newMedia?.id;
      }

      if (mediaId) {
        await supabase.from('actor_videos').update({ media_id: mediaId, url: "" }).eq('id', video.id);
        console.log(`✅ Video ${video.name} -> Media ID ${mediaId}`);
      }
    }
  }

  // 2. Migrate Workshops (Photo URLs)
  const { data: workshops } = await supabase.from('workshops').select('*').is('media_id', null);
  console.log(`🎓 Processing ${workshops?.length || 0} workshops...`);

  if (workshops) {
    for (const workshop of workshops) {
      if (!workshop.photo_url) continue;

      const filePath = workshop.photo_url.replace(/^\/assets\//, '');
      const fileName = filePath.split('/').pop() || 'workshop.webp';

      const { data: existingMedia } = await supabase.from('media').select('id').eq('file_path', filePath).single();
      
      let mediaId;
      if (existingMedia) {
        mediaId = existingMedia.id;
      } else {
        const { data: newMedia } = await supabase.from('media').insert({
          file_name: fileName,
          file_path: filePath,
          file_type: 'image/webp',
          journey: 'studio',
          category: 'workshops',
          is_public: true,
          labels: ['migrated-workshop-photo']
        }).select().single();
        mediaId = newMedia?.id;
      }

      if (mediaId) {
        await supabase.from('workshops').update({ media_id: mediaId, photo_url: "" }).eq('id', workshop.id);
        console.log(`✅ Workshop ${workshop.title} -> Media ID ${mediaId}`);
      }
    }
  }

  console.log('\n🏁 [FINAL MIGRATION COMPLETE]');
}

migrateRemainingSlop().catch(console.error);
