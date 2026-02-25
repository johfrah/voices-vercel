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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // 0. Fetch Prefix Translations from Voiceglot
  const { data: prefixTranslations } = await supabase.from('translations').select('lang, translation_key, translated_text').ilike('translation_key', 'routing.prefix.%');
  
  const getPrefix = (key: string, lang: string = 'nl') => {
    const entry = prefixTranslations?.find(t => t.lang === lang && t.translation_key === `routing.prefix.${key}`);
    return entry?.translated_text || key;
  };

  const activeLangs = ['nl', 'fr', 'de'];
  const actorJourneys = ['video', 'commercial', 'telephony'];

  // 1. Actors (Agency) -> voice/
  const { data: actors } = await supabase.from('actors').select('id, slug, first_name, last_name').eq('status', 'live').eq('is_public', true);
  actors?.forEach(a => {
    const firstName = a.first_name?.toLowerCase().trim();
    const lastInitial = a.last_name ? a.last_name.trim().charAt(0).toLowerCase() : '';
    const baseSlug = lastInitial ? `${firstName}-${lastInitial}` : firstName;
    
    activeLangs.forEach(lang => {
      const prefix = getPrefix('voice', lang);
      const canonicalActorSlug = `${prefix}/${baseSlug}`;
      
      // Main profile
      sitemap.push({ slug: canonicalActorSlug, type: 'actor', entity_id: a.id, journey: 'agency', name: `${a.first_name} ${a.last_name || ''}`, market_code: lang.toUpperCase() });
      
      // Journey-specific profiles (Deep Handshake)
      actorJourneys.forEach(journey => {
        sitemap.push({ 
          slug: `${canonicalActorSlug}/${journey}`, 
          type: 'actor', 
          entity_id: a.id, 
          journey: 'agency', 
          name: `${a.first_name} - ${journey.toUpperCase()}`, 
          market_code: lang.toUpperCase(),
          metadata: { journey } 
        });
      });

      // Legacy flat slug redirect (only for NL/default)
      if (lang === 'nl' && a.slug) {
        const legacySlug = a.slug.toLowerCase();
        if (legacySlug !== canonicalActorSlug) {
          sitemap.push({ slug: legacySlug, type: 'actor', entity_id: a.id, journey: 'agency', name: `${a.first_name} ${a.last_name || ''}`, canonical_slug: canonicalActorSlug });
        }
      }
    });
  });

  // 2. Artists (Artist Journey) -> artist/
  const { data: artists } = await supabase.from('artists').select('id, slug, display_name').eq('status', 'active').eq('is_public', true);
  artists?.forEach(a => {
    activeLangs.forEach(lang => {
      const prefix = getPrefix('artist', lang);
      const canonicalArtistSlug = `${prefix}/${a.slug.toLowerCase()}`;
      sitemap.push({ slug: canonicalArtistSlug, type: 'artist', entity_id: a.id, journey: 'artist', name: a.display_name, market_code: lang.toUpperCase() });
      
      if (lang === 'nl' && a.slug && !a.slug.startsWith(prefix)) {
        sitemap.push({ slug: a.slug.toLowerCase(), type: 'artist', entity_id: a.id, journey: 'artist', name: a.display_name, canonical_slug: canonicalArtistSlug });
      }
    });
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
      activeLangs.forEach(lang => {
        const prefix = getPrefix('music', lang);
        sitemap.push({ slug: `${prefix}/${mp.slug}`, type: 'music', entity_id: track.id, journey: 'agency', name: mp.name, market_code: lang.toUpperCase() });
      });
    }
  }

  // 4. Workshops (Studio/Academy) -> studio/ or academy/
  const { data: workshops } = await supabase.from('workshops').select('id, slug, title, journey').eq('status', 'publish');
  workshops?.forEach(w => {
    const type = w.journey || 'studio';
    activeLangs.forEach(lang => {
      const prefix = getPrefix(type, lang);
      sitemap.push({ slug: `${prefix}/${w.slug.toLowerCase()}`, type: 'workshop', entity_id: w.id, journey: type, name: w.title, market_code: lang.toUpperCase() });
    });
  });

  // 5. Blog Articles -> blog/
  const { data: articles } = await supabase.from('content_articles').select('id, slug, title, iap_context').eq('status', 'publish');
  articles?.forEach(art => {
    const isBlog = (art.iap_context as any)?.type === 'blog' || art.slug.startsWith('blog/');
    const type = isBlog ? 'blog' : 'article';
    const cleanSlug = art.slug.replace(/^blog\//, '').toLowerCase();
    
    activeLangs.forEach(lang => {
      const prefix = isBlog ? `${getPrefix('blog', lang)}/` : '';
      const canonicalSlug = `${prefix}${cleanSlug}`;
      sitemap.push({ slug: canonicalSlug, type, entity_id: art.id, journey: (art.iap_context as any)?.journey || 'agency', name: art.title, market_code: lang.toUpperCase() });
    });
  });

  // 6. Categories (Languages, Countries, Attributes)
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
    activeLangs.forEach(lang => {
      const prefix = getPrefix('tone-of-voice', lang);
      const descriptiveSlug = `${prefix}/${slugify(at.label)}`;
      sitemap.push({ slug: descriptiveSlug, type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}`, market_code: lang.toUpperCase() });
      
      if (lang === 'nl') {
        sitemap.push({ slug: at.code.toLowerCase(), type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}`, canonical_slug: descriptiveSlug });
        sitemap.push({ slug: `stemmen/${slugify(at.label)}`, type: 'attribute', entity_id: at.id, journey: 'agency', name: `Attribute: ${at.label}`, canonical_slug: descriptiveSlug });
      }
    });
  });

  // 7. FAQ -> faq/
  const { data: faqs } = await supabase.from('faq').select('id, question_nl, category').eq('is_public', true);
  faqs?.forEach(f => {
    const faqSlug = f.question_nl?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (faqSlug) {
      activeLangs.forEach(lang => {
        const prefix = getPrefix('faq', lang);
        sitemap.push({ slug: `${prefix}/${faqSlug}`, type: 'faq', entity_id: f.id, journey: 'agency', name: `FAQ: ${f.question_nl}`, market_code: lang.toUpperCase() });
      });
    }
  });

  // 8. Providers -> provider/
  const { data: providers } = await supabase.from('app_configs').select('value').eq('key', 'telephony_config').single();
  const providerList = (providers?.value as any)?.providers || ['voys', 'ziggo', 'telenet', 'proximus'];
  providerList.forEach((p: string) => {
    activeLangs.forEach(lang => {
      const prefix = getPrefix('provider', lang);
      sitemap.push({ slug: `${prefix}/${p.toLowerCase()}`, type: 'provider', entity_id: 0, journey: 'agency', name: `Provider: ${p}`, market_code: lang.toUpperCase() });
    });
  });

  // WRITE TO MD & REGISTRY
  let mdContent = '# ☢️ ATOMIC SITEMAP - THE 1 TRUTH LIST (2026)\n\n';
  mdContent += '| URL (Slug) | Type | Entity ID | Market | Handshake Truth |\n';
  mdContent += '| :--- | :--- | :--- | :--- | :--- |\n';
  
  const registryEntries = sitemap.map(item => ({
    slug: item.slug.toLowerCase(),
    routing_type: item.type,
    entity_id: item.entity_id,
    journey: item.journey,
    market_code: item.market_code || 'ALL',
    canonical_slug: item.canonical_slug || null,
    metadata: item.metadata || {},
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

  sitemap.sort((a, b) => a.slug.localeCompare(b.slug));
  for (const item of sitemap) {
    mdContent += `| \`/${item.slug}\` | \`${item.type}\` | \`${item.entity_id}\` | \`${item.market_code || 'ALL'}\` | ${item.name} |\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), '3-WETTEN/docs/ATOMIC_SITEMAP.md'), mdContent);
  console.log('✅ Atomic Sitemap generated and Registry synced.');
}

generateAtomicSitemap().catch(console.error);
