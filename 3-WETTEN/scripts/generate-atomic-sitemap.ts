import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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
  
  // 🛡️ CHRIS-PROTOCOL: Map language to correct market code (v2.14.634)
  const getMarketCode = (lang: string) => {
    const map: Record<string, string> = {
      'nl': 'BE', // Primary market for nl is BE
      'fr': 'FR',
      'de': 'DE',
      'en': 'EU',
      'es': 'ES',
      'pt': 'PT'
    };
    return map[lang] || 'ALL';
  };

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
      const mCode = getMarketCode(lang);
      
      // Main profile
      sitemap.push({ 
        slug: canonicalActorSlug, 
        entity_type_id: actorTypeId, 
        entity_id: a.id, 
        language_id: langId,
        journey: 'agency', 
        name: `${a.first_name} ${a.last_name || ''}`, 
        market_code: mCode 
      });

      // Special case: nl is also for NLNL market
      if (lang === 'nl') {
        sitemap.push({ 
          slug: canonicalActorSlug, 
          entity_type_id: actorTypeId, 
          entity_id: a.id, 
          language_id: langId,
          journey: 'agency', 
          name: `${a.first_name} ${a.last_name || ''}`, 
          market_code: 'NLNL' 
        });
      }

      // Deep Journey Handshake
      const journeys = ['video', 'commercial', 'telephony'];
      journeys.forEach(j => {
        const jPrefix = getPrefix(j, lang);
        sitemap.push({
          slug: `${canonicalActorSlug}/${jPrefix}`,
          entity_type_id: actorTypeId,
          entity_id: a.id,
          language_id: langId,
          journey: 'agency',
          metadata: { journey: j },
          name: `${a.first_name} - ${j}`,
          market_code: mCode
        });
      });

      // Legacy flat slug redirect (Only for NL/BE)
      if (lang === 'nl' && a.slug) {
        const legacySlug = a.slug.toLowerCase();
        const pureNameSlug = slugify(a.first_name);

        // 1. Redirect from a.slug (e.g. christina-1)
        if (legacySlug !== canonicalActorSlug) {
          sitemap.push({ 
            slug: legacySlug, 
            entity_type_id: actorTypeId, 
            entity_id: a.id, 
            language_id: langId,
            journey: 'agency', 
            name: `${a.first_name} ${a.last_name || ''}`, 
            canonical_slug: canonicalActorSlug,
            market_code: 'ALL'
          });
        }

        // 2. Redirect from pure name (e.g. christina)
        if (pureNameSlug !== canonicalActorSlug && pureNameSlug !== legacySlug) {
          sitemap.push({ 
            slug: pureNameSlug, 
            entity_type_id: actorTypeId, 
            entity_id: a.id, 
            language_id: langId,
            journey: 'agency', 
            name: `${a.first_name} ${a.last_name || ''}`, 
            canonical_slug: canonicalActorSlug,
            market_code: 'ALL'
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
      sitemap.push({ slug: canonicalArtistSlug, entity_type_id: artistTypeId, entity_id: a.id, language_id: langId, journey: 'artist', name: a.display_name, market_code: getMarketCode(lang) });
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
        sitemap.push({ slug: `${prefix}/${mp.slug}`, entity_type_id: musicTypeId, entity_id: track.id, language_id: langId, journey: 'agency', name: mp.name, market_code: getMarketCode(lang) });
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
      sitemap.push({ slug: `${prefix}/${w.slug.toLowerCase()}`, entity_type_id: workshopTypeId, entity_id: w.id, language_id: langId, journey, name: w.title, market_code: getMarketCode(lang) });
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
      sitemap.push({ slug: canonicalSlug, entity_type_id: typeId, entity_id: art.id, language_id: langId, journey: (art.iap_context as any)?.journey || 'agency', name: art.title, market_code: getMarketCode(lang) });
    });
  });

  // 6. Categories (Language/Country/Attribute)
  const langTypeId = getEntityTypeId('language');
  const { data: langs } = await supabase.from('languages').select('id, code, label');
  langs?.forEach(l => {
    const descriptiveSlug = `voice-overs/${slugify(l.label)}`;
    sitemap.push({ slug: descriptiveSlug, entity_type_id: langTypeId, entity_id: l.id, language_id: getLanguageId('nl'), journey: 'agency', name: `Language: ${l.label}`, market_code: 'ALL' });
    sitemap.push({ slug: l.code.toLowerCase(), entity_type_id: langTypeId, entity_id: l.id, language_id: getLanguageId('nl'), journey: 'agency', name: `Language: ${l.label}`, canonical_slug: descriptiveSlug, market_code: 'ALL' });
  });

  const countryTypeId = getEntityTypeId('country');
  const { data: countries } = await supabase.from('countries').select('id, code, label');
  countries?.forEach(c => {
    const descriptiveSlug = `voice-overs/${slugify(c.label)}`;
    sitemap.push({ slug: descriptiveSlug, entity_type_id: countryTypeId, entity_id: c.id, language_id: getLanguageId('nl'), journey: 'agency', name: `Country: ${c.label}`, market_code: 'ALL' });
  });

  // 7. Static Pages
  const staticPages = [
    { slug: 'agency', name: 'Agency', journey: 'agency' },
    { slug: 'studio', name: 'Studio', journey: 'studio' },
    { slug: 'academy', name: 'Academy', journey: 'academy' },
    { slug: 'contact', name: 'Contact', journey: 'agency' },
    { slug: 'tarieven', name: 'Tarieven', journey: 'agency' }
  ];
  staticPages.forEach(p => {
    activeLangs.forEach(lang => {
      const langId = getLanguageId(lang);
      sitemap.push({ slug: p.slug, entity_type_id: articleTypeId, entity_id: 0, language_id: langId, journey: p.journey, name: p.name, market_code: 'ALL' });
    });
  });

  // Master Registry Sync
  console.log(`🚀 Syncing ${sitemap.length} entries to Master Registry...`);
  
  // Deduplicate entries by slug + market_code
  const registryEntries = Array.from(new Map(sitemap.map(item => [`${item.slug}-${item.market_code || 'ALL'}`, item])).values());

  const { error: upsertError } = await supabase
    .from('slug_registry')
    .upsert(registryEntries.map(e => ({
      slug: e.slug,
      entity_type_id: e.entity_type_id,
      entity_id: e.entity_id,
      language_id: e.language_id,
      journey: e.journey || 'agency',
      market_code: e.market_code || 'ALL',
      canonical_slug: e.canonical_slug || null,
      metadata: e.metadata || {},
      is_active: true,
      routing_type: entityTypes?.find(t => t.id === e.entity_type_id)?.code || 'article'
    })), { onConflict: 'slug,market_code' });

  if (upsertError) {
    console.error('❌ Upsert failed:', upsertError.message);
  } else {
    console.log('✅ Master Registry Sync complete.');
  }

  // Write to file
  const mdContent = `# ☢️ ATOMIC SITEMAP (2026)\n\n| Slug | Type | ID | Market | Canonical |\n|------|------|----|--------|-----------|\n` +
    registryEntries.map(e => `| ${e.slug} | ${e.entity_type_id} | ${e.entity_id} | ${e.market_code || 'ALL'} | ${e.canonical_slug || '-'} |`).join('\n');

  fs.writeFileSync('3-WETTEN/docs/ATOMIC_SITEMAP.md', mdContent);
  console.log('✅ ATOMIC_SITEMAP.md generated.');
}

generateAtomicSitemap();
