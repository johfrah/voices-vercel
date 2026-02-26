import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function setupTelephonySubtypes() {
  console.log('🛡️ [CHRIS-PROTOCOL] Setting up Telephony Subtypes (IVR, Voicemail, etc.)...');

  try {
    // 1. Maak de telephony_subtypes tabel aan
    await sql`
      CREATE TABLE IF NOT EXISTS public.telephony_subtypes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ telephony_subtypes table created.');

    // 2. Seed de subtypes
    const subtypes = [
      { name: 'Welkomstboodschap', slug: 'welkomstboodschap', icon: 'DoorOpen' },
      { name: 'Keuzemenu (IVR)', slug: 'keuzemenu-ivr', icon: 'ListTree' },
      { name: 'Wachtmuziek / Info', slug: 'wachtmuziek-info', icon: 'Music' },
      { name: 'Voicemail (Persoonlijk)', slug: 'voicemail-persoonlijk', icon: 'User' },
      { name: 'Voicemail (Algemeen)', slug: 'voicemail-algemeen', icon: 'Users' },
      { name: 'Vakantie / Gesloten', slug: 'vakantie-gesloten', icon: 'Palmtree' },
      { name: 'Noodlijn / Urgentie', slug: 'noodlijn-urgentie', icon: 'AlertTriangle' }
    ];

    for (const st of subtypes) {
      await sql`
        INSERT INTO public.telephony_subtypes (name, slug, icon)
        VALUES (${st.name}, ${st.slug}, ${st.icon})
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
      `;
    }
    console.log('✅ Seeded telephony subtypes.');

    // 3. Voeg subtype_id toe aan actor_demos (indien nog niet aanwezig)
    await sql`ALTER TABLE public.actor_demos ADD COLUMN IF NOT EXISTS telephony_subtype_id INTEGER REFERENCES public.telephony_subtypes(id)`;
    console.log('✅ Added telephony_subtype_id column to actor_demos.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await sql.end();
  }
}

setupTelephonySubtypes();
