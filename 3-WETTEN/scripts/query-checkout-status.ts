import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

/**
 * 🔍 CHECKOUT STATUS QUERY SCRIPT
 * 
 * Queries recent orders and system events to verify checkout flow.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('❌ Missing Supabase credentials. Check .env file.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryRecentOrders() {
  console.log(chalk.bold.blue('\n📦 RECENT ORDERS (Last 10)\n'));
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, wp_order_id, total, status, journey, is_quote, created_at, user_id')
    .order('id', { ascending: false })
    .limit(10);

  if (error) {
    console.error(chalk.red('❌ Error fetching orders:'), error.message);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log(chalk.yellow('⚠️ No orders found.'));
    return;
  }

  orders.forEach((order: any) => {
    const statusColor = order.status === 'completed' ? 'green' : 
                       order.status === 'pending' ? 'yellow' : 
                       order.status === 'quote-pending' ? 'blue' : 'gray';
    
    console.log(chalk[statusColor](`
  Order ID: ${order.id} ${order.id >= 300002 ? '✅' : '⚠️'}
  WP Order ID: ${order.wp_order_id || 'N/A'}
  Total: €${order.total}
  Status: ${order.status}
  Journey: ${order.journey}
  Is Quote: ${order.is_quote ? 'Yes' : 'No'}
  User ID: ${order.user_id || 'Guest'}
  Created: ${new Date(order.created_at).toLocaleString('nl-BE')}
  ---`));
  });
}

async function querySystemEvents() {
  console.log(chalk.bold.blue('\n🚨 RECENT SYSTEM EVENTS (Last 20)\n'));
  
  const { data: events, error } = await supabase
    .from('system_events')
    .select('level, source, message, details, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error(chalk.red('❌ Error fetching events:'), error.message);
    return;
  }

  if (!events || events.length === 0) {
    console.log(chalk.yellow('⚠️ No system events found.'));
    return;
  }

  events.forEach((event: any) => {
    const levelColor = event.level === 'critical' ? 'red' : 
                      event.level === 'error' ? 'red' : 
                      event.level === 'warning' ? 'yellow' : 
                      event.level === 'info' ? 'blue' : 'gray';
    
    console.log(chalk[levelColor](`
  [${event.level.toUpperCase()}] ${event.source}
  Message: ${event.message}
  Time: ${new Date(event.created_at).toLocaleString('nl-BE')}
  ${event.details ? `Details: ${JSON.stringify(event.details, null, 2)}` : ''}
  ---`));
  });
}

async function queryCheckoutAPIEvents() {
  console.log(chalk.bold.blue('\n🛒 CHECKOUT API EVENTS (Last 10 minutes)\n'));
  
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  const { data: events, error } = await supabase
    .from('system_events')
    .select('level, source, message, details, created_at')
    .eq('source', 'CheckoutAPI')
    .gte('created_at', tenMinutesAgo)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(chalk.red('❌ Error fetching checkout events:'), error.message);
    return;
  }

  if (!events || events.length === 0) {
    console.log(chalk.green('✅ No checkout errors in the last 10 minutes.'));
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

async function main() {
  console.log(chalk.bold.magenta('\n🔍 VOICES CHECKOUT STATUS QUERY\n'));
  console.log(chalk.gray(`Timestamp: ${new Date().toLocaleString('nl-BE')}\n`));
  
  await queryRecentOrders();
  await queryCheckoutAPIEvents();
  await querySystemEvents();
  
  console.log(chalk.bold.green('\n✅ Query completed.\n'));
}

main().catch(console.error);
