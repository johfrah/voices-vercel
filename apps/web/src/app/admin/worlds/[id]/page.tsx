import { ContainerInstrument, HeadingInstrument, TextInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const storageBase = `${supabaseUrl}/storage/v1/object/public/voices/`;

export default async function WorldDetailPage({ params }: { params: { id: string } }) {
  const worldId = parseInt(params.id);

  const { data: config } = await supabase
    .from('world_configs')
    .select(`
      *, 
      logo_media:logo_media_id(id, file_path, file_type, alt_text),
      og_media:og_image_media_id(id, file_path, file_type, alt_text),
      favicon_media:favicon_media_id(id, file_path, file_type, alt_text)
    `)
    .eq('world_id', worldId)
    .maybeSingle();

  if (!config) notFound();

  const logoUrl = (config as any).logo_media?.file_path ? `${storageBase}${(config as any).logo_media.file_path}` : null;
  const ogUrl = (config as any).og_media?.file_path ? `${storageBase}${(config as any).og_media.file_path}` : null;
  const faviconUrl = (config as any).favicon_media?.file_path ? `${storageBase}${(config as any).favicon_media.file_path}` : null;

  const Field = ({ label, value, mono }: { label: string; value: string | number | null; mono?: boolean }) => (
    <ContainerInstrument plain className="space-y-1">
      <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/30">{label}</TextInstrument>
      <TextInstrument className={`text-[15px] font-light text-va-black ${mono ? 'font-mono text-[13px]' : ''}`}>
        {value || <TextInstrument as="span" className="text-va-black/20 italic">niet ingesteld</TextInstrument>}
      </TextInstrument>
    </ContainerInstrument>
  );

  const MediaCard = ({ label, url, mediaId, filePath }: { label: string; url: string | null; mediaId: number | null; filePath: string | null }) => (
    <ContainerInstrument className="bg-white rounded-[20px] p-6 border border-black/[0.03] shadow-aura space-y-4">
      <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/30">{label}</TextInstrument>
      {url ? (
        <ContainerInstrument plain className="space-y-3">
          <ContainerInstrument plain className="h-20 flex items-center">
            <Image src={url} alt={label} width={200} height={80} className="h-16 w-auto object-contain" />
          </ContainerInstrument>
          <TextInstrument className="text-[11px] text-va-black/30 font-mono break-all">{filePath}</TextInstrument>
          <TextInstrument className="text-[11px] text-primary font-bold">media_id: {mediaId}</TextInstrument>
        </ContainerInstrument>
      ) : (
        <ContainerInstrument plain className="h-20 flex items-center justify-center bg-va-off-white rounded-xl">
          <TextInstrument className="text-va-black/20 text-[13px]">Geen media gekoppeld</TextInstrument>
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen p-8">
      <ContainerInstrument className="max-w-4xl mx-auto space-y-8">
        <Link href="/admin/worlds" className="inline-flex items-center gap-2 text-[13px] text-va-black/40 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Terug naar overzicht
        </Link>

        <ContainerInstrument plain className="flex items-center gap-6">
          <ContainerInstrument plain className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
            {worldId}
          </ContainerInstrument>
          <ContainerInstrument plain>
            <HeadingInstrument level={1} className="text-3xl font-light tracking-tighter text-va-black">
              {config.name}
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              World {worldId} · Theme: {config.nav_theme || 'default'}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Contact */}
        <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
            Contact
          </HeadingInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Naam" value={config.name} />
            <Field label="E-mail" value={config.email} />
            <Field label="Telefoon" value={config.phone} />
            <Field label="BTW-nummer" value={config.vat_number} />
            <Field label="Adres" value={config.address} />
            <Field label="Nav Theme" value={config.nav_theme} mono />
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Branding / Media */}
        <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
            Branding (ID-First Handshake → media tabel)
          </HeadingInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MediaCard label="Logo" url={logoUrl} mediaId={config.logo_media_id} filePath={(config as any).logo_media?.file_path} />
            <MediaCard label="OG Image" url={ogUrl} mediaId={config.og_image_media_id} filePath={(config as any).og_media?.file_path} />
            <MediaCard label="Favicon" url={faviconUrl} mediaId={config.favicon_media_id} filePath={(config as any).favicon_media?.file_path} />
          </ContainerInstrument>
        </ContainerInstrument>

        {/* SEO */}
        <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
            SEO & Meta
          </HeadingInstrument>
          <ContainerInstrument plain className="space-y-6">
            <Field label="Meta Title" value={config.meta_title} />
            <Field label="Meta Description" value={config.meta_description} />
          </ContainerInstrument>
          
          {/* Preview */}
          <ContainerInstrument plain className="mt-6 p-4 bg-va-off-white rounded-xl">
            <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/20 mb-3">Google Preview</TextInstrument>
            <ContainerInstrument plain className="space-y-1">
              <TextInstrument className="text-[16px] text-blue-700 font-light">{config.meta_title || 'Geen titel'}</TextInstrument>
              <TextInstrument className="text-[13px] text-green-700 font-light">voices.be › studio</TextInstrument>
              <TextInstrument className="text-[13px] text-va-black/60 font-light">{config.meta_description || 'Geen beschrijving'}</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Social Links */}
        {config.social_links && Object.keys(config.social_links).length > 0 && (
          <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-aura space-y-6">
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight text-va-black">
              Social Links
            </HeadingInstrument>
            <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(config.social_links as Record<string, string>).map(([platform, url]) => (
                <ContainerInstrument key={platform} plain className="flex items-center gap-3">
                  <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/30 w-24">{platform}</TextInstrument>
                  <TextInstrument className="text-[13px] text-primary font-light truncate">{url}</TextInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        {/* Raw Data */}
        <ContainerInstrument className="bg-va-black text-white rounded-[24px] p-8 space-y-4">
          <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-white/30">Database Record (world_configs)</TextInstrument>
          <pre className="text-[12px] text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify({
              world_id: config.world_id,
              logo_media_id: config.logo_media_id,
              og_image_media_id: config.og_image_media_id,
              favicon_media_id: config.favicon_media_id,
              meta_title: config.meta_title,
              meta_description: config.meta_description,
              nav_theme: config.nav_theme,
              email: config.email,
              phone: config.phone,
            }, null, 2)}
          </pre>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
