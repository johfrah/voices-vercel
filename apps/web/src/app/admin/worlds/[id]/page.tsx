import { ContainerInstrument, HeadingInstrument, TextInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { getWorldConfig } from "@/lib/services/world-config-service";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Mail, Phone, MapPin, Building2, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});
const storageBase = `${supabaseUrl}/storage/v1/object/public/voices/`;

export default async function WorldDetailPage({ params }: { params: { id: string } }) {
  const worldId = parseInt(params.id);
  const config = await getWorldConfig(worldId);
  if (!config) notFound();

  // Get raw DB data for the debug section
  const { data: rawConfig } = await supabase
    .from('world_configs')
    .select('*, logo_media:logo_media_id(id, file_path), og_media:og_image_media_id(id, file_path), favicon_media:favicon_media_id(id, file_path)')
    .eq('world_id', worldId)
    .maybeSingle();

  // Get contact mapping details
  const { data: mapping } = await supabase
    .from('world_contact_mappings')
    .select('contact_id, actor_id, role, contacts(*), actors(id, first_name, last_name, email, phone, bio, tagline)')
    .eq('world_id', worldId)
    .maybeSingle();

  const contactSource = mapping?.contact_id ? 'contacts' : mapping?.actor_id ? 'actors' : 'geen';
  const contactRecord = mapping?.contact_id ? (mapping as any).contacts : (mapping as any)?.actors;

  const Field = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: any }) => (
    <ContainerInstrument plain className="flex items-start gap-3">
      {Icon && <Icon size={16} strokeWidth={1.5} className="text-primary/40 mt-1 shrink-0" />}
      <ContainerInstrument plain>
        <TextInstrument className="text-[10px] font-bold tracking-[0.2em] uppercase text-va-black/25">{label}</TextInstrument>
        <TextInstrument className="text-[15px] font-light text-va-black">
          {value || <TextInstrument as="span" className="text-va-black/15 italic">niet ingesteld</TextInstrument>}
        </TextInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen p-8">
      <ContainerInstrument className="max-w-5xl mx-auto space-y-8">
        <Link href="/admin/worlds" className="inline-flex items-center gap-2 text-[13px] text-va-black/40 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Terug naar overzicht
        </Link>

        <ContainerInstrument plain className="flex items-center gap-6">
          {config.logo_url && (
            <Image src={config.logo_url} alt={config.name} width={120} height={48} className="h-10 w-auto object-contain" />
          )}
          <ContainerInstrument plain>
            <HeadingInstrument level={1} className="text-3xl font-light tracking-tighter text-va-black">
              {config.name}
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              World {worldId} · {config.nav_theme} · {config.country_code}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Contact — from junction table */}
        <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
          <ContainerInstrument plain className="flex items-center justify-between">
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
              Contact
            </HeadingInstrument>
            <ContainerInstrument plain className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${contactSource === 'contacts' ? 'bg-blue-50 text-blue-600' : contactSource === 'actors' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-400'}`}>
              {contactSource === 'contacts' && `via contacts tabel (ID ${mapping?.contact_id})`}
              {contactSource === 'actors' && `via actors tabel (ID ${mapping?.actor_id})`}
              {contactSource === 'geen' && 'geen koppeling'}
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Bedrijf / Naam" value={config.company_name} icon={Building2} />
            <Field label="E-mail" value={config.email} icon={Mail} />
            <Field label="Telefoon" value={config.phone} icon={Phone} />
            <Field label="Website" value={config.website} icon={Globe} />
            <Field label="Adres" value={config.address} icon={MapPin} />
            <Field label="BTW-nummer" value={config.vat_number} icon={Building2} />
          </ContainerInstrument>

          {contactSource === 'actors' && contactRecord && (
            <ContainerInstrument plain className="pt-4 border-t border-black/5">
              <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-purple-400 mb-2">Actor Profiel</TextInstrument>
              <TextInstrument className="text-[14px] text-va-black/50 font-light">
                {contactRecord.first_name} {contactRecord.last_name} — {contactRecord.tagline || contactRecord.bio?.substring(0, 80)}
              </TextInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        {/* Opening Hours */}
        {config.opening_hours && Object.keys(config.opening_hours).length > 0 && (
          <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-4">
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
              Openingsuren
            </HeadingInstrument>
            <ContainerInstrument plain className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(config.opening_hours).filter(([k]) => k !== 'note').map(([day, hours]) => (
                <ContainerInstrument key={day} plain className="flex items-center gap-2">
                  <Clock size={12} className="text-va-black/20" />
                  <TextInstrument className="text-[13px] text-va-black/40 font-light">
                    <TextInstrument as="span" className="font-medium text-va-black/60 capitalize">{day}</TextInstrument> {hours}
                  </TextInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
            {(config.opening_hours as any).note && (
              <TextInstrument className="text-[12px] text-va-black/30 italic">{(config.opening_hours as any).note}</TextInstrument>
            )}
          </ContainerInstrument>
        )}

        {/* Branding */}
        <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
            Branding (media tabel via ID-First Handshake)
          </HeadingInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Logo', url: config.logo_url, id: rawConfig?.logo_media_id, path: (rawConfig as any)?.logo_media?.file_path },
              { label: 'OG Image', url: config.og_image_url, id: rawConfig?.og_image_media_id, path: (rawConfig as any)?.og_media?.file_path },
              { label: 'Favicon', url: config.favicon_url, id: rawConfig?.favicon_media_id, path: (rawConfig as any)?.favicon_media?.file_path },
            ].map(({ label, url, id, path }) => (
              <ContainerInstrument key={label} className="bg-va-off-white rounded-[16px] p-5 space-y-3">
                <TextInstrument className="text-[10px] font-bold tracking-[0.2em] uppercase text-va-black/25">{label}</TextInstrument>
                {url ? (
                  <ContainerInstrument plain>
                    <Image src={url} alt={label} width={160} height={64} className="h-12 w-auto object-contain" />
                    <TextInstrument className="text-[10px] text-va-black/20 font-mono mt-2 break-all">{path}</TextInstrument>
                    <TextInstrument className="text-[10px] text-primary font-bold">media_id: {id}</TextInstrument>
                  </ContainerInstrument>
                ) : (
                  <TextInstrument className="text-va-black/15 text-[13px] italic">Niet gekoppeld</TextInstrument>
                )}
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>

        {/* SEO */}
        <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
            SEO
          </HeadingInstrument>
          <Field label="Meta Title" value={config.meta_title} />
          <Field label="Meta Description" value={config.meta_description} />
          
          <ContainerInstrument plain className="p-4 bg-va-off-white rounded-xl space-y-1">
            <TextInstrument className="text-[10px] font-bold tracking-widest uppercase text-va-black/15 mb-2">Google Preview</TextInstrument>
            <TextInstrument className="text-[16px] text-blue-700">{config.meta_title || 'Geen titel'}</TextInstrument>
            <TextInstrument className="text-[13px] text-green-700">{config.website || 'voices.be'}</TextInstrument>
            <TextInstrument className="text-[13px] text-va-black/50">{config.meta_description || 'Geen beschrijving'}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Social Links */}
        {config.social_links && Object.keys(config.social_links).length > 0 && (
          <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-4">
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
              Social Links
            </HeadingInstrument>
            <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(config.social_links).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-va-off-white transition-colors group">
                  <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/25 w-20">{platform}</TextInstrument>
                  <TextInstrument className="text-[13px] text-primary font-light truncate group-hover:underline">{url}</TextInstrument>
                  <ExternalLink size={12} className="text-va-black/10 shrink-0" />
                </a>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        {/* Architecture Debug */}
        <ContainerInstrument className="bg-va-black text-white rounded-[24px] p-8 space-y-4">
          <TextInstrument className="text-[10px] font-bold tracking-widest uppercase text-white/20">Architectuur (ID-First Handshake)</TextInstrument>
          <pre className="text-[11px] text-white/40 font-mono overflow-x-auto whitespace-pre-wrap">
{`world_configs (world_id=${worldId})
  ├── logo_media_id: ${rawConfig?.logo_media_id || 'NULL'} → media.file_path: "${(rawConfig as any)?.logo_media?.file_path || 'n/a'}"
  ├── og_image_media_id: ${rawConfig?.og_image_media_id || 'NULL'} → media.file_path: "${(rawConfig as any)?.og_media?.file_path || 'n/a'}"
  ├── favicon_media_id: ${rawConfig?.favicon_media_id || 'NULL'}
  ├── meta_title: "${rawConfig?.meta_title || ''}"
  └── nav_theme: "${rawConfig?.nav_theme || 'default'}"

world_contact_mappings
  └── world_id=${worldId} → ${contactSource === 'contacts' ? `contact_id=${mapping?.contact_id}` : `actor_id=${mapping?.actor_id}`}
      └── ${contactSource} tabel: ${config.email} / ${config.phone}`}
          </pre>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
