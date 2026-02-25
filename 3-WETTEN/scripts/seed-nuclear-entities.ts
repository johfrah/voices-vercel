import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { actorStatuses, experienceLevels, actorAttributes } from '../../1-SITE/packages/database/schema';
import { eq } from 'drizzle-orm';

async function seedNuclearEntities() {
  console.log('🚀 STARTING NUCLEAR ENTITY SEEDING...');

  try {
    // 1. Seed Actor Statuses
    console.log('Step 1: Seeding actor_statuses...');
    const statuses = [
      { code: 'live', label: 'Live', color: '#22c55e', isPublic: true, canOrder: true },
      { code: 'pending', label: 'Wacht op goedkeuring', color: '#eab308', isPublic: false, canOrder: false },
      { code: 'approved', label: 'Goedgekeurd', color: '#3b82f6', isPublic: false, canOrder: true },
      { code: 'rejected', label: 'Afgewezen', color: '#ef4444', isPublic: false, canOrder: false },
      { code: 'active', label: 'Actief', color: '#22c55e', isPublic: true, canOrder: true },
      { code: 'publish', label: 'Gepubliceerd', color: '#22c55e', isPublic: true, canOrder: true },
      { code: 'cancelled', label: 'Geannuleerd', color: '#6b7280', isPublic: false, canOrder: false }
    ];

    for (const s of statuses) {
      await db.insert(actorStatuses).values(s).onConflictDoUpdate({
        target: actorStatuses.code,
        set: s
      });
    }
    console.log('✅ Statuses seeded.');

    // 2. Seed Experience Levels
    console.log('Step 2: Seeding experience_levels...');
    const levels = [
      { code: 'junior', label: 'Junior', basePriceModifier: '0.80', icon: 'Baby' },
      { code: 'pro', label: 'Pro', basePriceModifier: '1.00', icon: 'Mic2' },
      { code: 'senior', label: 'Senior', basePriceModifier: '1.25', icon: 'Award' },
      { code: 'legend', label: 'Legend', basePriceModifier: '2.00', icon: 'Crown' }
    ];

    for (const l of levels) {
      await db.insert(experienceLevels).values(l).onConflictDoUpdate({
        target: experienceLevels.code,
        set: l
      });
    }
    console.log('✅ Experience levels seeded.');

    // 3. Seed some initial Attributes (Tones)
    console.log('Step 3: Seeding initial actor_attributes...');
    const attributes = [
      { type: 'tone', code: 'warm', label: 'Warm' },
      { type: 'tone', code: 'zakelijk', label: 'Zakelijk' },
      { type: 'tone', code: 'enthousiast', label: 'Enthousiast' },
      { type: 'tone', code: 'betrouwbaar', label: 'Betrouwbaar' },
      { type: 'category', code: 'commercial', label: 'Reclame' },
      { type: 'category', code: 'elearning', label: 'E-learning' }
    ];

    for (const a of attributes) {
      await db.insert(actorAttributes).values(a).onConflictDoUpdate({
        target: actorAttributes.code,
        set: a
      });
    }
    console.log('✅ Initial attributes seeded.');

    console.log('\n🏆 NUCLEAR SEEDING COMPLETE.');

  } catch (e) {
    console.error('\n❌ SEEDING FAILED:');
    console.error(e.message);
  }
  
  process.exit(0);
}

seedNuclearEntities();
