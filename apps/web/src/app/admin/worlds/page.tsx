import { ContainerInstrument, HeadingInstrument, TextInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { getWorldConfig } from "@/lib/services/world-config-service";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const WORLD_NAMES: Record<number, string> = {
  0: 'Foyer (Global)',
  1: 'Agency',
  2: 'Studio',
  3: 'Academy',
  5: 'Portfolio',
  6: 'Ademing',
  7: 'Freelance',
  8: 'Partner',
  10: 'Johfrai',
  25: 'Artist',
};

export const metadata = { title: "Worlds | Admin" };

export default async function WorldsAdminPage() {
  const { data: configs } = await supabase
    .from('world_configs')
    .select(`
      world_id, name, email, phone, meta_title, meta_description, nav_theme,
      logo_media_id, og_image_media_id, favicon_media_id,
      logo_media:logo_media_id(id, file_path),
      og_media:og_image_media_id(id, file_path)
    `)
    .order('world_id');

  const storageBase = `${supabaseUrl}/storage/v1/object/public/voices/`;

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen p-8">
      <ContainerInstrument className="max-w-6xl mx-auto">
        <ContainerInstrument plain className="mb-12">
          <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-2">
            Admin
          </TextInstrument>
          <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter text-va-black">
            World Configuratie
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light mt-2">
            Beheer branding, contact en SEO per World. Alles via koppeltabellen (ID-First).
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(configs || []).map((config: any) => {
            const logoPath = config.logo_media?.file_path;
            const logoUrl = logoPath ? `${storageBase}${logoPath}` : null;
            const worldLabel = WORLD_NAMES[config.world_id] || `World ${config.world_id}`;

            return (
              <Link
                key={config.world_id}
                href={`/admin/worlds/${config.world_id}`}
                className="block group"
              >
                <ContainerInstrument className="bg-white rounded-[20px] p-6 border border-black/[0.03] shadow-aura hover:shadow-aura-lg transition-all duration-500 group-hover:-translate-y-1 space-y-4">
                  <ContainerInstrument plain className="flex items-center justify-between">
                    <ContainerInstrument plain className="flex items-center gap-3">
                      <ContainerInstrument plain className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {config.world_id}
                      </ContainerInstrument>
                      <ContainerInstrument plain>
                        <HeadingInstrument level={3} className="text-lg font-light tracking-tight text-va-black group-hover:text-primary transition-colors">
                          {worldLabel}
                        </HeadingInstrument>
                        <TextInstrument className="text-[11px] text-va-black/30 font-bold tracking-widest uppercase">
                          {config.nav_theme || 'default'}
                        </TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                    {logoUrl && (
                      <ContainerInstrument plain className="h-8 w-auto relative">
                        <Image src={logoUrl} alt={config.name} width={80} height={32} className="h-8 w-auto object-contain" />
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>

                  <ContainerInstrument plain className="space-y-1 text-[13px]">
                    <TextInstrument className="text-va-black/60 font-light truncate">{config.name}</TextInstrument>
                    <TextInstrument className="text-va-black/30 font-light truncate">{config.email}</TextInstrument>
                    <TextInstrument className="text-va-black/30 font-light truncate">{config.phone}</TextInstrument>
                  </ContainerInstrument>

                  <ContainerInstrument plain className="pt-3 border-t border-black/5 space-y-1">
                    <TextInstrument className="text-[11px] font-bold tracking-widest uppercase text-va-black/20">SEO</TextInstrument>
                    <TextInstrument className="text-[12px] text-va-black/50 font-light truncate">
                      {config.meta_title || '— geen titel —'}
                    </TextInstrument>
                  </ContainerInstrument>

                  <ContainerInstrument plain className="flex gap-2">
                    <ContainerInstrument plain className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${config.logo_media_id ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      LOGO {config.logo_media_id ? '✓' : '✗'}
                    </ContainerInstrument>
                    <ContainerInstrument plain className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${config.og_image_media_id ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      OG {config.og_image_media_id ? '✓' : '✗'}
                    </ContainerInstrument>
                    <ContainerInstrument plain className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${config.meta_title ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      SEO {config.meta_title ? '✓' : '✗'}
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </Link>
            );
          })}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
