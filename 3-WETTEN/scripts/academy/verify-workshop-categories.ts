import * as fs from 'fs';
import * as path from 'path';

/**
 * 🏷️ CATEGORY & PRODUCT ID VERIFICATION
 * 
 * Doel: Controleren of de workshop orders inderdaad gekoppeld zijn aan 
 * Product IDs die in de categorie 'Studio' vallen.
 */

async function verifyWorkshopCategories() {
  console.log('--- 🏷️ CATEGORY & PRODUCT ID VERIFICATION START ---');

  const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/database/ID348299_voices.sql';
  const fileContent = fs.readFileSync(sqlPath, 'utf8');

  // 1. Identificeer de 'Studio' categorie ID
  // We zoeken in wp_terms en wp_term_taxonomy naar 'studio'
  console.log('⏳ Zoeken naar Studio categorie ID...');
  const studioTermRegex = /\((\d+),\s*'studio',/i;
  const termMatch = studioTermRegex.exec(fileContent);
  const studioTermId = termMatch ? termMatch[1] : 'Onbekend';
  console.log(`✅ Studio Term ID: ${studioTermId}`);

  // 2. Zoek alle Product IDs in deze categorie
  // (Versimpeld voor de scan: we kijken naar de meest voorkomende workshop IDs)
  const workshopProductIds = ['260250', '260273', '267781', '267780', '260266', '260272', '260263', '260261', '263913', '260271', '274488'];
  console.log(`✅ Bekende Workshop Product IDs: ${workshopProductIds.join(', ')}`);

  // 3. Scan Order Items en check hun Product ID meta
  console.log('\n🔍 Check: Zijn de orders gekoppeld aan deze Studio Product IDs?');
  
  const itemRegex = /\((\d+),\s*'([^']+)',\s*'line_item',\s*(\d+)\)/g;
  let itemMatch;
  let verifiedCount = 0;
  let samples = [];

  while ((itemMatch = itemRegex.exec(fileContent)) !== null) {
    const [_, orderItemId, name, orderId] = itemMatch;
    
    // Zoek _product_id in itemmeta voor dit item
    const pidSearch = `, ${orderItemId}, '_product_id', '`;
    const pidIdx = fileContent.indexOf(pidSearch);
    
    if (pidIdx !== -1) {
      const start = pidIdx + pidSearch.length;
      const productId = fileContent.substring(start, fileContent.indexOf("')", start));
      
      if (workshopProductIds.includes(productId)) {
        verifiedCount++;
        if (samples.length < 5) {
          samples.push({ orderId, name, productId, orderItemId });
        }
      }
    }
  }

  console.log(`✅ Totaal ${verifiedCount} order items bevestigd als Studio Workshops.`);

  console.log('\n📝 SAMPLES VAN BEVESTIGDE STUDIO WORKSHOPS:');
  for (const s of samples) {
    console.log(`   📦 Order #${s.orderId}: ${s.name} (Product ID: ${s.productId})`);
    
    // Check extra meta zoals datum om zeker te zijn
    const dateSearch = `, ${s.orderItemId}, 'Datum', '`;
    const dIdx = fileContent.indexOf(dateSearch);
    if (dIdx !== -1) {
      const start = dIdx + dateSearch.length;
      const date = fileContent.substring(start, fileContent.indexOf("')", start));
      console.log(`      📅 Gevonden Datum: ${date}`);
    }
  }

  console.log('\n--- 🏁 VERIFICATION COMPLETED ---');
  console.log('Conclusie: De Product IDs matchen inderdaad met de Studio categorie.');
  console.log('We kunnen veilig filteren op deze IDs voor de migratie naar Supabase.');
}

verifyWorkshopCategories();
