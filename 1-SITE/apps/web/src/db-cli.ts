import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { contentArticles, contentBlocks, translations, appConfigs } from '../../../packages/database/src/schema/index';
import { eq, and, ilike, or } from "drizzle-orm";
import { db, seedInstructorBios, syncAllData } from './lib/sync/bridge';
import { VOICES_CONFIG } from '../../../packages/config/config';
import { MarketManagerServer as MarketManager } from './lib/system/market-manager-server';

/**
 * VOICES OS - DATABASE CLI TOOL (MARK & MOBY EDITION)
 * 
 * Gebruik: npx ts-node src/db-cli.ts <command>
 */

async function seedMarkets() {
  console.log('🚀 Starting seedMarkets...');
  const MARKETS = {
    'voices.be': {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: [
        'nl-BE', 'nl-NL', 'en-GB', 'fr-FR', 'de-DE', 
        'es-ES', 'it-IT', 'pl-PL', 'pt-PT', 'tr-TR', 
        'da-DK', 'sv-SE', 'nb-NO', 'fi-FI', 'el-GR', 
        'ru-RU', 'ar-SA', 'zh-CN', 'ja-JP'
      ],
      popular_languages: ['nl-BE', 'nl-NL', 'fr-FR', 'en-GB', 'de-DE'],
      name: 'België',
      logo_url: '/assets/common/branding/Voices-LOGO-Animated.svg',
      hero_images: [
        { url: "/assets/agency/voices/nl/nl/female/kristel-A-216105/kristel-photo.jpg", name: "Kristel", role: "Stemactrice" },
        { url: "/assets/agency/voices/be/nl/male/johfrah-A-182508/johfrah-photo.jpg", name: "Johfrah Lefebvre", role: "Founder & Stemacteur" },
        { url: "/assets/agency/voices/nl/nl/female/carolina-A-186284/carolina-photo.jpg", name: "Carolina", role: "Stemactrice" }
      ],
      hero_cta: { href: '/agency', text: 'Vind jouw stem' },
      theme: 'voices',
      is_inclusive: true
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'nl-NL',
      supported_languages: ['nl-NL', 'nl-BE', 'en-GB', 'de-DE', 'fr-FR', 'es-ES', 'it-IT'],
      popular_languages: ['nl-NL', 'nl-BE', 'en-GB', 'de-DE', 'fr-FR'],
      name: 'Nederland',
      phone: '+31 (0)85 016 34 60',
      email: 'johfrah@voices.nl',
      logo_url: '/assets/common/branding/Voices_LOGO_NL.svg',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      primary_language: 'fr-FR',
      supported_languages: ['fr-FR', 'en-GB', 'nl-NL', 'nl-BE', 'de-DE', 'es-ES', 'it-IT'],
      popular_languages: ['fr-FR', 'en-GB', 'nl-NL', 'nl-BE', 'de-DE'],
      name: 'France',
      email: 'johfrah@voices.fr',
      logo_url: '/assets/common/branding/Voices_LOGO_FR.svg',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.es': {
      market_code: 'ES',
      language: 'es',
      primary_language: 'es-ES',
      supported_languages: ['es-ES', 'en-GB', 'fr-FR', 'pt-PT', 'it-IT'],
      popular_languages: ['es-ES', 'en-GB', 'pt-PT'],
      name: 'España',
      email: 'johfrah@voices.es',
      logo_url: '/assets/common/branding/Voices_LOGO_ES.svg',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.pt': {
      market_code: 'PT',
      language: 'pt',
      primary_language: 'pt-PT',
      supported_languages: ['pt-PT', 'en-GB', 'es-ES', 'fr-FR'],
      popular_languages: ['pt-PT', 'en-GB', 'es-ES'],
      name: 'Portugal',
      email: 'johfrah@voices.pt',
      logo_url: '/assets/common/branding/Voices_LOGO_PT.svg',
      theme: 'voices',
      is_inclusive: true
    },
    'voices.eu': {
      market_code: 'EU',
      language: 'en',
      primary_language: 'en-GB',
      supported_languages: ['en-GB', 'de-DE', 'nl-BE', 'nl-NL', 'fr-FR', 'es-ES', 'it-IT'],
      popular_languages: ['en-GB', 'de-DE', 'fr-FR', 'nl-NL', 'nl-BE'],
      name: 'Europe',
      email: 'johfrah@voices.eu',
      logo_url: '/assets/common/branding/Voices_LOGO_EU.svg',
      theme: 'voices',
      is_inclusive: true
    },
    'johfrah.be': {
      market_code: 'PORTFOLIO',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      name: 'Johfrah',
      email: 'info@johfrah.be',
      logo_url: '/assets/common/branding/johfrah.be_LOGO.svg',
      hero_images: [
        { url: "/assets/agency/voices/be/nl/male/johfrah-A-182508/johfrah-photo.jpg", name: "Johfrah Lefebvre", role: "Voice-over & Host" }
      ],
      hero_cta: { href: '/demos', text: 'Bekijk mijn stemmen' },
      nav_links: [
        { 
          name: 'Voice-over', 
          href: '/demos', 
          key: 'nav.johfrah.voiceover',
          submenu: [
            { name: 'Beluister demo\'s', href: '/demos', key: 'nav.johfrah.demos' },
            { name: 'Hoe werkt het?', href: '/over-mij', key: 'nav.johfrah.how_it_works' },
            { name: 'Voice-over tarieven', href: '/tarieven', key: 'nav.johfrah.rates' },
            { name: 'Direct bestellen', href: '/bestellen', key: 'nav.johfrah.order' },
          ]
        },
        { name: 'Host', href: '/host', key: 'nav.johfrah.host' },
        { name: 'Contact', href: '/contact', key: 'nav.johfrah.contact' }
      ],
      theme: 'johfrah',
      is_inclusive: true
    },
    'ademing.be': {
      market_code: 'ADEMING',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL'],
      popular_languages: ['nl-BE', 'nl-NL'],
      name: 'Ademing',
      email: process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email,
      logo_url: '/assets/common/branding/Voices-LOGO-Animated.svg',
      hero_cta: { href: '/ademing', text: 'Start met luisteren' },
      nav_links: [
        { name: 'Meditaties', href: '/ademing', key: 'nav.ademing.meditations' },
        { name: 'Over Ademing', href: '/over-ademing', key: 'nav.ademing.about' },
        { name: 'Contact', href: '/contact', key: 'nav.ademing.contact' }
      ],
      footer_sections: [
        {
          title: 'Ademing',
          links: [
            { name: 'Meditaties', href: '/ademing' },
            { name: 'Over Ademing', href: '/over-ademing' },
            { name: 'Contact', href: '/contact' }
          ]
        },
        {
          title: 'Legal',
          links: [
            { name: 'Privacy', href: '/privacy' },
            { name: 'Voorwaarden', href: '/voorwaarden' }
          ]
        }
      ],
      theme: 'ademing',
      is_inclusive: true
    },
    'youssefzaki.eu': {
      market_code: 'ARTIST',
      language: 'en',
      primary_language: 'en-GB',
      supported_languages: ['en-GB', 'nl-NL', 'nl-BE', 'fr-FR', 'de-DE'],
      popular_languages: ['en-GB', 'nl-NL', 'nl-BE', 'fr-FR', 'de-DE'],
      name: 'Youssef Zaki',
      email: process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email,
      logo_url: '/assets/common/branding/Voices-LOGO-Animated.svg',
      hero_images: [
        { url: "/assets/common/branding/founder/youssef-poster.jpg", name: "Youssef Zaki", role: "Artist" }
      ],
      hero_cta: { href: '/music', text: 'Listen to my music' },
      nav_links: [
        { name: 'Story', href: '/story', key: 'nav.artist.story' },
        { name: 'Music', href: '/music', key: 'nav.artist.music' },
        { name: 'Support', href: '/support', key: 'nav.artist.support' }
      ],
      theme: 'youssef',
      is_inclusive: true
    },
    'voices.academy': {
      market_code: 'ACADEMY',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      name: 'Voices Academy',
      email: process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email,
      logo_url: '/assets/common/branding/Voices-LOGO-Animated.svg',
      theme: 'voices',
      is_inclusive: true
    },
    'johfrai.be': {
      market_code: 'JOHFRAI',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      name: 'Johfrai',
      email: process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email,
      logo_url: '/assets/common/branding/Voices-LOGO-Animated.svg',
      theme: 'johfrai',
      is_inclusive: true
    }
  };

  console.log('🚀 Seeding Market Configs...');

  for (const [host, config] of Object.entries(MARKETS)) {
    await db.insert(appConfigs).values({
      key: `market_config_${host}`,
      value: config,
      description: `Market configuration for ${host}`
    }).onConflictDoUpdate({
      target: [appConfigs.key],
      set: { value: config }
    });
    console.log(`✅ Seeded ${host}`);
  }

  await db.insert(appConfigs).values({
    key: 'active_markets',
    value: Object.keys(MARKETS),
    description: 'List of active market hosts'
  }).onConflictDoUpdate({
    target: [appConfigs.key],
    set: { value: Object.keys(MARKETS) }
  });

  console.log('✨ Market Seeding Complete!');
}

