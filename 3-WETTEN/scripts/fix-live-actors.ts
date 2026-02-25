import { createClient } from '@supabase/supabase-js';

// 🛡️ CHRIS-PROTOCOL: Live Actor Photo Handshake (v2.14.548)
// Doel: De 20 live stemmen zonder foto koppelen aan hun juiste media assets.

const SUPABASE_URL = 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ACTOR_FIXES = [
  { id: 2622, media_id: 9 },    // Elenice
  { id: 2620, media_id: 88 },   // Giuseppe
  { id: 2809, media_id: 128 },  // Yvonne
  { id: 2750, media_id: 118 },  // Sam
  { id: 2817, media_id: 118 },  // Sam (Duplicate)
  { id: 2646, media_id: 118 },  // Sam (Duplicate)
  { id: 2698, media_id: 118 },  // Sam (Duplicate)
  { id: 2785, media_id: 191 },  // Diana
  { id: 1734, media_id: 5072 }, // Pawel
  { id: 2784, media_id: 100 },  // Tom
  { id: 2786, media_id: 210 },  // Megui
  { id: 2787, media_id: 190 },  // Andreas
  { id: 2791, media_id: 189 },  // Maciek
  { id: 2794, media_id: 205 },  // Aleksander
  { id: 2788, media_id: 208 },  // Malgorzata
  { id: 2884, media_id: 214 },  // Giovanni
  { id: 2882, media_id: 212 },  // Barbara
  { id: 2885, media_id: 194 },  // Janpa
];

async function fixLiveActors() {
  console.log('🚀 [LIVE-ACTOR-FIX] Starting Atomic Photo Handshake...');

  let fixedCount = 0;

  for (const fix of ACTOR_FIXES) {
    const { error } = await supabase
      .from('actors')
      .update({ photo_id: fix.media_id })
      .eq('id', fix.id);

    if (error) {
      console.error(`❌ Failed to fix actor ${fix.id}:`, error.message);
    } else {
      console.log(`✅ Fixed actor ${fix.id} -> Media ID ${fix.media_id}`);
      fixedCount++;
    }
  }

  // 🎧 WORKSHOP FIX
  console.log('\n🎧 [WORKSHOP-FIX] Linking "Presenteren in de camera"...');
  const { error: wsError } = await supabase
    .from('workshops')
    .update({ media_id: 219 })
    .eq('id', 260271);

  if (wsError) {
    console.error('❌ Failed to fix workshop:', wsError.message);
  } else {
    console.log('✅ Fixed workshop 260271 -> Media ID 219');
  }

  console.log(`\n🏁 [FIX COMPLETE] Total actors fixed: ${fixedCount}`);
}

fixLiveActors().catch(console.error);
