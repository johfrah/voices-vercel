import * as dotenv from 'dotenv';
import path from 'path';
import { lt } from 'drizzle-orm';

// 📧 Load environment variables
const envPath = path.join(process.cwd(), 'apps/web/.env.local');
dotenv.config({ path: envPath });

/**
 * 🧹 VISITOR DATA CLEANUP (ZERO-MANDAAT)
 * 
 * Verwijdert rrweb events en sessies ouder dan 14 dagen.
 * Houdt de database lean en compliant met privacy-wetten.
 */

async function cleanup() {
  console.log('--- 🧹 STARTING VISITOR DATA CLEANUP ---');

  try {
    const { db } = await import('../../packages/database/src/index');
    const { voicejarSessions, voicejarEvents } = await import('../../packages/database/src/schema/index');

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    console.log(`Deleting data older than: ${fourteenDaysAgo.toISOString()}`);

    // 1. Verwijder events van oude sessies
    // We moeten eerst de sessie IDs ophalen die we gaan verwijderen
    const oldSessions = await db.select({ visitorHash: voicejarSessions.visitorHash })
      .from(voicejarSessions)
      .where(lt(voicejarSessions.updatedAt, fourteenDaysAgo));

    const oldHashes = oldSessions.map(s => s.visitorHash);

    if (oldHashes.length > 0) {
      console.log(`Found ${oldHashes.length} old sessions to clean up.`);

      // Verwijder events
      // In een echte productie-omgeving met miljoenen rijen zou dit in batches moeten
      let deletedEvents = 0;
      for (const hash of oldHashes) {
        const result = await db.delete(voicejarEvents).where(eq(voicejarEvents.sessionId, hash));
        // Drizzle delete doesn't always return count depending on driver, but we log progress
      }
      console.log('✅ Old events deleted.');

      // 2. Verwijder de sessies zelf
      await db.delete(voicejarSessions).where(lt(voicejarSessions.updatedAt, fourteenDaysAgo));
      console.log('✅ Old sessions deleted.');
    } else {
      console.log('No old data found to clean up.');
    }

    console.log('--- 🧹 CLEANUP COMPLETED ---');

  } catch (err) {
    console.error('❌ Cleanup failed:', err);
  }
  process.exit(0);
}

import { eq } from 'drizzle-orm';
cleanup();
