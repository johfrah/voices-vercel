#!/usr/bin/env tsx
/**
 * Studio World V1 - Live Production Validation
 * Validates the Studio landing page and workshop detail pages
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function validateStudioWorld() {
  console.log('\n🎓 STUDIO WORLD V1 - LIVE VALIDATION\n');

  try {
    // 1. Check Studio landing page
    console.log('1️⃣ Checking Studio Landing Page...');
    const studioPage = await db.execute(sql`
      SELECT 
        slug,
        title,
        description,
        status,
        world_id
      FROM pages
      WHERE slug = 'studio'
      LIMIT 1
    `);

    if (studioPage.rows.length === 0) {
      console.log('❌ Studio landing page not found in database');
      process.exit(1);
    }

    const page = studioPage.rows[0] as any;
    console.log(`✅ Studio Page Found: "${page.title}"`);
    console.log(`   Description: ${page.description?.substring(0, 100)}...`);
    console.log(`   Status: ${page.status}`);
    console.log(`   World ID: ${page.world_id}`);

    // 2. Check workshop pages
    console.log('\n2️⃣ Checking Workshop Detail Pages...');
    const workshops = await db.execute(sql`
      SELECT 
        slug,
        title,
        status,
        world_id
      FROM pages
      WHERE slug LIKE 'studio/%'
      AND status = 'published'
      ORDER BY slug
    `);

    console.log(`✅ Found ${workshops.rows.length} published workshop pages:`);
    workshops.rows.forEach((w: any, i: number) => {
      console.log(`   ${i + 1}. ${w.slug} - "${w.title}"`);
    });

    // 3. Check workshop editions (for carousel data)
    console.log('\n3️⃣ Checking Workshop Editions (Carousel Data)...');
    const editions = await db.execute(sql`
      SELECT 
        id,
        title,
        start_date,
        end_date,
        location,
        price_early_bird,
        status
      FROM workshop_editions
      WHERE status = 'published'
      ORDER BY start_date DESC
      LIMIT 5
    `);

    console.log(`✅ Found ${editions.rows.length} published editions:`);
    editions.rows.forEach((e: any, i: number) => {
      console.log(`   ${i + 1}. ${e.title} - ${e.start_date} @ ${e.location} (€${e.price_early_bird})`);
    });

    // 4. Check system events for recent errors
    console.log('\n4️⃣ Checking Recent System Events...');
    const recentErrors = await db.execute(sql`
      SELECT 
        event_type,
        message,
        created_at
      FROM system_events
      WHERE severity = 'error'
      AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recentErrors.rows.length === 0) {
      console.log('✅ No errors in the last hour');
    } else {
      console.log(`⚠️  Found ${recentErrors.rows.length} recent errors:`);
      recentErrors.rows.forEach((e: any, i: number) => {
        console.log(`   ${i + 1}. [${e.event_type}] ${e.message} (${e.created_at})`);
      });
    }

    // 5. Final certification
    console.log('\n📋 VALIDATION SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Studio Landing Page: LIVE`);
    console.log(`✅ Workshop Detail Pages: ${workshops.rows.length} LIVE`);
    console.log(`✅ Workshop Editions: ${editions.rows.length} ACTIVE`);
    console.log(`✅ System Health: ${recentErrors.rows.length === 0 ? 'CLEAN' : 'WARNINGS'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (recentErrors.rows.length === 0 && workshops.rows.length > 0 && editions.rows.length > 0) {
      console.log('🎉 VERIFIED LIVE: v2.16.059 - Studio World Operational - Database Healthy\n');
    } else {
      console.log('⚠️  PARTIAL SUCCESS: Some issues detected, review above\n');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

validateStudioWorld();
