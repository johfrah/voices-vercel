import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const actorTruth = [
  { wp_id: 212306, name: 'Béatrice', native: 3, extra: [5] },
  { wp_id: 193692, name: 'Bernard', native: 3, extra: [] },
  { wp_id: 251466, name: 'Marilyn', native: 3, extra: [5, 2, 8] },
  { wp_id: 194251, name: 'Veronique', native: 3, extra: [] },
  { wp_id: 228397, name: 'Annelies', native: 1, extra: [5, 3] },
  { wp_id: 189009, name: 'Birgit', native: 1, extra: [5, 3, 7] },
  { wp_id: 196832, name: 'Christina', native: 1, extra: [5, 3, 7, 8] },
  { wp_id: 186362, name: 'Gitta', native: 1, extra: [5] },
  { wp_id: 189058, name: 'Hannelore', native: 1, extra: [5, 3] },
  { wp_id: 182508, name: 'Johfrah', native: 1, extra: [5, 3] },
  { wp_id: 207784, name: 'Kirsten', native: 1, extra: [5, 3, 8] },
  { wp_id: 183809, name: 'Korneel', native: 1, extra: [5, 3] },
  { wp_id: 184071, name: 'Kristien', native: 1, extra: [5, 3, 7, 8] },
  { wp_id: 200319, name: 'Larissa', native: 1, extra: [5, 3, 7, 8] },
  { wp_id: 187940, name: 'Laura', native: 1, extra: [5, 3] },
  { wp_id: 186539, name: 'Mark', native: 1, extra: [] },
  { wp_id: 258121, name: 'Mona', native: 1, extra: [] },
  { wp_id: 187949, name: 'Patrick', native: 1, extra: [5, 3] },
  { wp_id: 194242, name: 'Sen', native: 1, extra: [5, 3] },
  { wp_id: 186533, name: 'Serge', native: 1, extra: [5, 3, 7] },
  { wp_id: 194245, name: 'Toos', native: 1, extra: [5] },
  { wp_id: 190797, name: 'Veerle', native: 1, extra: [7] },
  { wp_id: 207644, name: 'Birgit', native: 7, extra: [5, 3, 8] },
  { wp_id: 187185, name: 'Kaja', native: 7, extra: [5, 3] },
  { wp_id: 240191, name: 'Nadja', native: 7, extra: [5] },
  { wp_id: 275258, name: 'Sebastian', native: 7, extra: [] },
  { wp_id: 186401, name: 'Stephan', native: 7, extra: [5] },
  { wp_id: 198586, name: 'Sue', native: 7, extra: [5] },
  { wp_id: 187179, name: 'Sylvia', native: 7, extra: [5] },
  { wp_id: 246138, name: 'Yvonne', native: 7, extra: [5] },
  { wp_id: 251546, name: 'Andreas', native: 11, extra: [] },
  { wp_id: 251554, name: 'Diana', native: 11, extra: [] },
  { wp_id: 251576, name: 'Florian', native: 11, extra: [] },
  { wp_id: 251588, name: 'Alex', native: 8, extra: [] },
  { wp_id: 251551, name: 'Aurora', native: 8, extra: [] },
  { wp_id: 207842, name: 'Joel', native: 8, extra: [] },
  { wp_id: 218621, name: 'Maria', native: 8, extra: [] },
  { wp_id: 275373, name: 'Maria', native: 8, extra: [5, 3] },
  { wp_id: 218271, name: 'Marina', native: 8, extra: [] },
  { wp_id: 240105, name: 'delphine', native: 4, extra: [] },
  { wp_id: 208584, name: 'Estelle', native: 4, extra: [] },
  { wp_id: 275353, name: 'Julie', native: 4, extra: [] },
  { wp_id: 182527, name: 'Thomas', native: 4, extra: [] },
  { wp_id: 203592, name: 'Emma', native: 5, extra: [] },
  { wp_id: 258292, name: 'Mia', native: 5, extra: [] },
  { wp_id: 205727, name: 'Mike', native: 5, extra: [] },
  { wp_id: 194211, name: 'Nicolas', native: 5, extra: [3] },
  { wp_id: 205174, name: 'Sarah', native: 5, extra: [] },
  { wp_id: 182525, name: 'Sean', native: 5, extra: [] },
  { wp_id: 208205, name: 'Andrea', native: 9, extra: [] },
  { wp_id: 251579, name: 'Barbara', native: 9, extra: [5] },
  { wp_id: 251580, name: 'Francesca', native: 9, extra: [] },
  { wp_id: 251581, name: 'Giovanni', native: 9, extra: [5] },
  { wp_id: 208777, name: 'Paola', native: 9, extra: [] },
  { wp_id: 243232, name: 'silvia', native: 9, extra: [] },
  { wp_id: 186379, name: 'Bart', native: 2, extra: [5] },
  { wp_id: 186284, name: 'Carolina', native: 2, extra: [5] },
  { wp_id: 260015, name: 'Dunja', native: 2, extra: [7] },
  { wp_id: 186323, name: 'Gwenny', native: 2, extra: [] },
  { wp_id: 183772, name: 'Ilari', native: 2, extra: [5, 7] },
  { wp_id: 186112, name: 'Jakob', native: 2, extra: [] },
  { wp_id: 182521, name: 'Klaas', native: 2, extra: [5] },
  { wp_id: 216105, name: 'Kristel', native: 2, extra: [] },
  { wp_id: 194214, name: 'Lonneke', native: 2, extra: [5, 7] },
  { wp_id: 186366, name: 'Lotte', native: 2, extra: [5] },
  { wp_id: 184388, name: 'Machteld', native: 2, extra: [5, 3, 7] },
  { wp_id: 196562, name: 'Petra', native: 2, extra: [5, 3, 7] },
  { wp_id: 194248, name: 'Ronald', native: 2, extra: [] },
  { wp_id: 184239, name: 'Ruben', native: 2, extra: [5] },
  { wp_id: 186373, name: 'Sven', native: 2, extra: [] },
  { wp_id: 187608, name: 'Youri', native: 2, extra: [5] },
  { wp_id: 251521, name: 'Agnieszka', native: 10, extra: [] },
  { wp_id: 251501, name: 'Aleksander', native: 10, extra: [] },
  { wp_id: 251524, name: 'Bartek', native: 10, extra: [] },
  { wp_id: 251517, name: 'Maciek', native: 10, extra: [] },
  { wp_id: 226081, name: 'Alyson', native: 6, extra: [] },
  { wp_id: 199075, name: 'Catherine', native: 6, extra: [8] },
];

