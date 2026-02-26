import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function discoverMoreSubtypes() {
  console.log('🔍 [CHRIS-PROTOCOL] Discovering additional Telephony Subtypes from briefings...');

  try {
    // We scannen briefings op unieke termen die we nog niet in onze 7 subtypes hebben
    const samples = await sql`
      SELECT 
        oi.meta_data->>'briefing' as briefing,
        oi.name as product_name
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      WHERE o.created_at >= '2023-01-01'
        AND (oi.meta_data->>'usage' ILIKE '%telefonie%' OR oi.name ILIKE '%telefoon%')
      LIMIT 200
    `;

    const foundTerms = new Set<string>();
    const patterns = [
      /keuzemenu/gi, /wacht/gi, /voicemail/gi, /welkom/gi, /gesloten/gi, /vakantie/gi, /nood/gi,
      /nacht/gi, /weekend/gi, /lunch/gi, /pauze/gi, /overloop/gi, /bezet/gi, /buiten kantooruren/gi,
      /doorschakelen/gi, /on-hold/gi, /promotie/gi, /actie/gi, /collega/gi, /afwezig/gi,
      /directie/gi, /secretariaat/gi, /magazijn/gi, /boekhouding/gi, /support/gi, /helpdesk/gi
    ];

    samples.forEach(s => {
      const text = (s.briefing || "") + " " + (s.product_name || "");
      patterns.forEach(p => {
        if (text.match(p)) {
          foundTerms.add(p.source.replace(/\\/g, ''));
        }
      });
    });

    console.log('\n--- POTENTIAL NEW SUBTYPES / TAGS DISCOVERED ---');
    console.log(Array.from(foundTerms).sort());

    // Uitgebreide lijst van subtypes voorbereiden
    const extendedSubtypes = [
      { name: 'Welkomstboodschap', slug: 'welkomstboodschap', icon: 'DoorOpen' },
      { name: 'Keuzemenu (IVR)', slug: 'keuzemenu-ivr', icon: 'ListTree' },
      { name: 'Wachtmuziek / Info', slug: 'wachtmuziek-info', icon: 'Music' },
      { name: 'Voicemail (Persoonlijk)', slug: 'voicemail-persoonlijk', icon: 'User' },
      { name: 'Voicemail (Algemeen)', slug: 'voicemail-algemeen', icon: 'Users' },
      { name: 'Vakantie / Gesloten', slug: 'vakantie-gesloten', icon: 'Palmtree' },
      { name: 'Noodlijn / Urgentie', slug: 'noodlijn-urgentie', icon: 'AlertTriangle' },
      // Nieuwe ontdekkingen
      { name: 'Buiten Kantooruren', slug: 'buiten-kantooruren', icon: 'Moon' },
      { name: 'Lunchpauze / Tijdelijk Afwezig', slug: 'lunchpauze', icon: 'Coffee' },
      { name: 'On-Hold Marketing / Promo', slug: 'on-hold-promo', icon: 'Tag' },
      { name: 'Doorschakeling / Transfer', slug: 'doorschakeling', icon: 'Forward' },
      { name: 'Bezet / Alle Lijnen In Gebruik', slug: 'bezet-melding', icon: 'PhoneOff' },
      { name: 'Afdelingsmenu (Support/Sales)', slug: 'afdelingsmenu', icon: 'LayoutGrid' },
      { name: 'Nachtstand', slug: 'nachtstand', icon: 'Stars' }
    ];

    console.log('\n🚀 Proposed Extended Subtypes List:');
    console.table(extendedSubtypes);

    // Update de tabel met de uitgebreide lijst
    for (const st of extendedSubtypes) {
      await sql`
        INSERT INTO public.telephony_subtypes (name, slug, icon)
        VALUES (${st.name}, ${st.slug}, ${st.icon})
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
      `;
    }
    console.log('\n✅ telephony_subtypes table updated with extended list.');

  } catch (error) {
    console.error('❌ Discovery failed:', error);
  } finally {
    await sql.end();
  }
}

discoverMoreSubtypes();
