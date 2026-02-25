
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function exportPricingReadable() {
  const BSF = 249; // 🛡️ NEW BSF (2026) - Charm Pricing
  console.log(`🚀 Starting Readable Pricing Export (BSF + Buyout Model)...`);

  try {
    const allActorsRaw = await db.select().from(actors);
    const allActors = allActorsRaw
      .filter(a => a.status === 'live')
      .sort((a, b) => (a.nativeLang || '').localeCompare(b.nativeLang || ''));
    
    let markdown = `# 🎙️ Voices.be - Prijslijst Stemacteurs (2026)\n\n`;
    markdown += `*Gegenereerd op: ${new Date().toLocaleDateString('nl-BE')}*\n`;
    markdown += `*Model: BSF (€${BSF}) + Buyout (Charm Pricing)*\n\n`;
    markdown += `> **Legenda:**\n`;
    markdown += `> - **BSF**: Basic Studio Fee (Studiotijd & Techniek)\n`;
    markdown += `> - **Buyout**: Gebruiksrechten voor de geselecteerde media\n`;
    markdown += `> - **(fixed)**: Vast tarief voor kleine campagnes (geen BSF split)\n`;
    markdown += `> - **(all-in)**: Totaalprijs lager dan BSF (geen buyout split)\n`;
    markdown += `> - **(admin)**: 6 maanden buyout optie (20% korting op jaar-buyout)\n\n`;

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates || Object.keys(rates).length === 0) continue;

      markdown += `## ${actor.firstName} ${actor.lastName} (WP: ${actor.wpProductId})\n`;
      markdown += `**Taal:** ${actor.nativeLang} | **Score:** ${actor.voiceScore}\n\n`;

      // 1. BASIS TARIEVEN
      markdown += `### 🏛️ Basis Tarieven\n`;
      markdown += `| Type | BSF | Buyout | TOTAAL |\n`;
      markdown += `| :--- | :--- | :--- | :--- |\n`;
      
      const unpaidTotal = Number(actor.priceUnpaid) > 249 ? Number(actor.priceUnpaid) : 249;
      // 🛡️ VOICES CHARM ROUNDING (2026): 150 -> 149, 250 -> 249, 450 -> 449
      const base10 = Math.round(unpaidTotal / 10) * 10;
      const finalUnpaid = base10 - 1;

      markdown += `| Video (Corporate) | €${BSF} | €${Math.max(0, finalUnpaid - BSF)} | **€${finalUnpaid}** |\n`;
      
      if (Number(actor.priceIvr) > 0) {
          markdown += `| Telefonie | €${Number(actor.priceIvr)} | €0 | **€${Number(actor.priceIvr)}** |\n`;
      }
      if (Number(actor.priceLiveRegie) > 0) {
          markdown += `| Live Regie | €${Number(actor.priceLiveRegie)} | €0 | **€${Number(actor.priceLiveRegie)}** |\n`;
      }
      markdown += `\n`;

      // 2. MEDIA TARIEVEN
      markdown += `### 📢 Media Tarieven\n`;
      
      for (const [country, data] of Object.entries(rates)) {
        if (typeof data !== 'object') continue;
        const keys = Object.keys(data).filter(k => Number(data[k]) > 0);
        if (keys.length === 0) continue;

        markdown += `**${country}**\n`;
        markdown += `| Categorie | Type | BSF | Buyout | TOTAAL |\n`;
        markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

        const categorize = (key: string) => {
            if (key.includes('radio')) return 'Radio';
            if (key.includes('tv')) return 'TV';
            if (key.includes('podcast')) return 'Podcast';
            if (key.includes('online')) return 'Online';
            return 'Overig';
        };

        for (const key of keys) {
            if (['ivr', 'unpaid', 'live_regie', 'price_bsf', 'bsf'].includes(key)) continue;
            
            const category = categorize(key);
            let allInPrice = Number(data[key]);
            const originalPrice = allInPrice;

            // 🛡️ VOICES CHARM ROUNDING (2026): 150 -> 149, 250 -> 249, 450 -> 449
            // Uitzondering: Bedragen < 100 gaan ALTIJD OMHOOG (bijv. 40 -> 49)
            if (allInPrice > 0) {
                if (allInPrice < 100) {
                    allInPrice = Math.ceil(allInPrice / 10) * 10 - 1;
                } else {
                    const base10 = Math.round(allInPrice / 10) * 10;
                    allInPrice = base10 - 1;
                }
            }

            const cleanName = key.replace('price_', '').replace('be_', '').replace('nl_', '').replace(/_/g, ' ');
            const profitExtra = allInPrice - originalPrice;
            const profitLabel = profitExtra > 0 ? ` (+€${profitExtra} winst)` : '';
            
            // 🛡️ STRATEGIC SPLIT
            const isSmallCampaign = key.includes('regional') || key.includes('local');
            const currentBSF = isSmallCampaign ? 0 : Number(actor.rates?.price_bsf || actor.rates?.bsf || BSF);

            if (isSmallCampaign) {
                markdown += `| ${category} | ${cleanName} | - | - | **€${allInPrice}** (fixed)${profitLabel} |\n`;
                markdown += `| ${category} (extra spot) | ${cleanName} | - | - | **€${(allInPrice * 0.5).toFixed(2)}** (50% staffel)${profitLabel} |\n`;
            } else if (allInPrice < currentBSF) {
                markdown += `| ${category} | ${cleanName} | - | - | **€${allInPrice}** (all-in)${profitLabel} |\n`;
            } else {
                const buyout = allInPrice - currentBSF;
                const buyoutSixMonths = buyout * 0.8;
                markdown += `| ${category} | ${cleanName} | €${currentBSF} | €${buyout.toFixed(2)} | **€${allInPrice}**${profitLabel} |\n`;
                
                // 🛡️ DEGRESSIEVE STAFFEL PREVIEW (Voor Kelly)
                const buyoutSpot2 = buyout * 0.60;
                const buyoutSpot4 = buyout * 0.50;
                markdown += `| ${category} (spot 2-3) | ${cleanName} | - | €${buyoutSpot2.toFixed(2)} | **+€${buyoutSpot2.toFixed(2)}** (60%)${profitLabel} |\n`;
                markdown += `| ${category} (spot 4+) | ${cleanName} | - | €${buyoutSpot4.toFixed(2)} | **+€${buyoutSpot4.toFixed(2)}** (50%)${profitLabel} |\n`;

                // 🛡️ ADMIN OVERRIDE: Alleen tonen voor TV/Radio, niet voor Online
                if (!key.includes('online') && !key.includes('social_media') && !key.includes('podcast')) {
                    markdown += `| ${category} (6 mnd) | ${cleanName} | €${currentBSF} | €${buyoutSixMonths.toFixed(2)} | **€${(currentBSF + buyoutSixMonths).toFixed(2)}** (admin)${profitLabel} |\n`;
                }
            }
        }
        markdown += `\n`;
      }
      markdown += `---\n\n`;
    }

    const outputPath = path.join(process.cwd(), 'PRICING_EXPORT_READABLE.md');
    fs.writeFileSync(outputPath, markdown);
    console.log(`✅ Readable Export completed: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportPricingReadable();
