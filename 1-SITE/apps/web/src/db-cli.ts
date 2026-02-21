const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// CHRIS-PROTOCOL: Using absolute paths to avoid Russian Doll directory issues
const { db, seedInstructorBios, syncAllData } = require('/Users/voices/Library/CloudStorage/Dropbox/voices-headless/1-SITE/apps/web/1-SITE/apps/web/src/lib/sync/bridge');
const { OpenAIService } = require('/Users/voices/Library/CloudStorage/Dropbox/voices-headless/1-SITE/apps/web/1-SITE/apps/web/src/services/OpenAIService');
const { contentArticles, contentBlocks, translations } = require('/Users/voices/Library/CloudStorage/Dropbox/voices-headless/1-SITE/packages/database/src/schema/index');
const { eq, and, ilike, or, not } = require("drizzle-orm");

/**
 * VOICES OS - DATABASE CLI TOOL (MARK & MOBY EDITION)
 * 
 * Gebruik: npx ts-node src/db-cli.ts <command>
 */

async function fixFrTranslations() {
  console.log(" CHRIS-PROTOCOL: Fixing French translations (Polite form & Hero)...");

  try {
    // 1. Fix Hero Video
    await db.update(translations)
      .set({ translatedText: 'Donnez à votre vidéo', context: 'Agency Hero Title Part 1' })
      .where(and(eq(translations.lang, 'fr'), eq(translations.translationKey, 'agency.hero.title_part1_video')));
    
    await db.update(translations)
      .set({ translatedText: 'sa propre voix.', context: 'Agency Hero Title Part 2' })
      .where(and(eq(translations.lang, 'fr'), eq(translations.translationKey, 'agency.hero.title_part2_video')));

    // 2. Fix 'Vertaling' leak in French
    await db.update(translations)
      .set({ translatedText: 'Traduction' })
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '%Vertaling%')));

    console.log(' French translations fixed successfully.');
  } catch (e) {
    console.error(' Error fixing French translations:', e);
  }
}

async function auditTones() {
  console.log(" CHRIS-PROTOCOL: Auditing all Voice Tones across all languages...");

  try {
    const toneTranslations = await db.select().from(translations)
      .where(and(
        ilike(translations.translationKey, 'actor.%.tone.%'),
        not(eq(translations.lang, 'nl'))
      ));

    console.log(`Found ${toneTranslations.length} tone translations to audit.`);

    for (const row of toneTranslations) {
      console.log(`Auditing [${row.lang}] ${row.originalText} (${row.translatedText})...`);
      
      const prompt = `
        Je bent een native speaker ${row.lang} en een expert in voice-over terminologie.
        Audit de volgende vertaling van een stemkenmerk (tone of voice).
        
        CONTEXT: Voices.be is een premium voice-over agency.
        DOEL: De term moet de klank van een stem accuraat en professioneel beschrijven voor een native speaker.
        LET OP: Vermijd termen die seksueel getint kunnen zijn (zoals 'chaud' in het Frans voor 'warm', gebruik liever 'chaleureux' of 'grave' als het om diepte gaat).
        
        Bron (NL): "${row.originalText}"
        Huidige vertaling: "${row.translatedText}"
        
        Is de huidige vertaling perfect native en correct voor een stemkenmerk? Zo nee, geef de verbeterde versie.
        Geef UITSLUITEND de verbeterde tekst terug, geen uitleg.
        Verbeterde tekst:
      `;

      const improved = await OpenAIService.generateText(prompt, "gpt-4o");
      const cleanImproved = improved.trim().replace(/^"|"$/g, '');

      if (cleanImproved && cleanImproved !== row.translatedText && cleanImproved.length < 50) {
        await db.update(translations)
          .set({ 
            translatedText: cleanImproved,
            context: "Voice characteristic / Tone of voice",
            updatedAt: new Date()
          })
          .where(eq(translations.id, row.id));
        console.log(`  -> Updated to: ${cleanImproved}`);
      }
    }
    console.log(" Audit completed.");
  } catch (e) {
    console.error(" Audit failed:", e);
  }
}

