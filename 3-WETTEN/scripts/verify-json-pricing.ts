
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { eq } from 'drizzle-orm';
import { db } from '../../1-SITE/packages/database/src';
import { actors, appConfigs } from '../../1-SITE/packages/database/src/schema';
import { SlimmeKassa } from '../../1-SITE/apps/web/src/lib/pricing-engine';

async function verifyJsonPricing() {
  console.log('🔍 Starting Pricing Verification Audit...');

  try {
    // 0. Fetch Global Pricing Config
    const [configRow] = await db.select().from(appConfigs).where(eq(appConfigs.key, 'pricing_config')).limit(1);
    const pricingConfig = (configRow?.value as any) || {};
    console.log('⚙️ Global Config Loaded:', JSON.stringify(pricingConfig));

    // 1. Fetch a few representative actors
    const testActors = await db.select().from(actors).limit(10);
    
    if (testActors.length === 0) {
      console.error('❌ No actors found in database to test.');
      process.exit(1);
    }

    for (const actor of testActors) {
      console.log(`\n👤 Testing Actor: ${actor.firstName} ${actor.lastName} (ID: ${actor.id})`);
      
      const rates = actor.rates as any;
      console.log(`📊 JSON Rates GLOBAL:`, JSON.stringify(rates?.GLOBAL || rates?.global || 'MISSING'));

      // Test Video (Unpaid)
      const videoResult = SlimmeKassa.calculate({
        usage: 'unpaid',
        words: 0,
        actorRates: actor
      }, pricingConfig);
      console.log(`📹 Video Price: €${videoResult.total} (Base: €${videoResult.base})`);

      // Test Telephony (IVR)
      const telephonyResult = SlimmeKassa.calculate({
        usage: 'telefonie',
        words: 0,
        actorRates: actor
      }, pricingConfig);
      console.log(`📞 Telephony Price: €${telephonyResult.total} (Base: €${telephonyResult.base})`);

      // Test Commercial Online
      const commercialResult = SlimmeKassa.calculate({
        usage: 'commercial',
        mediaTypes: ['online'],
        country: 'BE',
        actorRates: actor
      }, pricingConfig);
      console.log(`🌐 Commercial Online (BE): €${commercialResult.total} (BSF: €${commercialResult.base}, Media: €${commercialResult.mediaSurcharge})`);
      
      // Verification logic
      const expectedVideo = parseFloat(String((rates?.GLOBAL?.unpaid || rates?.global?.unpaid || actor.priceUnpaid || 0)));
      const expectedIvr = parseFloat(String((rates?.GLOBAL?.ivr || rates?.global?.ivr || actor.priceIvr || 0)));
      
      if (videoResult.base !== expectedVideo && expectedVideo > 0) {
        console.error(`❌ Video price mismatch! Expected €${expectedVideo}, got €${videoResult.base}`);
      } else {
        console.log(`✅ Video price verified.`);
      }

      if (telephonyResult.base !== expectedIvr && expectedIvr > 0) {
        console.error(`❌ Telephony price mismatch! Expected €${expectedIvr}, got €${telephonyResult.base}`);
      } else {
        console.log(`✅ Telephony price verified.`);
      }
    }

    console.log(`\n✨ Audit complete!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

verifyJsonPricing();
