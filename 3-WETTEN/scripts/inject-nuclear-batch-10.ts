import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Block {
  title: string;
  content: string;
  type: string;
  order: number;
  settings?: any;
}

interface Article {
  title: string;
  slug: string;
  content: string;
  iap_context: any;
  blocks: Block[];
}

async function injectBatch10() {
  console.log("🚀 MARK: Start Nuclear Injection Batch 10 (Expertise & Academy Deep Dive)...");

  const now = new Date().toISOString();

  const articles: Article[] = [
    {
      title: "Stem gezocht voor telefoonboodschappen?",
      slug: "stem-voor-telefoonboodschappen",
      content: "Waarom een professionele stem het verschil maakt in je Interactive Voice Response (IVR) systeem.",
      iap_context: { journey: 'telephony', persona: 'entrepreneur', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "De Eerste Indruk", 
          content: "## On hold messaging: do's en don'ts\nWanneer klanten bellen en even in de wacht staan, is een warme, vriendelijke stem cruciaal. Het is de eerste indruk van je bedrijf. Gebruik deze tijd om klanten te informeren of te verwijzen naar je website.", 
          type: 'lifestyle-overlay', 
          order: 1,
          settings: { video_url: '/assets/content/blog/videos/de-voordelen-van-je-voicemail-laten-inspreken-voicesbe.mp4', use_own_player: true }
        },
        { 
          title: "Zelf doen of uitbesteden?", 
          content: "## De kracht van dialectloos spreken\nZelf inspreken kan persoonlijk zijn, maar klinkt vaak onprofessioneel. Een professionele stem is dialectloos en verstaanbaar voor iedereen, wat direct vertrouwen uitstraalt.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    },
    {
      title: "Zo spreekt u een zakelijk voicemail bericht in",
      slug: "zakelijke-voicemail-inspreken",
      content: "4 snelle tips voor een professionele voicemail die je klanten niet wegjaagt.",
      iap_context: { journey: 'telephony', persona: 'entrepreneur', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "Tempo & Kwaliteit", 
          content: "## Geen sneltrein, maar wel to-the-point\nStart meteen met het menu en laat overbodige info weg. Zorg voor een opname zonder achtergrondgeluid en kies een stem met de juiste intonatie.", 
          type: 'split-screen', 
          order: 1 
        },
        { 
          title: "Mensen, geen robots", 
          content: "## Warmte boven techniek\nJe bent een menselijk bedrijf. Verpest dat beeld niet met een kille robotstem. Een warme, vriendelijke stem komt veel professioneler over.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    },
    {
      title: "Waar vind je voice-over werk?",
      slug: "vind-voice-werk",
      content: "De 50-50 regel voor succes: waarom marketing net zo belangrijk is als je stem.",
      iap_context: { journey: 'academy', persona: 'student', theme: 'Academy' },
      blocks: [
        { 
          title: "De 50-50 Regel", 
          content: "## Inspreken én Ondernemen\nSuccesvol worden als voice-over gaat niet alleen over talent. De ene helft is inspreken, de andere helft is marketing. Je moet echt een ondernemer willen zijn.", 
          type: 'deep-read', 
          order: 1 
        },
        { 
          title: "Verschillende Niches", 
          content: "## Spreid je kansen\nVan audioboeken tot filmtrailers en YouTube-video's: ontdek alle niches. Hoe meer je in verschillende databases zit, hoe groter de kans op opdrachten.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    },
    {
      title: "Hoeveel kost een voice-over?",
      slug: "voice-over-price",
      content: "Alles over tarieven, gebruiksrechten en waarom een goede stem een investering is.",
      iap_context: { journey: 'common', persona: 'decision-maker', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "Tarieven & Gebruik", 
          content: "## Wat bepaalt de prijs?\nDe kosten zijn afhankelijk van de opdracht en het gebruik. Voor voicemail hanteren we vaak vaste tarieven, terwijl voor TV-commercials de prijzen hoger liggen door de ruimere verspreiding.", 
          type: 'deep-read', 
          order: 1 
        },
        { 
          title: "Een Artistiek Beroep", 
          content: "## Waarde boven prijs\nNet zoals elk ander artistiek beroep moeten stemacteurs kunnen leven van hun vak. Een goede opname is een investering in je merkidentiteit.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    },
    {
      title: "Tips voor je klantenservice in 2026",
      slug: "tips-klantenservice",
      content: "Voorkom frustratie met een goed ingericht keuzemenu en een heldere structuur.",
      iap_context: { journey: 'telephony', persona: 'corporate', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "Heldere Structuur", 
          content: "## Geen doolhof voor je klanten\nZorg dat mensen meteen bij de juiste persoon terechtkomen. Gebruik een logische opbouw: noem eerst de afdeling en dan de keuzetoets.", 
          type: 'split-screen', 
          order: 1 
        },
        { 
          title: "Internationaal Onthaal", 
          content: "## Taalkeuze is een must\nKrijg je geregeld internationale telefoontjes? Begin altijd met een taalkeuze. Houd de menu's in verschillende talen zo consistent mogelijk.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    },
    {
      title: "Do's en Don'ts bij een wachtcentrale",
      slug: "dos-en-donts-wachtcentrale",
      content: "Hoe je boetes voorkomt en klanten tevreden houdt in de wachtrij.",
      iap_context: { journey: 'telephony', persona: 'corporate', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "De Telecomwet", 
          content: "## Loop geen boetes op\nWist je dat je klanten niet onbeperkt in de wacht mag laten staan? Zorg dat ze hun gegevens kunnen achterlaten en bel ze binnen 24 uur terug.", 
          type: 'split-screen', 
          order: 1 
        },
        { 
          title: "Entertainment & Informatie", 
          content: "## Maak het wachten aangenaam\nGebruik een aangename stem om je troeven te beschrijven of het publiek te informeren. Neem afscheid van de 'klanten-wegjaag-club'.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    }
  ];

  try {
    for (const art of articles) {
      console.log(`📝 Upserting article: ${art.slug}`);
      const { data: article, error: artError } = await supabase
        .from('content_articles')
        .upsert({
          title: art.title,
          slug: art.slug,
          content: art.content,
          status: 'publish',
          iap_context: art.iap_context,
          is_manually_edited: true,
          updated_at: now
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (artError) {
        console.error(`❌ Error article ${art.slug}:`, artError);
        continue;
      }

      await supabase.from('content_blocks').delete().eq('article_id', article.id);
      for (const block of art.blocks) {
        await supabase.from('content_blocks').insert({
          article_id: article.id,
          type: block.type,
          content: block.content,
          display_order: block.order,
          is_manually_edited: true,
          settings: block.settings || null
        });
      }
    }

    console.log("🏁 Batch 10 Injection completed.");
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

injectBatch10().catch(console.error);
