import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { vaultFiles } from '../../1-SITE/packages/database/src/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

/**
 * 🧹 VAULT CLEANUP SCRIPT (2026)
 * 
 * Doel: Verwijderen van handtekening-afbeeldingen en kleine icoontjes uit de Vault.
 * Criteria: 
 * - Bestanden kleiner dan 15KB
 * - Bestandsnamen die lijken op icoontjes (facebook, linkedin, twitter, logo, image00)
 */

async function cleanupVault() {
  console.log('🧹 Start Vault Cleanup...');

  try {
    // Gebruik raw SQL voor de filters om type-mismatches tussen verschillende drizzle versies te voorkomen
    const smallFiles = await db.query.vaultFiles.findMany({
      where: sql`file_size < 15360 AND (
        original_name ILIKE '%image00%' OR 
        original_name ILIKE '%logo%' OR 
        original_name ILIKE '%facebook%' OR 
        original_name ILIKE '%linkedin%' OR 
        original_name ILIKE '%twitter%' OR 
        original_name ILIKE '%instagram%' OR 
        original_name ILIKE '%icon%' OR 
        original_name ILIKE '%sign%' OR 
        original_name ILIKE '%banner%' OR 
        original_name ILIKE '%header%'
      )`
    });

    console.log(`🔍 Gevonden: ${smallFiles.length} potentiële handtekening-bestanden.`);

    let deletedCount = 0;
    for (const file of smallFiles) {
      try {
        // 1. Probeer fysiek bestand te verwijderen
        const absolutePath = path.join(process.cwd(), '1-SITE/assets', file.filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }

        // 2. Verwijder uit database via raw SQL om type errors te omzeilen
        await db.execute(sql`DELETE FROM vault_files WHERE id = ${file.id}`);
        deletedCount++;
        
        if (deletedCount % 10 === 0) {
          console.log(`🗑️  ${deletedCount} bestanden verwijderd...`);
        }
      } catch (error) {
        console.error(`❌ Fout bij verwijderen van file ${file.id}:`, error);
      }
    }

    console.log(`✅ Cleanup voltooid. ${deletedCount} handtekening-afbeeldingen verwijderd uit de Vault.`);
  } catch (error) {
    console.error('❌ Fatale fout tijdens cleanup:', error);
  }
}

cleanupVault().catch(console.error);
