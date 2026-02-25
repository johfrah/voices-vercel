import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedPricingConfig() {
  console.log('🚀 Starting Pricing Config Sync...');

  // 1. Fetch current config
  const { data: existing, error: fetchError } = await supabase
    .from('app_configs')
    .select('value')
    .eq('key', 'pricing_config')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('❌ Error fetching existing config:', fetchError);
    process.exit(1);
  }

  const baseConfig = {
    basePrice: 19900,
    videoBasePrice: 24900,
    telephonyBasePrice: 8900,
    telephonySetupFee: 1995,
    telephonyWordPrice: 100,
    telephonyWordThreshold: 25,
    videoWordThreshold: 200,
    videoWordRate: 20,
    telephonyBulkThreshold: 750,
    telephonyBulkBasePrice: 91535,
    telephonyBulkWordRate: 25,
    wordRate: 20,
    vatRate: 0.21,
    musicSurcharge: 5900,
    radioReadySurcharge: 0,
    liveSessionSurcharge: 5000,
    academyPrice: 19900,
    workshopPrice: 29500,
    johfraiBasicPrice: 4900,
    johfraiProPrice: 9900,
    johfraiStudioPrice: 19900,
    wordsPerMinute: 155, // The new standard
  };

  const newConfig = { ...baseConfig, ...(existing?.value || {}) };
  newConfig.wordsPerMinute = 155; // Ensure it's set correctly

  // 2. Upsert config
  const { error: upsertError } = await supabase
    .from('app_configs')
    .upsert({
      key: 'pricing_config',
      value: newConfig,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (upsertError) {
    console.error('❌ Error updating config:', upsertError);
    process.exit(1);
  }

  console.log('✅ Pricing Config synced successfully with wordsPerMinute: 155');
}

seedPricingConfig();
