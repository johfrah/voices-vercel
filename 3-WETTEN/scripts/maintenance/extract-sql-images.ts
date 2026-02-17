import fs from 'fs';

/**
 * 🕵️‍♂️ SQL IMAGE LINK EXTRACTOR (2026)
 * 
 * Doel: Alle afbeeldingslinks uit de SQL dump extraheren en categoriseren.
 */

const SQL_FILE = './4-KELDER/CONTAINER/ID348299_voices.sql';
const OUTPUT_FILE = './3-WETTEN/scripts/maintenance/extracted-sql-images.json';

async function extractImages() {
  console.log("🔍 SQL dump scannen op afbeeldingen...");
  
  if (!fs.existsSync(SQL_FILE)) {
    console.error("❌ SQL bestand niet gevonden.");
    return;
  }

  // We lezen het bestand in chunks om geheugenproblemen te voorkomen
  const stream = fs.createReadStream(SQL_FILE, { encoding: 'utf8', highWaterMark: 1024 * 1024 });
  
  const images: Set<string> = new Set();
  const gravityFormsImages: Set<string> = new Set();
  const woocommerceImages: Set<string> = new Set();
  const elementorImages: Set<string> = new Set();
  
  let leftover = '';

  for await (const chunk of stream) {
    const data = leftover + chunk;
    const lines = data.split('\n');
    leftover = lines.pop() || '';

    for (const line of lines) {
      // Zoek naar alle URLs/paden met afbeelding extensies
      const matches = line.matchAll(/[^\s"'\\\/]+\.(jpg|png|webp|jpeg)/gi);
      for (const match of matches) {
        const img = match[0];
        
        // Categoriseren op basis van pad
        if (line.includes('gravity_forms')) {
          gravityFormsImages.add(img);
        } else if (line.includes('woocommerce_uploads')) {
          woocommerceImages.add(img);
        } else if (line.includes('elementor')) {
          elementorImages.add(img);
        } else {
          images.add(img);
        }
      }
    }
  }

  const result = {
    summary: {
      total: images.size + gravityFormsImages.size + woocommerceImages.size + elementorImages.size,
      gravityForms: gravityFormsImages.size,
      woocommerce: woocommerceImages.size,
      elementor: elementorImages.size,
      general: images.size
    },
    categories: {
      gravityForms: Array.from(gravityFormsImages),
      woocommerce: Array.from(woocommerceImages),
      elementor: Array.from(elementorImages),
      general: Array.from(images)
    }
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`✅ Scan voltooid! ${result.summary.total} unieke afbeeldingen gevonden.`);
  console.log(`📄 Resultaten opgeslagen in ${OUTPUT_FILE}`);
}

extractImages().catch(console.error);
