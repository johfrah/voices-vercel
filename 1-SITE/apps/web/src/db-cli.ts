import { contentArticles, contentBlocks } from '@db/schema';
import { eq } from "drizzle-orm";
import { db, seedInstructorBios, syncAllData } from './lib/sync/bridge';

/**
 * VOICES OS - DATABASE CLI TOOL (MARK & MOBY EDITION)
 * 
 * Gebruik: npx ts-node src/db-cli.ts <command>
 */

async function injectMarkMobyContent() {
  console.log("🚀 MARK & MOBY: Start injectie 'Zo werkt het', 'Garanties', 'FAQ', 'Scripts', 'Stories' & 'Muziek'...");

  // ... (vorige secties blijven gelijk)

  // 5. SKYGGE Story (Social Proof)
  const storySlug = "story-skygge";
  const storyTitle = "SKYGGE | Professionalisering via audio";
  const storyIntro = "Hoe mede-zaakvoerder An Casters met een professionele telefooncentrale zorgt voor een onvergetelijke eerste indruk.";

  const storyBlocks = [
    { 
      title: "De uitdaging", 
      content: "## Waarom een telefooncentrale?\n'Dat was een no-brainer. Je kunt privé van zakelijk scheiden en je 100% focussen op de klant. Geen telefoontjes meer om tien uur 's avonds.'",
      order: 1 
    },
    { 
      title: "De oplossing", 
      content: "## Waarom professioneel?\n'Als je het zelf doet, klinkt het vaak geforceerd of te informeel. Een professionele stem van Voices.be is een absolute meerwaarde voor onze uitstraling.'",
      order: 2 
    }
  ];

  // 6. Wachtmuziek (Beleving)
  const musicSlug = "wachtmuziek-die-werkt";
  const musicTitle = "Wachtmuziek die werkt";
  const musicIntro = "Muziek is de hartslag van je wachtrij. Kies de juiste sfeer en verlaag de ervaren wachttijd.";

  const musicBlocks = [
    { 
      title: "De psychologie", 
      content: "## Waarom goede muziek?\n'Wachtmuziek is meer dan vulling. Het is een kans om je merkidentiteit te versterken en de beller in de juiste stemming te brengen.'",
      order: 1 
    },
    { 
      title: "Onze collectie", 
      content: "## Rechtenvrij & Professioneel\n'Van rustgevende piano tot energieke beats. Al onze muziek is geoptimaliseerd voor telefonie (300Hz - 3400Hz) en volledig rechtenvrij.'",
      order: 2 
    }
  ];

  try {
    // ... (vorige injecties)

    // Inject Story
    console.log(`📝 MARK: Upserting story [${storySlug}]...`);
    const [storyArticle] = await db.insert(contentArticles).values({
      title: storyTitle,
      slug: storySlug,
      content: storyIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision' },
      isManuallyEdited: true,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: storyTitle, content: storyIntro, updatedAt: new Date(), isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, storyArticle.id));
    for (const block of storyBlocks) {
      await db.insert(contentBlocks).values({
        articleId: storyArticle.id,
        type: 'story-layout', // Moby: Story layout met grote quotes
        content: block.content,
        displayOrder: block.order,
        isManuallyEdited: true
      });
    }

    // Inject Muziek
    console.log(`📝 MARK: Upserting music [${musicSlug}]...`);
    const [musicArticle] = await db.insert(contentArticles).values({
      title: musicTitle,
      slug: musicSlug,
      content: musicIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness' },
      isManuallyEdited: true,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: musicTitle, content: musicIntro, updatedAt: new Date(), isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, musicArticle.id));
    for (const block of musicBlocks) {
      await db.insert(contentBlocks).values({
        articleId: musicArticle.id,
        type: 'lifestyle-overlay', // Moby: Lifestyle overlay voor sfeer
        content: block.content,
        displayOrder: block.order,
        isManuallyEdited: true
      });
    }

    console.log("✅ MARK & MOBY: Alles is nu live in de database.");
  } catch (error) {
    console.error("❌ MARK: Injectie mislukt:", error);
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'sync') {
    await syncAllData();
    process.exit(0);
  } else if (command === 'seed-instructors') {
    await seedInstructorBios();
    process.exit(0);
  } else if (command === 'inject-mark-moby') {
    await injectMarkMobyContent();
    process.exit(0);
  } else {
    console.log('Usage: npx ts-node src/db-cli.ts <command>');
    console.log('Available commands: sync, seed-instructors, inject-mark-moby');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
