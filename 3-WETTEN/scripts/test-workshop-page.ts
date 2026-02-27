async function testWorkshopPage() {
  console.log('🧪 Testing workshop detail page...\n');
  
  const url = 'https://www.voices.be/admin/studio/workshops/12/';
  
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    const html = await response.text();
    
    // Check for error indicators
    if (html.includes('Oeps, even geduld')) {
      console.log('\n❌ ERROR PAGE DETECTED: "Oeps, even geduld" found in response');
    } else if (html.includes('Editie Details')) {
      console.log('\n✅ SUCCESS: Page rendered correctly (found "Editie Details")');
    } else {
      console.log('\n⚠️  UNKNOWN STATE: Page loaded but expected content not found');
    }
    
    // Check for specific elements
    const checks = [
      { text: 'Editie Details', label: 'Header' },
      { text: 'Deelnemers & Betalers', label: 'Participants section' },
      { text: 'Kostenbeheer', label: 'Costs section' },
      { text: 'Editie Beheer', label: 'Management section' },
      { text: 'Diagnostic Info:', label: 'Error diagnostic' },
      { text: 'error', label: 'Error keyword (case-insensitive)' }
    ];
    
    console.log('\n🔍 Content Checks:');
    checks.forEach(check => {
      const found = check.text.toLowerCase() === 'error' 
        ? html.toLowerCase().includes(check.text)
        : html.includes(check.text);
      console.log(`  ${found ? '✅' : '❌'} ${check.label}: ${found ? 'Found' : 'Not found'}`);
    });
    
    // Extract any visible error messages
    const errorMatch = html.match(/<TextInstrument[^>]*class="[^"]*text-red-[^"]*"[^>]*>([^<]+)<\/TextInstrument>/);
    if (errorMatch) {
      console.log(`\n🚨 Error Message Found: ${errorMatch[1]}`);
    }
    
    // Check for JavaScript errors in the HTML
    const scriptErrors = html.match(/console\.error\(['"](.*?)['"]\)/g);
    if (scriptErrors && scriptErrors.length > 0) {
      console.log('\n⚠️  Console Errors Found:');
      scriptErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Save HTML for inspection
    const fs = require('fs');
    const outputPath = '/tmp/workshop-12-response.html';
    fs.writeFileSync(outputPath, html);
    console.log(`\n💾 Full HTML saved to: ${outputPath}`);
    console.log(`   View with: open ${outputPath}`);
    
  } catch (error: any) {
    console.error('\n❌ Request Failed:');
    console.error(error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testWorkshopPage().catch(console.error);
