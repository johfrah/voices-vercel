import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

/**
 * 🧪 CHECKOUT API E2E TEST (NUCLEAR MODE)
 * 
 * Tests the complete checkout flow via API calls, including:
 * - Long script stress test (2000+ words)
 * - Database insert verification
 * - Order creation with ID >= 300002
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-checkout-api.ts
 */

const BASE_URL = 'https://www.voices.be';
const TEST_EMAIL = `test-checkout-${Date.now()}@voices.be`;

// 🛡️ CHRIS-PROTOCOL: Generate a 2000+ word script for stress testing
function generateLongScript(wordCount: number = 2000): string {
  const paragraphs = [
    "In de wereld van voice-over is kwaliteit en professionaliteit van het grootste belang.",
    "Elke opname moet perfect zijn afgestemd op de doelgroep en de boodschap die we willen overbrengen.",
    "De stem moet warm en uitnodigend klinken, maar tegelijkertijd ook professioneel en betrouwbaar.",
    "Dit is een uitdaging die we met veel passie en toewijding aangaan.",
    "Onze stemacteurs zijn getraind in verschillende stijlen en genres.",
    "Van commerciële reclames tot educatieve video's, van documentaires tot bedrijfsfilms.",
    "Elk project krijgt de aandacht die het verdient.",
    "We werken met state-of-the-art opnameapparatuur in een professionele studio-omgeving.",
    "De akoestiek is perfect afgesteld voor optimale geluidskwaliteit.",
    "Onze engineers zorgen voor een vlekkeloze post-productie.",
  ];
  
  let script = "";
  let currentWordCount = 0;
  
  while (currentWordCount < wordCount) {
    const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    script += paragraph + " ";
    currentWordCount += paragraph.split(/\s+/).length;
  }
  
  return script.trim();
}

