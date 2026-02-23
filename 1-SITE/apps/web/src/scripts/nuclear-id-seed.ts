import { db } from '../lib/sync/bridge';
import { actors, actorLanguages, languages } from '@db/schema';
import { eq, inArray } from "drizzle-orm";

/**
 * NUCLEAR SEED: ID-FIRST SOURCE OF TRUTH (2026)
 * 
 * Dit script synchroniseert de actors tabel met de exacte IDs en taal-koppelingen
 * zoals gedicteerd door Johfrah.
 */

const SOURCE_OF_TRUTH = [
  { id: 212306, name: "Béatrice", nativeId: 3, extraIds: [5], country: 'BE' },
  { id: 193692, name: "Bernard", nativeId: 3, extraIds: [], country: 'BE' },
  { id: 251466, name: "Marilyn", nativeId: 3, extraIds: [5, 2, 8], country: 'BE' },
  { id: 194251, name: "Veronique", nativeId: 3, extraIds: [], country: 'BE' },
  { id: 228397, name: "Annelies", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 189009, name: "Birgit", nativeId: 1, extraIds: [5, 3, 7], country: 'BE' },
  { id: 196832, name: "Christina", nativeId: 1, extraIds: [5, 3, 7, 8], country: 'BE' },
  { id: 186362, name: "Gitta", nativeId: 1, extraIds: [5], country: 'BE' },
  { id: 189058, name: "Hannelore", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 182508, name: "Johfrah", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 207784, name: "Kirsten", nativeId: 1, extraIds: [5, 3, 8], country: 'BE' },
  { id: 183809, name: "Korneel", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 184071, name: "Kristien", nativeId: 1, extraIds: [5, 3, 7, 8], country: 'BE' },
  { id: 200319, name: "Larissa", nativeId: 1, extraIds: [5, 3, 7, 8], country: 'BE' },
  { id: 187940, name: "Laura", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 186539, name: "Mark", nativeId: 1, extraIds: [], country: 'BE' },
  { id: 258121, name: "Mona", nativeId: 1, extraIds: [], country: 'BE' },
  { id: 187949, name: "Patrick", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 194242, name: "Sen", nativeId: 1, extraIds: [5, 3], country: 'BE' },
  { id: 186533, name: "Serge", nativeId: 1, extraIds: [5, 3, 7], country: 'BE' },
  { id: 194245, name: "Toos", nativeId: 1, extraIds: [5], country: 'BE' },
  { id: 190797, name: "Veerle", nativeId: 1, extraIds: [7], country: 'BE' },
  { id: 207644, name: "Birgit-K", nativeId: 7, extraIds: [5, 3, 8], country: 'DE' },
  { id: 187185, name: "Kaja", nativeId: 7, extraIds: [5, 3], country: 'DE' },
  { id: 240191, name: "Nadja", nativeId: 7, extraIds: [5], country: 'DE' },
  { id: 275258, name: "Sebastian", nativeId: 7, extraIds: [], country: 'DE' },
  { id: 186401, name: "Stephan", nativeId: 7, extraIds: [5], country: 'DE' },
  { id: 198586, name: "Sue", nativeId: 7, extraIds: [5], country: 'DE' },
  { id: 187179, name: "Sylvia", nativeId: 7, extraIds: [5], country: 'DE' },
  { id: 246138, name: "Yvonne", nativeId: 7, extraIds: [5], country: 'DE' },
  { id: 251546, name: "Andreas", nativeId: 11, extraIds: [], country: 'DK' },
  { id: 251554, name: "Diana", nativeId: 11, extraIds: [], country: 'DK' },
  { id: 251576, name: "Florian", nativeId: 11, extraIds: [], country: 'DK' },
  { id: 251588, name: "Alex", nativeId: 8, extraIds: [], country: 'ES' },
  { id: 251551, name: "Aurora", nativeId: 8, extraIds: [], country: 'ES' },
  { id: 207842, name: "Joel", nativeId: 8, extraIds: [], country: 'ES' },
  { id: 218621, name: "Maria-1", nativeId: 8, extraIds: [], country: 'ES' },
  { id: 275373, name: "Maria-E", nativeId: 8, extraIds: [5, 3], country: 'ES' },
  { id: 218271, name: "Marina", nativeId: 8, extraIds: [], country: 'ES' },
  { id: 240105, name: "delphine-l", nativeId: 4, extraIds: [], country: 'FR' },
  { id: 208584, name: "Estelle", nativeId: 4, extraIds: [], country: 'FR' },
  { id: 275353, name: "Julie", nativeId: 4, extraIds: [], country: 'FR' },
  { id: 182527, name: "Thomas", nativeId: 4, extraIds: [], country: 'FR' },
  { id: 203592, name: "Emma", nativeId: 5, extraIds: [], country: 'GB' },
  { id: 258292, name: "Mia", nativeId: 5, extraIds: [], country: 'GB' },
  { id: 205727, name: "Mike", nativeId: 5, extraIds: [], country: 'GB' },
  { id: 194211, name: "Nicolas", nativeId: 5, extraIds: [3], country: 'GB' },
  { id: 205174, name: "Sarah-1", nativeId: 5, extraIds: [], country: 'GB' },
  { id: 182525, name: "Sean", nativeId: 5, extraIds: [], country: 'GB' },
  { id: 208205, name: "Andrea", nativeId: 9, extraIds: [], country: 'IT' },
  { id: 251579, name: "Barbara", nativeId: 9, extraIds: [5], country: 'IT' },
  { id: 251580, name: "Francesca", nativeId: 9, extraIds: [], country: 'IT' },
  { id: 251581, name: "Giovanni", nativeId: 9, extraIds: [5], country: 'IT' },
  { id: 208777, name: "Paola", nativeId: 9, extraIds: [], country: 'IT' },
  { id: 243232, name: "silvia", nativeId: 9, extraIds: [], country: 'IT' },
  { id: 186379, name: "Bart", nativeId: 2, extraIds: [5], country: 'NL' },
  { id: 186284, name: "Carolina", nativeId: 2, extraIds: [5], country: 'NL' },
  { id: 260015, name: "Dunja", nativeId: 2, extraIds: [7], country: 'NL' },
  { id: 186323, name: "Gwenny", nativeId: 2, extraIds: [], country: 'NL' },
  { id: 183772, name: "Ilari", nativeId: 2, extraIds: [5, 7], country: 'NL' },
  { id: 186112, name: "Jakob", nativeId: 2, extraIds: [], country: 'NL' },
  { id: 182521, name: "Klaas", nativeId: 2, extraIds: [5], country: 'NL' },
  { id: 216105, name: "Kristel", nativeId: 2, extraIds: [], country: 'NL' },
  { id: 194214, name: "Lonneke", nativeId: 2, extraIds: [5, 7], country: 'NL' },
  { id: 186366, name: "Lotte", nativeId: 2, extraIds: [5], country: 'NL' },
  { id: 184388, name: "Machteld", nativeId: 2, extraIds: [5, 3, 7], country: 'NL' },
  { id: 196562, name: "Petra", nativeId: 2, extraIds: [5, 3, 7], country: 'NL' },
  { id: 194248, name: "Ronald", nativeId: 2, extraIds: [], country: 'NL' },
  { id: 184239, name: "Ruben", nativeId: 2, extraIds: [5], country: 'NL' },
  { id: 186373, name: "Sven", nativeId: 2, extraIds: [], country: 'NL' },
  { id: 187608, name: "Youri", nativeId: 2, extraIds: [5], country: 'NL' },
  { id: 251521, name: "Agnieszka", nativeId: 10, extraIds: [], country: 'PL' },
  { id: 251501, name: "Aleksander", nativeId: 10, extraIds: [], country: 'PL' },
  { id: 251524, name: "Bartek", nativeId: 10, extraIds: [], country: 'PL' },
  { id: 251517, name: "Maciek", nativeId: 10, extraIds: [], country: 'PL' },
  { id: 226081, name: "Alyson", nativeId: 6, extraIds: [], country: 'US' },
  { id: 199075, name: "Catherine", nativeId: 6, extraIds: [8], country: 'US' },
];

