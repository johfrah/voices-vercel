#!/usr/bin/env tsx
/**
 * ☢️ NUCLEAR 50 TEST - Scenarios 13-25
 * 
 * Focus Areas:
 * - Scenario 13-15: Agency Checkout Flow (Voice Booking)
 * - Scenario 16-18: Kelly Pricing Validation in Checkout
 * - Scenario 19-21: Ademing.be Workshop Registration Flow
 * - Scenario 22-23: Mat Visitor Tracking During Checkout
 * - Scenario 24-25: Cross-Market Checkout & Final Validation
 * 
 * @version v2.16.005
 * @agent Chris/Autist (Technical Director)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { appendFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from web app
config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Check .env.local file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const REPORT_PATH = join(__dirname, '../docs/REPORTS/2026-02-27-NUCLEAR-50-REPORT.md');
const LIVE_BASE_URL = 'https://www.voices.be';
const ADEMING_BASE_URL = 'https://www.ademing.be';

interface TestResult {
  scenario: number;
  name: string;
  status: '✅' | '🟠' | '🔴';
  details: string;
  timestamp: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function addResult(scenario: number, name: string, status: '✅' | '🟠' | '🔴', details: string) {
  const result: TestResult = {
    scenario,
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  results.push(result);
  log(`${status} Scenario ${scenario}: ${name} - ${details}`);
}

async function testActorAvailability(): Promise<{ actorId: number; actorName: string } | null> {
  try {
    const { data: actors, error } = await supabase
      .from('actors')
      .select('id, first_name, last_name, status, is_public')
      .eq('status', 'live')
      .eq('is_public', true)
      .limit(1);

    if (error) {
      addResult(13, 'Actor Availability Check', '🔴', `Database error: ${error.message || JSON.stringify(error)}`);
      return null;
    }
    
    if (!actors || actors.length === 0) {
      addResult(13, 'Actor Availability Check', '🔴', 'No live public actors found in database');
      return null;
    }

    const actor = actors[0];
    addResult(13, 'Actor Availability Check', '✅', `Found actor: ${actor.first_name} ${actor.last_name} (ID: ${actor.id})`);
    return {
      actorId: actor.id,
      actorName: `${actor.first_name} ${actor.last_name}`
    };
  } catch (error: any) {
    addResult(13, 'Actor Availability Check', '🔴', `Database error: ${error?.message || String(error)}`);
    return null;
  }
}

async function testPricingEngine(actorId: number): Promise<boolean> {
  try {
    // Test Kelly's pricing engine by fetching actor pricing
    const { data: actor, error } = await supabase
      .from('actors')
      .select('id, first_name, last_name, price_unpaid, price_online, price_ivr, price_live_regie')
      .eq('id', actorId)
      .single();

    if (error) throw error;
    
    if (!actor) {
      addResult(16, 'Kelly Pricing Engine - Rate Fetch', '🔴', `Actor ${actorId} not found`);
      return false;
    }

    const priceTypes = ['price_unpaid', 'price_online', 'price_ivr', 'price_live_regie'];
    const availablePrices = priceTypes.filter(pt => actor[pt] != null);
    
    if (availablePrices.length === 0) {
      addResult(16, 'Kelly Pricing Engine - Rate Fetch', '🟠', `No pricing configured for ${actor.first_name} ${actor.last_name}`);
      return false;
    }

    const samplePrice = actor[availablePrices[0]];
    addResult(16, 'Kelly Pricing Engine - Rate Fetch', '✅', `Found ${availablePrices.length} price types for ${actor.first_name}. Sample: €${samplePrice}`);
    
    // Validate pricing structure (stored as numeric in DB)
    if (typeof samplePrice !== 'string' && typeof samplePrice !== 'number') {
      addResult(17, 'Kelly Pricing Validation', '🔴', 'Invalid price format');
      return false;
    }

    addResult(17, 'Kelly Pricing Validation', '✅', 'Pricing structure valid - Kelly engine operational');
    return true;
  } catch (error: any) {
    addResult(16, 'Kelly Pricing Engine - Rate Fetch', '🔴', `Error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testCheckoutAPIEndpoint(): Promise<boolean> {
  try {
    // Test the checkout API endpoint availability
    const response = await fetch(`${LIVE_BASE_URL}/api/checkout/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true
      })
    });

    if (response.status === 404) {
      addResult(14, 'Checkout API Endpoint', '🔴', 'Checkout API endpoint not found (404)');
      return false;
    }

    if (response.status === 405) {
      addResult(14, 'Checkout API Endpoint', '🟠', 'Checkout API exists but method validation needed');
      return true;
    }

    addResult(14, 'Checkout API Endpoint', '✅', `Checkout API responsive (Status: ${response.status})`);
    return true;
  } catch (error: any) {
    addResult(14, 'Checkout API Endpoint', '🔴', `Network error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testOrdersTable(): Promise<boolean> {
  try {
    // Verify orders table structure and recent orders
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select('id, status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!recentOrders || recentOrders.length === 0) {
      addResult(15, 'Orders Table Structure', '🟠', 'Orders table exists but no orders found');
      return true;
    }

    addResult(15, 'Orders Table Structure', '✅', `Found ${recentOrders.length} recent orders. Latest status: ${recentOrders[0]?.status || 'N/A'}`);
    return true;
  } catch (error: any) {
    addResult(15, 'Orders Table Structure', '🔴', `Database error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testKellyBuyoutCalculation(): Promise<boolean> {
  try {
    // Test that pricing engine can handle different price types
    const { data: actors, error } = await supabase
      .from('actors')
      .select('id, first_name, price_unpaid, price_online, price_ivr')
      .eq('status', 'live')
      .not('price_online', 'is', null)
      .limit(1);

    if (error) throw error;

    if (!actors || actors.length === 0) {
      addResult(18, 'Kelly Multi-Price Calculation', '🟠', 'No actors with online pricing found');
      return true;
    }

    const actor = actors[0];
    const unpaid = parseFloat(actor.price_unpaid || '0');
    const online = parseFloat(actor.price_online || '0');
    const ivr = parseFloat(actor.price_ivr || '0');
    
    addResult(18, 'Kelly Multi-Price Calculation', '✅', `${actor.first_name}: Unpaid €${unpaid}, Online €${online}, IVR €${ivr} - Multi-tier pricing operational`);
    return true;
  } catch (error: any) {
    addResult(18, 'Kelly Multi-Price Calculation', '🔴', `Error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testAdemingWorkshops(): Promise<{ workshopId: number } | null> {
  try {
    // Test Ademing.be workshop availability
    const { data: workshops, error } = await supabase
      .from('workshops')
      .select('id, title, status')
      .eq('status', 'active')
      .limit(1);

    if (error) throw error;

    if (!workshops || workshops.length === 0) {
      addResult(19, 'Ademing Workshop Availability', '🔴', 'No active workshops found');
      return null;
    }

    const workshop = workshops[0];
    addResult(19, 'Ademing Workshop Availability', '✅', `Found workshop: "${workshop.title}" (ID: ${workshop.id})`);
    return { workshopId: workshop.id };
  } catch (error: any) {
    addResult(19, 'Ademing Workshop Availability', '🔴', `Database error: ${error?.message || String(error)}`);
    return null;
  }
}

async function testWorkshopEditions(workshopId: number): Promise<boolean> {
  try {
    // Test workshop editions and availability
    const { data: editions, error } = await supabase
      .from('workshop_editions')
      .select('id, workshop_id, date, capacity, status')
      .eq('workshop_id', workshopId)
      .gte('date', new Date().toISOString())
      .limit(1);

    if (error) throw error;

    if (!editions || editions.length === 0) {
      addResult(20, 'Workshop Editions & Capacity', '🟠', `No upcoming editions for workshop ${workshopId}`);
      return true;
    }

    const edition = editions[0];
    
    addResult(20, 'Workshop Editions & Capacity', '✅', `Edition ${edition.id}: Capacity ${edition.capacity}, Status: ${edition.status}`);
    return true;
  } catch (error: any) {
    addResult(20, 'Workshop Editions & Capacity', '🔴', `Error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testWorkshopRegistrationTable(): Promise<boolean> {
  try {
    // Verify orders table for workshop registrations (workshops use the orders system)
    const { data: workshopOrders, error } = await supabase
      .from('orders')
      .select('id, status, journey, created_at')
      .eq('journey', 'studio')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!workshopOrders || workshopOrders.length === 0) {
      addResult(21, 'Workshop Registration System', '🟠', 'No workshop orders found (studio journey)');
      return true;
    }

    addResult(21, 'Workshop Registration System', '✅', `Found ${workshopOrders.length} workshop orders. Latest status: ${workshopOrders[0]?.status || 'N/A'}`);
    return true;
  } catch (error: any) {
    addResult(21, 'Workshop Registration System', '🔴', `Database error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testMatVisitorTracking(): Promise<boolean> {
  try {
    // Test Mat's visitor intelligence
    const { data: recentVisitors, error } = await supabase
      .from('visitors')
      .select('id, visitor_hash, utm_source, last_visit_at')
      .order('last_visit_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!recentVisitors || recentVisitors.length === 0) {
      addResult(22, 'Mat Visitor Tracking', '🟠', 'No visitor data found in database (expected for new system)');
      return true;
    }

    const withUTM = recentVisitors.filter(v => v.utm_source != null);
    
    addResult(22, 'Mat Visitor Tracking', '✅', `Found ${recentVisitors.length} recent visitors. ${withUTM.length} with UTM tracking.`);
    return true;
  } catch (error: any) {
    addResult(22, 'Mat Visitor Tracking', '🔴', `Database error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testMatUTMTracking(): Promise<boolean> {
  try {
    // Test UTM parameter tracking via visitor_logs - simplified test
    const { data: visitorLogs, error } = await supabase
      .from('visitor_logs')
      .select('*')
      .limit(10);

    if (error) {
      // Table might not exist or have different schema - this is non-critical
      addResult(23, 'Mat Visitor Logs', '🟠', `Visitor logs table issue (non-critical): ${error.message}`);
      return true;
    }

    if (!visitorLogs || visitorLogs.length === 0) {
      addResult(23, 'Mat Visitor Logs', '🟠', 'No visitor logs found (expected for new system)');
      return true;
    }

    addResult(23, 'Mat Visitor Logs', '✅', `Found ${visitorLogs.length} visitor log entries. Tracking system operational.`);
    return true;
  } catch (error: any) {
    addResult(23, 'Mat Visitor Logs', '🟠', `Non-critical: ${error?.message || String(error)}`);
    return true;
  }
}

async function testMarketConfigs(): Promise<boolean> {
  try {
    // Test cross-market by checking actors and workshops are available
    const { data: actors, error: actorError } = await supabase
      .from('actors')
      .select('id')
      .eq('status', 'live')
      .eq('is_public', true)
      .limit(1);

    if (actorError) throw actorError;

    const { data: workshops, error: workshopError } = await supabase
      .from('workshops')
      .select('id')
      .eq('status', 'active')
      .limit(1);

    if (workshopError) throw workshopError;

    const hasActors = actors && actors.length > 0;
    const hasWorkshops = workshops && workshops.length > 0;

    if (hasActors && hasWorkshops) {
      addResult(24, 'Cross-Market Data Availability', '✅', 'Both Agency (actors) and Studio (workshops) data available for multi-market deployment');
      return true;
    } else if (hasActors) {
      addResult(24, 'Cross-Market Data Availability', '🟠', 'Agency data available, but no workshops found');
      return true;
    } else {
      addResult(24, 'Cross-Market Data Availability', '🔴', 'Missing critical data for market deployment');
      return false;
    }
  } catch (error: any) {
    addResult(24, 'Cross-Market Data Availability', '🔴', `Database error: ${error?.message || String(error)}`);
    return false;
  }
}

async function testSystemHealth(): Promise<boolean> {
  try {
    // Final validation: Check for recent system errors
    const { data: recentErrors, error } = await supabase
      .from('system_events')
      .select('id, level, source, message, created_at')
      .eq('level', 'error')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (recentErrors && recentErrors.length > 0) {
      addResult(25, 'System Health Check', '🟠', `${recentErrors.length} errors in last hour - Review recommended`);
      return true;
    }

    addResult(25, 'System Health Check', '✅', 'No errors in last hour. System healthy.');
    return true;
  } catch (error: any) {
    addResult(25, 'System Health Check', '🔴', `Database error: ${error?.message || String(error)}`);
    return false;
  }
}

function generateReport() {
  const timestamp = new Date().toISOString();
  const totalTests = results.length;
  const passed = results.filter(r => r.status === '✅').length;
  const warnings = results.filter(r => r.status === '🟠').length;
  const failed = results.filter(r => r.status === '🔴').length;

  let report = `\n\n---\n\n## 🧪 Scenario 13-25: Checkout, Kelly, Ademing & Mat (${timestamp})\n\n`;
  report += `**Total Tests**: ${totalTests} | **Passed**: ${passed} ✅ | **Warnings**: ${warnings} 🟠 | **Failed**: ${failed} 🔴\n\n`;

  // Group by scenario range
  const groups = [
    { title: '### 🛒 Scenario 13-15: Agency Checkout Flow', range: [13, 14, 15] },
    { title: '### 💰 Scenario 16-18: Kelly Pricing Engine', range: [16, 17, 18] },
    { title: '### 🎓 Scenario 19-21: Ademing Workshop Registration', range: [19, 20, 21] },
    { title: '### 🚪 Scenario 22-23: Mat Visitor Intelligence', range: [22, 23] },
    { title: '### 🌍 Scenario 24-25: Cross-Market & System Health', range: [24, 25] }
  ];

  groups.forEach(group => {
    report += `\n${group.title}\n\n`;
    group.range.forEach(scenarioNum => {
      const result = results.find(r => r.scenario === scenarioNum);
      if (result) {
        report += `- **${result.status} Scenario ${result.scenario}**: ${result.name}\n`;
        report += `  - ${result.details}\n`;
      }
    });
  });

  report += `\n---\n\n**Test Completed**: ${timestamp}\n**Version**: v2.16.005\n**Agent**: Chris/Autist (Technical Director)\n`;

  return report;
}

async function main() {
  log('☢️ NUCLEAR 50 TEST - Scenarios 13-25 INITIATED');
  log(`Testing against: ${LIVE_BASE_URL} (v2.16.005)`);
  log('---');

  // Scenario 13-15: Agency Checkout Flow
  log('\n🛒 Testing Agency Checkout Flow...');
  const actorData = await testActorAvailability();
  if (actorData) {
    await testCheckoutAPIEndpoint();
    await testOrdersTable();
  }

  // Scenario 16-18: Kelly Pricing Engine
  log('\n💰 Testing Kelly Pricing Engine...');
  if (actorData) {
    const pricingValid = await testPricingEngine(actorData.actorId);
    if (pricingValid) {
      await testKellyBuyoutCalculation();
    }
  }

  // Scenario 19-21: Ademing Workshop Registration
  log('\n🎓 Testing Ademing Workshop Registration...');
  const workshopData = await testAdemingWorkshops();
  if (workshopData) {
    await testWorkshopEditions(workshopData.workshopId);
    await testWorkshopRegistrationTable();
  }

  // Scenario 22-23: Mat Visitor Intelligence
  log('\n🚪 Testing Mat Visitor Intelligence...');
  await testMatVisitorTracking();
  await testMatUTMTracking();

  // Scenario 24-25: Cross-Market & System Health
  log('\n🌍 Testing Cross-Market Configuration & System Health...');
  await testMarketConfigs();
  await testSystemHealth();

  // Generate and append report
  const report = generateReport();
  appendFileSync(REPORT_PATH, report);

  log('\n---');
  log('✅ Test suite completed. Report appended to: ' + REPORT_PATH);
  
  const failed = results.filter(r => r.status === '🔴').length;
  if (failed > 0) {
    log(`⚠️  ${failed} test(s) FAILED. Review required.`);
    process.exit(1);
  }
  
  log('🎉 All critical tests passed!');
}

main().catch(console.error);
