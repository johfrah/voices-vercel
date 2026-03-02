import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import postgres from 'postgres';
import { subtitles } from './components/legacy/ArtistSubtitles';

async function migrateSubtitles() {
  console.log("🚀 Starting subtitle migration for Youssef Zaki (Direct Postgres - iap_context)...");

  // 🛡️ CHRIS-PROTOCOL: Raw SQL voor schema-stabiliteit
  const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
  const sqlDirect = postgres(connectionString, { ssl: 'require', connect_timeout: 30 });

  try {
    // 1. Find Youssef (slug is 'youssef')
    const artists = await sqlDirect`SELECT id, display_name, iap_context FROM artists WHERE slug = 'youssef' LIMIT 1`;

    if (artists.length === 0) {
      console.error("❌ Artist 'youssef' not found.");
      return;
    }

    const artist = artists[0];
    console.log(`✅ Found artist: ${artist.display_name} (ID: ${artist.id})`);

    // 2. Prepare metadata
    const currentIap = artist.iap_context || {};
    const updatedIap = {
      ...currentIap,
      video_metadata: {
        ...(currentIap.video_metadata || {}),
        subtitles: subtitles
      }
    };

    // 3. Update DB
    await sqlDirect`UPDATE artists SET iap_context = ${updatedIap} WHERE id = ${artist.id}`;

    console.log("✨ Subtitles successfully migrated to iap_context!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await sqlDirect.end();
  }
}

migrateSubtitles().then(() => process.exit(0));
