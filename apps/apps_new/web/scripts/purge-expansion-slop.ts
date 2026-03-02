import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";

async function purgeExpansionSlop() {
  const sql = postgres(DATABASE_URL);
  console.log('🧹 Starting Expansion Slop Purge...');

  try {
    // 1. Find slop where short original text was expanded into long slogans
    const slopItems = await sql`
      SELECT id, translation_key, lang, original_text, translated_text 
      FROM translations 
      WHERE length(original_text) < 15 
      AND length(translated_text) > 30
      AND original_text NOT ILIKE '%...%'
    `;

    console.log(`🔍 Found ${slopItems.length} potential slop items.`);

    if (slopItems.length > 0) {
      const idsToDelete = slopItems.map(item => item.id);
      
      // Also specifically target 'Voices.be' slop
      const voicesBeSlop = await sql`
        SELECT id FROM translations 
        WHERE (original_text = 'Voices.be' OR original_text = 'Voices')
        AND translated_text != original_text
      `;
      
      const allIds = [...new Set([...idsToDelete, ...voicesBeSlop.map(i => i.id)])];
      
      if (allIds.length > 0) {
        console.log(`🗑️ Deleting ${allIds.length} slop items...`);
        await sql`DELETE FROM translations WHERE id IN ${sql(allIds)}`;
        console.log('✅ Slop purged successfully.');
      }
    }

    // 2. Fix 'Voices.be' in the registry if it was accidentally changed (unlikely but safe to check)
    // Actually, let's just make sure we don't have NL translations that are different from original for brand names
    const nlBrandSlop = await sql`
      DELETE FROM translations 
      WHERE lang = 'nl' 
      AND original_text = 'Voices.be' 
      AND translated_text != 'Voices.be'
    `;
    console.log('✅ Cleaned up NL brand slop.');

  } catch (err) {
    console.error('❌ Purge failed:', err);
  } finally {
    await sql.end();
  }
}

purgeExpansionSlop();