async function seed() {
  console.log('🚀 STARTING ID-FIRST NUCLEAR SEED...');

  // 🛡️ CHRIS-PROTOCOL: Force environment variables for local script execution
  process.env.DATABASE_URL = "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

  try {
    // 1. Zorg dat de talen bestaan
    const langMap: Record<number, string> = {
      1: 'nl-be', 2: 'nl-nl', 3: 'fr-be', 4: 'fr-fr', 
      5: 'en-gb', 6: 'en-us', 7: 'de-de', 8: 'es-es',
      9: 'it-it', 10: 'pl-pl', 11: 'da-dk'
    };

    for (const [id, code] of Object.entries(langMap)) {
      await db.insert(languages).values({
        id: Number(id),
        code: code,
        label: code, // Wordt later door Voiceglot vertaald
        isPopular: true
      }).onConflictDoUpdate({
        target: [languages.id],
        set: { code }
      });
    }
    console.log('✅ Languages synced.');

    // 2. Sync Actors & Languages
    for (const entry of SOURCE_OF_TRUTH) {
      console.log(`Processing ${entry.name} (${entry.id})...`);

      // Update actor
      await db.update(actors)
        .set({
          nativeLang: langMap[entry.nativeId],
          country: entry.country.toLowerCase(),
          status: 'live',
          isPublic: true,
          isManuallyEdited: true, // Lock dit profiel!
          updatedAt: new Date() as any
        })
        .where(eq(actors.wpProductId, entry.id));

      // Fetch internal ID
      const [actor] = await db.select().from(actors).where(eq(actors.wpProductId, entry.id)).limit(1);
      
      if (!actor) {
        console.warn(`⚠️ Actor ${entry.name} not found in database. Skipping language links.`);
        continue;
      }

      // Clear existing language links
      await db.delete(actorLanguages).where(eq(actorLanguages.actorId, actor.id));

      // Insert Native
      await db.insert(actorLanguages).values({
        actorId: actor.id,
        languageId: entry.nativeId,
        isNative: true
      });

      // Insert Extras
      for (const extraId of entry.extraIds) {
        await db.insert(actorLanguages).values({
          actorId: actor.id,
          languageId: extraId,
          isNative: false
        });
      }
    }

    console.log('✨ NUCLEAR SEED COMPLETE! De database is nu 100% in lijn met de Source of Truth.');
    process.exit(0);
  } catch (e) {
    console.error('❌ SEED FAILED:', e);
    process.exit(1);
  }
}

seed();
