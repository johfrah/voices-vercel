
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connectionString.replace('pgbouncer=true', 'sslmode=require'), { ssl: { rejectUnauthorized: false } });

async function runFix() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: DIRECT SQL SCHEMA FIX ---');
  
  try {
    console.log('Adding columns to ademing_tracks...');
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS maker_id INTEGER;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS series_id INTEGER;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS theme TEXT;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS element TEXT;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS series_order INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS short_description TEXT;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS long_description TEXT;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS cover_image_url TEXT;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS video_background_url TEXT;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS subtitle_data JSONB;`;
    await sql`ALTER TABLE ademing_tracks ADD COLUMN IF NOT EXISTS transcript TEXT;`;
    
    console.log('Adding columns to ademing_series...');
    await sql`ALTER TABLE ademing_series ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;`;
    await sql`ALTER TABLE ademing_series ADD COLUMN IF NOT EXISTS cover_image_url TEXT;`;
    await sql`ALTER TABLE ademing_series ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'rust';`;
    await sql`ALTER TABLE ademing_series ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();`;

    console.log('Creating ademing_makers table...');
    await sql`CREATE TABLE IF NOT EXISTS ademing_makers (
      id SERIAL PRIMARY KEY,
      short_name TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      hero_image_url TEXT,
      bio TEXT,
      website TEXT,
      instagram TEXT,
      is_public BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`;

    console.log('Creating ademing_background_music table...');
    await sql`CREATE TABLE IF NOT EXISTS ademing_background_music (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      element TEXT,
      is_public BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`;

    console.log('Syncing slugs...');
    const tracks = [
      { id: 1, slug: 'aarde-1' },
      { id: 2, slug: 'aarde-2' },
      { id: 3, slug: 'aarde-dummy' },
      { id: 4, slug: 'stiltemeditatie' },
      { id: 5, slug: 'vuur-1' }
    ];

    for (const track of tracks) {
      await sql`UPDATE ademing_tracks SET slug = ${track.slug} WHERE id = ${track.id};`;
      console.log(`Updated track ${track.id} with slug ${track.slug}`);
    }

    console.log('SUCCESS: Schema and data fixed.');
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    await sql.end();
  }
}

runFix();
