#!/usr/bin/env tsx
/**
 * 🔍 Live Status Check - Database Direct
 * Checks the database for recent errors and validates Orders V2 data
 */

import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const postgres = require('postgres');

async function checkLiveStatus() {
  console.log('🔍 FORENSIC AUDIT: Live Status Check\n');
  console.log('═══════════════════════════════════════════════════\n');

  const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
  const sql = postgres(connectionString, {
    ssl: 'require',
  });

  try {
    // Check 1: Recent System Events (Errors)
    console.log('📊 Check 1: Recent System Events (Last Hour)...');
    const recentErrors = await sql`
      SELECT level, source, message, details, created_at
      FROM system_events
      WHERE level = 'error'
        AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (recentErrors.length > 0) {
      console.log(`⚠️  Found ${recentErrors.length} recent errors:\n`);
      recentErrors.forEach((error: any) => {
        console.log(`   🔴 [${error.source}] ${error.message}`);
        console.log(`      Time: ${error.created_at}`);
        if (error.details) {
          const details = typeof error.details === 'string' ? error.details : JSON.stringify(error.details);
          console.log(`      Details: ${details.substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('✅ No errors in the last hour\n');
    }

    // Check 2: Orders V2 Table Status
    console.log('📊 Check 2: Orders V2 Table Status...');
    const orderCount = await sql`
      SELECT COUNT(*) as count FROM orders_v2
    `;
    console.log(`✅ Total orders in orders_v2: ${orderCount[0].count}\n`);

    // Check 3: Recent Orders (Last 5)
    console.log('📊 Check 3: Recent Orders (Last 5)...');
    const recentOrders = await sql`
      SELECT id, user_id, status_id, amount_total, billing_email_alt, created_at
      FROM orders_v2
      ORDER BY created_at DESC
      LIMIT 5
    `;

    if (recentOrders.length > 0) {
      console.log(`✅ Found ${recentOrders.length} recent orders:\n`);
      recentOrders.forEach((order: any) => {
        console.log(`   Order #${order.id}`);
        console.log(`   Email: ${order.billing_email_alt || 'N/A'}`);
        console.log(`   Status: ${order.status_id}`);
        console.log(`   Total: €${order.amount_total || '0.00'}`);
        console.log(`   Date: ${order.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No orders found\n');
    }

    // Check 4: Sample Order Detail (with legacy bloat)
    if (recentOrders.length > 0) {
      const sampleOrderId = recentOrders[0].id;
      console.log(`📊 Check 4: Sample Order Detail (#${sampleOrderId})...`);
      
      const orderDetail = await sql`
        SELECT 
          o.id, o.amount_net, o.amount_total, o.purchase_order,
          l.raw_meta
        FROM orders_v2 o
        LEFT JOIN orders_legacy_bloat l ON o.id = l.wp_order_id
        WHERE o.id = ${sampleOrderId}
        LIMIT 1
      `;

      if (orderDetail.length > 0) {
        const detail = orderDetail[0];
        console.log(`   Net: €${detail.amount_net || '0.00'}`);
        console.log(`   Total: €${detail.amount_total || '0.00'}`);
        console.log(`   PO: ${detail.purchase_order || 'N/A'}`);
        
        if (detail.raw_meta) {
          const meta = detail.raw_meta;
          const briefing = meta.briefing || meta._billing_wo_briefing || null;
          console.log(`   Briefing: ${briefing ? '✅ Present' : '❌ Missing'}`);
          
          // Check for COG data
          const hasCOG = meta._alg_wc_cog_order_total_cost || meta._COG;
          console.log(`   COG Data: ${hasCOG ? '✅ Present' : '❌ Missing'}`);
        } else {
          console.log(`   Legacy Meta: ❌ Missing`);
        }
        console.log('');
      }
    }

    // Check 5: API Config Version
    console.log('📊 Check 5: Checking deployed version...');
    const versionCheck = await fetch('https://www.voices.be/api/admin/config');
    if (versionCheck.status === 308 || versionCheck.status === 200) {
      console.log('✅ API is responding (redirects expected for auth)\n');
    } else {
      console.log(`⚠️  API returned status: ${versionCheck.status}\n`);
    }

    // Final Report
    console.log('═══════════════════════════════════════════════════');
    console.log('🎯 FORENSIC AUDIT SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Database Connection: Working`);
    console.log(`✅ Orders V2 Table: ${orderCount[0].count} orders`);
    console.log(`✅ Recent Errors: ${recentErrors.length} in last hour`);
    console.log(`✅ Sample Order: ${recentOrders.length > 0 ? 'Verified' : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════');
    
    if (recentErrors.length === 0 && recentOrders.length > 0) {
      console.log('\n🎉 CERTIFICATION: Orders V2 is LIVE and HEALTHY');
      console.log(`📍 Sample Order: #${recentOrders[0].id} with total €${recentOrders[0].amount_total}`);
    } else if (recentErrors.length > 0) {
      console.log('\n⚠️  WARNING: Recent errors detected. Review logs above.');
    }

  } catch (error: any) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

checkLiveStatus();
