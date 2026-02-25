import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateAtomicSitemap() {
  console.log('☢️ Generating Final Atomic Sitemap & Registry Sync...');

  const sitemap: any[] = [];

  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
      .replace(/[\u0300-\u036f]/g, '')   // remove all the accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')               // replace spaces with -
      .replace(/[^\w\-]+/g, '')           // remove all non-word chars
      .replace(/\-\-+/g, '-');            // replace multiple - with single -
  };

  // 1. Actors (Agency) -> voice/
  const { data: actors } = await supabase.from('actors').select('id, slug, first_name, last_name').eq('status', 'live').eq('is_public', true);
  actors?.forEach(a => {
    const firstName = a.first_name?.toLowerCase().trim();
    const lastInitial = a.last_name ? a.last_name.trim().charAt(0).toLowerCase() : '';
    const canonicalActorSlug = lastInitial ? `voice/${firstName}-${lastInitial}` : `voice/${firstName}`;
    
    // Legacy redirect (flat slug -> voice/slug)
    if (a.slug) {
      const legacySlug = a.slug.toLowerCase();
      if (legacySlug !== canonicalActorSlug) {
        sitemap.push({ slug: legacySlug, type: 'actor', entity_id: a.id, journey: 'agency', name: `${a.first_name} ${a.last_name || ''}`, canonical_slug: canonicalActorSlug });
      }
    }
    
    // Always register the canonical slug
    sitemap.push({ slug: canonicalActorSlug, type: 'actor', entity_id: a.id, journey: 'agency', name: `${a.first_name} ${a.last_name || ''}` });
  });

  // 2. Artists (Artist Journey) -> artist/
  const { data: artists } = await supabase.from('artists').select('id, slug, display_name').eq('status', 'active').eq('is_public', true);
  artists?.forEach(a => {
    const canonicalArtistSlug = `artist/${a.slug.toLowerCase()}`;
    sitemap.push({ slug: canonicalArtistSlug, type: 'artist', entity_id: a.id, journey: 'artist', name: a.display_name });
    
    // Legacy flat slug redirect if it exists
    if (a.slug && !a.slug.startsWith('artist/')) {
        sitemap.push({ slug: a.slug.toLowerCase(), type: 'artist', entity_id: a.id, journey: 'artist', name: a.display_name, canonical_slug: canonicalArtistSlug });
    }
  });

  // 3. Music (Music Journey) -> music/
  sitemap.push({ slug: 'music', type: 'music', entity_id: 0, journey: 'agency', name: 'Music Library' });
  const { data: musicMedia } = await supabase.from('media').select('id, file_name').eq('category', 'music');
  const musicProducts = [
    { slug: 'free', name: 'Free Music Track' },
    { slug: 'away', name: 'Away Music Track' },
    { slug: 'before', name: 'Before You Music Track' }
  ];
  for (const mp of musicProducts) {
    const track = musicMedia?.find(m => m.file_name.toLowerCase().includes(mp.slug));
    if (track) {
      sitemap.push({ slug: `music/${mp.slug}`, type: 'music', entity_id: track.id, journey: 'agency', name: mp.name });
    }
  }

  // 4. Workshops (Studio/Academy) -> studio/ or academy/
  const { data: workshops } = await supabase.from('workshops').select('id, slug, title, journey').eq('status', 'publish');
  workshops?.forEach(w => {
    const prefix = w.journey || 'studio';
    sitemap.push({ slug: `${prefix}/${w.slug.toLowerCase()}`, type: 'workshop', entity_id: w.id, journey: prefix, name: w.title });
  });

  // 5. Blog Articles -> blog/
  const { data: articles } = await supabase.from('content_articles').select('id, slug, title, iap_context').eq('status', 'publish');
  articles?.forEach(art => {
    const isBlog = (art.iap_context as any)?.type === 'blog' || art.slug.startsWith('blog/');
    const prefix = isBlog ? 'blog/' : '';
    const cleanSlug = art.slug.replace(/^blog\//, '').toLowerCase();
    const canonicalSlug = `${prefix}${cleanSlug}`;
    
    sitemap.push({ 
      slug: canonicalSlug, 
      type: isBlog ? 'blog' : 'article', 
      entity_id: art.id, 
      journey: (art.iap_context as any)?.journey || 'agency', 
      name: art.title 
    });

    // Legacy flat slug redirect
    if (isBlog && art.slug && !art.slug.startsWith('blog/')) {
        sitemap.push({ slug: art.slug.toLowerCase(), type: 'blog', entity_id: art.id, journey: 'agency', name: art.title, canonical_slug: canonicalSlug });
    }
  });

  // 6. Categories (Languages, Countries, Attributes) -> category/ or descriptive
  const { data: langs } = await supabase.from('languages').select('id, code, label, is_native_only');
  langs?.forEach(l => {
    const descriptiveSlug = `voice-overs/${slugify(l.label)}`;
    sitemap.push({ slug: descriptiveSlug, type: 'language', entity_id: l.id, journey: 'agency', name: `Language: ${l.label}` });
    sitemap.push({ slug: l.code.toLowerCase(), type: 'language', entity_id: l.id, journey: 'agency', name: `Language: ${l.label}`, canonical_slug: descriptiveSlug });
  });

  const { data: countries } = await supabase.from('countries').select('id, code, label');
  countries?.forEach(c => {
    const descriptiveSlug = `voice-overs/${slugify(c.label)}`;
    sitemap.push({ slug: descriptiveSlug, type: 'country', entity_id: c.id, journey: 'agency', name: `Country: ${c.label}` });
    const genericLangCodes = ['nl', 'fr', 'en', 'de', 'es', 'it', 'pt', 'pl', 'da', 'sv', 'fi', 'nb', 'tr', 'hr', 'ca'];
    if (!genericLangCodes.includes(c.code.toLowerCase())) {
      sitemap.push({ slug: c.code.toLowerCase(), type: 'country', entity_id: c.id, journey: 'agency', name: `Country: ${c.label}`, canonical_slug: descriptiveSlug });
    }
  });

  const { data: attrs } = await supabase.from('actor_attributes').select('id, code, label');
  attrs?.forEach(at => {
    const descriptiveSlug = `tone-of-voice/${slugify(at.label)}`;
    sitemap.push({ slug: descriptiveSlug, type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}` });
    
    // Redirect old code-based slug and old 'stemmen/' prefix
    sitemap.push({ slug: at.code.toLowerCase(), type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}`, canonical_slug: descriptiveSlug });
    sitemap.push({ slug: `stemmen/${slugify(at.label)}`, type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}`, canonical_slug: descriptiveSlug });
  });

  // 7. FAQ -> faq/
  const { data: faqs } = await supabase.from('faq').select('id, question_nl, category').eq('is_public', true);
  faqs?.forEach(f => {
    const faqSlug = f.question_nl?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (faqSlug) {
      sitemap.push({ slug: `faq/${faqSlug}`, type: 'faq', entity_id: f.id, journey: 'agency', name: `FAQ: ${f.question_nl}` });
    }
  });

  // 8. Providers -> provider/
  const { data: providers } = await supabase.from('app_configs').select('value').eq('key', 'telephony_config').single();
  const providerList = (providers?.value as any)?.providers || ['voys', 'ziggo', 'telenet', 'proximus'];
  providerList.forEach((p: string) => {
    sitemap.push({ slug: `provider/${p.toLowerCase()}`, type: 'provider', entity_id: 0, journey: 'agency', name: `Provider: ${p}` });
  });

  // WRITE TO MD
  let mdContent = '# ☢️ ATOMIC SITEMAP - THE 1 TRUTH LIST (2026)\n\n';
  mdContent += '| URL (Slug) | Type | Entity ID | Journey | Handshake Truth |\n';
  mdContent += '| :--- | :--- | :--- | :--- | :--- |\n';
  
  const registryEntries = sitemap.map(item => ({
    slug: item.slug.toLowerCase(),
    routing_type: item.type,
    entity_id: item.entity_id,
    journey: item.journey,
    market_code: 'ALL',
    canonical_slug: item.canonical_slug || null,
    is_active: true
  }));

  const uniqueEntries = Array.from(new Map(registryEntries.map(e => [`${e.slug}|${e.market_code}|${e.journey}`, e])).values());

  const chunkSize = 50;
  for (let i = 0; i < uniqueEntries.length; i += chunkSize) {
    const chunk = uniqueEntries.slice(i, i + chunkSize);
    const { error } = await supabase.from('slug_registry').upsert(chunk, { onConflict: 'slug, market_code, journey' });
    if (error) console.error(`❌ Error syncing chunk starting at ${i}:`, error.message);
    else console.log(`Synced chunk ${i / chunkSize + 1}/${Math.ceil(uniqueEntries.length / chunkSize)}`);
  }

  // Sort sitemap for clean MD output
  sitemap.sort((a, b) => a.slug.localeCompare(b.slug));

  for (const item of sitemap) {
    mdContent += `| \`/${item.slug}\` | \`${item.type}\` | \`${item.entity_id}\` | \`${item.journey}\` | ${item.name} |\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), '3-WETTEN/docs/ATOMIC_SITEMAP.md'), mdContent);
  console.log('✅ Atomic Sitemap generated and Registry synced.');
}

generateAtomicSitemap().catch(console.error);
