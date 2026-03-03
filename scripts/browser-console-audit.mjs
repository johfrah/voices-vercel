#!/usr/bin/env node
/**
 * Browser Console Audit Script
 * Captures console logs and validates the live site using Playwright
 */

import { chromium } from 'playwright';

async function auditSite() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    const consoleLogs = [];
    const networkRequests = new Map();

    // Capture console logs
    page.on('console', (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
    });

    // Capture network requests
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/actors') || url.includes('/api/admin/config')) {
        try {
          const text = await response.text();
          networkRequests.set(url, {
            status: response.status(),
            data: text
          });
        } catch (e) {
          networkRequests.set(url, {
            status: response.status(),
            error: e.message
          });
        }
      }
    });

    console.log('🌐 Navigating to https://www.voices.be...');
    await page.goto('https://www.voices.be', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting 5 seconds for hydration and data fetching...');
    await page.waitForTimeout(5000);

    // Report findings
    console.log('\n📋 CONSOLE LOGS REPORT');
    console.log('='.repeat(80));

    const voiceGridLogs = consoleLogs.filter(log => log.text.includes('[VoiceGrid]'));
    const voiceCardLogs = consoleLogs.filter(log => log.text.includes('[VoiceCard]'));
    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');
    const infos = consoleLogs.filter(log => log.type === 'log' || log.type === 'info');

    console.log(`\n🎯 VoiceGrid Logs (${voiceGridLogs.length}):`);
    if (voiceGridLogs.length === 0) {
      console.log('  ⚠️  NO VoiceGrid logs found!');
    } else {
      voiceGridLogs.forEach(log => console.log(`  ${log.text}`));
    }

    console.log(`\n🎯 VoiceCard Logs (${voiceCardLogs.length}):`);
    if (voiceCardLogs.length === 0) {
      console.log('  ⚠️  NO VoiceCard logs found!');
    } else {
      voiceCardLogs.forEach(log => console.log(`  ${log.text}`));
    }

    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    if (warnings.length === 0) {
      console.log('  ✅ No warnings');
    } else {
      warnings.forEach(log => console.log(`  ${log.text}`));
    }

    console.log(`\n❌ Errors (${errors.length}):`);
    if (errors.length === 0) {
      console.log('  ✅ No errors');
    } else {
      errors.forEach(log => console.log(`  ${log.text}`));
    }

    console.log(`\n📊 Info/Log Messages (${infos.length}):`);
    infos.forEach(log => {
      console.log(`  ℹ️  ${log.text}`);
    });

    console.log('\n🌐 NETWORK REQUESTS');
    console.log('='.repeat(80));
    if (networkRequests.size === 0) {
      console.log('⚠️  No /api/actors or /api/admin/config requests captured!');
    } else {
      for (const [url, data] of networkRequests) {
        console.log(`\n${url}`);
        console.log(`Status: ${data.status}`);
        if (data.data) {
          const preview = data.data.substring(0, 500);
          console.log('Response preview:', preview);
          if (data.data.length > 500) {
            console.log(`... (${data.data.length} total chars)`);
          }
        }
      }
    }

    console.log('\n📈 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`  - Errors: ${errors.length}`);
    console.log(`  - Warnings: ${warnings.length}`);
    console.log(`  - Info/Logs: ${infos.length}`);
    console.log(`Network requests captured: ${networkRequests.size}`);

    await browser.close();

    // Exit with error code if there are errors
    process.exit(errors.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    await browser.close();
    process.exit(1);
  }
}

auditSite();
