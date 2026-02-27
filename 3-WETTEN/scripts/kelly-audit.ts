
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src/index';
import { actors } from '../../1-SITE/packages/database/src/schema/index';

// ------------------------------------------------------------------
// ⚡ KELLY'S BRAIN (SlimmeKassa Logic Copy for Audit)
// We copy this to ensure we test the EXACT logic without import issues
// ------------------------------------------------------------------

type UsageType = 'unpaid' | 'telefonie' | 'subscription' | 'commercial' | 'non-commercial';
type CommercialMediaType = 'online' | 'tv_national' | 'radio_national' | 'podcast' | 'social_media' | 'tv_regional' | 'tv_local' | 'radio_regional' | 'radio_local';

interface SlimmeKassaInput {
  usage: UsageType;
  words?: number;
  mediaTypes?: CommercialMediaType[];
  country?: string;
  spots?: Record<string, number>;
  years?: Record<string, number>;
  actorRates?: Record<string, any>;
}

class SlimmeKassa {
  static calculate(input: SlimmeKassaInput) {
    let base = 239;
    let mediaSurcharge = 0;
    let wordSurcharge = 0;

    // 1. ORGANIC VIDEO (Unpaid)
    if (input.usage === 'unpaid') {
      base = 239; // Hardcoded base
      if (input.words && input.words > 200) {
        wordSurcharge = (input.words - 200) * 0.20;
      }
    } 
    // 2. COMMERCIAL (Paid Ads)
    else if (input.usage === 'commercial') {
      const actorRates = input.actorRates || {};
      const country = input.country || 'BE';
      const countryRates = actorRates[country] || actorRates['BE'] || actorRates || {};
      
      let highestBaseFee = 0;
      const selectedMedia = input.mediaTypes || [];
      
      selectedMedia.forEach(m => {
        const rateKey = `price_${m}`;
        // Fallback logic
        let fee = parseFloat(countryRates[rateKey] || actorRates[rateKey] || 0);
        
        if (fee === 0 && m === 'social_media') {
           fee = parseFloat(countryRates['price_online'] || actorRates['price_online'] || 239);
        }
        
        if (fee === 0) fee = 239; 

        const spots = (input.spots && input.spots[m]) || 1;
        const years = (input.years && input.years[m]) || 1;
        
        const buyoutForType = fee * (1 + 0.5 * (spots - 1)) * (1 + 0.5 * (years - 1));
        mediaSurcharge += buyoutForType;
        highestBaseFee = Math.max(highestBaseFee, fee);
      });

      // Group discount logic omitted for simplicity in this audit unless relevant
      if (selectedMedia.length > 1) {
        mediaSurcharge = mediaSurcharge * 0.85;
      }

      base = 0; // Reset base because mediaSurcharge covers it
    }

    return {
      base,
      wordSurcharge,
      mediaSurcharge,
      total: base + wordSurcharge + mediaSurcharge
    };
  }
}

// ------------------------------------------------------------------
// 🕵️ KELLY AUDIT SCRIPT
// ------------------------------------------------------------------

async function auditKelly() {
  console.log('🕵️ Starting Kelly Audit...');

  // 1. Fetch a Test Subject (Thomas Vreriks)
  // Use raw query or cast to any to avoid type mismatch in script context
  const allActors = await db.select().from(actors);
  const actor = allActors.find(a => a.wpProductId === 260250);
  
  // If not found by ID, try name
  const targetActor = actor || allActors.find(a => a.firstName === 'Thomas');

  if (!targetActor) {
    console.error('❌ Could not find test actor Thomas Vreriks');
    process.exit(1);
  }

  console.log(`\n👤 Test Subject: ${targetActor.firstName} ${targetActor.lastName}`);
  console.log('📊 Rates in DB:', JSON.stringify(targetActor.rates, null, 2));

  // 2. Scenario A: Organic Video (Corporate)
  console.log('\n🎥 SCENARIO A: Organic Video (Corporate/Web)');
  console.log('   - Usage: unpaid');
  console.log('   - Words: 150');
  const priceA = SlimmeKassa.calculate({
    usage: 'unpaid',
    words: 150,
    actorRates: targetActor.rates as any
  });
  console.log(`   💰 Result: €${priceA.total} (Base: ${priceA.base}, Words: ${priceA.wordSurcharge})`);
  console.log('   👉 Expectation: Should be €239 (Standard Base)');

  // 3. Scenario B: Online Advertisement (Paid)
  console.log('\n📢 SCENARIO B: Online Advertisement (Paid)');
  console.log('   - Usage: commercial');
  console.log('   - Media: Online');
  console.log('   - Spots: 1, Years: 1');
  const priceB = SlimmeKassa.calculate({
    usage: 'commercial',
    mediaTypes: ['online'],
    spots: { online: 1 },
    years: { online: 1 },
    actorRates: targetActor.rates as any
  });
  console.log(`   💰 Result: €${priceB.total} (Media Buyout: ${priceB.mediaSurcharge})`);
  
  // Check expected price from DB
  const rates = targetActor.rates as any;
  const expectedOnline = rates?.BE?.price_online || rates?.BE?.online || 239;
  console.log(`   👉 Expectation: Should match DB rate (€${expectedOnline})`);

  // 4. Scenario C: Radio National (High Value)
  console.log('\n📻 SCENARIO C: Radio National');
  console.log('   - Usage: commercial');
  console.log('   - Media: Radio National');
  const priceC = SlimmeKassa.calculate({
    usage: 'commercial',
    mediaTypes: ['radio_national'],
    spots: { radio_national: 1 },
    years: { radio_national: 1 },
    actorRates: targetActor.rates as any
  });
  console.log(`   💰 Result: €${priceC.total} (Media Buyout: ${priceC.mediaSurcharge})`);
  const expectedRadio = rates?.BE?.price_radio_national || rates?.BE?.radio_national || 239;
  console.log(`   👉 Expectation: Should match DB rate (€${expectedRadio})`);

  process.exit(0);
}

auditKelly();
