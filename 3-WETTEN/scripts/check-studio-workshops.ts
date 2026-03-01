#!/usr/bin/env tsx
/**
 * Check Studio Workshops - Forensic Inspection
 * Verifies which workshops are active for world_id: 2 (Studio)
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkStudioWorkshops() {
  console.log('\n🔍 STUDIO WORKSHOP FORENSIC AUDIT\n');
  console.log('='.repeat(80));

  try {
    // Get all workshops for Studio (world_id: 2) with edition counts
    const result = await db.execute(sql`
      SELECT 
        w.id,
        w.slug,
        w.title->>'nl-BE' as title_nl,
        w.status,
        w.world_id,
        COUNT(DISTINCT we.id) as edition_count,
        COUNT(DISTINCT CASE WHEN we.start_date > NOW() THEN we.id END) as future_editions
      FROM workshops w
      LEFT JOIN workshop_editions we ON we.workshop_id = w.id AND we.status = 'published'
      WHERE w.world_id = 2 AND w.status = 'published'
      GROUP BY w.id, w.slug, w.title, w.status, w.world_id
      ORDER BY w.id
    `);

    const workshops = result.rows as any[];
    console.log(`\n✅ Found ${workshops.length} published Studio workshops:\n`);

    for (const workshop of workshops) {
      console.log(`\n📚 Workshop #${workshop.id}: ${workshop.title_nl || 'No title'}`);
      console.log(`   Slug: ${workshop.slug}`);
      console.log(`   Status: ${workshop.status}`);
      console.log(`   World: ${workshop.world_id}`);
      console.log(`   Editions: ${workshop.edition_count} total, ${workshop.future_editions} future`);
      
      if (parseInt(workshop.future_editions) > 0) {
        console.log(`   ✅ Has future editions - should show "Boek Nu"`);
      } else {
        console.log(`   ⚠️  No future editions - should show "Meld je aan"`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('   - ALL workshops above should appear in WorkshopCarousel');
    console.log('   - Workshops WITH future editions: "Boek Nu" CTA');
    console.log('   - Workshops WITHOUT future editions: "Meld je aan" CTA');
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Database Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkStudioWorkshops();
