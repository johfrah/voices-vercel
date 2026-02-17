import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { FixedCostsInstrument } from "@/components/admin/FixedCostsInstrument";
import { db } from "@db";
import { workshopEditions } from "@db/schema";
import { desc } from "drizzle-orm";
import { ArrowRight, DollarSign, Mail, Settings, Upload, Plus } from "lucide-react";
import Link from "next/link";

/**
 * STUDIO ADMIN HUB
 *  VOICES OS: Exclusief voor Johfrah/Admin.
 * Hier worden de uploads gedaan, mails verstuurd en de financin beheerd.
 */
export default async function StudioAdminPage() {
  // 1. Haal alle edities op (voor overzicht)
  const allEditions = await db.query.workshopEditions.findMany({
    with: {
      workshop: true,
      location: true,
      instructor: true
    },
    orderBy: [desc(workshopEditions.date)]
  });

  // 2. Haal financile stats op (Nuclear Logic)
  const financeStats = await StudioDataBridge.getFinanceStats();

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
        {/* FINANCE OVERVIEW (Step 4) */}
        <BentoCard span="sm" className="bg-va-black text-white p-8 flex flex-col justify-between">
          <ContainerInstrument>
            <DollarSign strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] font-black tracking-widest text-white/30"><VoiceglotText  translationKey="admin.studio.total_revenue" defaultText="Totale Omzet Studio" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">
              {financeStats.totalRevenue.toLocaleString('nl-BE')}
            </HeadingInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="pt-8 border-t border-white/5 space-y-4">
            <ContainerInstrument className="flex justify-between items-center">
              <TextInstrument className="text-[13px] font-bold text-white/20 tracking-widest uppercase">
                Externe Kosten
              </TextInstrument>
              <TextInstrument className="text-[13px] font-black text-white/60">{financeStats.externalCosts.toLocaleString('nl-BE')}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex justify-between items-center">
              <TextInstrument className="text-[13px] font-bold text-white/20 tracking-widest uppercase">
                Partner Payouts
              </TextInstrument>
              <TextInstrument className="text-[13px] font-black text-white/60">{financeStats.partnerPayouts.toLocaleString('nl-BE')}</TextInstrument>
            </ContainerInstrument>
            {financeStats.pendingRevenue > 0 && (
              <ContainerInstrument className="flex justify-between items-center">
                <TextInstrument className="text-[13px] font-bold text-primary/40 tracking-widest uppercase">
                   Onbetaalde Orders
                </TextInstrument>
                <TextInstrument className="text-[13px] font-black text-primary/60">{financeStats.pendingRevenue.toLocaleString('nl-BE')}</TextInstrument>
              </ContainerInstrument>
            )}
            <div className="pt-2 border-t border-white/5">
              <ContainerInstrument className="flex justify-between items-center">
                <TextInstrument className="text-[15px] font-bold text-white/40 tracking-widest">
                  <VoiceglotText  translationKey="common.net_profit" defaultText="De Pot (Winst)" />
                </TextInstrument>
                <TextInstrument className="text-[15px] font-black text-primary">{financeStats.netProfit.toLocaleString('nl-BE')}</TextInstrument>
              </ContainerInstrument>
            </div>
            <ContainerInstrument className="flex justify-between items-center bg-primary/10 p-3 rounded-xl mt-2">
              <TextInstrument className="text-[13px] font-bold text-primary tracking-widest uppercase">
                Aandeel p.p. (50/50)
              </TextInstrument>
              <TextInstrument className="text-[15px] font-black text-primary">{financeStats.partnerShare.toLocaleString('nl-BE')}</TextInstrument>
            </ContainerInstrument>
            {financeStats.forecastProfit && financeStats.forecastProfit > financeStats.netProfit && (
              <ContainerInstrument className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                <TextInstrument className="text-[11px] font-bold text-white/20 tracking-widest uppercase">
                   Prognose (incl. onbetaald)
                </TextInstrument>
                <TextInstrument className="text-[11px] font-black text-white/40">{financeStats.forecastProfit.toLocaleString('nl-BE')}</TextInstrument>
              </ContainerInstrument>
            )}
            <ContainerInstrument className="flex justify-between items-center">
              <TextInstrument className="text-[13px] font-bold text-white/20 tracking-widest">
                <VoiceglotText  translationKey="common.margin" defaultText="Marge" />
              </TextInstrument>
              <TextInstrument className="text-[13px] font-black">{financeStats.marginPercentage.toFixed(1)}%</TextInstrument>
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
          <HeadingInstrument level={2} className="text-[15px] font-light tracking-widest text-black/30 mb-8"><VoiceglotText  translationKey="admin.studio.all_editions" defaultText="Alle Studio Edities" /></HeadingInstrument>
          
          <ContainerInstrument className="space-y-4">
            {allEditions.map((edition) => (
              <ContainerInstrument key={edition.id} className="p-6 rounded-2xl bg-va-off-white border border-transparent hover:border-black/5 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                <ContainerInstrument className="flex items-center gap-6">
                  <ContainerInstrument className="w-12 h-12 rounded-xl bg-black text-white flex flex-col items-center justify-center">
                    <TextInstrument className="text-[15px] font-black">{edition.date.getDate()}</TextInstrument>
                    <TextInstrument className="text-[15px] font-bold ">{edition.date.toLocaleString('nl-BE', { month: 'short' })}</TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="text-lg font-light tracking-tight"><VoiceglotText  translationKey={`workshop.${edition.workshop?.id}.title`} defaultText={edition.workshop?.title || ''} noTranslate={true} /></HeadingInstrument>
                    <ContainerInstrument className="flex gap-4 mt-1">
                      <TextInstrument className="text-[15px] font-bold text-black/30 tracking-widest">
                        <VoiceglotText  translationKey={`instructor.${edition.instructor?.id}.name`} defaultText={edition.instructor?.name || ''} noTranslate={true} />
                      </TextInstrument>
                      <TextInstrument className="text-[15px] font-bold text-black/30 tracking-widest">
                        <VoiceglotText  translationKey={`location.${edition.location?.id}.name`} defaultText={edition.location?.name || ''} noTranslate={true} />
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                
                <ContainerInstrument className="flex items-center gap-6">
                  <ContainerInstrument className="text-right">
                    <ContainerInstrument className="text-[15px] font-black tracking-widest text-black/20 mb-1">
                      <VoiceglotText  translationKey="common.status" defaultText="Status" />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-black tracking-widest text-black/40">
                      <VoiceglotText  translationKey={`common.status.${edition.status}`} defaultText={edition.status || ''} />
                    </TextInstrument>
                  </ContainerInstrument>
                  <Link  href={`/admin/studio/edities/${edition.id}`} className="p-4 rounded-xl bg-white border border-black/5 hover:border-primary transition-all">
                    <Settings strokeWidth={1.5} size={16} className="text-black/20" />
                  </Link>
                </ContainerInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
