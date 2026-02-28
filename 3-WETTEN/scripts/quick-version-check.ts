import { chromium } from 'playwright';

async function quickCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Checking live version on voices.be...\n');
    
    await page.goto('https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500&page=dashboard-orders', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    await page.waitForTimeout(5000);
    
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__ || (window as any).VOICES_VERSION || 'not found';
    });
    
    console.log(`✅ Live version: ${version}`);
    
    // Check for orders
    const ordersCheck = await page.evaluate(() => {
      const body = document.body.textContent || '';
      const hasOrders = body.includes('order') || body.includes('Order');
      const has500 = body.includes('500') || body.includes('Internal Server Error');
      return { hasOrders, has500, bodyLength: body.length };
    });
    
    console.log(`📦 Orders check:`, ordersCheck);
    
    // Try API call
    const apiCheck = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/admin/orders');
        return { status: res.status, ok: res.ok };
      } catch (e) {
        return { error: String(e) };
      }
    });
    
    console.log(`🔌 API check:`, apiCheck);
    
  } catch (e) {
    console.error('❌ Error:', e);
  } finally {
    await browser.close();
  }
}

quickCheck();
