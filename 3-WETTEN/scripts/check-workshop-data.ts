import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { workshop_editions } from '../../1-SITE/packages/database/src/schema';
import { eq } from 'drizzle-orm';

async function checkWorkshopData() {
  try {
    console.log('🔍 Checking workshop_editions table...\n');
    
    const editions = await db.select().from(workshop_editions);
    
    console.log(`📊 Total editions found: ${editions.length}\n`);
    
    if (editions.length === 0) {
      console.log('❌ NO WORKSHOP EDITIONS FOUND IN DATABASE');
      console.log('This explains why the carousel is empty!\n');
      return;
    }
    
    console.log('📋 Workshop Editions:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    editions.forEach((edition, index) => {
      console.log(`${index + 1}. ${edition.title || 'Untitled'}`);
      console.log(`   ID: ${edition.id}`);
      console.log(`   Status: ${edition.status}`);
      console.log(`   Start Date: ${edition.start_date}`);
      console.log(`   Location: ${edition.location || 'N/A'}`);
      console.log(`   Max Participants: ${edition.max_participants || 'N/A'}`);
      console.log(`   Price: €${edition.price || 'N/A'}`);
      console.log(`   Visible: ${edition.is_visible ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    const visibleEditions = editions.filter(e => e.is_visible);
    const upcomingEditions = editions.filter(e => e.status === 'upcoming' || e.status === 'open');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Visible editions: ${visibleEditions.length}`);
    console.log(`📅 Upcoming/Open editions: ${upcomingEditions.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    if (visibleEditions.length === 0) {
      console.log('⚠️  WARNING: No visible editions found!');
      console.log('The carousel will be empty because all editions have is_visible = false\n');
    }
    
  } catch (error) {
    console.error('❌ Error checking workshop data:', error);
    throw error;
  }
}

checkWorkshopData();
