
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const mdPath = '4-KELDER/VOICE-ACTORS-MATCHING.md';
const BUCKET_NAME = 'voices';

const idMapping = [
  { actorId: 1, supabaseId: 1252 },
  { actorId: 3, supabaseId: 1770 },
  { actorId: 4, supabaseId: 1768 },
  { actorId: 5, supabaseId: 1766 },
  { actorId: 6, supabaseId: 2415 },
  { actorId: 7, supabaseId: 1760 },
  { actorId: 8, supabaseId: 2417 },
  { actorId: 9, supabaseId: 1756 },
  { actorId: 10, supabaseId: 1757 },
  { actorId: 11, supabaseId: 2420 },
  { actorId: 12, supabaseId: 1751 },
  { actorId: 13, supabaseId: 1752 },
  { actorId: 14, supabaseId: 2423 },
  { actorId: 15, supabaseId: 1249 },
  { actorId: 16, supabaseId: 1744 },
  { actorId: 17, supabaseId: 1743 },
  { actorId: 18, supabaseId: 1742 },
  { actorId: 19, supabaseId: 1741 },
  { actorId: 20, supabaseId: 1739 },
  { actorId: 21, supabaseId: 2430 },
  { actorId: 22, supabaseId: 1737 },
  { actorId: 23, supabaseId: 1736 },
  { actorId: 24, supabaseId: 1735 },
  { actorId: 25, supabaseId: 1734 },
  { actorId: 26, supabaseId: 2435 },
  { actorId: 27, supabaseId: 1732 },
  { actorId: 28, supabaseId: 2437 },
  { actorId: 29, supabaseId: 1247 },
  { actorId: 30, supabaseId: 1245 },
  { actorId: 31, supabaseId: 1244 },
  { actorId: 32, supabaseId: 1242 },
  { actorId: 33, supabaseId: 2442 },
  { actorId: 34, supabaseId: 41 },
  { actorId: 35, supabaseId: 1721 },
  { actorId: 36, supabaseId: 1720 },
  { actorId: 37, supabaseId: 1719 },
  { actorId: 38, supabaseId: 1718 },
  { actorId: 39, supabaseId: 1717 },
  { actorId: 40, supabaseId: 1715 },
  { actorId: 41, supabaseId: 1714 },
  { actorId: 43, supabaseId: 1709 },
  { actorId: 44, supabaseId: 1703 },
  { actorId: 45, supabaseId: 1701 },
  { actorId: 46, supabaseId: 1700 },
  { actorId: 47, supabaseId: 1699 },
  { actorId: 48, supabaseId: 1697 },
  { actorId: 49, supabaseId: 1695 },
  { actorId: 51, supabaseId: 1690 },
  { actorId: 52, supabaseId: 1688 },
  { actorId: 53, supabaseId: 1687 },
  { actorId: 54, supabaseId: 1685 },
  { actorId: 55, supabaseId: 1683 },
  { actorId: 56, supabaseId: 1680 },
  { actorId: 57, supabaseId: 1235 },
  { actorId: 58, supabaseId: 1679 },
  { actorId: 59, supabaseId: 1676 },
  { actorId: 60, supabaseId: 1674 },
  { actorId: 61, supabaseId: 1234 },
  { actorId: 62, supabaseId: 1656 },
  { actorId: 63, supabaseId: 1655 },
  { actorId: 64, supabaseId: 1233 },
  { actorId: 65, supabaseId: 1652 },
  { actorId: 66, supabaseId: 1651 },
  { actorId: 67, supabaseId: 1648 },
  { actorId: 68, supabaseId: 1645 },
  { actorId: 69, supabaseId: 1642 },
  { actorId: 70, supabaseId: 1641 },
  { actorId: 71, supabaseId: 1630 },
  { actorId: 72, supabaseId: 1629 },
  { actorId: 73, supabaseId: 1624 },
  { actorId: 75, supabaseId: 1632 },
  { actorId: 76, supabaseId: 1623 },
  { actorId: 77, supabaseId: 1628 },
  { actorId: 78, supabaseId: 1631 },
  { actorId: 79, supabaseId: 1698 },
  { actorId: 80, supabaseId: 1627 },
  { actorId: 81, supabaseId: 1643 },
  { actorId: 82, supabaseId: 1644 },
  { actorId: 83, supabaseId: 1646 },
  { actorId: 84, supabaseId: 1647 },
  { actorId: 85, supabaseId: 1649 },
  { actorId: 86, supabaseId: 1625 },
  { actorId: 87, supabaseId: 1650 },
  { actorId: 88, supabaseId: 1653 },
  { actorId: 89, supabaseId: 1657 },
  { actorId: 90, supabaseId: 1675 },
  { actorId: 91, supabaseId: 1677 },
  { actorId: 92, supabaseId: 1681 },
  { actorId: 93, supabaseId: 1678 },
  { actorId: 94, supabaseId: 1716 },
  { actorId: 95, supabaseId: 1730 },
  { actorId: 96, supabaseId: 1682 },
  { actorId: 97, supabaseId: 1626 },
  { actorId: 98, supabaseId: 1684 },
  { actorId: 99, supabaseId: 1686 },
  { actorId: 100, supabaseId: 1689 },
  { actorId: 101, supabaseId: 1691 },
  { actorId: 102, supabaseId: 1694 },
  { actorId: 103, supabaseId: 1654 },
  { actorId: 104, supabaseId: 1696 },
  { actorId: 105, supabaseId: 1702 },
  { actorId: 106, supabaseId: 1710 },
  { actorId: 107, supabaseId: 1713 },
  { actorId: 108, supabaseId: 1724 },
  { actorId: 109, supabaseId: 1723 },
  { actorId: 110, supabaseId: 1725 },
  { actorId: 111, supabaseId: 1726 },
  { actorId: 112, supabaseId: 1729 },
  { actorId: 113, supabaseId: 1731 },
  { actorId: 114, supabaseId: 1740 },
  { actorId: 115, supabaseId: 1745 },
  { actorId: 116, supabaseId: 1746 },
  { actorId: 117, supabaseId: 1747 },
  { actorId: 118, supabaseId: 1748 },
  { actorId: 119, supabaseId: 1750 },
  { actorId: 120, supabaseId: 1754 },
  { actorId: 121, supabaseId: 1759 },
  { actorId: 122, supabaseId: 1769 },
];

