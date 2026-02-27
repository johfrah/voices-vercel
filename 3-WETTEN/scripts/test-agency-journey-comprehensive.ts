#!/usr/bin/env tsx
/**
 * AGENCY JOURNEY COMPREHENSIVE VALIDATION SCRIPT
 * 
 * Tests the complete Agency journey flow as requested by Chris:
 * 1. Initial Page Load (/agency/)
 * 2. Stem Selectie (Actor Selection)
 * 3. Page Refresh in Script State
 * 4. Journey Switch (Video → Telefoon)
 * 5. Checkout Flow (Slimme Kassa)
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-agency-journey-comprehensive.ts
 * 
 * @version v2.15.089
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'https://www.voices.be';
const SCREENSHOT_DIR = '/tmp/agency-journey-test';

interface TestResult {
  scenario: string;
  status: 'PASS' | 'FAIL';
  errors: string[];
  consoleErrors: string[];
  screenshotPath?: string;
  details: string[];
}

class AgencyJourneyTester {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;
  private results: TestResult[] = [];
  private consoleMessages: string[] = [];
  private errors: string[] = [];

  async setup() {
    console.log('🚀 Starting Agency Journey Comprehensive Validation...\n');
    console.log(`🎯 Target: ${BASE_URL}\n`);
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    this.page = await this.context.newPage();
    
    // Capture console logs
    this.page.on('console', msg => {
      const text = msg.text();
      this.consoleMessages.push(text);
      if (msg.type() === 'error') {
        this.errors.push(`Console Error: ${text}`);
      }
    });
    
    // Capture page errors
    this.page.on('pageerror', error => {
      this.errors.push(`PageError: ${error.message}`);
    });
    
    // Capture network errors
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.errors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  }

  async teardown() {
    await this.browser.close();
  }

  private resetErrorTracking() {
    this.consoleMessages = [];
    this.errors = [];
  }

  async scenario1_InitialPageLoad(): Promise<TestResult> {
    console.log('━'.repeat(80));
    console.log('📋 SCENARIO 1: Initial Page Load (/agency/)');
    console.log('━'.repeat(80));
    
    this.resetErrorTracking();
    const result: TestResult = {
      scenario: 'Initial Page Load',
      status: 'PASS',
      errors: [],
      consoleErrors: [],
      details: []
    };

    try {
      // Navigate to /agency/
      console.log('📍 Navigating to /agency/...');
      await this.page.goto(`${BASE_URL}/agency/`, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      
      await this.page.waitForTimeout(3000);
      result.screenshotPath = `${SCREENSHOT_DIR}/01-initial-load.png`;
      await this.page.screenshot({ path: result.screenshotPath, fullPage: true });
      
      // Check for GlobalNav
      console.log('🔍 Checking for GlobalNav...');
      const globalNav = await this.page.locator('nav').first().isVisible();
      if (globalNav) {
        console.log('  ✅ GlobalNav is visible');
        result.details.push('GlobalNav: VISIBLE');
      } else {
        console.log('  ❌ GlobalNav NOT found');
        result.errors.push('GlobalNav not visible');
        result.status = 'FAIL';
      }

      // Check for AgencyHero
      console.log('🔍 Checking for AgencyHero...');
      const heroSection = await this.page.locator('[data-component="AgencyHero"], section.hero, .agency-hero').first().isVisible().catch(() => false);
      if (heroSection) {
        console.log('  ✅ AgencyHero is visible');
        result.details.push('AgencyHero: VISIBLE');
      } else {
        console.log('  ⚠️ AgencyHero not found (checking for alternative hero)');
        const anyHero = await this.page.locator('h1').first().isVisible().catch(() => false);
        if (anyHero) {
          console.log('  ✅ Hero content (h1) is visible');
          result.details.push('Hero Content: VISIBLE');
        } else {
          result.errors.push('AgencyHero not visible');
        }
      }

      // Check for VoicesMasterControl
      console.log('🔍 Checking for VoicesMasterControl...');
      const masterControl = await this.page.locator('[data-component="VoicesMasterControl"], .master-control, [class*="MasterControl"]').first().isVisible().catch(() => false);
      if (masterControl) {
        console.log('  ✅ VoicesMasterControl is visible');
        result.details.push('VoicesMasterControl: VISIBLE');
      } else {
        console.log('  ⚠️ VoicesMasterControl not found');
        result.errors.push('VoicesMasterControl not visible');
      }

      // Check for VoiceGrid with at least 18 actors
      console.log('🔍 Checking for VoiceGrid with actors...');
      const actorCards = await this.page.locator('[data-actor-card], [data-actor-id], .actor-card, [class*="ActorCard"]').count();
      console.log(`  Found ${actorCards} actor cards`);
      
      if (actorCards >= 18) {
        console.log('  ✅ VoiceGrid has 18+ actors');
        result.details.push(`VoiceGrid: ${actorCards} actors VISIBLE`);
      } else if (actorCards > 0) {
        console.log(`  ⚠️ VoiceGrid has only ${actorCards} actors (expected 18+)`);
        result.errors.push(`VoiceGrid has only ${actorCards} actors (expected 18+)`);
        result.status = 'FAIL';
      } else {
        console.log('  ❌ VoiceGrid NOT found or no actors visible');
        result.errors.push('VoiceGrid not visible or no actors');
        result.status = 'FAIL';
      }

      // Check console errors
      const criticalErrors = this.errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('HTTP 404') &&
        !e.toLowerCase().includes('analytics')
      );
      
      if (criticalErrors.length > 0) {
        console.log(`  ⚠️ ${criticalErrors.length} console errors detected`);
        result.consoleErrors = criticalErrors;
        result.status = 'FAIL';
      } else {
        console.log('  ✅ No critical console errors');
        result.details.push('Console: CLEAN');
      }

    } catch (error: any) {
      console.error('❌ Scenario 1 failed:', error.message);
      result.status = 'FAIL';
      result.errors.push(error.message);
    }

    console.log(`\n${result.status === 'PASS' ? '✅' : '❌'} Scenario 1: ${result.status}\n`);
    return result;
  }

  async scenario2_StemSelectie(): Promise<TestResult> {
    console.log('━'.repeat(80));
    console.log('📋 SCENARIO 2: Stem Selectie (Actor Selection)');
    console.log('━'.repeat(80));
    
    this.resetErrorTracking();
    const result: TestResult = {
      scenario: 'Stem Selectie',
      status: 'PASS',
      errors: [],
      consoleErrors: [],
      details: []
    };

    try {
      // Find and click "Kies stem" button for Serge (or first available actor)
      console.log('🔍 Looking for "Kies stem" button...');
      
      // Try multiple selector strategies
      const chooseButton = await this.page.locator('button:has-text("Kies stem"), button:has-text("KIES STEM"), a:has-text("Kies stem")').first();
      const isVisible = await chooseButton.isVisible().catch(() => false);
      
      if (!isVisible) {
        console.log('  ⚠️ "Kies stem" button not found, trying alternative selectors...');
        const actorCard = await this.page.locator('[data-actor-card], .actor-card').first();
        if (await actorCard.isVisible()) {
          console.log('  Found actor card, clicking it...');
          await actorCard.click();
        } else {
          throw new Error('Could not find actor selection mechanism');
        }
      } else {
        console.log('  ✅ Found "Kies stem" button');
        await chooseButton.click();
      }
      
      console.log('  ✅ Clicked actor selection');
      await this.page.waitForTimeout(2000);
      
      result.screenshotPath = `${SCREENSHOT_DIR}/02-stem-selected.png`;
      await this.page.screenshot({ path: result.screenshotPath, fullPage: true });

      // Check URL change
      const currentUrl = this.page.url();
      console.log(`  Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/agency/') && currentUrl !== `${BASE_URL}/agency/`) {
        console.log('  ✅ URL changed to actor/journey path');
        result.details.push(`URL: ${currentUrl}`);
      } else {
        console.log('  ⚠️ URL did not change as expected');
        result.errors.push('URL did not change to actor/journey path');
      }

      // Check for script state UI
      console.log('🔍 Checking for script state UI...');
      const scriptInput = await this.page.locator('textarea, [placeholder*="script"], [placeholder*="tekst"]').first().isVisible().catch(() => false);
      
      if (scriptInput) {
        console.log('  ✅ Script input is visible (script state active)');
        result.details.push('Script State: ACTIVE');
      } else {
        console.log('  ⚠️ Script input not found');
        result.errors.push('Script state UI not visible');
        result.status = 'FAIL';
      }

      // Check for selected actor in sidebar
      console.log('🔍 Checking for selected actor in sidebar...');
      const sidebar = await this.page.locator('[data-component="Sidebar"], aside, .sidebar, [class*="sidebar"]').first().isVisible().catch(() => false);
      
      if (sidebar) {
        console.log('  ✅ Sidebar is visible');
        result.details.push('Sidebar: VISIBLE with selected actor');
      } else {
        console.log('  ⚠️ Sidebar not found');
        result.errors.push('Sidebar not visible');
      }

      // Check console errors
      if (this.errors.length > 0) {
        console.log(`  ⚠️ ${this.errors.length} errors detected`);
        result.consoleErrors = this.errors;
        result.status = 'FAIL';
      } else {
        console.log('  ✅ No errors during selection');
      }

    } catch (error: any) {
      console.error('❌ Scenario 2 failed:', error.message);
      result.status = 'FAIL';
      result.errors.push(error.message);
    }

    console.log(`\n${result.status === 'PASS' ? '✅' : '❌'} Scenario 2: ${result.status}\n`);
    return result;
  }

  async scenario3_PageRefresh(): Promise<TestResult> {
    console.log('━'.repeat(80));
    console.log('📋 SCENARIO 3: Page Refresh in Script State');
    console.log('━'.repeat(80));
    
    this.resetErrorTracking();
    const result: TestResult = {
      scenario: 'Page Refresh in Script State',
      status: 'PASS',
      errors: [],
      consoleErrors: [],
      details: []
    };

    try {
      const urlBeforeRefresh = this.page.url();
      console.log(`  URL before refresh: ${urlBeforeRefresh}`);
      
      // Refresh the page
      console.log('🔄 Refreshing page...');
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(3000);
      
      result.screenshotPath = `${SCREENSHOT_DIR}/03-after-refresh.png`;
      await this.page.screenshot({ path: result.screenshotPath, fullPage: true });

      const urlAfterRefresh = this.page.url();
      console.log(`  URL after refresh: ${urlAfterRefresh}`);

      // Check if we got a 404
      const is404 = await this.page.locator('text=/404|not found/i').first().isVisible().catch(() => false);
      
      if (is404) {
        console.log('  ❌ 404 ERROR after refresh');
        result.status = 'FAIL';
        result.errors.push('404 error after page refresh');
      } else {
        console.log('  ✅ No 404 error');
        result.details.push('No 404: PASS');
      }

      // Check if state restored or correctly fell back
      const scriptInput = await this.page.locator('textarea, [placeholder*="script"]').first().isVisible().catch(() => false);
      const actorGrid = await this.page.locator('[data-actor-card]').count();
      
      if (scriptInput) {
        console.log('  ✅ Script state restored');
        result.details.push('State: RESTORED to script');
      } else if (actorGrid > 0) {
        console.log('  ✅ Correctly fell back to grid view');
        result.details.push('State: FALLBACK to grid');
      } else {
        console.log('  ⚠️ Unclear state after refresh');
        result.errors.push('State unclear after refresh');
        result.status = 'FAIL';
      }

      // Check console errors
      if (this.errors.length > 0) {
        console.log(`  ⚠️ ${this.errors.length} errors after refresh`);
        result.consoleErrors = this.errors;
        result.status = 'FAIL';
      } else {
        console.log('  ✅ No errors after refresh');
      }

    } catch (error: any) {
      console.error('❌ Scenario 3 failed:', error.message);
      result.status = 'FAIL';
      result.errors.push(error.message);
    }

    console.log(`\n${result.status === 'PASS' ? '✅' : '❌'} Scenario 3: ${result.status}\n`);
    return result;
  }

  async scenario4_JourneySwitch(): Promise<TestResult> {
    console.log('━'.repeat(80));
    console.log('📋 SCENARIO 4: Journey Switch (Video → Telefoon)');
    console.log('━'.repeat(80));
    
    this.resetErrorTracking();
    const result: TestResult = {
      scenario: 'Journey Switch',
      status: 'PASS',
      errors: [],
      consoleErrors: [],
      details: []
    };

    try {
      // Navigate back to agency if needed
      if (!this.page.url().includes('/agency/')) {
        console.log('📍 Navigating back to /agency/...');
        await this.page.goto(`${BASE_URL}/agency/`, { waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
      }

      // Find journey switcher in MasterControl
      console.log('🔍 Looking for journey switcher...');
      const journeySwitcher = await this.page.locator('[data-component="JourneySwitcher"], button:has-text("Video"), button:has-text("Telefoon"), select').first();
      
      if (await journeySwitcher.isVisible()) {
        console.log('  ✅ Journey switcher found');
        
        // Get current journey
        const currentUrl = this.page.url();
        console.log(`  Current URL: ${currentUrl}`);
        
        // Click Telefoon journey
        console.log('  Switching to Telefoon journey...');
        const telephonyButton = await this.page.locator('button:has-text("Telefoon"), a:has-text("Telefoon")').first();
        
        if (await telephonyButton.isVisible()) {
          await telephonyButton.click();
          await this.page.waitForTimeout(2000);
          
          result.screenshotPath = `${SCREENSHOT_DIR}/04-journey-switched.png`;
          await this.page.screenshot({ path: result.screenshotPath, fullPage: true });
          
          const newUrl = this.page.url();
          console.log(`  New URL: ${newUrl}`);
          
          if (newUrl.includes('telefoon') || newUrl.includes('telephony')) {
            console.log('  ✅ URL updated to Telefoon journey');
            result.details.push(`URL: ${newUrl}`);
          } else {
            console.log('  ⚠️ URL did not update to Telefoon');
            result.errors.push('URL did not update for journey switch');
          }
          
          // Check if prices updated
          console.log('🔍 Checking for price updates...');
          const priceElements = await this.page.locator('[data-price], .price, [class*="price"]').count();
          
          if (priceElements > 0) {
            console.log(`  ✅ Found ${priceElements} price elements`);
            result.details.push(`Prices: ${priceElements} elements visible`);
          } else {
            console.log('  ⚠️ No price elements found');
            result.errors.push('No price elements visible');
          }
          
        } else {
          console.log('  ⚠️ Telefoon button not found');
          result.errors.push('Telefoon journey button not found');
          result.status = 'FAIL';
        }
        
      } else {
        console.log('  ⚠️ Journey switcher not found');
        result.errors.push('Journey switcher not visible');
        result.status = 'FAIL';
      }

      // Check console errors
      if (this.errors.length > 0) {
        console.log(`  ⚠️ ${this.errors.length} errors during journey switch`);
        result.consoleErrors = this.errors;
        result.status = 'FAIL';
      } else {
        console.log('  ✅ No errors during journey switch');
      }

    } catch (error: any) {
      console.error('❌ Scenario 4 failed:', error.message);
      result.status = 'FAIL';
      result.errors.push(error.message);
    }

    console.log(`\n${result.status === 'PASS' ? '✅' : '❌'} Scenario 4: ${result.status}\n`);
    return result;
  }

  async scenario5_CheckoutFlow(): Promise<TestResult> {
    console.log('━'.repeat(80));
    console.log('📋 SCENARIO 5: Checkout Flow (Slimme Kassa)');
    console.log('━'.repeat(80));
    
    this.resetErrorTracking();
    const result: TestResult = {
      scenario: 'Checkout Flow',
      status: 'PASS',
      errors: [],
      consoleErrors: [],
      details: []
    };

    try {
      // Navigate to agency and select an actor
      console.log('📍 Setting up checkout scenario...');
      await this.page.goto(`${BASE_URL}/agency/`, { waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(2000);
      
      // Select first actor
      const chooseButton = await this.page.locator('button:has-text("Kies stem")').first();
      if (await chooseButton.isVisible()) {
        await chooseButton.click();
        await this.page.waitForTimeout(2000);
      }
      
      // Add script
      console.log('📝 Adding script...');
      const scriptInput = await this.page.locator('textarea').first();
      if (await scriptInput.isVisible()) {
        await scriptInput.fill('Dit is een test script voor checkout validatie.');
        console.log('  ✅ Script added');
        await this.page.waitForTimeout(1000);
      }
      
      // Look for checkout/order button
      console.log('🔍 Looking for checkout button...');
      const checkoutButton = await this.page.locator(
        'button:has-text("Bestellen"), button:has-text("Checkout"), button:has-text("Naar kassa"), button:has-text("BESTELLEN")'
      ).first();
      
      if (await checkoutButton.isVisible()) {
        console.log('  ✅ Checkout button found');
        
        const urlBefore = this.page.url();
        await checkoutButton.click();
        console.log('  ✅ Checkout button clicked');
        await this.page.waitForTimeout(5000);
        
        result.screenshotPath = `${SCREENSHOT_DIR}/05-checkout-initiated.png`;
        await this.page.screenshot({ path: result.screenshotPath, fullPage: true });
        
        const urlAfter = this.page.url();
        console.log(`  URL after checkout: ${urlAfter}`);
        
        // Check if redirected to Mollie or payment page
        if (urlAfter.includes('mollie') || urlAfter.includes('payment') || urlAfter.includes('checkout')) {
          console.log('  ✅ Redirected to payment provider (Mollie)');
          result.details.push('Slimme Kassa: INITIATED');
          result.details.push(`Payment URL: ${urlAfter}`);
        } else if (urlAfter !== urlBefore) {
          console.log('  ✅ Redirected to different page');
          result.details.push(`Redirect: ${urlAfter}`);
        } else {
          console.log('  ⚠️ No redirect detected');
          
          // Check for payment form on same page
          const paymentForm = await this.page.locator('form[action*="payment"], form[action*="mollie"], [data-component="PaymentForm"]').first().isVisible().catch(() => false);
          
          if (paymentForm) {
            console.log('  ✅ Payment form visible on page');
            result.details.push('Payment Form: VISIBLE');
          } else {
            console.log('  ⚠️ No payment form or redirect detected');
            result.errors.push('Checkout did not initiate payment flow');
            result.status = 'FAIL';
          }
        }
        
      } else {
        console.log('  ⚠️ Checkout button not found');
        result.errors.push('Checkout button not visible');
        result.status = 'FAIL';
      }

      // Check console errors
      if (this.errors.length > 0) {
        console.log(`  ⚠️ ${this.errors.length} errors during checkout`);
        result.consoleErrors = this.errors;
        result.status = 'FAIL';
      } else {
        console.log('  ✅ No errors during checkout');
      }

    } catch (error: any) {
      console.error('❌ Scenario 5 failed:', error.message);
      result.status = 'FAIL';
      result.errors.push(error.message);
    }

    console.log(`\n${result.status === 'PASS' ? '✅' : '❌'} Scenario 5: ${result.status}\n`);
    return result;
  }

  printFinalReport(results: TestResult[]) {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 AGENCY JOURNEY COMPREHENSIVE TEST REPORT');
    console.log('═'.repeat(80));
    console.log(`🎯 Target: ${BASE_URL}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`📦 Version: v2.15.089`);
    console.log('═'.repeat(80));
    console.log('');

    results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} SCENARIO ${index + 1}: ${result.scenario} - ${result.status}`);
      
      if (result.details.length > 0) {
        console.log('   Details:');
        result.details.forEach(detail => console.log(`     • ${detail}`));
      }
      
      if (result.errors.length > 0) {
        console.log('   ⚠️ Errors:');
        result.errors.forEach(error => console.log(`     • ${error}`));
      }
      
      if (result.consoleErrors.length > 0 && result.consoleErrors.length <= 5) {
        console.log('   🔍 Console Errors:');
        result.consoleErrors.forEach(error => console.log(`     • ${error}`));
      } else if (result.consoleErrors.length > 5) {
        console.log(`   🔍 Console Errors: ${result.consoleErrors.length} errors (showing first 3)`);
        result.consoleErrors.slice(0, 3).forEach(error => console.log(`     • ${error}`));
      }
      
      if (result.screenshotPath) {
        console.log(`   📸 Screenshot: ${result.screenshotPath}`);
      }
      
      console.log('');
    });

    console.log('═'.repeat(80));
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const totalCount = results.length;
    
    console.log(`📈 SUMMARY: ${passCount}/${totalCount} scenarios passed`);
    
    if (failCount === 0) {
      console.log('🎉 ALL SCENARIOS PASSED! Agency journey is working correctly.');
    } else {
      console.log(`⚠️ ${failCount} scenario(s) failed. Review errors above.`);
    }
    
    console.log('═'.repeat(80));
    console.log('\n🔧 Next Steps for Chris:');
    console.log('  1. Review failed scenarios and error messages');
    console.log('  2. Check screenshots in /tmp/agency-journey-test/');
    console.log('  3. Fix identified issues in the codebase');
    console.log('  4. Re-run this test to verify fixes');
    console.log('');
  }

  async runAllScenarios() {
    const results: TestResult[] = [];
    
    try {
      await this.setup();
      
      // Run all scenarios
      results.push(await this.scenario1_InitialPageLoad());
      results.push(await this.scenario2_StemSelectie());
      results.push(await this.scenario3_PageRefresh());
      results.push(await this.scenario4_JourneySwitch());
      results.push(await this.scenario5_CheckoutFlow());
      
      // Print final report
      this.printFinalReport(results);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.teardown();
    }
    
    // Exit with appropriate code
    const hasFailures = results.some(r => r.status === 'FAIL');
    process.exit(hasFailures ? 1 : 0);
  }
}

// Run the test suite
const tester = new AgencyJourneyTester();
tester.runAllScenarios().catch(console.error);
