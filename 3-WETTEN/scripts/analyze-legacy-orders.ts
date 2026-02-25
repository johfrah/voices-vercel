
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { orderItems, orders } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function analyzeLegacyOrders() {
  console.log(`📊 Deep-analyzing legacy order history for media types...\n`);

  try {
    const allOrders = await db.select().from(orders);
    const allItems = await db.select().from(orderItems);
    
    const stats: Record<string, number> = {
      total: 0,
      regional_local: 0,
      national_online: 0,
      telephony: 0,
      unpaid_corporate: 0,
      other: 0
    };

    allOrders.forEach(order => {
      stats.total++;
      const context = (order.iapContext as any) || {};
      const rawMeta = (order.rawMeta as any) || {};
      const orderItemsList = allItems.filter(item => item.orderId === order.id);
      
      const customerMessage = (rawMeta.ywraq_customer_message || '').toLowerCase();
      const itemNames = orderItemsList.map(i => (i.name || '').toLowerCase()).join(' ');
      
      // 🛡️ CHRIS-PROTOCOL: Deep Detection
      // We kijken naar ELKE mogelijke plek waar we het label 'telephony' of 'telefonie' hebben gezet
      const isTelephony = 
        context.usage === 'telephony' || 
        context.usage === 'telefonie' ||
        rawMeta.usage === 'telephony' ||
        rawMeta.usage === 'telefonie' ||
        rawMeta.service === 'telephony' ||
        rawMeta._service === 'telephony' ||
        rawMeta.order_type === 'telephony' ||
        customerMessage.includes('telefoon') || 
        customerMessage.includes('ivr') ||
        customerMessage.includes('wachtmuziek') ||
        customerMessage.includes('centrale') ||
        customerMessage.includes('voicemail') ||
        itemNames.includes('telefoon') ||
        itemNames.includes('ivr') ||
        itemNames.includes('wachtmuziek') ||
        itemNames.includes('centrale') ||
        itemNames.includes('voicemail') ||
        (order.total && (parseFloat(order.total as string) === 107.69 || parseFloat(order.total as string) === 89.00));

      const isCorporate = 
        context.usage === 'unpaid' ||
        context.usage === 'corporate' ||
        rawMeta.usage === 'unpaid' ||
        rawMeta.usage === 'corporate' ||
        customerMessage.includes('corporate') || 
        customerMessage.includes('bedrijfsfilm') ||
        customerMessage.includes('uitlegvideo') ||
        customerMessage.includes('explainer') ||
        itemNames.includes('corporate') ||
        itemNames.includes('bedrijfsfilm') ||
        itemNames.includes('uitlegvideo') ||
        itemNames.includes('explainer') ||
        rawMeta.service === 'corporate';

      const isRegional = 
        customerMessage.includes('regionaal') || 
        customerMessage.includes('lokaal') || 
        customerMessage.includes('regional') || 
        customerMessage.includes('local') ||
        itemNames.includes('regionaal') ||
        itemNames.includes('lokaal') ||
        itemNames.includes('regional') ||
        itemNames.includes('local');

      if (isTelephony) {
        stats.telephony++;
      } else if (isCorporate) {
        stats.unpaid_corporate++;
      } else if (isRegional) {
        stats.regional_local++;
      } else {
        // Default to national/online for agency journey if not telephony/corporate/regional
        if (rawMeta._journey === 'agency' || context.usage === 'commercial' || context.usage === 'paid' || rawMeta.usage === 'commercial') {
          stats.national_online++;
        } else {
          stats.other++;
        }
      }
    });

    console.log(`### 📈 VERBETERDE ORDER ANALYSE`);
    console.log(`| Categorie | Aantal | Percentage |`);
    console.log(`| :--- | :--- | :--- |`);
    console.log(`| Totaal geanalyseerd | ${stats.total} | 100% |`);
    console.log(`| Telefonie | **${stats.telephony}** | **${((stats.telephony/stats.total)*100).toFixed(1)}%** |`);
    console.log(`| Video (Corporate) | ${stats.unpaid_corporate} | ${((stats.unpaid_corporate/stats.total)*100).toFixed(1)}% |`);
    console.log(`| Landcampagnes (Online/Nat.) | ${stats.national_online} | ${((stats.national_online/stats.total)*100).toFixed(1)}% |`);
    console.log(`| Kleine Campagnes (Reg./Loc.) | **${stats.regional_local}** | **${((stats.regional_local/stats.total)*100).toFixed(1)}%** |`);
    console.log(`| Overig/Onbekend | ${stats.other} | ${((stats.other/stats.total)*100).toFixed(1)}% |`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

analyzeLegacyOrders();
