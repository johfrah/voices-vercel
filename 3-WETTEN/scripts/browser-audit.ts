#!/usr/bin/env node
/**
 * Browser Audit Script
 * Captures console logs and validates the live site
 */

import puppeteer from 'puppeteer';

interface ConsoleMessage {
  type: string;
  text: string;
  timestamp: number;
}

async function auditSite() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const consoleLogs: ConsoleMessage[] = [];
    const networkRequests: Map<string, any> = new Map();

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
          const data = await response.json();
          networkRequests.set(url, {
            status: response.status(),
            data
          });
        } catch (e) {
          networkRequests.set(url, {
            status: response.status(),
            error: 'Could not parse JSON'
          });
        }
      }
    });

    console.log('🌐 Navigating to https://www.voices.be...');
    await page.goto('https://www.voices.be', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Waiting 5 seconds for hydration...');
    await page.waitForTimeout(5000);

    // Get version from API
    console.log('\n📡 Fetching version from /api/admin/config...');
    const configPage = await browser.newPage();
    await configPage.goto('https://www.voices.be/api/admin/config?type=general');
    const configText = await configPage.evaluate(() => document.body.textContent);
    const configData = JSON.parse(configText || '{}');
    console.log('Version:', configData._version || 'NOT FOUND');

    // Report findings
    console.log('\n📋 CONSOLE LOGS REPORT');
    console.log('='.repeat(80));

    const voiceGridLogs = consoleLogs.filter(log => log.text.includes('[VoiceGrid]'));
    const voiceCardLogs = consoleLogs.filter(log => log.text.includes('[VoiceCard]'));
    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');

    console.log(`\n🎯 VoiceGrid Logs (${voiceGridLogs.length}):`);
    voiceGridLogs.forEach(log => console.log(`  ${log.text}`));

    console.log(`\n🎯 VoiceCard Logs (${voiceCardLogs.length}):`);
    voiceCardLogs.forEach(log => console.log(`  ${log.text}`));

    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(log => console.log(`  ${log.text}`));

    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(log => console.log(`  ${log.text}`));

    console.log(`\n📊 All Console Logs (${consoleLogs.length} total):`);
    consoleLogs.forEach(log => {
      const emoji = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${emoji} [${log.type}] ${log.text}`);
    });

    console.log('\n🌐 NETWORK REQUESTS');
    console.log('='.repeat(80));
    for (const [url, data] of networkRequests) {
      console.log(`\n${url}`);
      console.log(`Status: ${data.status}`);
      if (data.data) {
        console.log('Response:', JSON.stringify(data.data, null, 2));
      }
    }

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
