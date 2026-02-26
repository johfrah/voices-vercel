import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyYoussefData() {
  console.log('🔍 VERIFYING YOUSSEF DATA IN DATABASE\n');

  // 1. Check artists table
  console.log('📊 Step 1: Checking artists table...');
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', 'youssef')
    .single();

  if (artistError) {
    console.error('❌ Error fetching artist:', artistError);
    return;
  }

  if (!artist) {
    console.error('❌ Youssef not found in artists table');
    return;
  }

  console.log('✅ Artist found:');
  console.log(`   - ID: ${artist.id}`);
  console.log(`   - Display Name: ${artist.display_name}`);
  console.log(`   - Slug: ${artist.slug}`);
  console.log(`   - Donation Goal: €${artist.donation_goal || 'NOT SET'}`);
  console.log(`   - Donation Current: €${artist.donation_current || 0}`);
  console.log(`   - Donor Count: ${artist.donor_count || 0}`);
  console.log(`   - Status: ${artist.status}`);
  console.log(`   - Is Public: ${artist.is_public}`);

  // 2. Check for donations
  console.log('\n📊 Step 2: Checking donations...');
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select('*')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false });

  if (donationsError) {
    console.error('❌ Error fetching donations:', donationsError);
  } else {
    console.log(`✅ Found ${donations?.length || 0} donations`);
    if (donations && donations.length > 0) {
      const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      console.log(`   - Total donated: €${totalAmount}`);
      console.log(`   - Recent donations:`);
      donations.slice(0, 5).forEach(d => {
        console.log(`     • €${d.amount} by ${d.donor_name} (${d.status})`);
      });
    }
  }

  // 3. Summary
  console.log('\n📋 SUMMARY:');
  const issues: string[] = [];

  if (!artist.donation_goal) {
    issues.push('⚠️  Donation goal is not set');
  } else if (artist.donation_goal !== 10500) {
    issues.push(`⚠️  Donation goal is €${artist.donation_goal}, expected €10500`);
  } else {
    console.log('✅ Donation goal is correctly set to €10500');
  }

  if (!artist.is_public) {
    issues.push('⚠️  Artist is not public (is_public = false)');
  } else {
    console.log('✅ Artist is public');
  }

  if (artist.status !== 'live') {
    issues.push(`⚠️  Artist status is "${artist.status}", expected "live"`);
  } else {
    console.log('✅ Artist status is "live"');
  }

  if (issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    issues.forEach(issue => console.log(`   ${issue}`));
  } else {
    console.log('\n✅ ALL DATA CHECKS PASSED');
  }
}

verifyYoussefData().catch(console.error);
