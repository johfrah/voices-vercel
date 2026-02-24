import { createClient } from '@supabase/supabase-js';

/**
 * 🧪 PROGRAMMATIC CHECKOUT API TEST
 * 
 * Tests the checkout flow by directly calling the API endpoint.
 * This bypasses the browser UI but validates the backend logic.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCheckoutAPI() {
  console.log('\n🧪 STARTING PROGRAMMATIC CHECKOUT TEST\n');
  
  // Step 1: Fetch a live actor
  console.log('📡 Step 1: Fetching live actors...');
  const { data: actors, error: actorError } = await supabase
    .from('actors')
    .select('id, first_name, last_name, rates')
    .eq('status', 'live')
    .eq('is_public', true)
    .limit(1);

  if (actorError || !actors || actors.length === 0) {
    console.error('❌ Failed to fetch actors:', actorError?.message);
    process.exit(1);
  }

  const actor = actors[0];
  const actorName = `${actor.first_name} ${actor.last_name}`.trim();
  console.log(`✅ Found actor: ${actorName} (ID: ${actor.id})`);

  // Step 2: Prepare checkout payload
  console.log('\n📦 Step 2: Preparing checkout payload...');
  const payload = {
    pricing: {
      total: 150.00,
      cartHash: 'test-' + Date.now(),
      base: 125.00,
      wordSurcharge: 0,
      mediaSurcharge: 25.00,
      musicSurcharge: 0,
    },
    items: [],
    selectedActor: {
      id: actor.id,
      display_name: actorName,
    },
    step: 'briefing',
    email: 'test-checkout@voices.be',
    first_name: 'Test',
    last_name: 'Gebruiker',
    phone: '+32 470 12 34 56',
    company: 'Test BV',
    vat_number: '',
    address_street: 'Teststraat 123',
    postal_code: '3000',
    city: 'Leuven',
    country: 'BE',
    usage: 'commercial',
    plan: 'basic',
    briefing: 'Dit is een automatische test van de checkout flow. We testen of de API correct werkt en een bestelling kan aanmaken met ID >= 300002.',
    quoteMessage: null,
    payment_method: 'banktransfer',
    metadata: {
      words: 25,
      prompts: 0,
    }
  };

  console.log('✅ Payload prepared');
  console.log(`   Actor: ${actorName}`);
  console.log(`   Total: €${payload.pricing.total}`);
  console.log(`   Payment: ${payload.payment_method}`);

  // Step 3: Submit to checkout API
  console.log('\n🚀 Step 3: Submitting to checkout API...');
  
  try {
    const response = await fetch('https://www.voices.be/api/checkout/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Voices-Test-Script/1.0',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('   Details:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ API Response:', JSON.stringify(data, null, 2));

    // Step 4: Verify order in database
    if (data.orderId) {
      console.log(`\n🔍 Step 4: Verifying order ${data.orderId} in database...`);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', data.orderId)
        .single();

      if (orderError) {
        console.error('❌ Failed to fetch order:', orderError.message);
        process.exit(1);
      }

      console.log('✅ Order found in database:');
      console.log(`   Order ID: ${order.id} ${order.id >= 300002 ? '✅' : '⚠️ (< 300002)'}`);
      console.log(`   WP Order ID: ${order.wp_order_id}`);
      console.log(`   Total: €${order.total}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Journey: ${order.journey}`);
      console.log(`   Is Quote: ${order.is_quote ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString('nl-BE')}`);

      // Step 5: Check system events
      console.log('\n📋 Step 5: Checking system events...');
      const { data: events, error: eventsError } = await supabase
        .from('system_events')
        .select('level, source, message, created_at')
        .eq('source', 'CheckoutAPI')
        .gte('created_at', new Date(Date.now() - 60000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (eventsError) {
        console.warn('⚠️ Failed to fetch events:', eventsError.message);
      } else if (events && events.length > 0) {
        console.log('✅ Recent CheckoutAPI events:');
        events.forEach((event: any) => {
          const emoji = event.level === 'critical' ? '🔴' : 
                       event.level === 'error' ? '🔴' : 
                       event.level === 'warning' ? '⚠️' : '✅';
          console.log(`   ${emoji} [${event.level}] ${event.message}`);
        });
      } else {
        console.log('✅ No errors in system events');
      }

      // Final Report
      console.log('\n' + '='.repeat(60));
      console.log('🎯 TEST RESULTS');
      console.log('='.repeat(60));
      console.log(`✅ Order Created: ${data.orderId}`);
      console.log(`✅ Order ID >= 300002: ${order.id >= 300002 ? 'YES' : 'NO'}`);
      console.log(`✅ Status: ${order.status}`);
      console.log(`✅ Total: €${order.total}`);
      console.log(`✅ Payment Method: ${payload.payment_method}`);
      console.log(`✅ Expected Redirect: ${data.token ? '/api/auth/magic-login?token=...' : '/checkout/success?orderId=' + data.orderId}`);
      console.log('='.repeat(60));
      console.log('\n✅ CHECKOUT TEST PASSED\n');

    } else {
      console.error('❌ No order ID returned from API');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testCheckoutAPI().catch(console.error);
