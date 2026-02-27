#!/usr/bin/env tsx
/**
 * Verification Script for Ademing.be v2.15.083
 * Checks if the softlaunch content is live
 */

async function verifyAdeming() {
  console.log('🔍 VERIFYING ADEMING.BE v2.15.083...\n');

  try {
    // Fetch the homepage
    const response = await fetch('https://www.ademing.be', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      process.exit(1);
    }

    const html = await response.text();

    // Check 1: Version
    const versionMatch = html.match(/window\.__VOICES_VERSION__\s*=\s*["']([^"']+)["']/);
    const version = versionMatch ? versionMatch[1] : 'NOT FOUND';
    console.log(`1️⃣  Version: ${version}`);
    if (version === '2.15.083') {
      console.log('   ✅ Version is correct!\n');
    } else {
      console.log(`   ❌ Expected v2.15.083, got ${version}\n`);
    }

    // Check 2: Softlaunch hero text
    const hasSoftlaunchText = html.includes('We bereiden ons voor op de grote lancering');
    console.log(`2️⃣  Softlaunch hero text: ${hasSoftlaunchText ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (hasSoftlaunchText) {
      console.log('   "We bereiden ons voor op de grote lancering..."\n');
    }

    // Check 3: Binnenkort section
    const hasBinnenkortSection = html.includes('Binnenkort openen we de volledige bibliotheek');
    console.log(`3️⃣  Binnenkort section: ${hasBinnenkortSection ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (hasBinnenkortSection) {
      console.log('   "Binnenkort openen we de volledige bibliotheek"\n');
    }

    // Check 4: Even ademen section
    const hasEvenAdemenSection = html.includes('Even ademen');
    console.log(`4️⃣  "Even ademen" section: ${hasEvenAdemenSection ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (hasEvenAdemenSection) {
      console.log('   Section title found in HTML\n');
    }

    // Check 5: Breathing tool component
    const hasBreathingTool = html.includes('BreathingTool') || html.includes('breathing-tool') || html.includes('ademhalings');
    console.log(`5️⃣  Breathing tool component: ${hasBreathingTool ? '✅ FOUND' : '❌ NOT FOUND'}\n`);

    // Summary
    const allChecks = [
      version === '2.15.083',
      hasSoftlaunchText,
      hasBinnenkortSection,
      hasEvenAdemenSection,
      hasBreathingTool,
    ];
    const passedChecks = allChecks.filter(Boolean).length;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 RESULT: ${passedChecks}/5 checks passed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (passedChecks === 5) {
      console.log('✅ ALL CHECKS PASSED - v2.15.083 is live and working!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some checks failed. Review the output above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

verifyAdeming();