async function injectMarkMobyContent() {
  console.log(" MARK & MOBY: Start injectie 'Zo werkt het', 'Garanties', 'FAQ', 'Scripts', 'Stories' & 'Muziek'...");

  const now = new Date();

  // 1. Zo werkt het
  const howSlug = "zo-werkt-het";
  const howTitle = "Zo werkt het";
  const howIntro = "In vier simpele stappen naar de perfecte stem voor jouw bedrijf. Geen gedoe, gewoon kwaliteit.";
  
  const howSteps = [
    { title: "Kies jouw stem", content: "Luister naar onze stemmen en kies de karakteristiek die bij je past. Meertalig? Geen probleem, veel van onze stemmen spreken hun talen vloeiend.", order: 1 },
    { title: "Voer je tekst in", content: "Gebruik onze voorbeeldteksten of upload je eigen script. Wij kijken mee of het lekker loopt.", order: 2 },
    { title: "Kies je muziek", content: "Voeg optioneel rechtenvrije wachtmuziek toe uit onze bibliotheek. Of upload je eigen audio.", order: 3 },
    { title: "Direct geleverd", content: "Na je bestelling gaan we meteen aan de slag. Je ontvangt de audio in elk gewenst formaat, klaar voor gebruik.", order: 4 }
  ];

  // 2. Garanties
  const garSlug = "tarieven";
  const garTitle = "Tarieven";
  const garIntro = "Kwaliteit zonder omwegen. Wij staan achter ons ambacht en hanteren transparante tarieven.";

  const garItems = [
    { title: "Transparante prijzen", content: "Geen verrassingen achteraf. Gebruik onze calculator voor een directe prijsopgave op maat van jouw project.", order: 1 },
    { title: "Retakes inbegrepen", content: "Niet helemaal tevreden over de uitspraak of het tempo? We passen het kosteloos aan tot het perfect is. Let op: voor tekstwijzigingen achteraf rekenen we een klein supplement.", order: 2 },
    { title: "Snelle levering", content: "Tijd is kostbaar. De meeste opnames worden binnen 24 uur geleverd, vaak zelfs sneller.", order: 3 },
    { title: "Professionele mix", content: "Elke opname wordt in onze studio afgemixt op 48kHz broadcast kwaliteit. Klaar voor elk platform.", order: 4 }
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

  // 4. Cookies & Voorwaarden
  const cookieSlug = "cookies";
  const cookieTitle = "Cookiebeleid";
  const cookieIntro = "Wij gebruiken cookies om uw ervaring op onze website te verbeteren.";

  const termsSlug = "voorwaarden";
  const termsTitle = "Algemene Voorwaarden";
  const termsIntro = "Onze afspraken voor een fijne samenwerking.";

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
      content: "## Waarom een telefooncentrale?\n'Dat was een no-brainer. Je kunt priv van zakelijk scheiden en je 100% focussen op de klant.'",
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
    console.log(` MARK: Upserting article [${howSlug}]...`);
    const [howArticle] = await db.insert(contentArticles).values({
      title: howTitle,
      slug: howSlug,
      content: howIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: howTitle, content: howIntro, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting article [${garSlug}]...`);
    const [garArticle] = await db.insert(contentArticles).values({
      title: garTitle,
      slug: garSlug,
      content: garIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: garTitle, content: garIntro, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting article [${faqSlug}]...`);
    const [faqArticle] = await db.insert(contentArticles).values({
      title: faqTitle,
      slug: faqSlug,
      content: faqIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'consideration' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: faqTitle, content: faqIntro, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting article [${scriptSlug}]...`);
    const [scriptArticle] = await db.insert(contentArticles).values({
      title: scriptTitle,
      slug: scriptSlug,
      content: scriptIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: scriptTitle, content: scriptIntro, iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' }, updatedAt: now as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, scriptArticle.id));
    for (const script of scriptCategories) {
      await db.insert(contentBlocks).values({
        articleId: scriptArticle.id,
        type: 'thematic', 
        content: script.content,
        displayOrder: script.order,
        isManuallyEdited: true
      });
    }

    // Inject Cookies
    console.log(` MARK: Upserting article [${cookieSlug}]...`);
    await db.insert(contentArticles).values({
      title: cookieTitle,
      slug: cookieSlug,
      content: cookieIntro,
      status: 'publish',
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: cookieTitle, content: cookieIntro, updatedAt: now as any, isManuallyEdited: true }
    });

    // Inject Voorwaarden
    console.log(` MARK: Upserting article [${termsSlug}]...`);
    await db.insert(contentArticles).values({
      title: termsTitle,
      slug: termsSlug,
      content: termsIntro,
      status: 'publish',
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: termsTitle, content: termsIntro, updatedAt: now as any, isManuallyEdited: true }
    });

    console.log(" MARK & MOBY: Alles is nu live in de database met de juiste thema-tags.");
  } catch (error) {
    console.error(" MARK: Injectie mislukt:", error);
    process.exit(1);
  }
}

async function checkKey(key: string) {
  console.log(` CHRIS-PROTOCOL: Checking translations for key: ${key}`);
  try {
    const results = await db.select().from(translations).where(eq(translations.translationKey, key));
    console.table(results.map((r: any) => ({ lang: r.lang, text: r.translatedText })));
  } catch (e) {
    console.error(' Error checking key:', e);
  }
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  if (command === 'sync') {
    await syncAllData();
    process.exit(0);
  } else if (command === 'seed-instructors') {
    await seedInstructorBios();
    process.exit(0);
  } else if (command === 'inject-mark-moby') {
    await injectMarkMobyContent();
    process.exit(0);
  } else if (command === 'fix-fr') {
    await fixFrTranslations();
    process.exit(0);
  } else if (command === 'audit-tones') {
    await auditTones();
    process.exit(0);
  } else if (command === 'check' && arg) {
    await checkKey(arg);
    process.exit(0);
  } else {
    console.log('Usage: npx ts-node src/db-cli.ts <command> [arg]');
    console.log('Available commands: sync, seed-instructors, inject-mark-moby, fix-fr, audit-tones, check <key>');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
