import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { contentArticles, contentBlocks } from '../../packages/database/src/schema';
import { eq } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

/**
 * 🚀 NUCLEAR SYNC (2026)
 * 
 * Doel: Automatisch transformeren van grondstoffen (Markdown) naar de Supabase Etalage.
 * Volgt de Bob-methode: Zero-Touch Automatisatie.
 */

const RAW_DIR = '4-KELDER/0-GRONDSTOFFEN-FABRIEK/nuclear-content';

async function syncNuclearContent() {
  console.log("☢️  NUCLEAR SYNC: Starting transformation pipeline...");

  const categories = ['page', 'post', 'faq'];
  
  for (const cat of categories) {
    const dir = path.join(RAW_DIR, cat);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    console.log(`📂 Processing category: ${cat} (${files.length} files)`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const slug = file.replace('.md', '');
      
      // Simple parsing (to be enhanced with LLM logic)
      const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      try {
        console.log(`  ☢️  Upserting [${slug}]...`);
        
        const [article] = await db.insert(contentArticles).values({
          title,
          slug,
          content: content.slice(0, 500) + '...', // Summary
          status: 'publish',
          iapContext: { journey: 'agency', source: 'nuclear-factory', category: cat },
          isManuallyEdited: false,
          updatedAt: new Date() as any
        }).onConflictDoUpdate({
          target: [contentArticles.slug],
          set: { title, updatedAt: new Date() as any }
        }).returning();

        // Create a default block with the full content
        await db.delete(contentBlocks).where(eq(contentBlocks.articleId, article.id));
        await db.insert(contentBlocks).values({
          articleId: article.id,
          type: cat === 'faq' ? 'split-screen' : 'deep-read',
          content: content,
          displayOrder: 1,
          isManuallyEdited: false
        });

      } catch (err) {
        console.error(`  ❌ Failed to sync [${slug}]:`, err);
      }
    }
  }

  console.log("✅ NUCLEAR SYNC: Pipeline completed.");
}

syncNuclearContent().catch(console.error);
