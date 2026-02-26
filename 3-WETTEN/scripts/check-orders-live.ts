#!/usr/bin/env tsx
/**
 * FORENSIC AUDIT: Check Orders V2 Live Status
 * Verifies the Orders API is working and data is visible
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersLive() {
  try {
    console.log('🔍 FORENSIC AUDIT: Orders V2 Live Status\n');
    
    // 1. Check system_events for recent errors
    console.log('1️⃣ Checking system_events for errors...');
    const { data: errors, error: eventsError } = await supabase
      .from('system_events')
      .select('*')
      .eq('event_type', 'error')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (eventsError) {
      console.error('❌ Failed to fetch system_events:', eventsError.message);
    } else if (!errors || errors.length === 0) {
      console.log('   ✅ No errors in the last hour');
    } else {
      console.log(`   ⚠️ Found ${errors.length} errors:`);
      errors.forEach((event: any, i: number) => {
        console.log(`\n   [${i+1}] ${event.created_at}`);
        console.log(`      Source: ${event.source}`);
        console.log(`      Message: ${event.message}`);
      });
    }
    
    // 2. Check if orders_v2 table exists and has data
    console.log('\n2️⃣ Checking orders_v2 table...');
    const { count, error: countError } = await supabase
      .from('orders_v2')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('   ❌ Failed to query orders_v2:', countError.message);
      console.error('   💡 This suggests the table might not exist or there\'s a permission issue');
    } else {
      console.log(`   ✅ orders_v2 table exists with ${count} records`);
    }
    
    // 3. Fetch sample orders
    console.log('\n3️⃣ Fetching sample orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders_v2')
      .select('id, amount_total, amount_net, purchase_order, billing_email_alt, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (ordersError) {
      console.error('   ❌ Failed to fetch orders:', ordersError.message);
    } else if (!orders || orders.length === 0) {
      console.log('   ⚠️ No orders found in orders_v2');
    } else {
      console.log(`   ✅ Found ${orders.length} orders:\n`);
      orders.forEach((order: any, i: number) => {
        const margin = order.amount_net && order.amount_total 
          ? ((order.amount_net / order.amount_total) * 100).toFixed(1)
          : 'N/A';
        console.log(`   Order #${order.id}:`);
        console.log(`      Total: €${order.amount_total || 'N/A'}`);
        console.log(`      Net: €${order.amount_net || 'N/A'}`);
        console.log(`      Margin: ${margin}%`);
        console.log(`      PO: ${order.purchase_order || 'N/A'}`);
        console.log(`      Email: ${order.billing_email_alt || 'N/A'}`);
        console.log(`      Created: ${order.created_at}\n`);
      });
    }
    
    console.log('✅ FORENSIC AUDIT COMPLETE');
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

checkOrdersLive();
