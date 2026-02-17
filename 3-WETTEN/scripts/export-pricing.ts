
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env from the web app BEFORE importing db
const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function exportPricing() {
  console.log('🚀 Starting Pricing Export...');

  try {
    const allActors = await db.select().from(actors);
    console.log(`Found ${allActors.length} actors.`);

    let markdown = `# 🎙️ VOICES PRICING EXPORT\n\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Table Header
    markdown += `| ID | WP ID | Naam | Unpaid (Video) | Online (Comm) | IVR | Live Regie | Rates JSON (Details) |\n`;
    markdown += `|---|---|---|---|---|---|---|---|\n`;

    // Sort actors: Live/Active/Publish first, then alphabetically
    allActors.sort((a, b) => {
        const isLiveA = ['live', 'active', 'publish'].includes(a.status || '') ? 1 : 0;
        const isLiveB = ['live', 'active', 'publish'].includes(b.status || '') ? 1 : 0;
        
        if (isLiveA !== isLiveB) return isLiveB - isLiveA; // Live first

        const nameA = `${a.firstName} ${a.lastName || ''}`.trim();
        const nameB = `${b.firstName} ${b.lastName || ''}`.trim();
        return nameA.localeCompare(nameB);
    });

    let count = 0;
    for (const actor of allActors) {
      // 🛡️ FILTER: Exclude entries without pricing (Music/Legacy artifacts)
      const hasStandardPrice = 
        (actor.priceUnpaid && Number(actor.priceUnpaid) > 0) ||
        (actor.priceOnline && Number(actor.priceOnline) > 0) ||
        (actor.priceIvr && Number(actor.priceIvr) > 0) ||
        (actor.priceLiveRegie && Number(actor.priceLiveRegie) > 0);

      const hasCustomRates = actor.rates && Object.keys(actor.rates as object).length > 0;

      if (!hasStandardPrice && !hasCustomRates) {
        continue; // Skip this actor
      }

      count++;
      const name = `${actor.firstName} ${actor.lastName || ''}`.trim();
      const wpId = actor.wpProductId ? actor.wpProductId.toString() : '-';
      const unpaid = actor.priceUnpaid ? `€${actor.priceUnpaid}` : '-';
      const online = actor.priceOnline ? `€${actor.priceOnline}` : '-';
      const ivr = actor.priceIvr ? `€${actor.priceIvr}` : '-';
      const live = actor.priceLiveRegie ? `€${actor.priceLiveRegie}` : '-';
      
      // Format JSON rates for readability (compact)
      let ratesStr = '-';
      if (actor.rates && Object.keys(actor.rates as object).length > 0) {
        // Parse the JSON and create a readable string with <br> for newlines
        const rates = actor.rates as Record<string, any>;
        const lines: string[] = [];
        
        // Helper to format a rate entry
        const formatEntry = (key: string, val: any, prefix = '') => {
            if (typeof val === 'object' && val !== null) {
                Object.entries(val).forEach(([k, v]) => formatEntry(k, v, `${prefix}${key}.`));
            } else {
                lines.push(`**${prefix}${key}**: €${val}`);
            }
        };

        Object.entries(rates).forEach(([key, val]) => formatEntry(key, val));
        ratesStr = lines.join(', ');
      }

      markdown += `| ${actor.id} | ${wpId} | **${name}** | ${unpaid} | ${online} | ${ivr} | ${live} | ${ratesStr} |\n`;
    }

    const outputPath = path.join(process.cwd(), 'PRICING_EXPORT.md');
    fs.writeFileSync(outputPath, markdown);

    console.log(`✅ Export completed: ${outputPath} (${count} actors included)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportPricing();
