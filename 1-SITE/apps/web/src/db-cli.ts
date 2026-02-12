import { syncAllData, seedInstructorBios, db } from './lib/sync/bridge';
import { contentArticles, contentBlocks } from '@db/schema';
import { eq } from "drizzle-orm";

/**
 * VOICES OS - DATABASE CLI TOOL (MARK & MOBY EDITION)
 * 
 * Gebruik: npx ts-node src/db-cli.ts <command>
 */

async function injectMarkMobyContent() {
  console.log("🚀 MARK & MOBY: Start injectie 'Zo werkt het', 'Garanties' & 'FAQ'...");

  // 1. Zo werkt het
  const howSlug = "how-it-works";
  const howTitle = "Zo werkt het";
  const howIntro = "In vier simpele stappen naar de perfecte stem voor jouw bedrijf. Geen gedoe, gewoon kwaliteit.";
  
  const howSteps = [
    { title: "Kies jouw stem", content: "Luister naar onze stemmen en kies de karakteristiek die bij je past. Meertalig? Geen probleem, veel van onze stemmen spreken hun talen vloeiend.", order: 1 },
    { title: "Voer je tekst in", content: "Gebruik onze voorbeeldteksten of upload je eigen script. Wij kijken mee of het lekker loopt.", order: 2 },
    { title: "Kies je muziek", content: "Voeg optioneel rechtenvrije wachtmuziek toe uit onze bibliotheek. Of upload je eigen audio.", order: 3 },
    { title: "Direct geleverd", content: "Na je bestelling gaan we meteen aan de slag. Je ontvangt de audio in elk gewenst formaat, klaar voor gebruik.", order: 4 }
  ];

  // 2. Garanties
  const garSlug = "onze-belofte";
  const garTitle = "Onze belofte";
  const garIntro = "Kwaliteit zonder omwegen. Wij staan achter ons ambacht.";

  const garItems = [
    { title: "Retakes inbegrepen", content: "Niet helemaal tevreden over de uitspraak of het tempo? We passen het aan tot het perfect is. Zonder extra kosten.", order: 1 },
    { title: "Snelle levering", content: "Tijd is kostbaar. De meeste opnames worden binnen 24 uur geleverd, vaak zelfs sneller.", order: 2 },
    { title: "Professionele mix", content: "Elke opname wordt in onze studio afgemixt op 48kHz broadcast kwaliteit. Klaar voor elk platform.", order: 3 },
    { title: "Opknippen inbegrepen", content: "Heb je losse bestanden nodig voor je telefooncentrale? Wij knippen ze voor je op en leveren ze in het juiste formaat.", order: 4 }
  ];

  // 3. FAQ (High-Impact)
  const faqSlug = "veelgestelde-vragen";
  const faqTitle = "Veelgestelde vragen";
  const faqIntro = "Alles wat je moet weten over jouw volgende stemproject.";

  const faqItems = [
    { title: "Hoe snel heb ik mijn opname?", content: "Meestal heb je de opname de volgende dag al. We garanderen levering binnen 3 werkdagen. Heb je haast? Laat het ons weten via de chat, dan kijken we wat er direct mogelijk is.", order: 1 },
    { title: "Wat kost een stem?", content: "De prijs hangt af van de lengte van je tekst en het type project. Een voicemail heeft een ander tarief dan een nationale TV-spot. Gebruik onze calculator voor een directe prijsopgave zonder verrassingen.", order: 2 },
    { title: "Kan ik de opname nog aanpassen?", content: "Natuurlijk. Een retake voor uitspraak, tempo of intonatie is altijd inbegrepen. We stoppen pas als het precies zo klinkt als jij in je hoofd hebt.", order: 3 }
  ];

  try {
    // Inject How It Works
    console.log(`📝 MARK: Upserting article [${howSlug}]...`);
    const [howArticle] = await db.insert(contentArticles).values({
      title: howTitle,
      slug: howSlug,
      content: howIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: howTitle, content: howIntro, updatedAt: new Date(), isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, howArticle.id));
    for (const step of howSteps) {
      await db.insert(contentBlocks).values({
        articleId: howArticle.id,
        type: 'thematic', // Moby: 4-column grid
        content: `## ${step.title}\n${step.content}`,
        displayOrder: step.order,
        isManuallyEdited: true
      });
    }

    // Inject Garanties
    console.log(`📝 MARK: Upserting article [${garSlug}]...`);
    const [garArticle] = await db.insert(contentArticles).values({
      title: garTitle,
      slug: garSlug,
      content: garIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: garTitle, content: garIntro, updatedAt: new Date(), isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, garArticle.id));
    for (const item of garItems) {
      await db.insert(contentBlocks).values({
        articleId: garArticle.id,
        type: 'split-screen', // Moby: 4/8 split with accordions
        content: `## ${item.title}\n${item.content}`,
        displayOrder: item.order,
        isManuallyEdited: true
      });
    }

    // Inject FAQ
    console.log(`📝 MARK: Upserting article [${faqSlug}]...`);
    const [faqArticle] = await db.insert(contentArticles).values({
      title: faqTitle,
      slug: faqSlug,
      content: faqIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: faqTitle, content: faqIntro, updatedAt: new Date(), isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, faqArticle.id));
    for (const faq of faqItems) {
      await db.insert(contentBlocks).values({
        articleId: faqArticle.id,
        type: 'split-screen', // Moby: 4/8 split with accordions
        content: `## ${faq.title}\n${faq.content}`,
        displayOrder: faq.order,
        isManuallyEdited: true
      });
    }

    console.log("✅ MARK & MOBY: 'Zo werkt het', 'Onze belofte' en 'Veelgestelde vragen' zijn nu live in de database.");
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
