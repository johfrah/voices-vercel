#!/usr/bin/env tsx
/**
 * Orders V2 Live Status Check
 * Verifies the Orders V2 dashboard data and system health
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkOrdersV2Live() {
  console.log('🔍 ORDERS V2 LIVE STATUS CHECK\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check for December 2025 orders
    console.log('\n📦 DECEMBER 2025 ORDERS (Sample):\n');
    const orders = await db.execute(sql`
      SELECT 
        order_id,
        order_number,
        status,
        total_amount,
        created_at,
        meta_data
      FROM orders_v2
      WHERE created_at >= '2025-12-01' AND created_at < '2026-01-01'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Total found: ${orders.rows.length}`);
    
    if (orders.rows.length > 0) {
      orders.rows.forEach((order: any) => {
        console.log(`\n  Order #${order.order_number}`);
        console.log(`    ID: ${order.order_id}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Total: €${order.total_amount}`);
        console.log(`    Created: ${new Date(order.created_at).toLocaleString('nl-BE')}`);
      });
    } else {
      console.log('  ⚠️  No December 2025 orders found');
    }
    
    // 2. Check for order items with financial data
    console.log('\n\n💰 ORDER ITEMS WITH FINANCIAL DATA:\n');
    const items = await db.execute(sql`
      SELECT 
        oi.order_item_id,
        oi.order_id,
        o.order_number,
        oi.net_amount,
        oi.cost_amount,
        oi.margin_amount,
        oi.margin_percentage
      FROM order_items_v2 oi
      JOIN orders_v2 o ON o.order_id = oi.order_id
      WHERE o.created_at >= '2025-12-01' AND o.created_at < '2026-01-01'
        AND oi.net_amount IS NOT NULL
      ORDER BY o.created_at DESC
      LIMIT 3
    `);
    
    console.log(`Total found: ${items.rows.length}`);
    
    if (items.rows.length > 0) {
      items.rows.forEach((item: any) => {
        console.log(`\n  Order #${item.order_number} - Item #${item.order_item_id}`);
        console.log(`    Net: €${item.net_amount}`);
        console.log(`    Cost: €${item.cost_amount || '0.00'}`);
        console.log(`    Margin: €${item.margin_amount || '0.00'} (${item.margin_percentage || 0}%)`);
      });
    } else {
      console.log('  ⚠️  No order items with financial data found');
    }
    
    // 3. Check for recent system events related to orders
    console.log('\n\n🚨 RECENT SYSTEM EVENTS (Orders Dashboard):\n');
    const events = await db.execute(sql`
      SELECT 
        event_type,
        severity,
        message,
        created_at,
        context
      FROM system_events
      WHERE context->>'path' LIKE '%/admin/orders%'
        OR message LIKE '%orders%'
        OR message LIKE '%Orders%'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`Total found: ${events.rows.length}`);
    
    if (events.rows.length > 0) {
      events.rows.forEach((event: any) => {
        console.log(`\n  [${event.severity}] ${event.event_type}`);
        console.log(`    Message: ${event.message}`);
        console.log(`    Time: ${new Date(event.created_at).toLocaleString('nl-BE')}`);
        if (event.context?.path) {
          console.log(`    Path: ${event.context.path}`);
        }
      });
    } else {
      console.log('  ✅ No errors found for orders dashboard');
    }
    
    // 4. Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY:\n');
    console.log(`  Orders (Dec 2025): ${orders.rows.length}`);
    console.log(`  Order Items with Financials: ${items.rows.length}`);
    console.log(`  Recent System Events: ${events.rows.length}`);
    
    if (events.rows.length === 0 && orders.rows.length > 0) {
      console.log('\n  ✅ Orders V2 Dashboard: HEALTHY');
    } else if (orders.rows.length === 0) {
      console.log('\n  ⚠️  Orders V2 Dashboard: NO DATA');
    } else {
      console.log('\n  ⚠️  Orders V2 Dashboard: CHECK EVENTS');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

checkOrdersV2Live();
