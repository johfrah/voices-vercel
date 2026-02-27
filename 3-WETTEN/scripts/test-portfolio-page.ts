#!/usr/bin/env tsx
/**
 * Portfolio Page Test Suite - Warm World DNA & UX Validation
 * Tests scenarios 21-25 as requested by Chris
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  scenario: string;
  status: 'PASS' | 'FAIL';
  errors: string[];
  consoleErrors: string[];
  screenshotPath?: string;
  details: string[];
}

const LIVE_URL = 'https://www.voices.be';
const PORTFOLIO_SLUG = 'portfolio/johfrah';
const SCREENSHOT_DIR = path.join(__dirname, '../test-results/portfolio-page');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function test21_WarmWorldDNA(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '21. Portfolio Page (Warm World) DNA',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🎨 Test 21: Warm World DNA Verification');
    
    await page.goto(`${LIVE_URL}/${PORTFOLIO_SLUG}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    await page.waitForTimeout(2000);

    result.screenshotPath = await captureScreenshot(page, 'test21-warm-world-dna');

    const warmWorldCheck = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main');
      const computedBodyStyle = window.getComputedStyle(body);
      const computedMainStyle = main ? window.getComputedStyle(main) : null;
      
      return {
        bodyBg: computedBodyStyle.backgroundColor,
        bodyColor: computedBodyStyle.color,
        bodyClasses: body.className,
        mainClasses: main?.className || 'not found',
        mainBg: computedMainStyle?.backgroundColor || 'not found',
        hasWarmWorld: body.className.includes('warm') || 
                     main?.className.includes('warm') ||
                     body.getAttribute('data-world') === 'portfolio' ||
                     main?.getAttribute('data-world') === 'portfolio',
        worldAttribute: body.getAttribute('data-world') || main?.getAttribute('data-world') || 'not found'
      };
    });

    result.details.push(`Body background: ${warmWorldCheck.bodyBg}`);
    result.details.push(`Body color: ${warmWorldCheck.bodyColor}`);
    result.details.push(`Body classes: ${warmWorldCheck.bodyClasses}`);
    result.details.push(`Main classes: ${warmWorldCheck.mainClasses}`);
    result.details.push(`World attribute: ${warmWorldCheck.worldAttribute}`);
    result.details.push(`Has Warm World marker: ${warmWorldCheck.hasWarmWorld}`);

    const typographyCheck = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3');
      const fonts = Array.from(headings).map(h => {
        const style = window.getComputedStyle(h);
        return {
          tag: h.tagName,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          text: h.textContent?.trim().substring(0, 50)
        };
      });

      const hasRaleway = fonts.some(f => f.fontFamily.toLowerCase().includes('raleway'));
      const hasLightWeight = fonts.some(f => parseInt(f.fontWeight) <= 300);

      return {
        headingCount: headings.length,
        fonts,
        hasRaleway,
        hasLightWeight
      };
    });

    result.details.push(`Headings found: ${typographyCheck.headingCount}`);
    result.details.push(`Uses Raleway: ${typographyCheck.hasRaleway}`);
    result.details.push(`Uses light weight: ${typographyCheck.hasLightWeight}`);

    if (!typographyCheck.hasRaleway) {
      result.errors.push('Raleway font not detected in headings (Warm World mandate)');
      result.status = 'FAIL';
    }

    if (!typographyCheck.hasLightWeight) {
      result.errors.push('Light font-weight not detected (should be 200-300 for Warm World)');
      result.status = 'FAIL';
    }

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test22_MediaGalleryFiltering(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '22. Media Galerij & Filtering',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🎬 Test 22: Media Gallery & Filtering');

    const mediaCheck = await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      const audioElements = document.querySelectorAll('audio');
      const mediaContainers = document.querySelectorAll('[data-media], [class*="media"], [class*="gallery"]');
      
      const videoSources = Array.from(videos).map(v => ({
        src: v.src || v.querySelector('source')?.src,
        poster: v.poster,
        visible: window.getComputedStyle(v).display !== 'none'
      }));

      const audioSources = Array.from(audioElements).map(a => ({
        src: a.src || a.querySelector('source')?.src,
        visible: window.getComputedStyle(a).display !== 'none'
      }));

      return {
        videoCount: videos.length,
        audioCount: audioElements.length,
        mediaContainerCount: mediaContainers.length,
        videoSources,
        audioSources
      };
    });

    result.details.push(`Videos found: ${mediaCheck.videoCount}`);
    result.details.push(`Audio elements found: ${mediaCheck.audioCount}`);
    result.details.push(`Media containers found: ${mediaCheck.mediaContainerCount}`);
    
    if (mediaCheck.videoSources.length > 0) {
      result.details.push(`Video sources: ${mediaCheck.videoSources.length} total`);
      mediaCheck.videoSources.slice(0, 3).forEach((v, i) => {
        result.details.push(`  Video ${i + 1}: ${v.src?.substring(0, 60)}... (visible: ${v.visible})`);
      });
    }

    if (mediaCheck.videoCount === 0 && mediaCheck.audioCount === 0) {
      result.errors.push('No media elements (video/audio) found on portfolio page');
      result.status = 'FAIL';
    }

    const filterCheck = await page.evaluate(() => {
      const filterButtons = document.querySelectorAll(
        '[data-filter], [data-journey], button[class*="filter"], button[class*="journey"]'
      );
      
      const filters = Array.from(filterButtons).map(btn => ({
        text: btn.textContent?.trim(),
        value: btn.getAttribute('data-filter') || btn.getAttribute('data-journey'),
        classes: btn.className
      }));

      return {
        filterCount: filterButtons.length,
        filters
      };
    });

    result.details.push(`Filter buttons found: ${filterCheck.filterCount}`);
    
    if (filterCheck.filters.length > 0) {
      result.details.push('Available filters:');
      filterCheck.filters.forEach(f => {
        result.details.push(`  - ${f.text} (value: ${f.value})`);
      });
    }

    if (filterCheck.filterCount > 0) {
      try {
        const firstFilter = await page.locator('[data-filter], [data-journey], button[class*="filter"]').first();
        await firstFilter.click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        
        result.details.push('✅ Filter button clicked successfully');

        const filteredMedia = await page.evaluate(() => {
          const visibleVideos = Array.from(document.querySelectorAll('video')).filter(
            v => window.getComputedStyle(v).display !== 'none'
          );
          return visibleVideos.length;
        });

        result.details.push(`Visible videos after filter: ${filteredMedia}`);
      } catch (error) {
        result.errors.push(`Could not interact with filter: ${error}`);
      }
    } else {
      result.details.push('⚠️  No filter buttons found (may be optional for this portfolio)');
    }

    result.screenshotPath = await captureScreenshot(page, 'test22-media-gallery');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test23_TestimonialsSection(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '23. Klant Getuigenissen Sectie',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n💬 Test 23: Testimonials/Reviews Section');

    const testimonialsCheck = await page.evaluate(() => {
      const testimonialSections = document.querySelectorAll(
        '[data-testimonials], [class*="testimonial"], [class*="review"], [class*="getuigenis"]'
      );
      
      const testimonials = Array.from(testimonialSections).map(section => {
        const quotes = section.querySelectorAll('blockquote, [class*="quote"], p[class*="testimonial"]');
        const authors = section.querySelectorAll('[class*="author"], [class*="name"], cite');
        
        return {
          hasContent: section.textContent && section.textContent.trim().length > 0,
          quoteCount: quotes.length,
          authorCount: authors.length,
          visible: window.getComputedStyle(section).display !== 'none',
          classes: section.className
        };
      });

      const allQuotes = document.querySelectorAll('blockquote');
      const allCites = document.querySelectorAll('cite');

      return {
        testimonialSectionCount: testimonialSections.length,
        testimonials,
        totalQuotes: allQuotes.length,
        totalCites: allCites.length,
        hasTestimonialContent: testimonials.some(t => t.hasContent && t.visible)
      };
    });

    result.details.push(`Testimonial sections found: ${testimonialsCheck.testimonialSectionCount}`);
    result.details.push(`Total quotes (blockquote): ${testimonialsCheck.totalQuotes}`);
    result.details.push(`Total citations (cite): ${testimonialsCheck.totalCites}`);
    result.details.push(`Has visible testimonial content: ${testimonialsCheck.hasTestimonialContent}`);

    if (testimonialsCheck.testimonials.length > 0) {
      testimonialsCheck.testimonials.forEach((t, i) => {
        result.details.push(
          `Section ${i + 1}: ${t.quoteCount} quotes, ${t.authorCount} authors, visible: ${t.visible}`
        );
      });
    }

    if (!testimonialsCheck.hasTestimonialContent && testimonialsCheck.testimonialSectionCount === 0) {
      result.details.push('⚠️  No testimonials section found (may be optional for this portfolio)');
    }

    result.screenshotPath = await captureScreenshot(page, 'test23-testimonials');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test24_SocialMediaIntegration(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '24. Social Media Integratie',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🔗 Test 24: Social Media Links');

    const socialCheck = await page.evaluate(() => {
      const socialLinks = document.querySelectorAll(
        'a[href*="instagram.com"], a[href*="spotify.com"], a[href*="youtube.com"], ' +
        'a[href*="linkedin.com"], a[href*="facebook.com"], a[href*="twitter.com"], ' +
        'a[href*="tiktok.com"], [data-social], [class*="social"]'
      );

      const links = Array.from(socialLinks).map(link => {
        const href = (link as HTMLAnchorElement).href;
        const platform = 
          href.includes('instagram') ? 'Instagram' :
          href.includes('spotify') ? 'Spotify' :
          href.includes('youtube') ? 'YouTube' :
          href.includes('linkedin') ? 'LinkedIn' :
          href.includes('facebook') ? 'Facebook' :
          href.includes('twitter') ? 'Twitter/X' :
          href.includes('tiktok') ? 'TikTok' :
          'Other';

        return {
          platform,
          href,
          text: link.textContent?.trim(),
          ariaLabel: link.getAttribute('aria-label'),
          visible: window.getComputedStyle(link).display !== 'none'
        };
      });

      const platforms = [...new Set(links.map(l => l.platform))];

      return {
        totalSocialLinks: socialLinks.length,
        links,
        platforms,
        visibleLinks: links.filter(l => l.visible).length
      };
    });

    result.details.push(`Social media links found: ${socialCheck.totalSocialLinks}`);
    result.details.push(`Visible links: ${socialCheck.visibleLinks}`);
    result.details.push(`Platforms detected: ${socialCheck.platforms.join(', ')}`);

    if (socialCheck.links.length > 0) {
      result.details.push('\nSocial links:');
      socialCheck.links.forEach(link => {
        result.details.push(
          `  - ${link.platform}: ${link.href} (visible: ${link.visible})`
        );
      });
    }

    if (socialCheck.totalSocialLinks === 0) {
      result.errors.push('No social media links found on portfolio page');
      result.status = 'FAIL';
    }

    if (socialCheck.visibleLinks === 0 && socialCheck.totalSocialLinks > 0) {
      result.errors.push('Social links exist but none are visible');
      result.status = 'FAIL';
    }

    const instagramCheck = socialCheck.links.some(l => l.platform === 'Instagram');
    result.details.push(`Has Instagram link: ${instagramCheck}`);

    result.screenshotPath = await captureScreenshot(page, 'test24-social-media');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test25_PerformanceCheck(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '25. Performance (100ms LCP) Check',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n⚡ Test 25: Performance & Nuclear Loading Law');

    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
      const lcp = paintEntries.find(e => e.name === 'largest-contentful-paint');

      return {
        domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
        loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart,
        fcp: fcp?.startTime,
        lcp: lcp?.startTime,
        transferSize: perfData?.transferSize,
        domInteractive: perfData?.domInteractive
      };
    });

    result.details.push(`DOM Content Loaded: ${performanceMetrics.domContentLoaded?.toFixed(2)}ms`);
    result.details.push(`Load Complete: ${performanceMetrics.loadComplete?.toFixed(2)}ms`);
    result.details.push(`First Contentful Paint: ${performanceMetrics.fcp?.toFixed(2)}ms`);
    result.details.push(`Largest Contentful Paint: ${performanceMetrics.lcp?.toFixed(2)}ms`);
    result.details.push(`Transfer Size: ${(performanceMetrics.transferSize / 1024).toFixed(2)} KB`);

    if (performanceMetrics.lcp && performanceMetrics.lcp > 100) {
      result.details.push(`⚠️  LCP exceeds 100ms target: ${performanceMetrics.lcp.toFixed(2)}ms`);
    }

    const dynamicLoadingCheck = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const dynamicScripts = scripts.filter(s => 
        s.src.includes('chunk') || 
        s.getAttribute('data-dynamic') === 'true' ||
        s.textContent?.includes('next/dynamic')
      );

      const heavyComponents = [
        document.querySelector('[data-chat]'),
        document.querySelector('[data-audio-dock]'),
        document.querySelector('[data-casting-dock]')
      ].filter(Boolean);

      return {
        totalScripts: scripts.length,
        dynamicScripts: dynamicScripts.length,
        heavyComponentsFound: heavyComponents.length,
        scriptSizes: scripts.map(s => ({
          src: s.src?.substring(s.src.lastIndexOf('/') + 1, s.src.length).substring(0, 40),
          async: s.async,
          defer: s.defer
        })).filter(s => s.src)
      };
    });

    result.details.push(`\nScript Analysis:`);
    result.details.push(`Total scripts: ${dynamicLoadingCheck.totalScripts}`);
    result.details.push(`Dynamic chunks: ${dynamicLoadingCheck.dynamicScripts}`);
    result.details.push(`Heavy components detected: ${dynamicLoadingCheck.heavyComponentsFound}`);

    const bundleSizeCheck = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      const totalJsSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
      const largestJs = jsResources.sort((a, b) => b.transferSize - a.transferSize).slice(0, 5);

      return {
        totalJsFiles: jsResources.length,
        totalJsSize: totalJsSize,
        largestBundles: largestJs.map(r => ({
          name: r.name.substring(r.name.lastIndexOf('/') + 1),
          size: (r.transferSize / 1024).toFixed(2) + ' KB',
          duration: r.duration.toFixed(2) + 'ms'
        }))
      };
    });

    result.details.push(`\nBundle Analysis:`);
    result.details.push(`Total JS files: ${bundleSizeCheck.totalJsFiles}`);
    result.details.push(`Total JS size: ${(bundleSizeCheck.totalJsSize / 1024).toFixed(2)} KB`);
    
    if (bundleSizeCheck.largestBundles.length > 0) {
      result.details.push(`Largest bundles:`);
      bundleSizeCheck.largestBundles.forEach(b => {
        result.details.push(`  - ${b.name}: ${b.size} (${b.duration})`);
      });
    }

    if (bundleSizeCheck.totalJsSize > 500 * 1024) {
      result.errors.push(`Main bundle size exceeds 500KB: ${(bundleSizeCheck.totalJsSize / 1024).toFixed(2)} KB`);
      result.status = 'FAIL';
    }

    result.screenshotPath = await captureScreenshot(page, 'test25-performance');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function runAllTests() {
  console.log('🚀 Starting Portfolio Page Test Suite');
  console.log(`Target: ${LIVE_URL}/${PORTFOLIO_SLUG}`);
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const results: TestResult[] = [];

  try {
    results.push(await test21_WarmWorldDNA(page));
    results.push(await test22_MediaGalleryFiltering(page));
    results.push(await test23_TestimonialsSection(page));
    results.push(await test24_SocialMediaIntegration(page));
    results.push(await test25_PerformanceCheck(page));

    results.forEach(r => r.consoleErrors = [...consoleErrors]);

  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  results.forEach(result => {
    console.log(`\n${result.scenario}`);
    console.log(`Status: ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result.details.length > 0) {
      console.log('\nDetails:');
      result.details.forEach(d => console.log(`  ${d}`));
    }

    if (result.errors.length > 0) {
      console.log('\n🚨 Errors:');
      result.errors.forEach(e => console.log(`  - ${e}`));
    }

    if (result.screenshotPath) {
      console.log(`\n📸 Screenshot: ${result.screenshotPath}`);
    }
  });

  if (consoleErrors.length > 0) {
    console.log('\n🚨 Console Errors Detected:');
    consoleErrors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (consoleErrors.length > 10) {
      console.log(`  ... and ${consoleErrors.length - 10} more errors`);
    }
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;

  console.log('\n' + '='.repeat(60));
  console.log(`FINAL SCORE: ${passCount} PASS / ${failCount} FAIL`);
  console.log('='.repeat(60));

  process.exit(failCount > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
