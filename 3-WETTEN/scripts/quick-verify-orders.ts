#!/usr/bin/env tsx
/**
 * CHRIS - QUICK API VERIFICATION
 * Mission: Verify Orders API status on production
 */

async function quickVerify() {
  console.log('🔍 CHRIS - QUICK VERIFICATION\n');
  
  try {
    // Check version
    console.log('📍 Checking version...');
    const configRes = await fetch('https://www.voices.be/api/admin/config');
    const config = await configRes.json();
    console.log(`   Version: ${config._version || config.version}`);
    
    // Check Orders API
    console.log('\n📍 Checking Orders API...');
    const ordersRes = await fetch('https://www.voices.be/api/admin/orders?world=agency');
    console.log(`   Status: ${ordersRes.status} ${ordersRes.statusText}`);
    
    if (ordersRes.ok) {
      const data = await ordersRes.json();
      console.log(`   ✅ Orders Count: ${data.orders?.length || 0}`);
      
      if (data.orders?.[0]) {
        const first = data.orders[0];
        console.log(`\n   First Order:`);
        console.log(`   - Order #: ${first.order_number || first.id}`);
        console.log(`   - Date: ${first.created_at}`);
        console.log(`   - Customer: ${first.customer_name || first.billing_first_name}`);
      }
      
      console.log('\n✅ VERIFIED: Orders API is responding correctly!');
    } else {
      const error = await ordersRes.text();
      console.log(`   ❌ ERROR: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
    process.exit(1);
  }
}

quickVerify();