async function fixFrTranslations() {
  console.log(" CHRIS-PROTOCOL: Fixing French translations (Polite form & Hero)...");

  try {
    // 1. Fix Hero Video
    await db.update(translations)
      .set({ translatedText: 'Donnez à votre' })
      .where(and(eq(translations.lang, 'fr'), eq(translations.translationKey, 'agency.hero.title_part1_video')));
    
    await db.update(translations)
      .set({ translatedText: 'sa propre voix.' })
      .where(and(eq(translations.lang, 'fr'), eq(translations.translationKey, 'agency.hero.title_part2_video')));

    // 2. Fix 'Vertaling' leak in French
    await db.update(translations)
      .set({ translatedText: 'Traduction' })
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '%Vertaling%')));

    // 3. Fix 'ton' -> 'votre' (general polite form mandate)
    const tonResults = await db.select().from(translations)
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '% ton %')));
    
    console.log(`Found ${tonResults.length} instances of ' ton ' in French translations.`);
    
    for (const row of tonResults) {
      if (!row.translatedText) continue;
      const newText = row.translatedText.replace(/\bton\b/g, 'votre').replace(/\bDonne\b/g, 'Donnez');
      if (newText !== row.translatedText) {
        await db.update(translations).set({ translatedText: newText }).where(eq(translations.id, row.id));
      }
    }

    // 4. Fix 'ta' -> 'votre' (feminine informal)
    const taResults = await db.select().from(translations)
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '% ta %')));
    
    for (const row of taResults) {
      if (!row.translatedText) continue;
      const newText = row.translatedText.replace(/\bta\b/g, 'votre');
      if (newText !== row.translatedText) {
        await db.update(translations).set({ translatedText: newText }).where(eq(translations.id, row.id));
      }
    }

    // 5. Fix 'tes' -> 'vos' (plural informal)
    const tesResults = await db.select().from(translations)
      .where(and(eq(translations.lang, 'fr'), ilike(translations.translatedText, '% tes %')));
    
    for (const row of tesResults) {
      if (!row.translatedText) continue;
      const newText = row.translatedText.replace(/\btes\b/g, 'vos');
      if (newText !== row.translatedText) {
        await db.update(translations).set({ translatedText: newText }).where(eq(translations.id, row.id));
      }
    }

    console.log(' French translations fixed successfully.');
  } catch (e) {
    console.error(' Error fixing French translations:', e);
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
    console.log(` MARK: Upserting article [${coolSlug}]...`);
    const [coolArticle] = await db.insert(contentArticles).values({
      title: coolTitle,
      slug: coolSlug,
      content: coolIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: coolTitle, content: coolIntro, iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Inspiratie' }, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting story [${storySlug}]...`);
    const [storyArticle] = await db.insert(contentArticles).values({
      title: storyTitle,
      slug: storySlug,
      content: storyIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: storyTitle, content: storyIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting story [${creoSlug}]...`);
    const [creoArticle] = await db.insert(contentArticles).values({
      title: creoTitle,
      slug: creoSlug,
      content: creoIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: creoTitle, content: creoIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting story [${jokerSlug}]...`);
    const [jokerArticle] = await db.insert(contentArticles).values({
      title: jokerTitle,
      slug: jokerSlug,
      content: jokerIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: jokerTitle, content: jokerIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
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
    console.log(` MARK: Upserting music [${musicSlug}]...`);
    const [musicArticle] = await db.insert(contentArticles).values({
      title: musicTitle,
      slug: musicSlug,
      content: musicIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Beleving' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: musicTitle, content: musicIntro, iapContext: { journey: 'telephony', fase: 'awareness', theme: 'Beleving' }, updatedAt: now as any, isManuallyEdited: true }
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

    // 7. SLV Belgium Story (Stories)
    const slvSlug = "slv-belgium";
    const slvTitle = "SLV Belgium | Rust door professionalisering";
    const slvIntro = "Hoe een marktleider in verlichting koos voor een uniform visitekaartje aan de telefoon.";
    console.log(` MARK: Upserting story [${slvSlug}]...`);
    const [slvArticle] = await db.insert(contentArticles).values({
      title: slvTitle,
      slug: slvSlug,
      content: slvIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: slvTitle, content: slvIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, slvArticle.id));
    await db.insert(contentBlocks).values({
      articleId: slvArticle.id,
      type: 'story-layout',
      content: "## De Transformatie\nSLV Belgium koos voor een consistente audio-branding over al hun afdelingen heen. Dit zorgde niet alleen voor meer rust bij de klant, maar ook voor een professionelere uitstraling.",
      displayOrder: 1,
      isManuallyEdited: true
    });

    // 8. NKC Story (Stories)
    const nkcSlug = "nkc";
    const nkcTitle = "NKC | Evolutie in audio";
    const nkcIntro = "Hoe technologische vooruitgang en een warme aanpak samengaan in de klantendienst.";
    console.log(` MARK: Upserting story [${nkcSlug}]...`);
    const [nkcArticle] = await db.insert(contentArticles).values({
      title: nkcTitle,
      slug: nkcSlug,
      content: nkcIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: nkcTitle, content: nkcIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, nkcArticle.id));
    await db.insert(contentBlocks).values({
      articleId: nkcArticle.id,
      type: 'story-layout',
      content: "## De Doelgroep\nMet 35.000 telefoontjes per jaar is een glashelder keuzemenu onontbeerlijk. Een rustige, professionele stem die perfect matcht met de doelgroep.",
      displayOrder: 1,
      isManuallyEdited: true
    });

    // 9. Ticket Team Story (Stories)
    const ttSlug = "ticketteam";
    const ttTitle = "Ticket Team | Strak onthaal";
    const ttIntro = "Van een rommeltje naar een professioneel visitekaartje aan de telefoon.";
    console.log(` MARK: Upserting story [${ttSlug}]...`);
    const [ttArticle] = await db.insert(contentArticles).values({
      title: ttTitle,
      slug: ttSlug,
      content: ttIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: ttTitle, content: ttIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, ttArticle.id));
    await db.insert(contentBlocks).values({
      articleId: ttArticle.id,
      type: 'story-layout',
      content: "## De Uniformiteit\nHet 'rommeltje' aan verschillende stemmen en volumes werd achtergelaten voor een duidelijke stem die klanten snel en professioneel verder gidst.",
      displayOrder: 1,
      isManuallyEdited: true
    });

    // 10. Jokershop Interview (Stories)
    const jokerIntSlug = "jokershop-be-investeert-in-een-warm-onthaal";
    const jokerIntTitle = "Jokershop | Investering in een warm onthaal";
    const jokerIntIntro = "Roel van Jokershop vertelt waarom een professionele telefooncentrale cruciaal is voor hun groei.";
    console.log(` MARK: Upserting story [${jokerIntSlug}]...`);
    const [jokerIntArticle] = await db.insert(contentArticles).values({
      title: jokerIntTitle,
      slug: jokerIntSlug,
      content: jokerIntIntro,
      status: 'publish',
      iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' },
      isManuallyEdited: true,
      updatedAt: now as any
    }).onConflictDoUpdate({
      target: [contentArticles.slug],
      set: { title: jokerIntTitle, content: jokerIntIntro, iapContext: { journey: 'telephony', fase: 'decision', theme: 'Stories' }, updatedAt: now as any, isManuallyEdited: true }
    }).returning();

    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, jokerIntArticle.id));
    await db.insert(contentBlocks).values({
      articleId: jokerIntArticle.id,
      type: 'story-layout',
      content: "## De Klik\n'Tijdens onze zoektocht kwamen we al snel bij Voices.be uit. De klik was er meteen. Hun manier van communiceren voelt goed en natuurlijk aan.'",
      displayOrder: 1,
      isManuallyEdited: true
    });

    console.log(" MARK & MOBY: Alles is nu live in de database met de juiste thema-tags.");
  } catch (error) {
    console.error(" MARK: Injectie mislukt:", error);
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
  } else if (command === 'seed-markets') {
    await seedMarkets();
    process.exit(0);
  } else if (command === 'fix-fr-translations') {
    await fixFrTranslations();
    process.exit(0);
  } else if (command === 'cleanup-de-market') {
    await db.delete(appConfigs).where(eq(appConfigs.key, 'market_config_voices.de'));
    console.log('✅ Removed market_config_voices.de from database');
    process.exit(0);
  } else if (command === 'list-actors') {
    const { actors } = await import('../../../packages/database/src/schema/index');
    const { count } = await import('drizzle-orm');
    const total = await db.select({ value: count() }).from(actors);
    console.log('Total actors:', total[0].value);
    const statuses = await db.select({ status: actors.status, count: count() }).from(actors).groupBy(actors.status);
    console.log('Actor statuses:', statuses);
    const firstFive = await db.select({ id: actors.id, firstName: actors.firstName, status: actors.status }).from(actors).limit(5);
    console.log('First 5 actors:', firstFive);
    process.exit(0);
  } else {
    console.log('Usage: npx ts-node src/db-cli.ts <command>');
    console.log('Available commands: sync, seed-instructors, inject-mark-moby, seed-markets, fix-fr-translations, cleanup-de-market');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
