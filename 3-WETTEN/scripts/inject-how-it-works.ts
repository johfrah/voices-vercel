import { db } from "@db";
import { contentArticles, contentBlocks } from "@db/schema";
import { eq } from "drizzle-orm";

/**
 * ⚛️ NUCLEAR CONTENT INJECTOR (MARK-EDITION)
 * 
 * Dit script transformeert grondstoffen uit de kelder naar de etalage.
 * Het zuivert de tekst, past Natural Capitalization toe en structureert de data.
 */

async function injectHowItWorks() {
  console.log("🚀 MARK: Start injectie 'Zo werkt het'...");

  const slug = "zo-werkt-het";
  const title = "Zo werkt het";
  
  // 1. De Grondstof (Gezuiverd door MARK)
  const intro = "In vier simpele stappen naar de perfecte stem voor jouw bedrijf. Geen gedoe, gewoon kwaliteit.";
  
  const steps = [
    {
      title: "Kies jouw stem",
      content: "Luister naar onze stemmen en kies de karakteristiek die bij je past. Meertalig? Geen probleem, veel van onze stemmen spreken hun talen vloeiend.",
      order: 1
    },
    {
      title: "Voer je tekst in",
      content: "Gebruik onze voorbeeldteksten of upload je eigen script. Wij kijken mee of het lekker loopt.",
      order: 2
    },
    {
      title: "Kies je muziek",
      content: "Voeg optioneel rechtenvrije wachtmuziek toe uit onze bibliotheek. Of upload je eigen audio.",
      order: 3
    },
    {
      title: "Direct geleverd",
      content: "Na je bestelling gaan we meteen aan de slag. Je ontvangt de audio in elk gewenst formaat, klaar voor gebruik.",
      order: 4
    }
  ];

  try {
    // 2. Upsert Article
    console.log(`📝 MARK: Upserting article [${slug}]...`);
    const [article] = await db.insert(contentArticles).values({
      title,
      slug,
      content: intro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { 
        title, 
        content: intro, 
        updatedAt: new Date(),
        isManuallyEdited: true 
      }
    }).returning();

    // 3. Clear existing blocks
    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, article.id));

    // 4. Insert Blocks (Thematic Grid)
    console.log("📦 MARK: Injecting content blocks...");
    for (const step of steps) {
      await db.insert(contentBlocks).values({
        articleId: article.id,
        type: 'thematic', // 4-column grid trigger
        content: `## ${step.title}\n${step.content}`,
        displayOrder: step.order,
        isManuallyEdited: true
      });
    }

    console.log("✅ MARK: 'Zo werkt het' is nu live in de database. Gezuiverd en wel.");
  } catch (error) {
    console.error("❌ MARK: Injectie mislukt:", error);
  }
}

injectHowItWorks().then(() => process.exit(0));
