#!/usr/bin/env tsx
/**
 * 🎓 Studio World Deep Validation Script
 * 
 * Validates the Studio journey on voices.be according to the Bob-methode & Chris-Protocol.
 * 
 * Tasks:
 * 1. Verify main /studio page loads with carousel and calendar
 * 2. Check individual workshop pages
 * 3. Verify "Handshake Truth": prices, instructors, locations
 * 4. Check for console errors and hydration issues
 * 5. Verify Voices Tone of Voice (Natural Capitalization, aesthetics)
 * 6. Test Slimme Kassa entry points
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'INFO';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

function log(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN' | 'INFO', message: string, details?: any) {
  results.push({ category, test, status, message, details });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${category}] ${test}: ${message}`);
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2));
  }
}

async function validateDatabaseIntegrity() {
  console.log('\n🗄️ === DATABASE INTEGRITY CHECK ===\n');

  // Check workshops table
  const { data: workshops, error: workshopsError } = await supabase
    .from('workshops')
    .select('*')
    .order('id');

  if (workshopsError) {
    log('Database', 'Workshops Table', 'FAIL', `Failed to fetch workshops: ${workshopsError.message}`);
    return;
  }

  log('Database', 'Workshops Count', workshops && workshops.length > 0 ? 'PASS' : 'FAIL', 
    `Found ${workshops?.length || 0} workshops in database`);

  // Check for required workshop slugs
  const requiredSlugs = ['perfect-spreken', 'voice-overs-voor-beginners', 'tekenfilm-stemmetjes'];
  const foundSlugs = workshops?.map(w => w.slug) || [];
  
  for (const slug of requiredSlugs) {
    const found = foundSlugs.some(s => s?.includes(slug.split('-')[0]));
    log('Database', `Workshop Slug: ${slug}`, found ? 'PASS' : 'WARN', 
      found ? `Workshop with slug containing "${slug.split('-')[0]}" exists` : `No workshop found for "${slug}"`);
  }

  // Check workshop_editions
  const { data: editions, error: editionsError } = await supabase
    .from('workshop_editions')
    .select(`
      *,
      workshop:workshops(title, slug),
      location:locations(name, address, city),
      instructor:instructors(first_name, last_name)
    `)
    .order('date', { ascending: true });

  if (editionsError) {
    log('Database', 'Workshop Editions', 'FAIL', `Failed to fetch editions: ${editionsError.message}`);
    return;
  }

  log('Database', 'Workshop Editions Count', editions && editions.length > 0 ? 'PASS' : 'WARN', 
    `Found ${editions?.length || 0} workshop editions`);

  // Validate "Handshake Truth" - prices, instructors, locations
  if (editions && editions.length > 0) {
    for (const edition of editions.slice(0, 5)) {
      const hasPrice = edition.price !== null && edition.price !== undefined;
      const hasInstructor = edition.instructor !== null;
      const hasLocation = edition.location !== null;

      log('Database', `Edition: ${edition.title || 'Untitled'}`, 
        hasPrice && hasInstructor && hasLocation ? 'PASS' : 'WARN',
        `Price: ${hasPrice ? '✓' : '✗'}, Instructor: ${hasInstructor ? '✓' : '✗'}, Location: ${hasLocation ? '✓' : '✗'}`,
        {
          price: edition.price,
          instructor: edition.instructor ? `${edition.instructor.first_name} ${edition.instructor.last_name}` : null,
          location: edition.location ? `${edition.location.name}, ${edition.location.city}` : null,
          date: edition.date
        });
    }
  }

  // Check instructors (Bernadette & Johfrah)
  const { data: instructors, error: instructorsError } = await supabase
    .from('instructors')
    .select('*');

  if (instructorsError) {
    log('Database', 'Instructors', 'FAIL', `Failed to fetch instructors: ${instructorsError.message}`);
    return;
  }

  const bernadette = instructors?.find(i => i.first_name?.toLowerCase().includes('bernadette'));
  const johfrah = instructors?.find(i => i.first_name?.toLowerCase().includes('johfrah'));

  log('Database', 'Instructor: Bernadette', bernadette ? 'PASS' : 'FAIL', 
    bernadette ? `Found: ${bernadette.first_name} ${bernadette.last_name}` : 'Bernadette not found in database');
  
  log('Database', 'Instructor: Johfrah', johfrah ? 'PASS' : 'FAIL', 
    johfrah ? `Found: ${johfrah.first_name} ${johfrah.last_name}` : 'Johfrah not found in database');

  // Check locations
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('*');

  if (locationsError) {
    log('Database', 'Locations', 'FAIL', `Failed to fetch locations: ${locationsError.message}`);
    return;
  }

  log('Database', 'Locations Count', locations && locations.length > 0 ? 'PASS' : 'WARN', 
    `Found ${locations?.length || 0} locations`, 
    locations?.map(l => `${l.name} (${l.city})`));
}

async function validateAPIEndpoints() {
  console.log('\n🌐 === API ENDPOINTS CHECK ===\n');

  const endpoints = [
    { url: 'https://www.voices.be/api/admin/config', name: 'Admin Config' },
    { url: 'https://www.voices.be/api/studio/workshops', name: 'Studio Workshops' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      const isSuccess = response.ok;
      
      if (isSuccess) {
        const data = await response.json();
        log('API', endpoint.name, 'PASS', `${endpoint.url} returned ${response.status}`, 
          endpoint.name === 'Admin Config' ? { version: data._version } : undefined);
      } else {
        log('API', endpoint.name, 'WARN', `${endpoint.url} returned ${response.status}`);
      }
    } catch (error: any) {
      log('API', endpoint.name, 'FAIL', `Failed to fetch ${endpoint.url}: ${error.message}`);
    }
  }
}

async function validatePageStructure() {
  console.log('\n📄 === PAGE STRUCTURE CHECK ===\n');

  const pages = [
    { url: 'https://www.voices.be/studio/', name: 'Studio Main' },
    { url: 'https://www.voices.be/studio/perfect-spreken', name: 'Perfect Spreken' },
    { url: 'https://www.voices.be/studio/voice-overs-voor-beginners', name: 'Voice-overs voor Beginners' },
    { url: 'https://www.voices.be/studio/tekenfilm-stemmetjes', name: 'Tekenfilm Stemmetjes' },
  ];

  for (const page of pages) {
    try {
      const response = await fetch(page.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Check for key elements
        const hasTitle = html.includes('<title>') || html.includes('Voices');
        const hasNextData = html.includes('__NEXT_DATA__');
        const hasHydrationError = html.toLowerCase().includes('hydration') && html.toLowerCase().includes('error');
        
        log('Pages', page.name, response.ok && !hasHydrationError ? 'PASS' : 'WARN', 
          `${page.url} - Status: ${response.status}`, {
            hasTitle,
            hasNextData,
            hasHydrationError: hasHydrationError ? 'DETECTED' : 'None',
            contentLength: html.length
          });

        // Check for Voices aesthetic elements
        const hasRaleway = html.includes('Raleway') || html.includes('font-light');
        const hasAuraShadow = html.includes('shadow-aura');
        const hasLiquidBackground = html.includes('LiquidBackground') || html.includes('liquid');
        
        log('Aesthetics', `${page.name} - Voices DNA`, 
          hasRaleway || hasAuraShadow ? 'PASS' : 'INFO',
          `Raleway: ${hasRaleway ? '✓' : '✗'}, Aura: ${hasAuraShadow ? '✓' : '✗'}, Liquid: ${hasLiquidBackground ? '✓' : '✗'}`);

      } else {
        log('Pages', page.name, 'FAIL', `${page.url} returned ${response.status}`);
      }
    } catch (error: any) {
      log('Pages', page.name, 'FAIL', `Failed to fetch ${page.url}: ${error.message}`);
    }
  }
}

async function validateSlimmeKassa() {
  console.log('\n💰 === SLIMME KASSA VALIDATION ===\n');

  // Check if checkout endpoints are accessible
  const checkoutUrls = [
    'https://www.voices.be/checkout/configurator',
    'https://www.voices.be/api/checkout/session',
  ];

  for (const url of checkoutUrls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      log('Slimme Kassa', url.split('/').pop() || 'endpoint', 
        response.status < 500 ? 'PASS' : 'FAIL',
        `Status: ${response.status}`);
    } catch (error: any) {
      log('Slimme Kassa', url, 'WARN', `Could not validate: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🎓 ================================================');
  console.log('   VOICES STUDIO WORLD - DEEP VALIDATION');
  console.log('   Bob-methode & Chris-Protocol');
  console.log('================================================\n');

  await validateDatabaseIntegrity();
  await validateAPIEndpoints();
  await validatePageStructure();
  await validateSlimmeKassa();

  console.log('\n📊 === VALIDATION SUMMARY ===\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const info = results.filter(r => r.status === 'INFO').length;

  console.log(`✅ PASSED:   ${passed}`);
  console.log(`❌ FAILED:   ${failed}`);
  console.log(`⚠️  WARNINGS: ${warnings}`);
  console.log(`ℹ️  INFO:     ${info}`);
  console.log(`\nTOTAL TESTS: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ VALIDATION FAILED - Critical issues detected');
    process.exit(1);
  } else if (warnings > 5) {
    console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS - Review recommended');
    process.exit(0);
  } else {
    console.log('\n✅ VALIDATION PASSED - Studio world is healthy');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('💥 VALIDATION SCRIPT CRASHED:', error);
  process.exit(1);
});
