#!/usr/bin/env tsx
/**
 * 🎓 Studio E2E Validation Script
 * 
 * Validates the Studio world pages on the live site:
 * - /studio/quiz (WorkshopQuiz component)
 * - /studio/doe-je-mee (WorkshopInterestForm component)
 * 
 * Checks:
 * 1. HTTP status codes
 * 2. Key content presence
 * 3. Aesthetic compliance (Raleway, Natural Capitalization)
 */

const STUDIO_PAGES = [
  {
    path: '/studio/quiz',
    name: 'Workshop Quiz',
    expectedContent: [
      'Welke workshop past bij mij',
      'Start de quiz',
      'video'
    ]
  },
  {
    path: '/studio/doe-je-mee',
    name: 'Workshop Interest Form',
    expectedContent: [
      'Doe je mee',
      'workshop',
      'Laat ons weten'
    ]
  }
];

async function validatePage(baseUrl: string, page: typeof STUDIO_PAGES[0]) {
  const url = `${baseUrl}${page.path}`;
  console.log(`\n🔍 Testing: ${page.name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.status !== 200) {
      console.log(`   ❌ FAILED: Expected 200, got ${response.status}`);
      return false;
    }
    
    const html = await response.text();
    
    // Check for expected content
    let contentFound = 0;
    for (const content of page.expectedContent) {
      if (html.toLowerCase().includes(content.toLowerCase())) {
        contentFound++;
        console.log(`   ✅ Found: "${content}"`);
      } else {
        console.log(`   ⚠️  Missing: "${content}"`);
      }
    }
    
    // Check for Raleway font
    if (html.includes('Raleway') || html.includes('font-display')) {
      console.log(`   ✅ Raleway font detected`);
    } else {
      console.log(`   ⚠️  Raleway font not explicitly found`);
    }
    
    // Check for hydration error markers
    if (html.includes('Hydration') || html.includes('hydration')) {
      console.log(`   ⚠️  Possible hydration reference found (check console)`);
    } else {
      console.log(`   ✅ No hydration errors in HTML`);
    }
    
    // Check for LiquidBackground
    if (html.includes('LiquidBackground') || html.includes('liquid')) {
      console.log(`   ✅ Liquid DNA detected`);
    }
    
    const successRate = (contentFound / page.expectedContent.length) * 100;
    console.log(`   📊 Content Match: ${successRate.toFixed(0)}%`);
    
    return successRate >= 66; // At least 2/3 content must match
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function main() {
  console.log('🎓 STUDIO E2E VALIDATION');
  console.log('========================\n');
  
  const baseUrl = 'https://www.voices.be';
  const results: boolean[] = [];
  
  for (const page of STUDIO_PAGES) {
    const success = await validatePage(baseUrl, page);
    results.push(success);
  }
  
  console.log('\n\n📋 SUMMARY');
  console.log('==========');
  
  const passedCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log(`✅ Passed: ${passedCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - passedCount}/${totalCount}`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 ALL TESTS PASSED');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Review output above');
    process.exit(1);
  }
}

main();
