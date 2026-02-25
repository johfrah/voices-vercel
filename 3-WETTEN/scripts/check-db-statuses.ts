import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 MARK: Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatuses() {
  console.log('🔍 Inspecteren van koppeltabellen voor statussen...');

  const { data: orderStatuses, error: orderError } = await supabase
    .from('order_statuses')
    .select('*');

  if (orderError) {
    console.error('❌ Fout bij ophalen order_statuses:', orderError.message);
  } else {
    console.log('\n--- ORDER STATUSES ---');
    console.table(orderStatuses.map(s => ({ code: s.code, label: s.label })));
  }

  const { data: deliveryStatuses, error: deliveryError } = await supabase
    .from('delivery_statuses')
    .select('*');

  if (deliveryError) {
    console.error('❌ Fout bij ophalen delivery_statuses:', deliveryError.message);
  } else {
    console.log('\n--- DELIVERY STATUSES ---');
    console.table(deliveryStatuses.map(s => ({ code: s.code, label: s.label })));
  }
}

checkStatuses();