async function syncCombinatieTalen() {
  console.log('☢️ Starting Nuclear Sync: Combinatietalen (ID-First)...');

  for (const truth of actorTruth) {
    console.log(`\n--- Processing ${truth.name} (WP ID: ${truth.wp_id}) ---`);

    // 1. Find internal actor ID
    const { data: actor, error: actorError } = await supabase
      .from('actors')
      .select('id')
      .eq('wp_product_id', truth.wp_id)
      .single();

    if (actorError || !actor) {
      console.error(`❌ Actor not found for WP ID ${truth.wp_id}`);
      continue;
    }

    const actorId = actor.id;

    // 2. Update native_language_id in actors table
    const { error: updateError } = await supabase
      .from('actors')
      .update({ native_language_id: truth.native })
      .eq('id', actorId);

    if (updateError) {
      console.error(`❌ Error updating native_language_id for actor ${actorId}:`, updateError.message);
    } else {
      console.log(`✅ Updated native_language_id to ${truth.native}`);
    }

    // 3. Clear existing actor_languages mappings for this actor
    const { error: deleteError } = await supabase
      .from('actor_languages')
      .delete()
      .eq('actor_id', actorId);

    if (deleteError) {
      console.error(`❌ Error clearing actor_languages for actor ${actorId}:`, deleteError.message);
      continue;
    }

    // 4. Insert native language mapping
    const { error: nativeInsertError } = await supabase
      .from('actor_languages')
      .insert({
        actor_id: actorId,
        language_id: truth.native,
        is_native: true
      });

    if (nativeInsertError) {
      console.error(`❌ Error inserting native lang ${truth.native} for actor ${actorId}:`, nativeInsertError.message);
    } else {
      console.log(`✅ Linked native language: ${truth.native}`);
    }

    // 5. Insert extra language mappings
    for (const extraLangId of truth.extra) {
      const { error: extraInsertError } = await supabase
        .from('actor_languages')
        .insert({
          actor_id: actorId,
          language_id: extraLangId,
          is_native: false
        });

      if (extraInsertError) {
        console.error(`❌ Error inserting extra lang ${extraLangId} for actor ${actorId}:`, extraInsertError.message);
      } else {
        console.log(`✅ Linked extra language: ${extraLangId}`);
      }
    }
  }

  console.log('\n🏁 [NUCLEAR SYNC COMPLETE]');
}

syncCombinatieTalen().catch(console.error);
