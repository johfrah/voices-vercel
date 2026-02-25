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

/**
 * 🚦 ORDER STATUS HANDSHAKE
 * 
 * Doel: Update de labels in de koppeltabel 'order_statuses' naar de nieuwe Founder-taal.
 * Dit is de diepste vorm van uitzuivering.
 */

const STATUS_UPDATES = [
  { code: 'processing', label: 'In productie' },
  { code: 'pending', label: 'Wacht op kassa' },
  { code: 'awaiting_payment', label: 'Wacht op kassa' },
  { code: 'waiting_po', label: 'Wacht op PO-nummer' },
  { code: 'quote_sent', label: 'Offerte verzonden' }
];

async function syncStatuses() {
  console.log('🚀 Start Order Status Handshake Sync...');

  for (const update of STATUS_UPDATES) {
    console.log(`📝 Updating status: ${update.code} -> ${update.label}`);

    const { error } = await supabase
      .from('order_statuses')
      .update({ label: update.label })
      .eq('code', update.code);

    if (error) {
      // Als de rij niet bestaat, voegen we hem toe (upsert)
      const { error: upsertError } = await supabase
        .from('order_statuses')
        .upsert({ code: update.code, label: update.label }, { onConflict: 'code' });
        
      if (upsertError) {
        console.error(`   ❌ Fout bij ${update.code}:`, upsertError.message);
      } else {
        console.log(`   ✅ Status toegevoegd: ${update.code}`);
      }
    } else {
      console.log(`   ✅ Status bijgewerkt: ${update.code}`);
    }
  }

  console.log('🏁 Order Status Handshake voltooid.');
}

syncStatuses();
