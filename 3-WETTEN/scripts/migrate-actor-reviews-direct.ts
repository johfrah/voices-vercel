import postgres from 'postgres';

const databaseUrl = 'postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';
const sql = postgres(databaseUrl, { ssl: 'require' });

async function migrate() {
  console.log('🚀 STARTING NUCLEAR HANDSHAKE MIGRATION (Direct SQL): actor_reviews');

  try {
    // 1. Maak de koppeltabel aan
    await sql`
      CREATE TABLE IF NOT EXISTS public.actor_reviews (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES public.actors(id) ON DELETE CASCADE,
        review_id INTEGER REFERENCES public.reviews(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(actor_id, review_id)
      );
    `;
    console.log('✅ Table actor_reviews created or already exists.');

    // 2. Indexen voor 0ms latency
    await sql`CREATE INDEX IF NOT EXISTS idx_actor_reviews_actor_id ON public.actor_reviews(actor_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_actor_reviews_review_id ON public.actor_reviews(review_id);`;
    console.log('✅ Indexes created.');

    // 3. Haal Johfrah reviews op (ID 1760)
    const johfrahReviews = await sql`
      SELECT id FROM public.reviews 
      WHERE text_nl ILIKE '%johfrah%' 
      OR text_en ILIKE '%johfrah%'
    `;

    if (johfrahReviews.length > 0) {
      const inserts = johfrahReviews.map(r => ({
        actor_id: 1760,
        review_id: r.id
      }));

      await sql`
        INSERT INTO public.actor_reviews ${sql(inserts, 'actor_id', 'review_id')}
        ON CONFLICT (actor_id, review_id) DO NOTHING
      `;
      console.log(`✅ Linked ${johfrahReviews.length} reviews to Johfrah (ID 1760)`);
    }

    console.log('🏁 MIGRATION COMPLETED: Handshake Truth is verankerd.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
