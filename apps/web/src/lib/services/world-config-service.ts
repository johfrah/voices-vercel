import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/voices/`;

export interface WorldConfig {
  world_id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  vat_number: string | null;
  company_name: string | null;
  website: string | null;
  country_code: string;
  social_links: Record<string, string> | null;
  opening_hours: Record<string, string> | null;
  logo_url: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  nav_theme: string;
}

const cache: Record<number, { data: WorldConfig; ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

/**
 * World Config Service (2026)
 * 
 * Haalt per-World branding, contact en SEO data op via ID-First Handshake.
 * world_configs.logo_media_id → media.file_path → Storage URL
 */
export async function getWorldConfig(worldId: number): Promise<WorldConfig | null> {
  const now = Date.now();
  if (cache[worldId] && (now - cache[worldId].ts < CACHE_TTL)) {
    return cache[worldId].data;
  }

  try {
    const { data, error } = await supabase
      .from('world_configs')
      .select(`
        world_id, name, social_links,
        meta_title, meta_description, nav_theme,
        logo_media:logo_media_id(file_path),
        og_media:og_image_media_id(file_path),
        favicon_media:favicon_media_id(file_path)
      `)
      .eq('world_id', worldId)
      .maybeSingle();

    if (error || !data) return null;

    // Contact via junction table (ID-First) — resolves to contacts OR actors
    const { data: contactMapping } = await supabase
      .from('world_contact_mappings')
      .select(`
        contact_id, actor_id,
        contacts(id, label, email, phone, address, vat_number, company_name, website, social_links, opening_hours, country_code),
        actors(id, first_name, last_name, email, bio, tagline, website)
      `)
      .eq('world_id', worldId)
      .eq('role', 'primary')
      .maybeSingle();

    const contactData = (contactMapping as any)?.contacts;
    const actorData = (contactMapping as any)?.actors;
    
    const contact = contactData ? {
      email: contactData.email,
      phone: contactData.phone,
      address: contactData.address,
      vat_number: contactData.vat_number,
      company_name: contactData.company_name,
      website: contactData.website,
      social_links: contactData.social_links,
      opening_hours: contactData.opening_hours,
      country_code: contactData.country_code,
    } : actorData ? {
      email: actorData.email,
      phone: null,
      address: null,
      vat_number: null,
      company_name: `${actorData.first_name} ${actorData.last_name}`.trim(),
      website: actorData.website,
      social_links: null,
      opening_hours: null,
      country_code: 'BE',
    } : {};

    const config: WorldConfig = {
      world_id: data.world_id,
      name: data.name,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || null,
      vat_number: contact.vat_number || null,
      company_name: contact.company_name || null,
      website: contact.website || null,
      country_code: contact.country_code || 'BE',
      social_links: contact.social_links || data.social_links || null,
      opening_hours: contact.opening_hours || null,
      logo_url: (data as any).logo_media?.file_path 
        ? `${STORAGE_BASE}${(data as any).logo_media.file_path}` 
        : null,
      og_image_url: (data as any).og_media?.file_path 
        ? `${STORAGE_BASE}${(data as any).og_media.file_path}` 
        : null,
      favicon_url: (data as any).favicon_media?.file_path 
        ? `${STORAGE_BASE}${(data as any).favicon_media.file_path}` 
        : null,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      nav_theme: data.nav_theme || 'default',
    };

    cache[worldId] = { data: config, ts: now };
    return config;
  } catch (err) {
    console.error(`[WorldConfigService] Failed to fetch config for world ${worldId}:`, err);
    return null;
  }
}

/**
 * Get world config by pathname (for server components)
 */
export async function getWorldConfigByPath(pathname: string): Promise<WorldConfig | null> {
  const pathToWorld: Record<string, number> = {
    '/studio': 2,
    '/academy': 3,
    '/ademing': 6,
    '/johfrai': 10,
    '/freelance': 7,
    '/partner': 8,
  };

  for (const [prefix, worldId] of Object.entries(pathToWorld)) {
    if (pathname.startsWith(prefix)) {
      return getWorldConfig(worldId);
    }
  }

  return getWorldConfig(1);
}
