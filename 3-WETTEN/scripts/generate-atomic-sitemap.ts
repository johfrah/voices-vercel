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
  console.log('☢️ Generating ID-First Atomic Sitemap & Master Registry Sync...');

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

  // 0. Fetch Master Data (IDs)
  const { data: entityTypes } = await supabase.from('entity_types').select('id, code');
  const { data: languages } = await supabase.from('languages').select('id, code');
  const { data: prefixTranslations } = await supabase.from('translations').select('lang, translation_key, translated_text').ilike('translation_key', 'routing.prefix.%');
  
  const getEntityTypeId = (code: string) => entityTypes?.find(t => t.code === code)?.id;
  const getLanguageId = (code: string) => languages?.find(l => l.code.toLowerCase() === code.toLowerCase())?.id;
  const getPrefix = (key: string, lang: string = 'nl') => {
    const entry = prefixTranslations?.find(t => t.lang === lang && t.translation_key === `routing.prefix.${key}`);
    return entry?.translated_text || key;
  };

  const activeLangs = ['nl', 'fr', 'de'];
  const actorJourneys = ['video', 'commercial', 'telephony'];

  // 1. Actors (Agency)
  const { data: actors } = await supabase.from('actors').select('id, slug, first_name, last_name').eq('status', 'live').eq('is_public', true);
  const actorTypeId = getEntityTypeId('actor');
  
  actors?.forEach(a => {
    const firstName = a.first_name?.toLowerCase().trim();
    const lastInitial = a.last_name ? a.last_name.trim().charAt(0).toLowerCase() : '';
    const baseSlug = lastInitial ? `${firstName}-${lastInitial}` : firstName;
    
    activeLangs.forEach(lang => {
      const prefix = getPrefix('voice', lang);
      const canonicalActorSlug = `${prefix}/${baseSlug}`;
      const langId = getLanguageId(lang);
      
      // Main profile
      sitemap.push({ 
        slug: canonicalActorSlug, 
        entity_type_id: actorTypeId, 
        entity_id: a.id, 
        language_id: langId,
        journey: 'agency', 
        name: `${a.first_name} ${a.last_name || ''}`, 
        market_code: lang.toUpperCase() 
      });
      
      // Journey-specific
      actorJourneys.forEach(journey => {
        sitemap.push({ 
          slug: `${canonicalActorSlug}/${journey}`, 
          entity_type_id: actorTypeId, 
          entity_id: a.id, 
          language_id: langId,
          journey: 'agency', 
          name: `${a.first_name} - ${journey.toUpperCase()}`, 
          market_code: lang.toUpperCase(),
          metadata: { journey } 
        });
      });

      // Legacy flat slug redirect
      if (lang === 'nl' && a.slug) {
        const legacySlug = a.slug.toLowerCase();
        if (legacySlug !== canonicalActorSlug) {
          sitemap.push({ 
            slug: legacySlug, 
            entity_type_id: actorTypeId, 
            entity_id: a.id, 
            language_id: langId,
            journey: 'agency', 
            name: `${a.first_name} ${a.last_name || ''}`, 
            canonical_slug: canonicalActorSlug 
          });
        }
      }
    });
  });

  // 2. Artists
  const { data: artists } = await supabase.from('artists').select('id, slug, display_name').eq('status', 'active').eq('is_public', true);
  const artistTypeId = getEntityTypeId('artist');
  artists?.forEach(a => {
    activeLangs.forEach(lang => {
      const prefix = getPrefix('artist', lang);
      const canonicalArtistSlug = `${prefix}/${a.slug.toLowerCase()}`;
      const langId = getLanguageId(lang);
      sitemap.push({ slug: canonicalArtistSlug, entity_type_id: artistTypeId, entity_id: a.id, language_id: langId, journey: 'artist', name: a.display_name, market_code: lang.toUpperCase() });
    });
  });

  // 3. Music
  const musicTypeId = getEntityTypeId('music');
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
        const langId = getLanguageId(lang);
        sitemap.push({ slug: `${prefix}/${mp.slug}`, entity_type_id: musicTypeId, entity_id: track.id, language_id: langId, journey: 'agency', name: mp.name, market_code: lang.toUpperCase() });
      });
    }
  }

  // 4. Workshops
  const workshopTypeId = getEntityTypeId('workshop');
  const { data: workshops } = await supabase.from('workshops').select('id, slug, title, journey').eq('status', 'publish');
  workshops?.forEach(w => {
    const journey = w.journey || 'studio';
    activeLangs.forEach(lang => {
      const prefix = getPrefix(journey, lang);
      const langId = getLanguageId(lang);
      sitemap.push({ slug: `${prefix}/${w.slug.toLowerCase()}`, entity_type_id: workshopTypeId, entity_id: w.id, language_id: langId, journey, name: w.title, market_code: lang.toUpperCase() });
    });
  });

  // 5. Blog
  const blogTypeId = getEntityTypeId('blog');
  const articleTypeId = getEntityTypeId('article');
  const { data: articles } = await supabase.from('content_articles').select('id, slug, title, iap_context').eq('status', 'publish');
  articles?.forEach(art => {
    const isBlog = (art.iap_context as any)?.type === 'blog' || art.slug.startsWith('blog/');
    const typeId = isBlog ? blogTypeId : articleTypeId;
    const cleanSlug = art.slug.replace(/^blog\//, '').toLowerCase();
    
    activeLangs.forEach(lang => {
      const prefix = isBlog ? `${getPrefix('blog', lang)}/` : '';
      const canonicalSlug = `${prefix}${cleanSlug}`;
      const langId = getLanguageId(lang);
      sitemap.push({ slug: canonicalSlug, entity_type_id: typeId, entity_id: art.id, language_id: langId, journey: (art.iap_context as any)?.journey || 'agency', name: art.title, market_code: lang.toUpperCase() });
    });
  });

  // 6. Categories (Language/Country/Attribute)
  const langTypeId = getEntityTypeId('language');
  const { data: langs } = await supabase.from('languages').select('id, code, label');
  langs?.forEach(l => {
    const descriptiveSlug = `voice-overs/${slugify(l.label)}`;
    sitemap.push({ slug: descriptiveSlug, entity_type_id: langTypeId, entity_id: l.id, language_id: getLanguageId('nl'), journey: 'agency', name: `Language: ${l.label}` });
    sitemap.push({ slug: l.code.toLowerCase(), entity_type_id: langTypeId, entity_id: l.id, language_id: getLanguageId('nl'), journey: 'agency', name: `Language: ${l.label}`, canonical_slug: descriptiveSlug });
  });

  const countryTypeId = getEntityTypeId('country');
  const { data: countries } = await supabase.from('countries').select('id, code, label');
  countries?.forEach(c => {
    const descriptiveSlug = `voice-overs/${slugify(c.label)}`;
    sitemap.push({ slug: descriptiveSlug, entity_type_id: countryTypeId, entity_id: c.id, language_id: getLanguageId('nl'), journey: 'agency', name: `Country: ${c.label}` });
  });

  const attrTypeId = getEntityTypeId('attribute');
  const { data: attrs } = await supabase.from('actor_attributes').select('id, code, label');
  attrs?.forEach(at => {
    activeLangs.forEach(lang => {
      const prefix = getPrefix('tone-of-voice', lang);
      const descriptiveSlug = `${prefix}/${slugify(at.label)}`;
      const langId = getLanguageId(lang);
      sitemap.push({ slug: descriptiveSlug, entity_type_id: attrTypeId, entity_id: at.id, language_id: langId, journey: 'agency', name: `Attribute: ${at.label}`, market_code: lang.toUpperCase() });
    });
  });

  // 7. FAQ
  const faqTypeId = getEntityTypeId('faq');
  const { data: faqs } = await supabase.from('faq').select('id, question_nl').eq('is_public', true);
  faqs?.forEach(f => {
    const faqSlug = f.question_nl?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (faqSlug) {
      activeLangs.forEach(lang => {
        const prefix = getPrefix('faq', lang);
        const langId = getLanguageId(lang);
        sitemap.push({ slug: `${prefix}/${faqSlug}`, entity_type_id: faqTypeId, entity_id: f.id, language_id: langId, journey: 'agency', name: `FAQ: ${f.question_nl}`, market_code: lang.toUpperCase() });
      });
    }
  });

  // WRITE TO MD & REGISTRY
  let mdContent = '# ☢️ ATOMIC SITEMAP - ID-FIRST MASTER LEDGER (2026)\n\n';
  mdContent += '| URL (Slug) | Type ID | Entity ID | Lang ID | Market | Handshake Truth |\n';
  mdContent += '| :--- | :--- | :--- | :--- | :--- | :--- |\n';
  
  const registryEntries = sitemap.map(item => ({
    slug: item.slug.toLowerCase(),
    entity_type_id: item.entity_type_id,
    entity_id: item.entity_id,
    language_id: item.language_id,
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
    mdContent += `| \`/${item.slug}\` | \`${item.entity_type_id}\` | \`${item.entity_id}\` | \`${item.language_id}\` | \`${item.market_code || 'ALL'}\` | ${item.name} |\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), '3-WETTEN/docs/ATOMIC_SITEMAP.md'), mdContent);
  console.log('✅ ID-First Atomic Sitemap generated and Master Registry synced.');
}

generateAtomicSitemap().catch(console.error);
