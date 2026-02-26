#!/usr/bin/env tsx
/**
 * 🔍 Orders V2 API Test Script
 * Tests the Orders V2 dashboard API endpoint to verify SQL hardening fix
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOrdersV2() {
  console.log('🔍 Testing Orders V2 API...\n');

  try {
    // Test 1: Fetch orders with raw SQL (mimicking the API endpoint)
    console.log('📊 Test 1: Fetching orders with SQL...');
    const { data: orders, error } = await supabase.rpc('get_orders_v2', {
      p_limit: 10,
      p_offset: 0
    });

    if (error) {
      console.error('❌ SQL Error:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('⚠️  No orders found');
      return;
    }

    console.log(`✅ Found ${orders.length} orders\n`);

    // Test 2: Inspect first order
    const firstOrder = orders[0];
    console.log('📋 First Order Details:');
    console.log(`   Order ID: ${firstOrder.order_id}`);
    console.log(`   Order Number: ${firstOrder.order_number}`);
    console.log(`   Customer: ${firstOrder.customer_name || 'N/A'}`);
    console.log(`   Status: ${firstOrder.order_status}`);
    console.log(`   Total: €${firstOrder.order_total}`);
    console.log(`   Created: ${firstOrder.order_date}\n`);

    // Test 3: Check for financial data
    if (firstOrder.financial_overview) {
      console.log('💰 Financial Overview:');
      console.log(`   Net: €${firstOrder.financial_overview.net || 0}`);
      console.log(`   Cost: €${firstOrder.financial_overview.cost || 0}`);
      console.log(`   Margin: ${firstOrder.financial_overview.margin || 0}%\n`);
    } else {
      console.log('⚠️  No financial overview data\n');
    }

    // Test 4: Check for production data
    if (firstOrder.production_info) {
      console.log('🎬 Production Info:');
      console.log(`   Briefing: ${firstOrder.production_info.briefing ? 'Present' : 'Missing'}`);
      console.log(`   Script: ${firstOrder.production_info.script ? 'Present' : 'Missing'}\n`);
    } else {
      console.log('⚠️  No production info\n');
    }

    // Test 5: Check system events for errors
    console.log('🔍 Checking recent system events for errors...');
    const { data: events, error: eventsError } = await supabase
      .from('system_events')
      .select('*')
      .eq('event_type', 'error')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order('created_at', { ascending: false })
      .limit(5);

    if (eventsError) {
      console.error('❌ Error fetching system events:', eventsError);
    } else if (events && events.length > 0) {
      console.log(`⚠️  Found ${events.length} recent errors:`);
      events.forEach(event => {
        console.log(`   - ${event.message} (${event.created_at})`);
      });
    } else {
      console.log('✅ No recent errors in system_events\n');
    }

    console.log('✅ Orders V2 API Test Complete');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOrdersV2();
