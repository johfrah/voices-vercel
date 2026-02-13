import React, { Suspense } from 'react';
import { StudioDataBridge } from "@/lib/studio-bridge";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument,
  InputInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { HitlActionCardInstrument } from "@/components/ui/HitlActionCardInstrument";
import { Users, Mail, Phone, Calendar, ArrowLeft, Search, Filter, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Participant } from "@/lib/api";

export default function ParticipantsPage() {
  return (
    <PageWrapperInstrument>
      <Suspense fallback={<LoadingScreenInstrument />}>
        <ParticipantsContent />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function ParticipantsContent() {
  // We halen alle deelnemers op via de bridge. 
  // In een echte scenario zouden we hier een specifieke workshop ID kunnen meegeven of alle 'interest' leads ophalen.
  // Voor nu simuleren we de 'interest' lijst (deelnemers in de backend).
  const participants: Participant[] = await StudioDataBridge.getParticipants(0); // 0 as placeholder for 'all' or 'leads'

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      {/* Header */}
      <SectionInstrument className="mb-16 space-y-4">
        <Link 
          href="/studio" 
          className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all mb-4"
        >
          <ArrowLeft strokeWidth={1.5} size={14} /> 
          <VoiceglotText translationKey="studio.back_to_studio" defaultText="Terug" />
        </Link>
        <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter">
          <VoiceglotText translationKey="studio.participants.title" defaultText="Deelnemers" />
        </HeadingInstrument>
        <TextInstrument className="text-va-black/50 font-medium">
          <VoiceglotText translationKey="studio.participants.subtitle" defaultText="Beheer alle workshop aanmeldingen en geïnteresseerden." />
        </TextInstrument>
      </SectionInstrument>

      <BentoGrid>
        {/* Stats Summary */}
        <BentoCard span="sm" className="bg-va-black text-white p-8">
          <Users className="text-primary mb-6" size={32} />
          <ContainerInstrument className="text-4xl font-black tracking-tighter mb-2">{participants.length}</ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-white/40">
            <VoiceglotText translationKey="studio.participants.total_label" defaultText="Totaal" />
          </TextInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-white p-8 border border-black/5">
          <Mail strokeWidth={1.5} className="text-va-black mb-6" size={32} />
          <ContainerInstrument className="text-4xl font-black tracking-tighter mb-2">
            {participants.filter(p => p.status === 'lead').length}
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/40">
            <VoiceglotText translationKey="studio.participants.leads_label" defaultText="Nieuw" />
          </TextInstrument>
        </BentoCard>

        <BentoCard span="sm" className="hblue text-white p-8">
          <Calendar strokeWidth={1.5} className="mb-6" size={32} />
          <ContainerInstrument className="text-4xl font-black tracking-tighter mb-2">
            {participants.filter(p => p.status === 'confirmed').length}
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-white/80">
            <VoiceglotText translationKey="studio.participants.confirmed_label" defaultText="Bevestigd" />
          </TextInstrument>
        </BentoCard>

        {/* Participants List */}
        <BentoCard span="full" className="bg-white/40 backdrop-blur-md border-white/20 shadow-aura p-12">
          <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <HeadingInstrument level={3} className="text-2xl font-black tracking-tight">
              <VoiceglotText translationKey="studio.participants.list_title" defaultText="Lijst" />
            </HeadingInstrument>
            <ContainerInstrument className="flex items-center gap-4 w-full md:w-auto">
              <ContainerInstrument className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={16} />
                <InputInstrument 
                  type="text" 
                  placeholder="Zoeken..." 
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-va-off-white border border-black/5 text-[15px] font-bold focus:outline-none focus:border-primary/30 transition-all"
                />
              </ContainerInstrument>
              <ButtonInstrument className="p-3 rounded-full bg-va-off-white border border-black/5 text-va-black/40 hover:text-primary transition-all">
                <Filter size={18} />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="overflow-x-auto">
            <ContainerInstrument as="table" className="w-full text-left">
              <ContainerInstrument as="thead">
                <ContainerInstrument as="tr" className="border-b border-black/5">
                  <ContainerInstrument as="th" className="pb-6 text-[15px] font-black tracking-widest text-va-black/30">
                    <VoiceglotText translationKey="common.name" defaultText="Naam" />
                  </ContainerInstrument>
                  <ContainerInstrument as="th" className="pb-6 text-[15px] font-black tracking-widest text-va-black/30">
                    <VoiceglotText translationKey="common.contact" defaultText="Contact" />
                  </ContainerInstrument>
                  <ContainerInstrument as="th" className="pb-6 text-[15px] font-black tracking-widest text-va-black/30">
                    <VoiceglotText translationKey="common.status" defaultText="Status" />
                  </ContainerInstrument>
                  <ContainerInstrument as="th" className="pb-6 text-[15px] font-black tracking-widest text-va-black/30">
                    <VoiceglotText translationKey="common.date" defaultText="Datum" />
                  </ContainerInstrument>
                  <ContainerInstrument as="th" className="pb-6" />
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument as="tbody" className="divide-y divide-black/5">
                {participants.map((participant) => (
                  <ContainerInstrument as="tr" key={participant.id} className="group hover:bg-va-off-white/50 transition-all">
                    <ContainerInstrument as="td" className="py-6">
                      <TextInstrument className="font-black tracking-tight text-sm">
                        {participant.firstName} {participant.lastName}
                      </TextInstrument>
                      <TextInstrument className="text-[15px] font-bold text-va-black/30 tracking-widest mt-1">
                        {participant.profession || <VoiceglotText translationKey="studio.participants.no_profession" defaultText="Geen beroep" />}
                      </TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument as="td" className="py-6">
                      <ContainerInstrument className="flex flex-col gap-1">
                        <TextInstrument className="flex items-center gap-2 text-[15px] font-bold text-va-black/60">
                          <Mail strokeWidth={1.5} size={12} className="text-va-black/20" /> {participant.email}
                        </TextInstrument>
                        {participant.phone && (
                          <TextInstrument className="flex items-center gap-2 text-[15px] font-bold text-va-black/60">
                            <Phone strokeWidth={1.5} size={12} className="text-va-black/20" /> {participant.phone}
                          </TextInstrument>
                        )}
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument as="td" className="py-6">
                      <TextInstrument as="span" className={`px-3 py-1 rounded-full text-[15px] font-black uppercase tracking-widest ${
                        participant.status === 'confirmed' 
                          ? 'bg-green-500/10 text-green-500' 
                          : participant.status === 'lead'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-va-black/5 text-va-black/40'
                      }`}>
                        {participant.status}
                      </TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument as="td" className="py-6 text-[15px] font-bold text-va-black/40 tracking-widest">
                      {participant.createdAt ? new Date(participant.createdAt).toLocaleDateString('nl-BE') : 'N/A'}
                    </ContainerInstrument>
                    <ContainerInstrument as="td" className="py-6 text-right">
                      <ButtonInstrument className="px-4 py-2 rounded-full bg-va-black text-white text-[15px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                        <VoiceglotText translationKey="common.details" defaultText="Details" />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
            
            {participants.length === 0 && (
              <ContainerInstrument className="py-20 text-center text-va-black/20 font-black tracking-widest text-[15px]">
                <VoiceglotText translationKey="studio.participants.empty" defaultText="Geen deelnemers gevonden" />
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}