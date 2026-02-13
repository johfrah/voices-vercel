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

async function injectBatch9() {
  console.log("🚀 MARK: Start Nuclear Injection Batch 9 (Customer Success Stories)...");

  const now = new Date().toISOString();

  const articles: Article[] = [
    {
      title: "Jokershop.be: Investering in een warm onthaal",
      slug: "story-jokershop",
      content: "Hoe een webshop in feestartikelen stress vermindert en klantvriendelijkheid boost met een professionele stem.",
      iap_context: { journey: 'telephony', persona: 'entrepreneur', theme: 'Stories' },
      blocks: [
        { 
          title: "De Klik", 
          content: "## Een warm onthaal\nRoel van Jokershop.be: 'We kregen zoveel telefoontjes dat we niet altijd zelf konden opnemen. Dat gaf stress. Bij Voices.be was de klik er meteen. De warme stem van Johfrah past perfect bij wat we willen uitstralen.'", 
          type: 'lifestyle-overlay', 
          order: 1,
          settings: { video_url: '/assets/content/blog/videos/review-jokershopbe.mp4', use_own_player: true }
        }
      ]
    },
    {
      title: "SLV Belgium: Een professioneel jasje voor B2B",
      slug: "story-slv-belgium",
      content: "Waarom een internationale fabrikant van verlichting koos voor de snelheid en kwaliteit van Voices.be.",
      iap_context: { journey: 'telephony', persona: 'corporate', theme: 'Stories' },
      blocks: [
        { 
          title: "Geen Haastwerk Meer", 
          content: "## Weg met de stress\nJan Joostens (SLV Belgium): 'We spraken berichten vroeger zelf in, vaak na de uren. Het matchte niet met ons imago. Met Voices.be ging het razendsnel. De stemmen geven perfect weer wie we zijn.'", 
          type: 'lifestyle-overlay', 
          order: 1,
          settings: { video_url: '/assets/content/blog/videos/review-slv.mp4', use_own_player: true }
        }
      ]
    },
    {
      title: "SKYGGE: Een no-brainer voor professionalisering",
      slug: "story-skygge",
      content: "Hoe een groeiend bedrijf uit Halle de grens tussen privé en zakelijk bewaakt met een slimme telefooncentrale.",
      iap_context: { journey: 'telephony', persona: 'entrepreneur', theme: 'Stories' },
      blocks: [
        { 
          title: "De Eerste Indruk", 
          content: "## Nooit meer om 6u uit bed\nAn Casters (Skygge): 'Een telefooncentrale was een no-brainer. Je kunt je 100% focussen op de klant zonder gestoord te worden. De professionele stemmen van Voices.be zorgen voor een hartelijk onthaal in NL en FR.'", 
          type: 'lifestyle-overlay', 
          order: 1,
          settings: { video_url: '/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer.mp4', use_own_player: true }
        }
      ]
    },
    {
      title: "Ticket Team: Uniformiteit als visitekaartje",
      slug: "story-ticket-team",
      content: "Hoe Ticket Team een rommeltje aan verschillende stemmen verving door één helder en rustig stemtimbre.",
      iap_context: { journey: 'telephony', persona: 'corporate', theme: 'Stories' },
      blocks: [
        { 
          title: "Rust en Balans", 
          content: "## Eén stem, één verhaal\nBart Cornelisse (Ticket Team): 'Vroeger hadden we verschillende collega's die bandjes opnamen. Volumes verschilden, stemmen matchten niet. Nu hebben we een uniform visitekaartje dat rust uitstraalt.'", 
          type: 'lifestyle-overlay', 
          order: 1,
          settings: { video_url: '/assets/content/blog/videos/ticketteam.mp4', use_own_player: true }
        }
      ]
    },
    {
      title: "NKC: 35.000 bellers per jaar correct gidsen",
      slug: "story-nkc",
      content: "Hoe de Nederlandse Kampeerauto Club haar klantendienst naar een hoger niveau tilde met een stem die past bij de doelgroep.",
      iap_context: { journey: 'telephony', persona: 'corporate', theme: 'Stories' },
      blocks: [
        { 
          title: "De Juiste Match", 
          content: "## Passend bij de doelgroep\nRené Norbart (NKC): 'Voor onze oudere doelgroep zochten we een rustige, enthousiaste stem. Bij Voices.nl vonden we de perfecte match. We werken nu efficiënter en iedereen wordt meteen correct doorverbonden.'", 
          type: 'lifestyle-overlay', 
          order: 1,
          settings: { video_url: '/assets/content/blog/videos/nkc.mp4', use_own_player: true }
        }
      ]
    },
    {
      title: "Coolblue: 5 lessen in klantvriendelijkheid",
      slug: "inspiratie-coolblue",
      content: "Wat we kunnen leren van de koning van de klantenservice in de Benelux.",
      iap_context: { journey: 'telephony', persona: 'entrepreneur', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "Alles voor een glimlach", 
          content: "## De Coolblue Methode\nCoolblue investeert zwaar in klantenservice omdat ze weten dat het behouden van klanten goedkoper is dan nieuwe werven. Hun geheim? Persoonlijke aandacht, humor en een feilloze telefonische bereikbaarheid.", 
          type: 'deep-read', 
          order: 1 
        },
        { 
          title: "De Les", 
          content: "## Start bij de basis\nEen eerste stap naar verbluffende service is je voicemail. Het is de eerste kans op een onvergetelijke indruk. Gebruik humor waar het kan, maar wees altijd betrouwbaar.", 
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

    console.log("🏁 Batch 9 Injection completed.");
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

injectBatch9().catch(console.error);
