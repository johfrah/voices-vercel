import { chromium } from 'playwright';

async function checkLiveChat() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  console.log('Navigating to https://www.voices.be/admin/live-chat/ ...');
  // We might get redirected to login, but we can still check for errors on the login page or the redirect
  await page.goto('https://www.voices.be/admin/live-chat/', { waitUntil: 'networkidle' });
  
  console.log('Current URL:', page.url());
  
  // Wait a bit for any async errors
  await page.waitForTimeout(5000);
  
  if (errors.length > 0) {
    console.log('\n--- DETECTED ERRORS ---');
    errors.forEach(err => console.log('- ' + err));
  } else {
    console.log('\nNo errors detected in console.');
  }

  await browser.close();
}

checkLiveChat().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