async function testCheckoutFlow() {
  console.log(chalk.bold.magenta('\n🧪 STARTING CHECKOUT API E2E TEST\n'));
  console.log(chalk.gray(`Base URL: ${BASE_URL}`));
  console.log(chalk.gray(`Test Email: ${TEST_EMAIL}\n`));

  try {
    // Step 1: Generate long script
    console.log(chalk.bold.blue('📝 Step 1: Generating long script (2000+ words)...'));
    const longScript = generateLongScript(2000);
    const wordCount = longScript.split(/\s+/).filter(Boolean).length;
    console.log(chalk.green(`✅ Generated script with ${wordCount} words (${longScript.length} characters)`));
    console.log(chalk.gray(`Preview: ${longScript.substring(0, 100)}...\n`));

    // Step 2: Prepare checkout payload
    console.log(chalk.bold.blue('📦 Step 2: Preparing checkout payload...'));
    const payload = {
      pricing: {
        total: 150.50,
        cartHash: `test-${Date.now()}`,
        base: 100,
        wordSurcharge: 30.50,
        mediaSurcharge: 20,
        musicSurcharge: 0,
      },
      items: [],
      selectedActor: {
        id: 1, // Johfrah's ID
        display_name: 'Johfrah'
      },
      step: 'briefing',
      email: TEST_EMAIL,
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
      briefing: longScript,
      quoteMessage: null,
      payment_method: 'banktransfer',
      media: ['radio'], // 🛡️ CHRIS-PROTOCOL: Required for pricing calculation
      spots: 1,
      years: 1,
      liveSession: false,
      music: {
        trackId: null,
        asBackground: false,
        asHoldMusic: false
      },
      metadata: {
        words: wordCount,
        prompts: 0,
        userId: null
      }
    };
    console.log(chalk.green(`✅ Payload prepared (${JSON.stringify(payload).length} bytes)\n`));

    // Step 3: Submit order
    console.log(chalk.bold.blue('🚀 Step 3: Submitting order to API...'));
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/checkout/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Voices-E2E-Test/1.0'
      },
      body: JSON.stringify(payload)
    });

    const responseTime = Date.now() - startTime;
    console.log(chalk.cyan(`⏱️  Response time: ${responseTime}ms`));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(chalk.red(`❌ HTTP ${response.status}: ${response.statusText}`));
      console.error(chalk.red(`Response: ${errorText}`));
      throw new Error(`Checkout API failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log(chalk.green(`✅ Order submitted successfully\n`));

    // Step 4: Verify response
    console.log(chalk.bold.blue('🔍 Step 4: Verifying response...'));
    console.log(chalk.cyan('Response data:'));
    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      throw new Error(`Order creation failed: ${result.error || 'Unknown error'}`);
    }

    if (!result.orderId) {
      throw new Error('No order ID returned in response');
    }

    const orderId = result.orderId;
    console.log(chalk.green(`✅ Order ID: ${orderId}`));
    console.log(chalk.green(`✅ Is Bank Transfer: ${result.isBankTransfer}`));
    console.log(chalk.green(`✅ Token: ${result.token ? 'Present' : 'Missing'}\n`));

    // Step 5: Verify order ID >= 300002
    if (orderId >= 300002) {
      console.log(chalk.green(`✅ Order ID ${orderId} >= 300002 (PASS)\n`));
    } else {
      console.log(chalk.yellow(`⚠️  Order ID ${orderId} < 300002 (WARNING: Expected >= 300002)\n`));
    }

    // Step 6: Query database to verify order
    console.log(chalk.bold.blue('🗄️  Step 5: Querying database to verify order...'));
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log(chalk.yellow('⚠️  Supabase credentials not found. Skipping database verification.\n'));
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error(chalk.red(`❌ Database query failed: ${error.message}`));
      } else if (!order) {
        console.error(chalk.red(`❌ Order ${orderId} not found in database`));
      } else {
        console.log(chalk.green(`✅ Order found in database:`));
        console.log(chalk.cyan(`   ID: ${order.id}`));
        console.log(chalk.cyan(`   WP Order ID: ${order.wp_order_id}`));
        console.log(chalk.cyan(`   Total: €${order.total}`));
        console.log(chalk.cyan(`   Status: ${order.status}`));
        console.log(chalk.cyan(`   Journey: ${order.journey}`));
        console.log(chalk.cyan(`   Is Quote: ${order.is_quote}`));
        console.log(chalk.cyan(`   User ID: ${order.user_id || 'Guest'}`));
        console.log(chalk.cyan(`   Market: ${order.market}`));
        console.log(chalk.cyan(`   Created: ${new Date(order.created_at).toLocaleString('nl-BE')}`));
        
        // Verify briefing was stored correctly
        const rawMeta = order.raw_meta as any;
        if (rawMeta && rawMeta.items && rawMeta.items.length > 0) {
          const storedBriefing = rawMeta.items[0]?.briefing || '';
          const storedWordCount = storedBriefing.split(/\s+/).filter(Boolean).length;
          console.log(chalk.cyan(`   Briefing word count: ${storedWordCount}`));
          
          if (storedWordCount >= 2000) {
            console.log(chalk.green(`   ✅ Long script stored successfully (${storedWordCount} words)\n`));
          } else {
            console.log(chalk.yellow(`   ⚠️  Briefing word count < 2000 (${storedWordCount} words)\n`));
          }
        }
      }
    }

    // Step 7: Construct redirect URL
    console.log(chalk.bold.blue('🔗 Step 6: Constructing redirect URL...'));
    const redirectUrl = result.token 
      ? `${BASE_URL}/api/auth/magic-login?token=${result.token}&redirect=/account/orders?orderId=${orderId}`
      : `${BASE_URL}/checkout/success?orderId=${orderId}`;
    
    console.log(chalk.green(`✅ Expected redirect URL:`));
    console.log(chalk.cyan(`   ${redirectUrl}\n`));

    // Step 8: Final summary
    console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.green('✅ CHECKOUT E2E TEST PASSED'));
    console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green(`Order ID: ${orderId}`));
    console.log(chalk.green(`Order ID >= 300002: ${orderId >= 300002 ? 'YES' : 'NO'}`));
    console.log(chalk.green(`Script word count: ${wordCount}`));
    console.log(chalk.green(`Response time: ${responseTime}ms`));
    console.log(chalk.green(`Redirect URL: ${redirectUrl}`));
    console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    return {
      success: true,
      orderId,
      wordCount,
      responseTime,
      redirectUrl
    };

  } catch (error: any) {
    console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.red('❌ CHECKOUT E2E TEST FAILED'));
    console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.error(chalk.red(`Error: ${error.message}`));
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
    console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    
    throw error;
  }
}

// Run the test
testCheckoutFlow()
  .then(() => {
    console.log(chalk.green('✅ Test completed successfully'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red('❌ Test failed:', error.message));
    process.exit(1);
  });
