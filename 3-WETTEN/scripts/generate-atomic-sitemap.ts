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

  // 1. Actors (Agency)
  const { data: actors } = await supabase.from('actors').select('id, slug, first_name, last_name').eq('status', 'live').eq('is_public', true);
  actors?.forEach(a => {
    // 🛡️ CHRIS-PROTOCOL: No last names in slugs (mark-labrand -> mark-l)
    const firstName = a.first_name?.toLowerCase().trim();
    const lastInitial = a.last_name ? a.last_name.trim().charAt(0).toLowerCase() : '';
    const canonicalActorSlug = lastInitial ? `${firstName}-${lastInitial}` : firstName;
    
    // If the current slug is not the canonical one, we register it as a redirect
    if (a.slug && a.slug.toLowerCase() !== canonicalActorSlug) {
      sitemap.push({ slug: a.slug.toLowerCase(), type: 'actor', entity_id: a.id, journey: 'agency', name: `${a.first_name} ${a.last_name || ''}`, canonical_slug: canonicalActorSlug });
    }
    
    // Always register the canonical slug
    sitemap.push({ slug: canonicalActorSlug, type: 'actor', entity_id: a.id, journey: 'agency', name: `${a.first_name} ${a.last_name || ''}` });
  });

  // 2. Artists (Artist Journey)
  const { data: artists } = await supabase.from('artists').select('id, slug, display_name').eq('status', 'active').eq('is_public', true);
  artists?.forEach(a => sitemap.push({ slug: `artist/${a.slug}`, type: 'artist', entity_id: a.id, journey: 'artist', name: a.display_name }));

  // 3. Music (Music Journey)
  // Hardcoded system routes for music
  sitemap.push({ slug: 'music', type: 'music', entity_id: 0, journey: 'agency', name: 'Music Library' });
  
  // Specific Music Products (from media table)
  const { data: musicMedia } = await supabase.from('media').select('id, file_name').eq('category', 'music');
  const musicProducts = [
    { slug: 'free', name: 'Free Music Track' },
    { slug: 'away', name: 'Away Music Track' },
    { slug: 'before', name: 'Before You Music Track' }
  ];

  for (const mp of musicProducts) {
    const track = musicMedia?.find(m => m.file_name.toLowerCase().includes(mp.slug));
    if (track) {
      sitemap.push({ 
        slug: `music/${mp.slug}`, 
        type: 'music', 
        entity_id: track.id, 
        journey: 'agency', 
        name: mp.name 
      });
    }
  }

  // 4. Workshops (Studio/Academy)
  const { data: workshops } = await supabase.from('workshops').select('id, slug, title, journey').eq('status', 'publish');
  workshops?.forEach(w => sitemap.push({ slug: `${w.journey || 'studio'}/${w.slug}`, type: 'workshop', entity_id: w.id, journey: w.journey || 'studio', name: w.title }));

  // 5. Blog Articles
  const { data: articles } = await supabase.from('content_articles').select('id, slug, title, iap_context').eq('status', 'publish');
  articles?.forEach(art => {
    const isBlog = (art.iap_context as any)?.type === 'blog' || art.slug.startsWith('blog/');
    sitemap.push({ 
      slug: art.slug, 
      type: isBlog ? 'blog' : 'article', 
      entity_id: art.id, 
      journey: (art.iap_context as any)?.journey || 'agency', 
      name: art.title 
    });
  });

  // 6. Categories (Languages, Countries, Attributes)
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

  const { data: langs } = await supabase.from('languages').select('id, code, label, is_native_only');
  langs?.forEach(l => {
    const descriptiveSlug = `voice-overs/${slugify(l.label)}`;
    
    // Always register the descriptive slug
    sitemap.push({ slug: descriptiveSlug, type: 'language', entity_id: l.id, journey: 'agency', name: `Language: ${l.label}` });
    
    // Redirect old code-based slug (e.g. /nl-be -> /voice-overs/vlaams)
    sitemap.push({ slug: l.code.toLowerCase(), type: 'language', entity_id: l.id, journey: 'agency', name: `Language: ${l.label}`, canonical_slug: descriptiveSlug });
    
    // Special case: if it's a generic language (e.g. 'en'), also register the short slug
    if (l.code.length === 2) {
      sitemap.push({ slug: l.code.toLowerCase(), type: 'language', entity_id: l.id, journey: 'agency', name: `Language: ${l.label}` });
    }
  });

  const { data: countries } = await supabase.from('countries').select('id, code, label');
  countries?.forEach(c => {
    const descriptiveSlug = `voice-overs/${slugify(c.label)}`;
    sitemap.push({ slug: descriptiveSlug, type: 'country', entity_id: c.id, journey: 'agency', name: `Country: ${c.label}` });
    // Redirect old code-based slug
    sitemap.push({ slug: c.code.toLowerCase(), type: 'country', entity_id: c.id, journey: 'agency', name: `Country: ${c.label}`, canonical_slug: descriptiveSlug });
  });

  const { data: attrs } = await supabase.from('actor_attributes').select('id, code, label');
  attrs?.forEach(at => {
    const descriptiveSlug = `stemmen/${slugify(at.label)}`;
    sitemap.push({ slug: descriptiveSlug, type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}` });
    // Redirect old code-based slug
    sitemap.push({ slug: at.code.toLowerCase(), type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}`, canonical_slug: descriptiveSlug });
  });

  // 7. FAQ (from GSC)
  const { data: faqs } = await supabase.from('faq').select('id, question_nl, category').eq('is_public', true);
  faqs?.forEach(f => {
    const faqSlug = f.question_nl?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (faqSlug) {
      sitemap.push({ slug: `faq/${faqSlug}`, type: 'faq', entity_id: f.id, journey: 'agency', name: `FAQ: ${f.question_nl}` });
    }
  });

  // 8. Providers (from GSC)
  const { data: providers } = await supabase.from('app_configs').select('value').eq('key', 'telephony_config').single();
  const providerList = (providers?.value as any)?.providers || ['voys', 'ziggo', 'telenet', 'proximus'];
  providerList.forEach((p: string) => {
    sitemap.push({ slug: `provider/${p.toLowerCase()}`, type: 'provider', entity_id: 0, journey: 'agency', name: `Provider: ${p}` });
  });

  // 9. Descriptive Slugs (SEO Legacy Redirects)
  const legacyRedirects = [
    { slug: 'native/vlaamse-voicemail-stemmen', type: 'language', entity_id: 1, journey: 'agency', name: 'Vlaamse Stemmen (Native)', canonical_slug: 'voice-overs/vlaams' },
    { slug: 'voice-overs/nederlandse-voice-overs', type: 'language', entity_id: 2, journey: 'agency', name: 'Nederlandse Voice-overs', canonical_slug: 'voice-overs/nederlands' },
    { slug: 'country/duitse-voice-overs', type: 'country', entity_id: 4, journey: 'agency', name: 'Duitse Voice-overs (Country)', canonical_slug: 'voice-overs/duitsland' }
  ];
  legacyRedirects.forEach(ds => sitemap.push(ds));

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

  // Bulk UPSERT to Registry in chunks of 50 to avoid timeouts
  const chunkSize = 50;
  for (let i = 0; i < registryEntries.length; i += chunkSize) {
    const chunk = registryEntries.slice(i, i + chunkSize);
    const { error } = await supabase.from('slug_registry').upsert(chunk, { onConflict: 'slug, market_code, journey' });
    if (error) console.error(`❌ Error syncing chunk starting at ${i}:`, error.message);
    else console.log(`Synced chunk ${i / chunkSize + 1}/${Math.ceil(registryEntries.length / chunkSize)}`);
  }

  for (const item of sitemap) {
    mdContent += `| \`/${item.slug}\` | \`${item.type}\` | \`${item.entity_id}\` | \`${item.journey}\` | ${item.name} |\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), '3-WETTEN/docs/ATOMIC_SITEMAP.md'), mdContent);
  console.log('✅ Atomic Sitemap generated and Registry synced.');
}

generateAtomicSitemap().catch(console.error);