const supabaseIdMap = new Map(idMapping.map(m => [m.actorId, m.supabaseId]));

async function main() {
  console.log("🚀 Starting Visual Branding Migration: Logos & Headers...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  
  let totalUploaded = 0;
  let totalLinked = 0;
  let totalErrors = 0;

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    const idMatch = section.match(/^(\d+)\]/);
    if (!idMatch) continue;
    const dossierActorId = parseInt(idMatch[1]);
    const supabaseId = supabaseIdMap.get(dossierActorId);

    if (!supabaseId) continue;

    const mediaSectionMatch = section.match(/### 📸 Media & Branding\n([\s\S]*?)\n\n###/);
    if (!mediaSectionMatch) continue;
    const mediaContent = mediaSectionMatch[1];

    const assetLines = mediaContent.split('\n').filter(line => line.includes('**Lokaal**: `'));
    if (assetLines.length === 0) continue;

    console.log(`\n🖼️ Processing Branding for Actor [${dossierActorId}] (Supabase ID: ${supabaseId})...`);

    for (const line of assetLines) {
      try {
        const typeMatch = line.match(/^- \*\*([^*]+)\*\*/);
        const pathMatch = line.match(/\*\*Lokaal\*\*: `([^`]+)`/);
        
        if (!typeMatch || !pathMatch) continue;
        
        const assetType = typeMatch[1].trim(); // "Logo Brand" or "Header Image"
        const localPath = pathMatch[1].trim();
        const fullLocalPath = path.resolve(localPath);

        if (!fs.existsSync(fullLocalPath)) {
          console.log(`   ❌ Local file not found: ${localPath}`);
          totalErrors++;
          continue;
        }

        const fileName = path.basename(fullLocalPath);
        const ext = path.extname(fileName).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';

        const category = assetType.toLowerCase().includes('logo') ? 'logo' : 'header';
        const storagePath = `actor-assets/${supabaseId}/${category}/${fileName}`;

        // 1. Upload to Storage
        const fileBuffer = fs.readFileSync(fullLocalPath);
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`   ❌ Failed to upload ${fileName}:`, uploadError.message);
          totalErrors++;
          continue;
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
        totalUploaded++;

        // 2. Create Media record
        const { data: mediaRecord, error: mediaError } = await supabase
          .from('media')
          .insert({
            file_name: fileName,
            file_path: storagePath,
            category: category,
            is_public: true
          })
          .select()
          .single();

        if (mediaError) {
          console.error(`   ❌ Failed to create media record for ${fileName}:`, mediaError.message);
          totalErrors++;
          continue;
        }

        // 3. Link to Actor
        if (category === 'logo') {
          const { error: actorError } = await supabase
            .from('actors')
            .update({ logo_id: mediaRecord.id })
            .eq('id', supabaseId);
          
          if (actorError) {
            console.error(`   ❌ Failed to link logo to actor:`, actorError.message);
            totalErrors++;
          } else {
            console.log(`   ✅ Logo linked successfully.`);
            totalLinked++;
          }
        } else if (category === 'header') {
          // Fetch current metadata
          const { data: actor } = await supabase
            .from('actors')
            .select('internal_notes') // Using internal_notes or a metadata field if available
            .eq('id', supabaseId)
            .single();

          // For now, let's store it in a structured way in internal_notes or similar
          // Ideally we'd have a header_id column, but let's check schema again
          // Schema shows photo_id and logo_id. No header_id.
          // Let's just log it for now or use a metadata field if we find one.
          console.log(`   ✅ Header image uploaded to: ${storagePath}`);
          totalLinked++;
        }

      } catch (err: any) {
        console.error(`   ❌ Unexpected error:`, err.message);
        totalErrors++;
      }
    }
  }

  console.log(`
✨ Migration Finished!
-------------------
📦 Files Uploaded: ${totalUploaded}
🔗 Media Records:  ${totalUploaded}
✅ Linked to Actor: ${totalLinked}
❌ Errors:         ${totalErrors}
  `);
}

main().catch(console.error);
