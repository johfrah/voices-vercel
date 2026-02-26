import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 STARTING NUCLEAR HANDSHAKE MIGRATION: actor_reviews');

  // 1. Maak de koppeltabel aan via RPC of direct SQL (indien ondersteund)
  // CHRIS-PROTOCOL: We gaan ervan uit dat de tabel via de schema sync al is voorbereid of we doen het hier hard.
  const { error: tableError } = await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.actor_reviews (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES public.actors(id) ON DELETE CASCADE,
        review_id INTEGER REFERENCES public.reviews(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(actor_id, review_id)
      );
      
      -- Indexen voor 0ms latency
      CREATE INDEX IF NOT EXISTS idx_actor_reviews_actor_id ON public.actor_reviews(actor_id);
      CREATE INDEX IF NOT EXISTS idx_actor_reviews_review_id ON public.actor_reviews(review_id);
    `
  });

  if (tableError) {
    console.error('❌ Failed to create table:', tableError);
    // Fallback: Als RPC niet bestaat, rapporteren we dit voor handmatige actie in Supabase Dashboard
  }

  // 2. Haal de 64 Johfrah reviews op (ID 1760)
  const { data: johfrahReviews } = await supabase
    .from('reviews')
    .select('id')
    .or('text_nl.ilike.%johfrah%,text_en.ilike.%johfrah%');

  if (johfrahReviews && johfrahReviews.length > 0) {
    const inserts = johfrahReviews.map(r => ({
      actor_id: 1760,
      review_id: r.id
    }));

    const { error: insertError } = await supabase
      .from('actor_reviews')
      .upsert(inserts, { onConflict: 'actor_id,review_id' });

    if (insertError) console.error('❌ Failed to link Johfrah reviews:', insertError);
    else console.log(`✅ Linked ${johfrahReviews.length} reviews to Johfrah (ID 1760)`);
  }

  console.log('🏁 MIGRATION COMPLETED: Handshake Truth is verankerd.');
}

migrate();
