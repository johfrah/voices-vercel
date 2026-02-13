import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { ArrowLeft, CheckCircle2, DollarSign, FileAudio, Mail, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoiceglotText } from '@/components/ui/VoiceglotText';

/**
 * STUDIO ADMIN EDITION DETAIL
 * 🛡️ VOICES OS: Beheer van uploads, deelnemers en financiën per editie.
 */
export default async function AdminEditionDetailPage({ params }: { params: { id: string } }) {
  const editionId = parseInt(params.id);
  const edition = await StudioDataBridge.getEditionById(editionId);

  if (!edition) {
    notFound();
  }

  const participants = await StudioDataBridge.getParticipantsByEdition(editionId);

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <Link 
        href="/admin/studio" 
        className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group"
      >
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" /><VoiceglotText translationKey="auto.page.terug_naar_studio_be.340257" defaultText="Terug naar studio beheer" /></Link>

      <ContainerInstrument className="mb-12">
        <TextInstrument className="text-[15px] font-light tracking-widest text-black/40 mb-2"><VoiceglotText translationKey="auto.page.editie_beheer.b65194" defaultText="Editie Beheer" /></TextInstrument>
        <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
          {edition.workshop?.title} <span className="text-primary">— {new Date(edition.date).toLocaleDateString('nl-BE')}</span>
        </HeadingInstrument>
      </ContainerInstrument>

      <BentoGrid columns={3} className="gap-8">
        {/* PARTICIPANTS & UPLOADS (Step 2) */}
        <BentoCard span="lg" className="bg-white shadow-aura border border-black/5 overflow-hidden">
          <div className="p-8 border-b border-black/5 bg-va-off-white/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-primary" />
              <span className="text-[15px] font-light tracking-tight">
                {participants.length} Deelnemers
              </span>
            </div>
            <ButtonInstrument className="px-6 py-2 bg-black text-white text-[15px] font-light tracking-widest rounded-xl hover:bg-primary transition-all"><VoiceglotText translationKey="auto.page.bulk_audio_upload.59a817" defaultText="Bulk Audio Upload" /></ButtonInstrument>
          </div>

          <div className="divide-y divide-black/5">
            {participants.map((p: any) => {
              const user = p.order?.user;
              return (
                <div key={p.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-light text-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xl font-light tracking-tight">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-[15px] font-light text-black/30 tracking-widest mt-1">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {p.dropboxUrl ? (
                      <div className="flex items-center gap-2 text-green-500 text-[15px] font-light tracking-widest">
                        <CheckCircle2 strokeWidth={1.5} size={14} /><VoiceglotText translationKey="auto.page.audio_live.4d370c" defaultText="Audio Live" /></div>
                    ) : (
                      <ButtonInstrument className="flex items-center gap-2 px-4 py-3 bg-va-off-white border border-black/5 text-[15px] font-light tracking-widest rounded-xl hover:border-primary transition-all">
                        <FileAudio size={14} /><VoiceglotText translationKey="auto.page.upload_audio.92cb1a" defaultText="Upload Audio" />
                      </ButtonInstrument>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* FINANCE & INSTRUCTOR PAYOUT (Step 4) */}
        <div className="space-y-8">
          <BentoCard span="sm" className="bg-va-black text-white p-10">
            <DollarSign className="text-primary mb-6" size={24} />
            <HeadingInstrument level={3} className="text-xl font-light tracking-tighter mb-6"><VoiceglotText translationKey="auto.page.financi_le_afwikkeli.b40783" defaultText="Financiële Afwikkeling" /></HeadingInstrument>
            
            <div className="space-y-4 border-b border-white/5 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-light text-white/30 tracking-widest"><VoiceglotText translationKey="auto.page.bruto_omzet.dad5d3" defaultText="Bruto Omzet" /></span>
                <span className="text-[15px] font-light">€{(participants.length * parseFloat(edition.price || '0')).toLocaleString('nl-BE')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-light text-white/30 tracking-widest"><VoiceglotText translationKey="auto.page.platform_fee__30__.21d3ea" defaultText="Platform Fee (30%)" /></span>
                <span className="text-[15px] font-light text-primary">- €{(participants.length * parseFloat(edition.price || '0') * 0.3).toLocaleString('nl-BE')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[15px] font-light text-white/30 tracking-widest"><VoiceglotText translationKey="auto.page.uitbetaling_instruct.1cb7e8" defaultText="Uitbetaling Instructeur" /></span>
              <span className="text-xl font-light text-white">€{(participants.length * parseFloat(edition.price || '0') * 0.7).toLocaleString('nl-BE')}</span>
            </div>

            <ButtonInstrument className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[15px] font-light tracking-widest transition-all mt-10"><VoiceglotText translationKey="auto.page.bevestig_uitbetaling.386eea" defaultText="Bevestig Uitbetaling" /></ButtonInstrument></BentoCard>

          {/* SMART MAIL (Step 3) */}
          <BentoCard span="sm" className="bg-va-off-white p-10 border border-black/5">
            <Mail strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-black/30 mb-6"><VoiceglotText translationKey="auto.page.communicatie.637569" defaultText="Communicatie" /></HeadingInstrument>
            <div className="space-y-3">
              <ButtonInstrument className="w-full py-4 bg-white border border-black/5 text-[15px] font-light tracking-widest hover:bg-primary transition-all"><VoiceglotText translationKey="auto.page.stuur_audio_link_mai.53457f" defaultText="Stuur Audio-Link Mail" /></ButtonInstrument><ButtonInstrument className="w-full py-4 bg-white border border-black/5 text-[15px] font-light tracking-widest hover:bg-primary transition-all"><VoiceglotText translationKey="auto.page.vraag_om_review.c67197" defaultText="Vraag om Review" /></ButtonInstrument></div>
          </BentoCard>
        </div>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
