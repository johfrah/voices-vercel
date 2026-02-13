import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const videoDownloads = [
  { slug: 'sean-gray-digital-nomad', url: 'https://youtu.be/Dgl-t4W3x9Q', title: 'Sean Gray: De Digital Nomad Voice-over' },
  { slug: 'machteld-van-der-gaag-studio', url: 'https://youtu.be/kx7Pad-Cg18', title: 'In de studio bij Machteld van der Gaag' }
];

const assetDir = '1-SITE/apps/web/public/assets/content/blog/videos/academy/';

async function injectBatch8() {
  console.log("🚀 MARK: Start Nuclear Injection Batch 8 (Stories & Social Proof)...");

  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  const now = new Date().toISOString();

  // 1. Download and Sync Video Articles
  for (const item of videoDownloads) {
    const localPath = `${assetDir}${item.slug}.mp4`;
    const publicPath = `/assets/content/blog/videos/academy/${item.slug}.mp4`;

    if (!fs.existsSync(localPath)) {
      console.log(`📥 Downloading: ${item.title}...`);
      try {
        execSync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "${item.url}" -o "${localPath}"`);
      } catch (e) {
        console.error(`❌ Failed to download ${item.slug}:`, e);
        continue;
      }
    }

    console.log(`📝 Upserting video article: ${item.slug}`);
    const { data: article } = await supabase
      .from('content_articles')
      .upsert({
        title: item.title,
        slug: item.slug,
        content: `Ontdek het verhaal van ${item.title.split(':')[0]} in deze video.`,
        status: 'publish',
        iap_context: { journey: 'common', persona: 'fan', theme: 'Stories' },
        is_manually_edited: true,
        updated_at: now
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (article) {
      await supabase.from('content_blocks').delete().eq('article_id', article.id);
      await supabase.from('content_blocks').insert({
        article_id: article.id,
        type: 'lifestyle-overlay',
        content: `## ${item.title}\nBekijk de volledige video en krijg een uniek kijkje achter de schermen.`,
        display_order: 1,
        is_manually_edited: true,
        settings: { video_url: publicPath, use_own_player: true, autoplay: false, muted: false }
      });
    }
  }

  // 2. Inject Text-based Articles
  const textArticles = [
    {
      title: "ACLVB: Van 140 stemmen naar één warm onthaal",
      slug: "story-aclvb",
      content: "Hoe de liberale vakbond tienduizenden bellers per jaar een professionele eerste indruk geeft dankzij Voices.be.",
      iap_context: { journey: 'telephony', persona: 'corporate', theme: 'Stories' },
      blocks: [
        { 
          title: "De Uitdaging", 
          content: "## 140 verschillende verwelkomingen\nTom Van Droogenbroeck (ACLVB): 'In het verleden had elk kantoor een eigen, zelf ingesproken boodschap. Het was niet uniform en niet professioneel. We hadden nood aan een stem die onze bellers de weg wijst, geen koude robotstem.'", 
          type: 'story-layout', 
          order: 1 
        },
        { 
          title: "Het Resultaat", 
          content: "## Bij ons ben je geen nummer\nDoor te kiezen voor professionele stemmen van Voices.be, voelen leden zich direct welkom in een warme omgeving. Het is elke keer opnieuw een kans om een geweldige indruk te maken op tienduizenden bellers.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    },
    {
      title: "Wachtmuziek: De psychologie achter het wachten",
      slug: "psychologie-van-wachtmuziek",
      content: "Muziek of stilte aan de telefoon? Ontdek waarom de juiste wachtmuziek therapeutisch werkt en frustraties bij je klanten wegneemt.",
      iap_context: { journey: 'telephony', persona: 'entrepreneur', theme: 'Inspiratie' },
      blocks: [
        { 
          title: "Therapeutisch Wachten", 
          content: "## Muziek werkt ontspannend\nMuziek beïnvloedt onze emoties en prikkelt de hersenen. In de wachtrij voorkomt het dat mensen in een 'leegte' vallen. Het is de auditieve bedding die de wachttijd korter doet lijken.", 
          type: 'deep-read', 
          order: 1 
        },
        { 
          title: "Wist je dat?", 
          content: "## De uitvinding van wachtmuziek\nWachtmuziek werd per ongeluk uitgevonden door Alfred Levy, wiens fabriek naast een radiostation lag. Een loshangende draad pikte het signaal op, en een miljardenindustrie was geboren.", 
          type: 'split-screen', 
          order: 2 
        }
      ]
    }
  ];

  for (const art of textArticles) {
    console.log(`📝 Upserting text article: ${art.slug}`);
    const { data: article } = await supabase
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

    if (article) {
      await supabase.from('content_blocks').delete().eq('article_id', article.id);
      for (const block of art.blocks) {
        await supabase.from('content_blocks').insert({
          article_id: article.id,
          type: block.type,
          content: block.content,
          display_order: block.order,
          is_manually_edited: true
        });
      }
    }
  }

  console.log("🏁 Batch 8 Injection completed.");
}

injectBatch8().catch(console.error);
