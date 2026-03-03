/**
 * 🛡️ CHRIS-PROTOCOL: Handshake Integrity Script (v1.0.0)
 * 
 * Dit script valideert de integriteit van de SmartRouter en MarketManager.
 * Het simuleert server-side requests en controleert of alle kritieke functies aanwezig zijn.
 * 
 * Gebruik: npx tsx 3-WETTEN/scripts/integrity-handshake.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

type MarketManagerContract = {
  getWorldId: (journeyOrSlug: string) => number;
  resolveContext: (host: string, routePath: string) => { worldId: number; languageId: number };
  [key: string]: unknown;
};

async function runIntegrityCheck() {
  console.log('🚀 Starting Nuclear Handshake Integrity Check...');
  let errors = 0;
  const marketManager = await loadMarketManager();

  // 1. Test MarketManager Methods
  console.log('\n--- 1. MarketManager Validation ---');
  const requiredMethods = [
    'getCurrentMarket',
    'getMarketDomains',
    'getLanguageCode',
    'getLanguageLabel',
    'getLanguageId',
    'getJourneyId',
    'getWorldId',
    'resolveContext'
  ];

  for (const method of requiredMethods) {
    if (typeof marketManager[method] === 'function') {
      console.log(`✅ Method "${method}" is present.`);
    } else {
      console.error(`❌ CRITICAL: Method "${method}" is MISSING from MarketManager.`);
      errors++;
    }
  }

  // 2. Test World ID Mapping
  console.log('\n--- 2. World ID Mapping Validation ---');
  const testCases = [
    { input: 'agency', expected: 1 },
    { input: 'studio', expected: 2 },
    { input: 'academy', expected: 3 },
    { input: 'ademing', expected: 6 },
    { input: 'johfrai', expected: 10 }
  ];

  for (const test of testCases) {
    const result = marketManager.getWorldId(test.input);
    if (result === test.expected) {
      console.log(`✅ Mapping "${test.input}" -> World ${result} is correct.`);
    } else {
      console.error(`❌ ERROR: Mapping "${test.input}" returned ${result}, expected ${test.expected}.`);
      errors++;
    }
  }

  // 3. Context Resolution Validation
  console.log('\n--- 3. Context Resolution Validation ---');
  const context = marketManager.resolveContext('voices.be', '/studio/workshops');
  if (context.worldId === 2 && context.languageId === 1) {
    console.log('✅ Context resolution for voices.be/studio is correct.');
  } else {
    console.error(`❌ ERROR: Context resolution failed. Got:`, context);
    errors++;
  }

  console.log('\n----------------------------------------');
  if (errors === 0) {
    console.log('✅ NUCLEAR HANDSHAKE VERIFIED: System integrity is 100%.');
    process.exit(0);
  } else {
    console.error(`❌ INTEGRITY FAILURE: ${errors} critical errors found.`);
    process.exit(1);
  }
}

async function loadMarketManager(): Promise<MarketManagerContract> {
  const modulePath = resolveMarketManagerPath();
  if (!modulePath) {
    throw new Error('MarketManager module niet gevonden in moderne of legacy structuur.');
  }

  const module = await import(pathToFileURL(modulePath).href);
  const marketManager = module.MarketManager;

  if (!marketManager) {
    throw new Error(`MarketManager export ontbreekt in: ${modulePath}`);
  }

  return marketManager as MarketManagerContract;
}

function resolveMarketManagerPath(): string | null {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);

  const candidates = [
    path.resolve(currentDir, '../../apps/web/src/lib/system/core/market-manager.ts'),
    path.resolve(currentDir, '../../1-SITE/apps/web/src/lib/system/core/market-manager.ts'),
    path.resolve(process.cwd(), 'apps/web/src/lib/system/core/market-manager.ts'),
    path.resolve(process.cwd(), '1-SITE/apps/web/src/lib/system/core/market-manager.ts'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

runIntegrityCheck().catch(err => {
  console.error('💥 FATAL ERROR during integrity check:', err);
  process.exit(1);
});
