import { contentArticles, contentBlocks } from '../../packages/database/schema';
import { eq } from "drizzle-orm";
import { db, seedInstructorBios, syncAllData } from './lib/sync/bridge';

/**
 * VOICES OS - DATABASE CLI TOOL (MARK & MOBY EDITION)
 * 
 * Gebruik: npx ts-node src/db-cli.ts <command>
 */

async function injectMarkMobyContent() {
  console.log("🚀 MARK & MOBY: Start injectie 'Zo werkt het', 'Garanties', 'FAQ', 'Scripts', 'Stories' & 'Muziek'...");

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
    { title: "Retakes inbegrepen", content: "Niet helemaal tevreden over de uitspraak of het tempo? We passen het kosteloos aan tot het perfect is. Let op: voor tekstwijzigingen achteraf rekenen we een klein supplement.", order: 1 },
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
    { title: "Kan ik de opname nog aanpassen?", content: "Natuurlijk. Een retake voor uitspraak, tempo of intonatie is altijd inbegrepen. Voor wijzigingen in de tekst na de opname rekenen we een vast tarief.", order: 3 }
  ];

  // 4. Script Bibliotheek (Inspiratie)
  const scriptSlug = "voorbeeldteksten-telefooncentrale";
  const scriptTitle = "Voorbeeldteksten voor je telefooncentrale";
  const scriptIntro = "Geen inspiratie? Gebruik onze beproefde teksten als basis voor jouw eigen boodschap. Kopieer, plak en pas aan.";

  const scriptCategories = [
    { 
      title: "Gesloten & Buiten kantooruren", 
      content: "## Welkom bij [Bedrijfsnaam]. Momenteel is ons kantoor gesloten. We zijn te bereiken van maandag tot en met vrijdag van 08:30 tot 17:00. Laat een bericht achter of stuur een e-mail naar [E-mailadres]. Bedankt voor uw oproep.",
      order: 1 
    },
    { 
      title: "Keuzemenu (IVR)", 
      content: "## Welkom bij [Bedrijfsnaam]. Voor onze helpdesk, druk 1. Voor verkoop, druk 2. Voor administratie of andere vragen, blijf aan de lijn of druk 3.",
      order: 2 
    },
    { 
      title: "Wachtbericht", 
      content: "## Een moment geduld alstublieft, al onze medewerkers zijn momenteel in gesprek. U wordt zo spoedig mogelijk geholpen. Bedankt voor uw geduld.",
      order: 3 
    },
    { 
      title: "Vakantie & Feestdagen", 
      content: "## Goeiedag, welkom bij [Bedrijfsnaam]. In verband met onze jaarlijkse vakantie zijn wij gesloten tot [Datum]. Vanaf [Datum] staan we weer voor u klaar. Kijk voor dringende zaken op onze website.",
      order: 4 
    }
  ];

  // 5. SKYGGE Story (Stories)
  const storySlug = "story-skygge";
  const storyTitle = "SKYGGE | Professionalisering via audio";
  const storyIntro = "Hoe mede-zaakvoerder An Casters met een professionele telefooncentrale zorgt voor een onvergetelijke eerste indruk.";

  const storyBlocks = [
    { 
      title: "De uitdaging", 
      content: "## Waarom een telefooncentrale?\n'Dat was een no-brainer. Je kunt privé van zakelijk scheiden en je 100% focussen op de klant.'",
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
    // Inject How It Works
    console.log(`📝 MARK: Upserting article [${howSlug}]...`);
    const [howArticle] = await db.insert(contentArticles).values({
      title: howTitle,
      slug: howSlug,
      content: howIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: howTitle, content: howIntro, updatedAt: new Date().toISOString() as any, isManuallyEdited: true } as any
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, howArticle.id));
    for (const step of howSteps) {
      await db.insert(contentBlocks).values({
        articleId: howArticle.id,
        type: 'thematic', 
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
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: garTitle, content: garIntro, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, garArticle.id));
    for (const item of garItems) {
      await db.insert(contentBlocks).values({
        articleId: garArticle.id,
        type: 'split-screen', 
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
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: faqTitle, content: faqIntro, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, faqArticle.id));
    for (const faq of faqItems) {
      await db.insert(contentBlocks).values({
        articleId: faqArticle.id,
        type: 'split-screen', 
        content: `## ${faq.title}\n${faq.content}`,
        displayOrder: faq.order,
        isManuallyEdited: true
      });
    }

    // Inject Script Bibliotheek (Inspiratie)
    console.log(`📝 MARK: Upserting article [${scriptSlug}]...`);
    const [scriptArticle] = await db.insert(contentArticles).values({
      title: scriptTitle,
      slug: scriptSlug,
      content: scriptIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: scriptTitle, content: scriptIntro, iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' }, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, scriptArticle.id));
    for (const cat of scriptCategories) {
      await db.insert(contentBlocks).values({
        articleId: scriptArticle.id,
        type: 'thematic', 
        content: `## ${cat.title}\n${cat.content}`,
        displayOrder: cat.order,
        isManuallyEdited: true
      });
    }

    // Inject Coolblue (Inspiratie)
    const coolSlug = "coolblue-story";
    const coolTitle = "Audio Branding: Het geheim van Coolblue";
    const coolIntro = "Waarom het klantvriendelijkste bedrijf van de Benelux zweert bij een herkenbare audio-branding.";
    console.log(`📝 MARK: Upserting article [${coolSlug}]...`);
    const [coolArticle] = await db.insert(contentArticles).values({
      title: coolTitle,
      slug: coolSlug,
      content: coolIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: coolTitle, content: coolIntro, iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' }, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, coolArticle.id));
    await db.insert(contentBlocks).values({
      articleId: coolArticle.id,
      type: 'story-layout',
      content: "## De Strategie\nCoolblue begrijpt dat elk contactmoment telt. Hun audio-branding is een essentieel onderdeel van de 'glimlach' die ze beloven.",
      displayOrder: 1,
      isManuallyEdited: true
    });

    // Inject SKYGGE Story (Stories)
    console.log(`📝 MARK: Upserting story [${storySlug}]...`);
    const [storyArticle] = await db.insert(contentArticles).values({
      title: storyTitle,
      slug: storySlug,
      content: storyIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: storyTitle, content: storyIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, storyArticle.id));
    for (const block of storyBlocks) {
      await db.insert(contentBlocks).values({
        articleId: storyArticle.id,
        type: 'story-layout', 
        content: block.content,
        displayOrder: block.order,
        isManuallyEdited: true
      });
    }

    // Inject CREO Story (Stories)
    const creoSlug = "story-creo";
    const creoTitle = "CREO | De eerste indruk";
    const creoIntro = "Waarom het telefonisch onthaal voor een onderwijsinstelling het belangrijkste visitekaartje is.";
    console.log(`📝 MARK: Upserting story [${creoSlug}]...`);
    const [creoArticle] = await db.insert(contentArticles).values({
      title: creoTitle,
      slug: creoSlug,
      content: creoIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: creoTitle, content: creoIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, creoArticle.id));
    await db.insert(contentBlocks).values({
      articleId: creoArticle.id,
      type: 'story-layout',
      content: "## Het Belang\n'Het is zoals wanneer je iemand voor de eerste keer ziet. Die eerste indruk telt.'",
      displayOrder: 1,
      isManuallyEdited: true
    });

    // Inject Jokershop Story (Stories)
    const jokerSlug = "jokershop";
    const jokerTitle = "Jokershop | Fun & Kwaliteit";
    const jokerIntro = "Waarom ook een feestwinkel kiest voor een professionele uitstraling aan de telefoon.";
    console.log(`📝 MARK: Upserting story [${jokerSlug}]...`);
    const [jokerArticle] = await db.insert(contentArticles).values({
      title: jokerTitle,
      slug: jokerSlug,
      content: jokerIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: jokerTitle, content: jokerIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, jokerArticle.id));
    await db.insert(contentBlocks).values({
      articleId: jokerArticle.id,
      type: 'story-layout',
      content: "## De Beleving\nOntdek hoe audio bijdraagt aan de fun-factor van Jokershop zonder in te boeten op professionaliteit.",
      displayOrder: 1,
      isManuallyEdited: true
    });

    // Inject Muziek (Beleving)
    console.log(`📝 MARK: Upserting music [${musicSlug}]...`);
    const [musicArticle] = await db.insert(contentArticles).values({
      title: musicTitle,
      slug: musicSlug,
      content: musicIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Beleving' },
      isManuallyEdited: true,
      updatedAt: new Date().toISOString() as any
    } as any).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: musicTitle, content: musicIntro, iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Beleving' }, updatedAt: new Date().toISOString() as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, musicArticle.id));
    for (const block of musicBlocks) {
      await db.insert(contentBlocks).values({
        articleId: musicArticle.id,
        type: 'lifestyle-overlay', 
        content: block.content,
        displayOrder: block.order,
        isManuallyEdited: true
      });
    }

    console.log("✅ MARK & MOBY: Alles is nu live in de database met de juiste thema-tags.");
  } catch (error) {
    console.error("❌ MARK: Injectie mislukt:", error);
    process.exit(1);
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
