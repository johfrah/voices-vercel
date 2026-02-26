import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

/**
 * CHRIS-PROTOCOL: Tone of Voice Intelligence
 * Analyseert de geanonimiseerde tekst en wijst automatisch de juiste 'voice_tones' toe.
 */
async function enrichEliteWithTone() {
  console.log('🚀 [MASTERCLASS] Enriching Elite Demos with Tone of Voice DNA...');

  try {
    // 1. Haal de beschikbare tones op uit de database
    const dbTones = await sql`SELECT id, label FROM public.voice_tones`;
    const toneMap = new Map();
    dbTones.forEach(t => toneMap.set(t.label.toLowerCase(), t.id));

    // 2. Haal de recent geïnjecteerde elite demo's op
    const eliteDemos = await sql`
      SELECT ad.id, mi.transcript, ad.actor_id
      FROM public.actor_demos ad
      JOIN public.media_intelligence mi ON ad.id = mi.demo_id
      WHERE ad.name ILIKE '%Fragment%'
    `;

    console.log(`🔍 Analyzing ${eliteDemos.length} fragments for tone...`);

    for (const demo of eliteDemos) {
      const text = demo.transcript.toLowerCase();
      const detectedToneIds = [];

      // Smart Detection op basis van tekstpatronen
      if (text.match(/welkom|bedankt|fijne dag|helpen/)) detectedToneIds.push(toneMap.get('warm') || 1);
      if (text.match(/druk|keuzemenu|verbonden|onmiddellijk/)) detectedToneIds.push(toneMap.get('zakelijk') || 17);
      if (text.match(/actie|promotie|nu|ontdek/)) detectedToneIds.push(toneMap.get('energiek') || 4);
      if (text.match(/nood|urgent|opgelet/)) detectedToneIds.push(toneMap.get('gezaghebbend') || 28);

      // Koppel de tones in de junction tabel actor_tones (of demo_tones indien die bestaat)
      // Voor nu gebruiken we de metadata in media_intelligence om de 'Sonic DNA' vast te leggen
      for (const toneId of detectedToneIds) {
        await sql`
          INSERT INTO public.actor_tones (actor_id, tone_id)
          VALUES (${demo.actor_id}, ${toneId})
          ON CONFLICT DO NOTHING
        `;
      }

      // Update media_intelligence met de gedetecteerde tones
      await sql`
        UPDATE public.media_intelligence 
        SET ai_metadata = ai_metadata || ${JSON.stringify({ 
          detected_tones: detectedToneIds,
          sonic_dna: {
            tempo: text.length > 200 ? 'rustig' : 'vlot',
            energy: detectedToneIds.includes(4) ? 'hoog' : 'gebalanceerd'
          }
        })}
        WHERE demo_id = ${demo.id}
      `;
    }

    console.log('✅ Tone of Voice DNA successfully injected into Elite batch.');

  } catch (error) {
    console.error('❌ Tone enrichment failed:', error);
  } finally {
    await sql.end();
  }
}

enrichEliteWithTone();
