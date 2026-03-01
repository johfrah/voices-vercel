#!/usr/bin/env tsx
/**
 * Verify Studio Live - v2.16.118
 * Simulates browser request to verify workshop filtering
 */

async function verifyStudioLive() {
  console.log('\n🔍 STUDIO LIVE VERIFICATION - v2.16.118\n');
  console.log('='.repeat(80));

  try {
    // 1. Check version
    console.log('\n📌 Step 1: Checking live version...');
    const configRes = await fetch('https://www.voices.be/api/admin/config', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!configRes.ok) {
      console.log(`   ⚠️  Config API returned ${configRes.status}`);
    } else {
      const config = await configRes.json();
      console.log(`   ✅ Live version: ${config._version || 'unknown'}`);
      
      if (config._version !== '2.16.118') {
        console.log(`   ⚠️  Expected v2.16.118, got ${config._version}`);
      }
    }

    // 2. Check workshops API with Studio filter
    console.log('\n📌 Step 2: Checking workshops API (world_id: 2)...');
    const workshopsRes = await fetch('https://www.voices.be/api/studio/workshops', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!workshopsRes.ok) {
      console.log(`   ❌ Workshops API returned ${workshopsRes.status}`);
      const text = await workshopsRes.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    } else {
      const data = await workshopsRes.json();
      const workshops = data.workshops || [];
      
      console.log(`   ✅ Found ${workshops.length} workshops for Studio`);
      
      if (workshops.length === 0) {
        console.log(`   ❌ FATAL: No workshops returned!`);
      } else {
        console.log('\n📚 Workshop Details:\n');
        
        for (const workshop of workshops) {
          const hasEditions = workshop.editions && workshop.editions.length > 0;
          const ctaType = hasEditions ? 'Boek Nu' : 'Meld je aan';
          
          console.log(`   ${workshop.id}. ${workshop.title || 'No title'}`);
          console.log(`      Slug: ${workshop.slug}`);
          console.log(`      Editions: ${workshop.editions?.length || 0} upcoming`);
          console.log(`      CTA: ${ctaType}`);
          console.log(`      World ID: ${workshop.world_id}`);
          console.log('');
        }
      }
    }

    // 3. Summary
    console.log('='.repeat(80));
    console.log('\n🎯 VERIFICATION SUMMARY:');
    console.log('   - Version should be v2.16.118');
    console.log('   - ALL live workshops with world_id=2 should appear');
    console.log('   - Workshops with upcoming editions: "Boek Nu"');
    console.log('   - Workshops without upcoming editions: "Meld je aan"');
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ Verification Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

verifyStudioLive();
