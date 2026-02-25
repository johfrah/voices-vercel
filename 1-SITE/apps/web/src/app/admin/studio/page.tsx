import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { FixedCostsInstrument } from "@/components/admin/FixedCostsInstrument";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, DollarSign, Mail, Settings, Upload, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

//  CHRIS-PROTOCOL: SDK fallback for stability (v2.14.273)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export const dynamic = 'force-dynamic';

/**
 * STUDIO ADMIN HUB
 *  VOICES OS: Exclusief voor Johfrah/Admin.
 * Hier worden de uploads gedaan, mails verstuurd en de financiën beheerd.
 */
export default async function StudioAdminPage() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return <ContainerInstrument className="p-20 text-center">Skipping admin render during build...</ContainerInstrument>;
  }

  // 1. Haal alle edities op (voor overzicht) via SDK voor stabiliteit
  let allEditions: any[] = [];
  try {
    console.log(' [StudioAdmin] Fetching editions via SDK...');
    const { data: editions, error } = await supabase
      .from('workshop_editions')
      .select(`
        id,
        date,
        status,
        workshop_id,
        location_id,
        instructor_id,
        workshop:workshops(id, title),
        location:locations(id, name),
        instructor:instructors(id, name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error(' [StudioAdmin] SDK Error (Editions):', error.message);
    }

    if (editions) {
      console.log(` [StudioAdmin] Found ${editions.length} editions.`);
      allEditions = editions.map(e => {
        const d = e.date ? new Date(e.date) : new Date();
        return {
          ...e,
          date: isNaN(d.getTime()) ? new Date() : d,
          workshop: Array.isArray(e.workshop) ? e.workshop[0] : e.workshop,
          location: Array.isArray(e.location) ? e.location[0] : e.location,
          instructor: Array.isArray(e.instructor) ? e.instructor[0] : e.instructor
        };
      });
    }
  } catch (dbError: any) {
    console.error(' [StudioAdmin] Fatal Error (Editions):', dbError.message);
  }

  const now = new Date();
  const upcomingEditions = allEditions.filter(e => e.date >= now && e.status !== 'cancelled');
  const pastEditions = allEditions.filter(e => e.date < now || e.status === 'completed');


  // 2. Haal financile stats op (Nuclear Logic)
  let financeStats = {
    totalRevenue: 0,
    pendingRevenue: 0,
    externalCosts: 0,
    partnerPayouts: 0,
    netProfit: 0,
    partnerShare: 0,
    marginPercentage: 0,
    forecastProfit: 0
  };
  
  try {
    // 🛡️ CHRIS-PROTOCOL: StudioDataBridge needs SDK migration too, but for now we try-catch
    financeStats = await StudioDataBridge.getFinanceStats().catch(err => {
      console.error('Studio Admin Stats Error (Async):', err);
      return financeStats; // Fallback to initial empty stats
    });
  } catch (statsError) {
    console.error('Studio Admin Stats Error:', statsError);
  }

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2"><VoiceglotText  translationKey="admin.studio.badge" defaultText="Studio Master Control" /></TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter"><VoiceglotText  translationKey="admin.studio.title_part1" defaultText="Studio" /><TextInstrument as="span" className="text-primary font-light"><VoiceglotText  translationKey="admin.studio.title_part2" defaultText="Beheer." /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
        
        <ButtonInstrument className="px-8 py-4 bg-va-black text-white rounded-2xl font-black tracking-widest text-[13px] hover:bg-primary transition-all flex items-center gap-3 shadow-aura">
          <Plus size={18} strokeWidth={2} />
          <VoiceglotText translationKey="admin.studio.new_edition" defaultText="NIEUWE EDITIE TOEVOEGEN" />
        </ButtonInstrument>
      </ContainerInstrument>

      <BentoGrid strokeWidth={1.5} columns={3} className="gap-8">
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument>
            <Calendar strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light">Geplande edities</TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">{upcomingEditions.length}</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument>
            <History strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light">Historische edities</TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">{pastEditions.length}</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>
        {/* FINANCE OVERVIEW (Step 4) */}
        <BentoCard span="sm" className="bg-va-black text-white p-8 flex flex-col justify-between">
          <ContainerInstrument>
            <DollarSign strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] font-black tracking-widest text-white/30"><VoiceglotText  translationKey="admin.studio.total_revenue" defaultText="Totale Omzet Studio" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">
              {(financeStats?.totalRevenue || 0).toLocaleString('nl-BE')}
            </HeadingInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="pt-8 border-t border-white/5 space-y-4">
            <ContainerInstrument className="flex justify-between items-center">
              <TextInstrument className="text-[13px] font-bold text-white/20 tracking-widest uppercase">
                Externe Kosten
              </TextInstrument>
              <TextInstrument className="text-[13px] font-black text-white/60">{(financeStats?.externalCosts || 0).toLocaleString('nl-BE')}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex justify-between items-center">
              <TextInstrument className="text-[13px] font-bold text-white/20 tracking-widest uppercase">
                Partner Payouts
              </TextInstrument>
              <TextInstrument className="text-[13px] font-black text-white/60">{(financeStats?.partnerPayouts || 0).toLocaleString('nl-BE')}</TextInstrument>
            </ContainerInstrument>
            {financeStats?.pendingRevenue > 0 && (
              <ContainerInstrument className="flex justify-between items-center">
                <TextInstrument className="text-[13px] font-bold text-primary/40 tracking-widest uppercase">
                   Onbetaalde Orders
                </TextInstrument>
                <TextInstrument className="text-[13px] font-black text-primary/60">{(financeStats?.pendingRevenue || 0).toLocaleString('nl-BE')}</TextInstrument>
              </ContainerInstrument>
            )}
            <div className="pt-2 border-t border-white/5">
              <ContainerInstrument className="flex justify-between items-center">
                <TextInstrument className="text-[15px] font-bold text-white/40 tracking-widest">
                  <VoiceglotText  translationKey="common.net_profit" defaultText="De Pot (Winst)" />
                </TextInstrument>
                <TextInstrument className="text-[15px] font-black text-primary">{(financeStats?.netProfit || 0).toLocaleString('nl-BE')}</TextInstrument>
              </ContainerInstrument>
            </div>
            <ContainerInstrument className="flex justify-between items-center bg-primary/10 p-3 rounded-xl mt-2">
              <TextInstrument className="text-[13px] font-bold text-primary tracking-widest uppercase">
                Aandeel p.p. (50/50)
              </TextInstrument>
              <TextInstrument className="text-[15px] font-black text-primary">{(financeStats?.partnerShare || 0).toLocaleString('nl-BE')}</TextInstrument>
            </ContainerInstrument>
            {financeStats?.forecastProfit && financeStats?.forecastProfit > (financeStats?.netProfit || 0) && (
              <ContainerInstrument className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                <TextInstrument className="text-[11px] font-bold text-white/20 tracking-widest uppercase">
                   Prognose (incl. onbetaald)
                </TextInstrument>
                <TextInstrument className="text-[11px] font-black text-white/40">{(financeStats?.forecastProfit || 0).toLocaleString('nl-BE')}</TextInstrument>
              </ContainerInstrument>
            )}
            <ContainerInstrument className="flex justify-between items-center">
              <TextInstrument className="text-[13px] font-bold text-white/20 tracking-widest">
                <VoiceglotText  translationKey="common.margin" defaultText="Marge" />
              </TextInstrument>
              <TextInstrument className="text-[13px] font-black">{(financeStats?.marginPercentage || 0).toFixed(1)}%</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/* QUICK ACTIONS (Step 3) */}
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <Mail strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] font-black tracking-widest text-black/30"><VoiceglotText  translationKey="admin.studio.mail_triggers" defaultText="Smart Mail Triggers" /></TextInstrument>
            <ContainerInstrument className="space-y-3 mt-6">
              <ButtonInstrument className="w-full py-3 bg-white border border-black/5 text-[15px] font-black tracking-widest hover:bg-primary transition-all"><VoiceglotText  translationKey="admin.studio.trigger.new_edition" defaultText="Nieuwe Editie Aankondiging" /></ButtonInstrument>
              <ButtonInstrument className="w-full py-3 bg-white border border-black/5 text-[15px] font-black tracking-widest hover:bg-primary transition-all"><VoiceglotText  translationKey="admin.studio.trigger.certificates" defaultText="Certificaten Klaar (Bulk)" /></ButtonInstrument>
              
              <div className="pt-4 border-t border-black/5 mt-4">
                <FixedCostsInstrument />
              </div>
            </ContainerInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-medium text-black/30 mt-8"><VoiceglotText  translationKey="admin.studio.mail_disclaimer" defaultText="* Mails worden alleen door Johfrah getriggerd." /></TextInstrument>
        </BentoCard>

        {/* UPLOAD STATUS (Step 2) */}
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <Upload strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] font-black tracking-widest text-black/30"><VoiceglotText  translationKey="admin.studio.audio_uploads" defaultText="Audio Uploads" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">12</HeadingInstrument>
            <TextInstrument className="text-[15px] font-bold text-black/20 tracking-widest mt-1"><VoiceglotText  translationKey="admin.studio.pending_uploads" defaultText="Nog te verwerken" /></TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="text-[15px] font-black tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all mt-8"><VoiceglotText  translationKey="admin.studio.start_upload" defaultText="START BATCH UPLOAD" /><ArrowRight strokeWidth={1.5} size={14} /></ButtonInstrument>
        </BentoCard>

        {/* EDITIONS LIST FOR ADMIN */}
        <BentoCard span="lg" className="bg-white shadow-aura p-10 border border-black/5">
          <HeadingInstrument level={2} className="text-[15px] font-light tracking-widest text-black/30 mb-8">Komende Studio Edities</HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            {upcomingEditions.length === 0 ? (
              <ContainerInstrument className="p-20 text-center text-black/20 italic">Geen komende edities gevonden.</ContainerInstrument>
            ) : upcomingEditions.map((edition) => <EditionRow key={edition.id} edition={edition} />)}
          </ContainerInstrument>

          <HeadingInstrument level={2} className="text-[15px] font-light tracking-widest text-black/30 mt-16 mb-8">Historische Studio Edities</HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            {pastEditions.length === 0 ? (
              <ContainerInstrument className="p-20 text-center text-black/20 italic">Geen historische edities gevonden.</ContainerInstrument>
            ) : pastEditions.map((edition) => <EditionRow key={edition.id} edition={edition} />)}
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}

function EditionRow({ edition }: { edition: any }) {
  const date = new Date(edition.date);
  return (
    <Link 
      href={`/admin/studio/workshops/${edition.id}`}
      className="p-6 rounded-2xl bg-va-off-white border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-aura transition-all flex flex-col md:flex-row justify-between items-center gap-6 group va-interactive"
    >
      <ContainerInstrument plain className="flex items-center gap-6">
        <ContainerInstrument plain className="w-12 h-12 rounded-xl bg-black text-white flex flex-col items-center justify-center group-hover:bg-primary group-hover:text-va-black transition-colors">
          <TextInstrument className="text-[15px] font-black">{date.getDate()}</TextInstrument>
          <TextInstrument className="text-[15px] font-bold ">{date.toLocaleString('nl-BE', { month: 'short' })}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument plain>
          <HeadingInstrument level={4} className="text-lg font-light tracking-tight">{edition.workshop?.title || edition.title}</HeadingInstrument>
          <ContainerInstrument plain className="flex gap-4 mt-1">
            <TextInstrument className="text-[13px] font-bold text-black/30 tracking-widest uppercase flex items-center gap-1">
              <Users size={12} /> {edition.instructor?.name || 'Onbekend'}
            </TextInstrument>
            <TextInstrument className="text-[13px] font-bold text-black/30 tracking-widest uppercase flex items-center gap-1">
              <MapPin size={12} /> {edition.location?.name || 'Gent'}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
      
      <ContainerInstrument plain className="flex items-center gap-6">
        <ContainerInstrument plain className="text-right">
          <ContainerInstrument plain className="text-[11px] font-black tracking-widest text-black/20 mb-1 uppercase">Status</ContainerInstrument>
          <TextInstrument className="text-[13px] font-black tracking-widest text-black/40 uppercase">{edition.status}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument plain className="p-4 rounded-xl bg-white border border-black/5 group-hover:border-primary transition-all">
          <Settings strokeWidth={1.5} size={16} className="text-black/20 group-hover:text-primary transition-colors" />
        </ContainerInstrument>
      </ContainerInstrument>
    </Link>
  );
}
