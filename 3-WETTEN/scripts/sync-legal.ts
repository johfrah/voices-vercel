import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars BEFORE any other imports that might use them
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { contentArticles, contentBlocks } from '../../1-SITE/packages/database/src/schema/index';
import { eq } from "drizzle-orm";
import fs from 'fs';

/**
 * ⚖️ LEX: LEGAL SYNC (2026)
 * 
 * Doel: Injecteren van de officiële legacy terms (43 artikelen) in de Supabase database.
 * De waarheid moet overal op de site vanuit één bron (de database) komen.
 */

const TERMS_FILE = '4-KELDER/0-GRONDSTOFFEN-FABRIEK/nuclear-content-relevant/page/terms.md';

async function syncLegalTerms() {
  console.log("⚖️  LEX: Starting legal terms injection...");

  if (!fs.existsSync(TERMS_FILE)) {
    console.error(`❌ Legacy terms file not found at: ${TERMS_FILE}`);
    return;
  }

  const content = fs.readFileSync(TERMS_FILE, 'utf-8');
  const slug = 'terms';
  const title = 'Algemene Voorwaarden';

  try {
    console.log(`  ⚖️  Upserting [${slug}] in contentArticles...`);
    
    // 1. Upsert the main article
    // @ts-ignore
    const [article] = await db.insert(contentArticles).values({
      title,
      slug,
      content: "De officiële algemene voorwaarden van Voices.be, opgesteld door onze jurist.",
      status: 'publish',
      iapContext: { journey: 'general', source: 'legacy-legal', type: 'legal' },
      isManuallyEdited: true, // Lock this from automatic overwrites
      updatedAt: new Date() as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title, updatedAt: new Date() as any, isManuallyEdited: true }
    }).returning();

    // 2. Clear existing blocks for this article to ensure a clean sync
    console.log(`  ⚖️  Refreshing contentBlocks for [${slug}]...`);
    // @ts-ignore
    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, article.id));

    // 3. Insert the full content as a single 'deep-read' block
    // Note: In the future, we could split this into 43 separate blocks for even finer control.
    // @ts-ignore
    await db.insert(contentBlocks).values({
      articleId: article.id,
      type: 'deep-read',
      content: content,
      displayOrder: 1,
      isManuallyEdited: true
    });

    console.log("✅ LEX: Legal terms injection completed successfully.");
  } catch (err) {
    console.error(`  ❌ LEX: Failed to sync legal terms:`, err);
  }
}

syncLegalTerms().catch(console.error);
