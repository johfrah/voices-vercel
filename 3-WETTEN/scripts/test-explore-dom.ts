#!/usr/bin/env tsx
/**
 * 🔍 DOM EXPLORATION TEST
 * 
 * Explores the actual DOM structure to understand what elements exist
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-explore-dom.ts
 */

import { chromium } from 'playwright';

async function explorePage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🚀 Navigating to homepage...');
  await page.goto('https://voices-os-2026.vercel.app/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(5000);

  console.log('\n📋 PAGE STRUCTURE:\n');
  
  // Get page title
  const title = await page.title();
  console.log(`Title: ${title}`);
  
  // Get all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n🔘 Found ${buttons.length} buttons:`);
  for (let i = 0; i < Math.min(buttons.length, 20); i++) {
    const text = await buttons[i].textContent();
    const classes = await buttons[i].getAttribute('class');
    console.log(`  ${i + 1}. "${text?.trim()}" (class: ${classes?.substring(0, 50)})`);
  }
  
  // Get all inputs
  const inputs = await page.locator('input').all();
  console.log(`\n📝 Found ${inputs.length} inputs:`);
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type');
    const placeholder = await inputs[i].getAttribute('placeholder');
    const name = await inputs[i].getAttribute('name');
    console.log(`  ${i + 1}. type="${type}" placeholder="${placeholder}" name="${name}"`);
  }
  
  // Get all selects
  const selects = await page.locator('select').all();
  console.log(`\n📊 Found ${selects.length} select elements`);
  
  // Get all divs with role="button"
  const roleButtons = await page.locator('[role="button"]').all();
  console.log(`\n🎯 Found ${roleButtons.length} elements with role="button"`);
  for (let i = 0; i < Math.min(roleButtons.length, 10); i++) {
    const text = await roleButtons[i].textContent();
    console.log(`  ${i + 1}. "${text?.trim()}"`);
  }
  
  // Get all links
  const links = await page.locator('a').all();
  console.log(`\n🔗 Found ${links.length} links (showing first 20):`);
  for (let i = 0; i < Math.min(links.length, 20); i++) {
    const text = await links[i].textContent();
    const href = await links[i].getAttribute('href');
    console.log(`  ${i + 1}. "${text?.trim()}" -> ${href}`);
  }
  
  // Look for filter-related elements
  console.log('\n🔍 SEARCHING FOR FILTER ELEMENTS:\n');
  const filterKeywords = ['filter', 'taal', 'language', 'langue', 'frans', 'french'];
  for (const keyword of filterKeywords) {
    const elements = await page.locator(`text=/${keyword}/i`).all();
    if (elements.length > 0) {
      console.log(`  Found ${elements.length} elements containing "${keyword}"`);
      for (let i = 0; i < Math.min(elements.length, 5); i++) {
        const text = await elements[i].textContent();
        const tagName = await elements[i].evaluate(el => el.tagName);
        console.log(`    - <${tagName}> "${text?.trim().substring(0, 50)}"`);
      }
    }
  }
  
  // Get main content structure
  console.log('\n🏗️  MAIN STRUCTURE:\n');
  const mainSections = await page.locator('main > *').all();
  console.log(`Found ${mainSections.length} direct children of <main>`);
  for (let i = 0; i < Math.min(mainSections.length, 10); i++) {
    const tagName = await mainSections[i].evaluate(el => el.tagName);
    const classes = await mainSections[i].getAttribute('class');
    console.log(`  ${i + 1}. <${tagName}> class="${classes?.substring(0, 60)}"`);
  }
  
  // Take full page screenshot
  await page.screenshot({ path: '/tmp/voices-explore-full.png', fullPage: true });
  console.log('\n📸 Full page screenshot saved to /tmp/voices-explore-full.png');
  
  // Now check /account/ page
  console.log('\n\n' + '='.repeat(60));
  console.log('🚀 Navigating to /account/ page...');
  await page.goto('https://voices-os-2026.vercel.app/account/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(5000);
  
  console.log('\n📋 ACCOUNT PAGE STRUCTURE:\n');
  
  // Get page title
  const accountTitle = await page.title();
  console.log(`Title: ${accountTitle}`);
  
  // Get all inputs on account page
  const accountInputs = await page.locator('input').all();
  console.log(`\n📝 Found ${accountInputs.length} inputs:`);
  for (let i = 0; i < accountInputs.length; i++) {
    const type = await accountInputs[i].getAttribute('type');
    const placeholder = await accountInputs[i].getAttribute('placeholder');
    const name = await accountInputs[i].getAttribute('name');
    const id = await accountInputs[i].getAttribute('id');
    console.log(`  ${i + 1}. type="${type}" placeholder="${placeholder}" name="${name}" id="${id}"`);
  }
  
  // Get all buttons on account page
  const accountButtons = await page.locator('button').all();
  console.log(`\n🔘 Found ${accountButtons.length} buttons:`);
  for (let i = 0; i < accountButtons.length; i++) {
    const text = await accountButtons[i].textContent();
    const type = await accountButtons[i].getAttribute('type');
    console.log(`  ${i + 1}. "${text?.trim()}" (type="${type}")`);
  }
  
  // Get all forms
  const forms = await page.locator('form').all();
  console.log(`\n📋 Found ${forms.length} forms`);
  
  // Take account page screenshot
  await page.screenshot({ path: '/tmp/voices-explore-account.png', fullPage: true });
  console.log('\n📸 Account page screenshot saved to /tmp/voices-explore-account.png');
  
  await browser.close();
}

explorePage().catch(console.error);
