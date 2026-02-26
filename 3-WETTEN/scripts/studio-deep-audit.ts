/**
 * Studio Deep Audit - Forensic Analysis
 * Captures digest IDs, DOM structure, and visual evidence
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), '3-WETTEN', 'scripts', 'screenshots');

async function deepAudit() {
  console.log('🔍 Starting Studio Deep Forensic Audit...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const consoleMessages: Array<{type: string, text: string, digest?: string}> = [];
  
  // Capture ALL console messages with digest extraction
  page.on('console', msg => {
    const text = msg.text();
    let digest: string | undefined;
    
    // Try to extract digest from error messages
    const digestMatch = text.match(/Digest:\s*([a-zA-Z0-9]+)/i);
    if (digestMatch) {
      digest = digestMatch[1];
    }
    
    consoleMessages.push({
      type: msg.type(),
      text,
      digest
    });
  });

  try {
    // ========================================
    // QUIZ PAGE DEEP DIVE
    // ========================================
    console.log('🎬 QUIZ PAGE ANALYSIS');
    console.log('='.repeat(60));
    
    await page.goto('https://www.voices.be/studio/quiz', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000); // Give time for hydration
    
    // Check for version in page
    const versionInPage = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const versionScript = scripts.find(s => s.textContent?.includes('currentVersion'));
      if (versionScript) {
        const match = versionScript.textContent?.match(/currentVersion["\s:]+["']?v?(\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
      }
      
      // Check meta tags
      const meta = document.querySelector('meta[name="version"]');
      return meta?.getAttribute('content') || null;
    });
    
    if (versionInPage) {
      console.log(`✅ Version detected in page: v${versionInPage}`);
    }
    
    // Analyze video elements
    const videoAnalysis = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      return videos.map(v => ({
        src: v.src || v.querySelector('source')?.src || 'no-src',
        autoplay: v.autoplay,
        muted: v.muted,
        loop: v.loop,
        paused: v.paused,
        readyState: v.readyState,
        currentTime: v.currentTime,
        className: v.className,
        parentClassName: v.parentElement?.className || 'no-parent'
      }));
    });
    
    console.log(`\n📹 Video Elements Found: ${videoAnalysis.length}`);
    if (videoAnalysis.length > 0) {
      videoAnalysis.forEach((v, i) => {
        console.log(`\nVideo ${i + 1}:`);
        console.log(`  - Source: ${v.src.substring(0, 80)}...`);
        console.log(`  - Autoplay: ${v.autoplay}, Muted: ${v.muted}, Loop: ${v.loop}`);
        console.log(`  - Ready State: ${v.readyState} (4 = HAVE_ENOUGH_DATA)`);
        console.log(`  - Playing: ${!v.paused}, Current Time: ${v.currentTime}s`);
        console.log(`  - Class: ${v.className}`);
      });
    } else {
      console.log('⚠️  No video elements found in DOM');
      
      // Check for background images as fallback
      const bgImages = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements
          .filter(el => {
            const bg = window.getComputedStyle(el).backgroundImage;
            return bg && bg !== 'none' && bg.includes('url');
          })
          .map(el => ({
            tag: el.tagName,
            className: el.className,
            backgroundImage: window.getComputedStyle(el).backgroundImage
          }))
          .slice(0, 5);
      });
      
      if (bgImages.length > 0) {
        console.log('\n🖼️  Background images detected (possible video fallback):');
        bgImages.forEach(img => {
          console.log(`  - ${img.tag}.${img.className}`);
        });
      }
    }
    
    // Check button structure
    const buttonAnalysis = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => ({
        text: b.textContent?.trim().substring(0, 50) || '',
        className: b.className,
        disabled: b.disabled,
        type: b.type
      }));
    });
    
    console.log(`\n🔘 Buttons Found: ${buttonAnalysis.length}`);
    buttonAnalysis.forEach((b, i) => {
      console.log(`  ${i + 1}. "${b.text}" (${b.disabled ? 'disabled' : 'enabled'})`);
    });
    
    // Screenshot quiz
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'quiz-deep.png'),
      fullPage: true 
    });
    
    // ========================================
    // WORKSHOPS PAGE DEEP DIVE
    // ========================================
    console.log('\n\n📚 WORKSHOPS PAGE ANALYSIS');
    console.log('='.repeat(60));
    
    await page.goto('https://www.voices.be/studio/doe-je-mee', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Analyze workshop structure
    const workshopAnalysis = await page.evaluate(() => {
      // Look for various patterns
      const grids = document.querySelectorAll('[class*="grid"]');
      const cards = document.querySelectorAll('[class*="card"], article, [role="article"]');
      const workshops = document.querySelectorAll('[class*="workshop"]');
      
      // Get actual text content
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim().substring(0, 60) || '',
        fontFamily: window.getComputedStyle(h).fontFamily,
        textTransform: window.getComputedStyle(h).textTransform
      }));
      
      return {
        gridCount: grids.length,
        cardCount: cards.length,
        workshopCount: workshops.length,
        headings,
        bodyFont: window.getComputedStyle(document.body).fontFamily
      };
    });
    
    console.log(`\n📊 Structure Analysis:`);
    console.log(`  - Grid containers: ${workshopAnalysis.gridCount}`);
    console.log(`  - Card/Article elements: ${workshopAnalysis.cardCount}`);
    console.log(`  - Workshop-specific elements: ${workshopAnalysis.workshopCount}`);
    console.log(`  - Body font: ${workshopAnalysis.bodyFont}`);
    
    console.log(`\n📝 Headings (${workshopAnalysis.headings.length}):`);
    workshopAnalysis.headings.forEach((h, i) => {
      const capsWarning = h.textTransform === 'uppercase' ? ' ⚠️ ALL CAPS' : '';
      const fontWarning = !h.fontFamily.toLowerCase().includes('raleway') ? ' ⚠️ Not Raleway' : ' ✅';
      console.log(`  ${i + 1}. ${h.tag}: "${h.text}"${capsWarning}${fontWarning}`);
    });
    
    // Screenshot workshops
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'workshops-deep.png'),
      fullPage: true 
    });
    
    // ========================================
    // CONSOLE ERROR ANALYSIS
    // ========================================
    console.log('\n\n🚨 CONSOLE ERROR ANALYSIS');
    console.log('='.repeat(60));
    
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    
    console.log(`\nTotal console messages: ${consoleMessages.length}`);
    console.log(`  - Errors: ${errors.length}`);
    console.log(`  - Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Error Details:');
      errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.text.substring(0, 200)}`);
        if (err.digest) {
          console.log(`   Digest: ${err.digest}`);
        }
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warning Details:');
      warnings.slice(0, 5).forEach((warn, i) => {
        console.log(`\n${i + 1}. ${warn.text.substring(0, 150)}`);
      });
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      version: versionInPage,
      quiz: {
        videoElements: videoAnalysis,
        buttons: buttonAnalysis
      },
      workshops: workshopAnalysis,
      console: {
        errors: errors.map(e => ({ text: e.text, digest: e.digest })),
        warnings: warnings.slice(0, 10).map(w => ({ text: w.text }))
      }
    };
    
    writeFileSync(
      join(SCREENSHOTS_DIR, 'deep-audit-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n\n✅ Deep audit complete. Screenshots and report saved.');
    
  } catch (error) {
    console.error('❌ Fatal error during deep audit:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

deepAudit().catch(console.error);
