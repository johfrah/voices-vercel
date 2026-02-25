import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

/**
 * 🧪 DIRECT CHECKOUT API TEST
 * 
 * Simulates a checkout submission directly to the API endpoint.
 * Monitors system_events for errors in real-time.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('❌ Missing Supabase credentials. Check .env file.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test payload with large briefing and special characters
const testPayload = {
  pricing: {
    total: 150.50,
    cartHash: 'test-hash-' + Date.now(),
    base: 100,
    wordSurcharge: 30,
    mediaSurcharge: 20.50,
    musicSurcharge: 0,
  },
  items: [],
  selectedActor: {
    id: 1, // Johfrah
    display_name: 'Johfrah'
  },
  step: 'briefing',
  email: 'test-checkout-v302@voices.be',
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
  briefing: `Dit is een zeer lange test briefing met speciale karakters: 
    
    àéèêëïôöùûü ÀÉÈÊËÏÔÖÙÛÜ
    
    "Quotes" en 'apostrophes'
    
    Symbolen: €$£¥ @#&*()[]{}
    
    Emoji: 🎤 🎧 🎬 📢 🔊
    
    Lange tekst om payload grootte te testen. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    
    Multiline support test:
    - Regel 1
    - Regel 2
    - Regel 3
    
    Special JSON characters: \\ / " ' \n \r \t
    
    Unicode: 中文 日本語 한국어 العربية עברית
    
    End of test briefing.`,
  quoteMessage: 'Dit is een test offerte aanvraag voor v2.14.295',
  payment_method: 'banktransfer',
  metadata: {
    words: 150,
    prompts: 0,
    userId: undefined
  }
};

async function monitorSystemEvents(startTime: Date) {
  console.log(chalk.blue('\n🔍 Monitoring system_events for CheckoutAPI logs...\n'));
  
  const { data: events, error } = await supabase
    .from('system_events')
    .select('level, source, message, details, created_at')
    .eq('source', 'CheckoutAPI')
    .gte('created_at', startTime.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error(chalk.red('❌ Error fetching events:'), error.message);
    return;
  }

  if (!events || events.length === 0) {
    console.log(chalk.green('✅ No errors found in system_events.'));
    return;
  }

  events.forEach((event: any) => {
    const levelColor = event.level === 'critical' ? 'red' : 
                      event.level === 'error' ? 'red' : 
                      event.level === 'warning' ? 'yellow' : 'cyan';
    
    console.log(chalk[levelColor](`
  [${event.level.toUpperCase()}] ${event.message}
  Time: ${new Date(event.created_at).toLocaleString('nl-BE')}
  ${event.details ? `Details: ${JSON.stringify(event.details, null, 2).substring(0, 500)}` : ''}
  ---`));
  });
}

async function testCheckout() {
  const startTime = new Date();
  console.log(chalk.bold.magenta('\n🧪 DIRECT CHECKOUT API TEST\n'));
  console.log(chalk.gray(`Start Time: ${startTime.toLocaleString('nl-BE')}\n`));
  
  console.log(chalk.blue('📦 Test Payload:'));
  console.log(chalk.gray(JSON.stringify(testPayload, null, 2).substring(0, 500) + '...\n'));

  try {
    console.log(chalk.yellow('🚀 Sending POST request to /api/checkout/submit...\n'));
    
    const response = await fetch('https://www.voices.be/api/checkout/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Voices-Test-Script/2.14.295'
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(chalk.red('❌ Failed to parse response as JSON:'));
      console.log(chalk.gray(responseText.substring(0, 500)));
      responseData = { error: 'Invalid JSON response', raw: responseText };
    }

    console.log(chalk.blue(`\n📡 Response Status: ${response.status} ${response.statusText}\n`));
    
    if (response.ok) {
      console.log(chalk.green('✅ API Request Successful!\n'));
      console.log(chalk.cyan('Response Data:'));
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.orderId) {
        console.log(chalk.green(`\n✅ Order Created: ID = ${responseData.orderId}`));
        
        if (responseData.orderId >= 300002) {
          console.log(chalk.green('✅ Order ID is >= 300002 (SUCCESS CRITERIA MET)'));
        } else {
          console.log(chalk.yellow(`⚠️ Order ID is < 300002 (Expected >= 300002)`));
        }
      }
      
      if (responseData.isBankTransfer || responseData.isQuote) {
        console.log(chalk.cyan('\n📄 Quote/Invoice flow detected'));
        console.log(chalk.cyan(`Expected redirect: /checkout/success?orderId=${responseData.orderId}`));
      }
    } else {
      console.log(chalk.red('❌ API Request Failed!\n'));
      console.log(chalk.red('Error Response:'));
      console.log(JSON.stringify(responseData, null, 2));
    }

    // Wait 2 seconds for logs to be written
    console.log(chalk.gray('\n⏳ Waiting 2 seconds for system_events to be written...\n'));
    await new Promise(resolve => setTimeout(resolve, 2000));

    await monitorSystemEvents(startTime);

    // Query the created order
    if (responseData.orderId) {
      console.log(chalk.blue('\n📊 Querying created order from database...\n'));
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', responseData.orderId)
        .single();

      if (orderError) {
        console.error(chalk.red('❌ Error fetching order:'), orderError.message);
      } else if (order) {
        console.log(chalk.green('✅ Order found in database:'));
        console.log(chalk.gray(JSON.stringify({
          id: order.id,
          wp_order_id: order.wp_order_id,
          total: order.total,
          status: order.status,
          journey: order.journey,
          is_quote: order.is_quote,
          market: order.market,
          created_at: order.created_at
        }, null, 2)));
      }
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ FATAL ERROR:\n'), error.message);
    console.error(chalk.gray(error.stack));
    
    await monitorSystemEvents(startTime);
  }

  console.log(chalk.bold.green('\n✅ Test completed.\n'));
}

testCheckout().catch(console.error);
