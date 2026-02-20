import { db } from "../../1-SITE/apps/web/src/lib/sync/bridge";
import { contentArticles, contentBlocks } from "../../1-SITE/packages/database/src/schema";
import { eq } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
// import matter from 'gray-matter';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

/**
 * 🚀 NUCLEAR CONTENT MIGRATOR (2026)
 * 
 * Doel: Grondstoffen (.md) uit src/content definitief naar de database-fabriek verplaatsen.
 * Volgt de Bob-methode: Zero-Touch Automatisatie & Consuela Protocol.
 */

const CONTENT_DIR = '1-SITE/apps/web/src/content';
const ARCHIVE_DIR = '4-KELDER/CONTAINER/src-content-archive';

async function migrateContent() {
  console.log("☢️  NUCLEAR MIGRATOR: Starting transformation pipeline...");

  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  // We focussen op de belangrijkste mappen in src/content
  const folders = ['pages', 'articles', 'fragments'];
  
  for (const folder of folders) {
    const dir = path.join(CONTENT_DIR, folder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    console.log(`📂 Processing folder: ${folder} (${files.length} files)`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parse Frontmatter
      const frontmatterMatch = rawContent.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
      let frontmatter: any = {};
      let body = rawContent;

      if (frontmatterMatch) {
        const yaml = frontmatterMatch[1];
        body = frontmatterMatch[2];
        yaml.split('\n').forEach(line => {
          const [key, ...val] = line.split(':');
          if (key && val.length > 0) {
            frontmatter[key.trim()] = val.join(':').trim().replace(/^["']|["']$/g, '');
          }
        });
      }
      
      const slug = frontmatter.slug || file.replace('.md', '');
      const title = frontmatter.title || slug;

      try {
        console.log(`  ☢️  Transforming [${slug}]...`);
        
        // 1. Upsert Article
        const [article] = await db.insert(contentArticles).values({
          title,
          slug,
          content: frontmatter.description || body.slice(0, 200),
          status: 'publish',
          iapContext: { 
            journey: frontmatter.journey || 'agency', 
            fase: frontmatter.fase || 'awareness',
            source: 'migration-factory',
            original_path: filePath
          },
          isManuallyEdited: true,
          updatedAt: new Date() as any
        }).onConflictDoUpdate({
          target: [contentArticles.slug],
          set: { 
            title, 
            updatedAt: new Date() as any,
            isManuallyEdited: true 
          }
        }).returning();

        // 2. Clear and Create Blocks
        await db.delete(contentBlocks).where(eq(contentBlocks.articleId, article.id));
        
        // Split body into sections based on ## headers
        const sections = body.split(/\n(?=## )/);
        
        for (let i = 0; i < sections.length; i++) {
          const sectionContent = sections[i].trim();
          if (!sectionContent) continue;

          // Bepaal block type op basis van content of folder
          let blockType = 'deep-read';
          if (folder === 'fragments') blockType = 'thematic';
          if (sectionContent.includes('{{tool:pricing-calculator}}')) blockType = 'calculator';
          if (sectionContent.includes('{{tool:course-explorer}}')) blockType = 'bento';
          if (sectionContent.includes('{{tool:workshop-explorer}}')) blockType = 'bento';
          
          await db.insert(contentBlocks).values({
            articleId: article.id,
            type: blockType,
            content: sectionContent,
            displayOrder: i + 1,
            isManuallyEdited: true
          });
        }

        // 3. Consuela Protocol: Archive the file
        const archivePath = path.join(ARCHIVE_DIR, folder);
        if (!fs.existsSync(archivePath)) fs.mkdirSync(archivePath, { recursive: true });
        
        fs.renameSync(filePath, path.join(archivePath, file));
        console.log(`  ✅ [${slug}] migrated and archived.`);

      } catch (err) {
        console.error(`  ❌ Failed to migrate [${slug}]:`, err);
      }
    }
  }

  console.log("✅ NUCLEAR MIGRATOR: Pipeline completed. Grondstoffen zijn nu in de database.");
}

migrateContent().catch(console.error);
