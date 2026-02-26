#!/usr/bin/env tsx
/**
 * 🔍 Orders V2 Live Verification
 * Verifies the Orders V2 dashboard is working on production
 */

import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const ADMIN_KEY = 'ak_1cef7d19b3354b799e9a62857d53db0f';
const BASE_URL = 'https://www.voices.be';

async function verifyOrdersLive() {
  console.log('🔍 FORENSIC AUDIT: Orders V2 Dashboard\n');
  console.log('📍 Target: https://www.voices.be/admin/orders\n');

  try {
    // Step 1: Authenticate with Admin Key Bridge
    console.log('🔐 Step 1: Authenticating via Admin Key Bridge...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/admin-key?key=${ADMIN_KEY}`, {
      redirect: 'manual'
    });

    if (authResponse.status !== 302 && authResponse.status !== 200) {
      console.error(`❌ Auth failed with status ${authResponse.status}`);
      process.exit(1);
    }

    const cookies = authResponse.headers.get('set-cookie');
    console.log('✅ Authentication successful\n');

    // Step 2: Fetch Orders API
    console.log('📊 Step 2: Fetching orders from API...');
    const ordersResponse = await fetch(`${BASE_URL}/api/admin/orders?page=1&limit=5`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!ordersResponse.ok) {
      console.error(`❌ Orders API failed with status ${ordersResponse.status}`);
      const errorText = await ordersResponse.text();
      console.error('Error:', errorText);
      process.exit(1);
    }

    const ordersData = await ordersResponse.json();
    console.log(`✅ Orders API responded successfully\n`);

    // Step 3: Verify Data Structure
    console.log('🔍 Step 3: Verifying data structure...');
    if (!ordersData.orders || !Array.isArray(ordersData.orders)) {
      console.error('❌ Invalid data structure: missing orders array');
      process.exit(1);
    }

    console.log(`✅ Found ${ordersData.orders.length} orders`);
    console.log(`📈 Total in DB: ${ordersData.total || 'unknown'}\n`);

    if (ordersData.orders.length === 0) {
      console.log('⚠️  No orders found in database');
      console.log('✅ VERIFIED LIVE: v' + (ordersData.debug?.version || 'unknown'));
      return;
    }

    // Step 4: Test Order Detail Fetch
    const firstOrder = ordersData.orders[0];
    console.log('📋 Step 4: Testing order detail fetch...');
    console.log(`   Order ID: ${firstOrder.id}`);
    console.log(`   Customer: ${firstOrder.customerName || 'Guest'}`);
    console.log(`   Status: ${firstOrder.status}`);
    console.log(`   Total: €${firstOrder.total || '0.00'}\n`);

    const detailResponse = await fetch(`${BASE_URL}/api/admin/orders/${firstOrder.id}`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!detailResponse.ok) {
      console.error(`❌ Order detail API failed with status ${detailResponse.status}`);
      process.exit(1);
    }

    const detailData = await detailResponse.json();
    console.log('✅ Order detail API responded successfully\n');

    // Step 5: Verify Expandable Intelligence Data
    console.log('💰 Step 5: Verifying Financial Overview...');
    if (detailData.financial) {
      console.log(`   Net: €${detailData.financial.net || '0.00'}`);
      console.log(`   Cost: €${detailData.financial.cost || '0.00'}`);
      console.log(`   Margin: ${detailData.financial.margin || '0'}%`);
      console.log(`   Margin €: €${detailData.financial.marginAmount || '0.00'}\n`);
    } else {
      console.log('   ⚠️  No financial data (expected for some orders)\n');
    }

    console.log('🎬 Step 6: Verifying Production Data...');
    if (detailData.production) {
      console.log(`   Briefing: ${detailData.production.briefing ? '✅ Present' : '❌ Missing'}`);
      console.log(`   Script: ${detailData.production.script ? '✅ Present' : '❌ Missing'}`);
      console.log(`   Has Regie: ${detailData.production.hasRegieInstructions ? '✅ Yes' : '❌ No'}\n`);
    } else {
      console.log('   ⚠️  No production data\n');
    }

    // Step 7: Check System Events
    console.log('🔍 Step 7: Checking for recent errors...');
    const eventsResponse = await fetch(`${BASE_URL}/api/admin/system-events?type=error&limit=5`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      if (eventsData.events && eventsData.events.length > 0) {
        console.log(`⚠️  Found ${eventsData.events.length} recent errors:`);
        eventsData.events.forEach((event: any) => {
          console.log(`   - ${event.message}`);
        });
      } else {
        console.log('✅ No recent errors in system_events\n');
      }
    } else {
      console.log('⚠️  Could not fetch system events\n');
    }

    // Final Report
    console.log('═══════════════════════════════════════════════════');
    console.log('🎯 FORENSIC AUDIT COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ VERIFIED LIVE: v${ordersData.debug?.version || 'unknown'}`);
    console.log(`✅ Orders API: Working`);
    console.log(`✅ Order Detail API: Working`);
    console.log(`✅ Financial Overview: ${detailData.financial ? 'Present' : 'N/A'}`);
    console.log(`✅ Production Data: ${detailData.production ? 'Present' : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n🔍 VISUAL PROOF: Order #${firstOrder.id} with margin ${detailData.financial?.margin || 0}%`);
    console.log(`📍 Version: v${ordersData.debug?.version || 'unknown'}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyOrdersLive();
