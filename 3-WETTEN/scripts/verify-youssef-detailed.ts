#!/usr/bin/env node
/**
 * Detailed Youssef Artist Page Analysis
 */

import puppeteer from 'puppeteer';

async function analyzeYoussefPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('🌐 Navigating to https://www.voices.be/artist/youssef...');
    await page.goto('https://www.voices.be/artist/youssef', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ Waiting for hydration...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1')).map(el => el.textContent?.trim()),
        h2: Array.from(document.querySelectorAll('h2')).map(el => el.textContent?.trim()),
        bodyText: document.body.innerText.substring(0, 2000),
        metaTags: Array.from(document.querySelectorAll('meta[property^="og:"]')).map(el => ({
          property: el.getAttribute('property'),
          content: el.getAttribute('content')
        })),
        buttons: Array.from(document.querySelectorAll('button, a[role="button"]')).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          className: el.className,
          href: (el as HTMLAnchorElement).href || null
        })).slice(0, 20),
        url: window.location.href,
        pathname: window.location.pathname
      };
    });

    console.log('\n' + '='.repeat(80));
    console.log('📋 DETAILED PAGE ANALYSIS');
    console.log('='.repeat(80));
    console.log('\n📍 URL:', pageContent.url);
    console.log('📍 Pathname:', pageContent.pathname);
    console.log('\n📄 Title:', pageContent.title);
    console.log('\n📌 H1 Tags:', JSON.stringify(pageContent.h1, null, 2));
    console.log('\n📌 H2 Tags:', JSON.stringify(pageContent.h2, null, 2));
    console.log('\n🏷️ Meta Tags:', JSON.stringify(pageContent.metaTags, null, 2));
    console.log('\n🔘 Buttons (first 20):', JSON.stringify(pageContent.buttons, null, 2));
    console.log('\n📝 Body Text (first 2000 chars):');
    console.log(pageContent.bodyText);

    // Search for specific keywords
    const keywords = ['youssef', 'zaki', 'donate', 'doneer', 'steun', '10500', '10.500', 'goal', 'doel'];
    console.log('\n🔍 Keyword Search:');
    for (const keyword of keywords) {
      const found = pageContent.bodyText.toLowerCase().includes(keyword.toLowerCase());
      console.log(`  ${found ? '✅' : '❌'} "${keyword}"`);
    }

    await browser.close();

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    await browser.close();
    process.exit(1);
  }
}

analyzeYoussefPage();
