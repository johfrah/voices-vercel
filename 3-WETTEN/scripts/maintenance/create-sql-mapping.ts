import fs from 'fs';
import path from 'path';

/**
 * 🕵️‍♂️ SQL IMAGE MAPPER (2026)
 * 
 * Doel: Een mapping maken tussen bestandsnamen in legacy-uploads en hun WooCommerce IDs
 * op basis van de SQL dump data.
 */

const SQL_FILE = './4-KELDER/CONTAINER/ID348299_voices.sql';
const OUTPUT_FILE = './3-WETTEN/scripts/maintenance/sql-image-mapping.json';

async function createMapping() {
  console.log("🔍 SQL dump scannen voor ID-mapping...");
  
  if (!fs.existsSync(SQL_FILE)) {
    console.error("❌ SQL bestand niet gevonden.");
    return;
  }

  const stream = fs.createReadStream(SQL_FILE, { encoding: 'utf8', highWaterMark: 1024 * 1024 });
  
  const mapping: { [fileName: string]: string } = {};
  let leftover = '';

  for await (const chunk of stream) {
    const data = leftover + chunk;
    const lines = data.split('\n');
    leftover = lines.pop() || '';

    for (const line of lines) {
      // Zoek naar patronen zoals (ID, PARENT_ID, '_wp_attached_file', 'PATH')
      // Of (ID, AUTHOR, DATE, ..., PARENT, GUID, ..., 'attachment', 'image/...')
      
      // Patroon 1: wp_postmeta _wp_attached_file
      const metaMatch = line.match(/\(\d+,\s*(\d+),\s*'_wp_attached_file',\s*'([^']+)'\)/i);
      if (metaMatch) {
        const parentId = metaMatch[1];
        const filePath = metaMatch[2];
        const fileName = path.basename(filePath);
        mapping[fileName] = parentId;
      }

      // Patroon 2: wp_posts attachment records
      const postMatch = line.match(/\((\d+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*(\d+),\s*'([^']+)',[^,]+,\s*'attachment'/i);
      if (postMatch) {
        const attachmentId = postMatch[1];
        const parentId = postMatch[2];
        const guid = postMatch[3];
        const fileName = path.basename(guid);
        if (parentId !== '0') {
          mapping[fileName] = parentId;
        }
      }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mapping, null, 2));
  console.log(`✅ Mapping voltooid! ${Object.keys(mapping).length} bestanden gekoppeld aan een ID.`);
  console.log(`📄 Mapping opgeslagen in ${OUTPUT_FILE}`);
}

createMapping().catch(console.error);
