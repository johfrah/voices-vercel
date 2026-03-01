import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  // Get Johfrah actor
  const actorResult = await db.execute(sql`
    SELECT id, first_name, last_name, slug, rates, status
    FROM actors
    WHERE slug = 'johfrah'
    LIMIT 1
  `);

  console.log('Raw result:', JSON.stringify(actorResult, null, 2));

  const rows = (actorResult as any).rows || (actorResult as any);
  if (!rows || rows.length === 0) {
    console.error('❌ Johfrah not found in database');
    process.exit(1);
  }

  const johfrah = Array.isArray(rows) ? rows[0] : rows;
  console.log('\n🎙️ Johfrah Actor Data:');
  console.log(`ID: ${johfrah.id}`);
  console.log(`Name: ${johfrah.first_name} ${johfrah.last_name}`);
  console.log(`Status: ${johfrah.status}`);
  console.log('\n📊 Rates Structure:');
  console.log(JSON.stringify(johfrah.rates, null, 2));

  // Check for FR-specific rates
  const rates = johfrah.rates?.rates || johfrah.rates || {};
  const frRates = rates['FR'] || {};
  const globalRates = rates['GLOBAL'] || rates['global'] || {};

  console.log('\n🇫🇷 France-Specific Rates:');
  if (Object.keys(frRates).length > 0) {
    console.log(JSON.stringify(frRates, null, 2));
  } else {
    console.log('❌ No FR-specific rates found');
  }

  console.log('\n🌍 Global Rates:');
  console.log(JSON.stringify(globalRates, null, 2));

  // Simulate pricing calculation for Online/Social Media in FR
  console.log('\n💰 Pricing Simulation for Online/Social Media (FR):');
  
  const onlineRate = frRates['online'] || globalRates['online'] || 0;
  const source = frRates['online'] ? 'FR-specific' : 'GLOBAL fallback';
  
  console.log(`Base Online Rate: €${onlineRate} (${source})`);
  
  if (onlineRate > 0) {
    const onlineCents = onlineRate * 100; // Convert to cents
    const buyoutCents = Math.max(10000, onlineCents); // Minimum €100
    const bsfCents = 19900; // Base Studio Fee
    const totalCents = buyoutCents + bsfCents;
    const totalEuros = totalCents / 100;
    
    console.log(`\nCalculation:`);
    console.log(`1. Online Rate: €${onlineRate} = ${onlineCents} cents`);
    console.log(`2. Buyout (min €100): ${buyoutCents} cents`);
    console.log(`3. BSF (Base Studio Fee): ${bsfCents} cents`);
    console.log(`4. Total: ${totalCents} cents = €${totalEuros.toFixed(2)}`);
    
    if (totalEuros === 299) {
      console.log('\n✅ CORRECT: Price matches expected €299.00');
    } else {
      console.log(`\n❌ MISMATCH: Expected €299.00, got €${totalEuros.toFixed(2)}`);
    }
  } else {
    console.log('❌ No online rate found - would trigger quote-only mode');
  }

  // Check multi-market summation (FR + BE)
  console.log('\n\n🔄 Multi-Market Summation Test (FR + BE):');
  const beRates = rates['BE'] || {};
  const beOnlineRate = beRates['online'] || globalRates['online'] || 0;
  
  console.log(`FR Online Rate: €${onlineRate} (${source})`);
  console.log(`BE Online Rate: €${beOnlineRate} (${beRates['online'] ? 'BE-specific' : 'GLOBAL fallback'})`);
  
  if (onlineRate > 0 && beOnlineRate > 0) {
    const frBuyoutCents = Math.max(10000, onlineRate * 100);
    const beBuyoutCents = Math.max(10000, beOnlineRate * 100);
    const totalBuyoutCents = frBuyoutCents + beBuyoutCents;
    const bsfCents = 19900;
    const grandTotalCents = totalBuyoutCents + bsfCents;
    const grandTotalEuros = grandTotalCents / 100;
    
    console.log(`\nCalculation:`);
    console.log(`1. FR Buyout: ${frBuyoutCents} cents`);
    console.log(`2. BE Buyout: ${beBuyoutCents} cents`);
    console.log(`3. Total Buyouts: ${totalBuyoutCents} cents`);
    console.log(`4. BSF: ${bsfCents} cents`);
    console.log(`5. Grand Total: ${grandTotalCents} cents = €${grandTotalEuros.toFixed(2)}`);
    
    const expectedMultiMarket = 199 + 100 + 100; // BSF + FR + BE
    if (grandTotalEuros === expectedMultiMarket) {
      console.log(`\n✅ CORRECT: Multi-market price matches expected €${expectedMultiMarket}.00`);
    } else {
      console.log(`\n⚠️ Multi-market total: €${grandTotalEuros.toFixed(2)} (BSF + both buyouts)`);
    }
  }

  console.log('\n✅ Verification complete');
}

main().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
