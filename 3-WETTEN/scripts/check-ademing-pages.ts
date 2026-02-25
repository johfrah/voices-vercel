import { chromium } from 'playwright';

async function checkAdemingPages() {
  console.log('🔍 Checking Ademing Pages...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const pages = [
    { name: 'Home', url: 'https://www.ademing.be' },
    { name: 'Bibliotheek', url: 'https://www.ademing.be/bibliotheek' },
    { name: 'Favorieten', url: 'https://www.ademing.be/favorieten' },
    { name: 'Zoeken', url: 'https://www.ademing.be/zoeken' },
    { name: 'Account', url: 'https://www.ademing.be/account' },
  ];

  for (const testPage of pages) {
    try {
      console.log(`\n📍 Testing: ${testPage.name} (${testPage.url})`);
      
      await page.goto(testPage.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      // Check for error page
      const errorText = await page.locator('text=Oeps, even geduld').count();
      const hasNav = await page.locator('nav').count();
      const title = await page.locator('h1').first().textContent();

      if (errorText > 0) {
        console.log(`   ❌ ERROR PAGE`);
      } else if (hasNav > 0) {
        console.log(`   ✅ LOADED`);
        console.log(`   📝 Title: "${title?.trim().substring(0, 50)}..."`);
      } else {
        console.log(`   ⚠️ LOADED but no nav`);
      }

    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Check complete!');
}

checkAdemingPages();
