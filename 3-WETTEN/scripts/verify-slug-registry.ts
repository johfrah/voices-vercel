import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function verifyRegistry() {
  console.log('🔍 [CHRIS-PROTOCOL] Verifying slug_registry integrity...');

  try {
    // 1. Check for missing actors in registry
    const missingActors = await sql`
      SELECT a.id, a.first_name, a.slug 
      FROM actors a 
      LEFT JOIN slug_registry sr ON a.id = sr.entity_id AND sr.routing_type = 'actor'
      WHERE sr.id IS NULL AND a.status = 'live' AND a.is_public = true
    `;
    
    if (missingActors.length > 0) {
      console.log(`❌ Found ${missingActors.length} live/public actors missing from slug_registry:`);
      console.table(missingActors);
    } else {
      console.log('✅ All live/public actors are present in slug_registry.');
    }

    // 2. Check for missing articles in registry
    const missingArticles = await sql`
      SELECT c.id, c.title, c.slug 
      FROM content_articles c 
      LEFT JOIN slug_registry sr ON c.id = sr.entity_id AND sr.routing_type = 'article'
      WHERE sr.id IS NULL AND c.status = 'publish'
    `;
    
    if (missingArticles.length > 0) {
      console.log(`❌ Found ${missingArticles.length} published articles missing from slug_registry:`);
      console.table(missingArticles);
    } else {
      console.log('✅ All published articles are present in slug_registry.');
    }

    // 3. Check for duplicates in registry
    const duplicates = await sql`
      SELECT slug, market_code, COUNT(*) 
      FROM slug_registry 
      WHERE is_active = true
      GROUP BY slug, market_code 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate active slugs in registry:`);
      console.table(duplicates);
    } else {
      console.log('✅ No duplicate active slugs found in registry.');
    }

    // 4. Summary of registry types
    const summary = await sql`
      SELECT routing_type, COUNT(*) 
      FROM slug_registry 
      GROUP BY routing_type
    `;
    console.log('\n--- REGISTRY SUMMARY ---');
    console.table(summary);

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await sql.end();
  }
}

verifyRegistry();
