
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql';

async function main() {
  console.log("🚀 Starting actor seeding from SQL dump (ROBUST PARSER)...");

  // 1. Extract actors from wp_voices_actors using specific line ranges
  console.log("📂 Extracting actors from wp_voices_actors...");
  const tempFile = '/tmp/actor_data_seed_robust.txt';
  const { execSync } = require('child_process');
  
  // Get the lines from the SQL dump
  execSync(`sed -n '1195681,1196000p' "${sqlPath}" | grep "^(" > ${tempFile}`);
  
  const dataContent = fs.readFileSync(tempFile, 'utf8');
  const actorsFromSql = [];
  
  const lines = dataContent.split('\n');
  console.log(`📊 Processing ${lines.length} lines...`);

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Clean up trailing comma or semicolon
    line = line.replace(/[,;]$/, '');
    
    // Manual parsing instead of one big regex
    // Format: (id, first_name, last_name, email, phone, gender, native_lang, country, delivery_time, extra_langs, bio, why_voices, tagline, ai_tags, photo_id, logo_id, voice_score, price_unpaid, price_online, price_ivr, price_live_regie, dropbox_url, videoask, aftermovie_videoask, videostill_id, status, created_at, updated_at)
    
    // Remove outer parentheses
    const content = line.substring(1, line.length - 1);
    
    // Split by comma, but respect single quotes
    const fields = [];
    let currentField = "";
    let inQuotes = false;
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (char === "'" && (i === 0 || content[i-1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());

    if (fields.length >= 28) {
      const actor = {
        actorId: fields[0],
        firstName: fields[1].replace(/^'|'$/g, ''),
        lastName: fields[2].replace(/^'|'$/g, ''),
        email: fields[3].replace(/^'|'$/g, ''),
        phone: fields[4].replace(/^'|'$/g, ''),
        gender: fields[5].replace(/^'|'$/g, ''),
        nativeLang: fields[6].replace(/^'|'$/g, ''),
        country: fields[7].replace(/^'|'$/g, ''),
        deliveryTime: fields[8].replace(/^'|'$/g, ''),
        extraLangs: fields[9].replace(/^'|'$/g, ''),
        bio: fields[10].replace(/^'|'$/g, ''),
        whyVoices: fields[11].replace(/^'|'$/g, ''),
        tagline: fields[12].replace(/^'|'$/g, ''),
        aiTags: fields[13] === 'NULL' ? [] : fields[13].replace(/^'|'$/g, ''),
        photoId: fields[14] === 'NULL' ? null : parseInt(fields[14]),
        logoId: fields[15] === 'NULL' ? null : parseInt(fields[15]),
        voiceScore: parseInt(fields[16]),
        priceUnpaid: fields[17],
        priceOnline: fields[18],
        priceIvr: fields[19],
        priceLiveRegie: fields[20],
        dropboxUrl: fields[21] === 'NULL' ? null : fields[21].replace(/^'|'$/g, ''),
        status: fields[25].replace(/^'|'$/g, ''),
        createdAt: fields[26].replace(/^'|'$/g, ''),
        updatedAt: fields[27].replace(/^'|'$/g, '')
      };
      actorsFromSql.push(actor);
    }
  }
  console.log(`✅ Found ${actorsFromSql.length} actors in wp_voices_actors.`);

  // 2. Map Actor IDs to WooCommerce IDs (post_ids) from wp_postmeta
  console.log("🔗 Mapping Actor IDs to WooCommerce IDs...");
  const mappingFile = '/tmp/actor_mapping_seed_robust.txt';
  execSync(`grep "'voice-email'" "${sqlPath}" > ${mappingFile}`);
  const mappingContent = fs.readFileSync(mappingFile, 'utf8');
  const emailToWpMap = new Map<string, number>();
  const emailRegex = /\(\d+,\s*(\d+),\s*'voice-email',\s*'([^']+)'\)/g;
  let matchMapping;
  while ((matchMapping = emailRegex.exec(mappingContent)) !== null) {
    emailToWpMap.set(matchMapping[2].toLowerCase(), parseInt(matchMapping[1]));
  }
  console.log(`✅ Found ${emailToWpMap.size} email-to-WP mappings in wp_postmeta.`);

  // 3. Upsert into Supabase
  console.log("☁️ Upserting actors into Supabase...");
  let successCount = 0;
  let errorCount = 0;

  for (const actor of actorsFromSql) {
    const wpProductId = emailToWpMap.get(actor.email.toLowerCase());
    
    // Convert gender to Supabase enum if needed
    let genderValue = actor.gender.toLowerCase().includes('vrouw') ? 'female' : 
                      actor.gender.toLowerCase().includes('man') ? 'male' : null;

    const { error } = await supabase
      .from('actors')
      .upsert({
        wp_product_id: wpProductId,
        first_name: actor.firstName,
        last_name: actor.lastName,
        email: actor.email,
        gender: genderValue as any,
        native_lang: actor.nativeLang,
        delivery_time: actor.deliveryTime,
        extra_langs: actor.extraLangs,
        bio: actor.bio,
        why_voices: actor.whyVoices,
        tagline: actor.tagline,
        voice_score: actor.voiceScore,
        price_unpaid: actor.priceUnpaid,
        price_online: actor.priceOnline,
        price_ivr: actor.priceIvr,
        price_live_regie: actor.priceLiveRegie,
        dropbox_url: actor.dropboxUrl,
        status: actor.status === 'live' ? 'live' : 'pending',
        is_public: actor.status === 'live',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wp_product_id'
      });

    if (error) {
      console.error(`❌ Error upserting actor ${actor.firstName} (WP ID: ${wpProductId}):`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`🏁 Seeding completed: ${successCount} successful, ${errorCount} errors.`);
}

main();
