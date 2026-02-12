import * as fs from 'fs';
import * as path from 'path';

/**
 * 🕵️‍♂️ VERIFICATION: PAST WORKSHOP MAPPING
 * 
 * Doel: Bewijzen dat we de juiste "workshoppers" pakken en dat we 
 * de datums/tijden van VERLEDEN workshops (die niet meer in het systeem staan)
 * correct kunnen mappen.
 */

async function verifyPastWorkshops() {
  console.log('--- 🕵️‍♂️ VERIFICATION: PAST WORKSHOP MAPPING START ---');

  const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/database/ID348299_voices.sql';
  const fileContent = fs.readFileSync(sqlPath, 'utf8');

  // We zoeken specifiek naar workshops uit 2023/2024 (verleden)
  // Deze staan niet meer in de actieve lijst maar wel in de order historie
  const pastWorkshopKeywords = ['Voice-overs voor beginners', 'Perfectie van intonatie', 'Audioboeken inspreken'];
  
  console.log('⏳ Scannen naar verleden workshops en hun atomic data...');

  // 1. Vind Order Items van deze workshops
  const itemRegex = /INSERT INTO `wp_woocommerce_order_items` .*? VALUES\s*([\s\S]*?);/g;
  let itemMatch;
  let foundItems = [];

  while ((itemMatch = itemRegex.exec(fileContent)) !== null) {
    const rows = itemMatch[1].split(/\s*,\s*\(/);
    rows.forEach(row => {
      const cleanRow = row.replace(/^\(|\)$|;$/g, '');
      const vals = cleanRow.split(/,(?=(?:(?:[^']*'){2})*[^']*$)/).map(v => v.trim().replace(/^'|'$/g, ''));
      const [orderItemId, name, type, orderId] = vals;
      if (type === 'line_item' && pastWorkshopKeywords.some(kw => name.includes(kw))) {
        foundItems.push({ orderItemId, name, orderId });
      }
    });
  }

  // 2. Pak 5 voorbeelden uit het VERLEDEN (bijv. 2023/2024)
  // We zoeken in de itemmeta naar de datum
  console.log(`\n📊 Gevonden workshop items: ${foundItems.length}`);
  console.log('\n🔍 DIEPE CHECK OP 5 VERLEDEN WORKSHOPS:');

  const examples = foundItems.slice(50, 55); // Pak een willekeurige batch uit het verleden

  for (const item of examples) {
    console.log(`\n📦 Order #${item.orderId}: ${item.name}`);
    
    // Zoek de datum meta
    // We proberen verschillende keys die WP gebruikte: '_workshop_date', 'datum', 'pa_datum'
    const dateKeys = ['_workshop_date', 'datum', 'pa_datum', 'workshop-datum'];
    let foundDate = 'Niet gevonden';
    let foundTime = 'Niet gevonden';

    for (const key of dateKeys) {
      const searchStr = `, ${item.orderItemId}, '${key}', '`;
      const idx = fileContent.indexOf(searchStr);
      if (idx !== -1) {
        const start = idx + searchStr.length;
        foundDate = fileContent.substring(start, fileContent.indexOf("')", start));
        break;
      }
    }

    // Zoek de tijd meta
    const timeSearchStr = `, ${item.orderItemId}, '_workshop_time', '`;
    const tIdx = fileContent.indexOf(timeSearchStr);
    if (tIdx !== -1) {
      const start = tIdx + timeSearchStr.length;
      foundTime = fileContent.substring(start, fileContent.indexOf("')", start));
    }

    // Zoek de DEELNEMER (indien afwijkend)
    const pNameSearch = `, ${item.orderItemId}, 'voornaam', '`;
    const pIdx = fileContent.indexOf(pNameSearch);
    let participant = 'Zelfde als koper';
    if (pIdx !== -1) {
      const start = pIdx + pNameSearch.length;
      participant = fileContent.substring(start, fileContent.indexOf("')", start));
    }

    console.log(`   📅 RAW Datum in WP:  ${foundDate}`);
    console.log(`   ⏰ RAW Tijd in WP:   ${foundTime}`);
    console.log(`   👤 Deelnemer:        ${participant}`);

    // DEMO MAPPING
    const cleanDate = parseLegacyDate(foundDate);
    console.log(`   🚀 NUCLEAR MAPPING: { clean_date: "${cleanDate.toISOString()}", status: "past" }`);
  }

  console.log('\n--- 🏁 VERIFICATION COMPLETED ---');
}

function parseLegacyDate(dateStr: string): Date {
  if (!dateStr || dateStr === 'Niet gevonden') return new Date();
  
  // Verwijder dagnaam (bijv. "woensdag ")
  const cleanStr = dateStr.replace(/^[a-z]+\s+/i, '');
  
  // Format: DD/MM/YYYY
  if (cleanStr.includes('/')) {
    const [d, m, y] = cleanStr.split('/');
    return new Date(`${y}-${m}-${d}T09:00:00Z`);
  }
  
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
    return new Date(cleanStr);
  }

  return new Date(dateStr);
}

verifyPastWorkshops();
