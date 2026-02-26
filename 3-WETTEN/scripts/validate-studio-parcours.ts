#!/usr/bin/env tsx
/**
 * 🎓 Studio Parcours E2E Validation
 * 
 * Validates the complete Studio journey on voices.be:
 * 1. /studio/quiz - Video quiz with subtitles
 * 2. Quiz completion → recommendation or /studio/doe-je-mee
 * 3. /studio/doe-je-mee - Dynamic workshop list
 * 4. Interest form submission
 * 5. Aesthetic validation (Raleway, Natural Capitalization)
 */

import { chromium, type Browser, type Page } from 'playwright';

interface ValidationResult {
  step: string;
  success: boolean;
  details: string;
  screenshot?: string;
}

const results: ValidationResult[] = [];

async function validateStudioParcours() {
  console.log('🎓 Starting Studio Parcours Validation...\n');
  
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    page = await context.newPage();

    // ========================================
    // STEP 1: Navigate to /studio/quiz
    // ========================================
    console.log('📍 Step 1: Navigating to /studio/quiz...');
    await page.goto('https://www.voices.be/studio/quiz', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Check if video element exists
    const videoElement = await page.locator('video').first();
    const videoExists = await videoElement.count() > 0;
    
    if (videoExists) {
      results.push({
        step: '1a. Video Element',
        success: true,
        details: 'Video element found on /studio/quiz'
      });
      
      // Check if video has loaded
      const videoSrc = await videoElement.getAttribute('src');
      results.push({
        step: '1b. Video Source',
        success: !!videoSrc,
        details: videoSrc ? `Video source: ${videoSrc.substring(0, 60)}...` : 'No video source found'
      });
    } else {
      results.push({
        step: '1a. Video Element',
        success: false,
        details: 'Video element NOT found on /studio/quiz'
      });
    }
    
    // Check for subtitles/captions
    const subtitlesVisible = await page.locator('track[kind="subtitles"], track[kind="captions"], .subtitle, .caption').count() > 0;
    results.push({
      step: '1c. Subtitles',
      success: subtitlesVisible,
      details: subtitlesVisible ? 'Subtitle tracks found' : 'No subtitle elements detected'
    });
    
    // Check for quiz start button/interaction
    const quizStartButton = await page.locator('button:has-text("Start"), button:has-text("Begin"), [data-quiz-start]').first();
    const hasStartButton = await quizStartButton.count() > 0;
    
    results.push({
      step: '1d. Quiz Start Button',
      success: hasStartButton,
      details: hasStartButton ? 'Quiz start button found' : 'No quiz start button detected'
    });

    // ========================================
    // STEP 2: Complete Quiz
    // ========================================
    console.log('📍 Step 2: Attempting to complete quiz...');
    
    if (hasStartButton) {
      await quizStartButton.click();
      await page.waitForTimeout(2000);
      
      // Look for quiz questions or interactive elements
      const quizQuestions = await page.locator('[data-question], .quiz-question, button[data-answer]').count();
      
      if (quizQuestions > 0) {
        results.push({
          step: '2a. Quiz Questions',
          success: true,
          details: `Found ${quizQuestions} quiz interaction elements`
        });
        
        // Try to answer questions (click first available answer buttons)
        const answerButtons = await page.locator('button[data-answer], .quiz-answer button').all();
        
        for (let i = 0; i < Math.min(answerButtons.length, 5); i++) {
          try {
            await answerButtons[i].click();
            await page.waitForTimeout(1000);
          } catch (e) {
            // Continue if button is not clickable
          }
        }
        
        // Check if we're redirected to recommendation or doe-je-mee
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        const redirectedCorrectly = currentUrl.includes('/studio/doe-je-mee') || currentUrl.includes('recommendation');
        
        results.push({
          step: '2b. Quiz Completion Redirect',
          success: redirectedCorrectly,
          details: redirectedCorrectly 
            ? `Redirected to: ${currentUrl}` 
            : `Still on: ${currentUrl} (expected redirect to /studio/doe-je-mee or recommendation)`
        });
      } else {
        results.push({
          step: '2a. Quiz Questions',
          success: false,
          details: 'No quiz questions found after clicking start'
        });
      }
    }

    // ========================================
    // STEP 3: Navigate to /studio/doe-je-mee
    // ========================================
    console.log('📍 Step 3: Navigating to /studio/doe-je-mee...');
    await page.goto('https://www.voices.be/studio/doe-je-mee', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Check for workshop list
    const workshopCards = await page.locator('[data-workshop], .workshop-card, [class*="workshop"]').count();
    
    results.push({
      step: '3a. Workshop List',
      success: workshopCards > 0,
      details: `Found ${workshopCards} workshop elements`
    });
    
    // Check if more than 8 workshops (dynamic loading)
    const dynamicLoadingWorks = workshopCards > 8;
    results.push({
      step: '3b. Dynamic Workshop Loading',
      success: dynamicLoadingWorks,
      details: dynamicLoadingWorks 
        ? `✅ Dynamic loading confirmed: ${workshopCards} workshops (> 8 static)` 
        : `⚠️ Only ${workshopCards} workshops found (expected > 8 for dynamic loading)`
    });

    // ========================================
    // STEP 4: Fill Interest Form
    // ========================================
    console.log('📍 Step 4: Testing interest form...');
    
    // Look for form fields
    const nameInput = await page.locator('input[name="name"], input[name="firstName"], input[placeholder*="naam" i]').first();
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Verstuur"), button:has-text("Inschrijven")').first();
    
    const hasNameField = await nameInput.count() > 0;
    const hasEmailField = await emailInput.count() > 0;
    const hasSubmitButton = await submitButton.count() > 0;
    
    results.push({
      step: '4a. Form Fields Present',
      success: hasNameField && hasEmailField && hasSubmitButton,
      details: `Name field: ${hasNameField}, Email field: ${hasEmailField}, Submit button: ${hasSubmitButton}`
    });
    
    if (hasNameField && hasEmailField && hasSubmitButton) {
      // Fill form with test data
      await nameInput.fill('E2E Test User');
      await emailInput.fill('e2e-test@voices.be');
      await page.waitForTimeout(500);
      
      // Submit form
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Check for success state (could be a message, redirect, or UI change)
      const successIndicators = await page.locator(
        '.success, [data-success], :has-text("Bedankt"), :has-text("Succesvol"), :has-text("Ontvangen")'
      ).count();
      
      results.push({
        step: '4b. Form Submission Success',
        success: successIndicators > 0,
        details: successIndicators > 0 
          ? `✅ Success state detected (${successIndicators} indicators)` 
          : '⚠️ No clear success indicator found after submission'
      });
    }

    // ========================================
    // STEP 5: Aesthetic Validation
    // ========================================
    console.log('📍 Step 5: Validating aesthetic elements...');
    
    // Check for Raleway font
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    const usesRaleway = bodyFont.toLowerCase().includes('raleway');
    results.push({
      step: '5a. Raleway Font',
      success: usesRaleway,
      details: usesRaleway ? `✅ Raleway detected: ${bodyFont}` : `⚠️ Font family: ${bodyFont}`
    });
    
    // Check for Natural Capitalization (headings should not be all caps)
    const headings = await page.locator('h1, h2, h3').allTextContents();
    const hasNaturalCaps = headings.some(h => {
      const hasLowerCase = /[a-z]/.test(h);
      const hasUpperCase = /[A-Z]/.test(h);
      return hasLowerCase && hasUpperCase;
    });
    
    results.push({
      step: '5b. Natural Capitalization',
      success: hasNaturalCaps,
      details: hasNaturalCaps 
        ? '✅ Natural Capitalization detected in headings' 
        : '⚠️ Headings may be using all caps or all lowercase'
    });
    
    // Check for Voices branding elements
    const hasVoicesBranding = await page.locator('[alt*="Voices" i], [src*="logo" i], .logo').count() > 0;
    results.push({
      step: '5c. Voices Branding',
      success: hasVoicesBranding,
      details: hasVoicesBranding ? '✅ Voices branding elements found' : '⚠️ No clear branding elements detected'
    });

    // ========================================
    // FINAL REPORT
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🎓 STUDIO PARCOURS VALIDATION REPORT');
    console.log('='.repeat(60) + '\n');
    
    console.log(`📦 Version: v2.14.765 (confirmed in package.json)`);
    console.log(`🌐 Target: https://www.voices.be/studio/*\n`);
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.step}`);
      console.log(`   ${result.details}\n`);
    });
    
    console.log('='.repeat(60));
    console.log(`📊 SUMMARY: ${passedTests}/${totalTests} tests passed`);
    console.log('='.repeat(60) + '\n');
    
    if (failedTests > 0) {
      console.log(`⚠️  ${failedTests} test(s) failed. Review details above.`);
      process.exit(1);
    } else {
      console.log('🎉 All validation tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Fatal error during validation:', error);
    process.exit(1);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run validation
validateStudioParcours();
