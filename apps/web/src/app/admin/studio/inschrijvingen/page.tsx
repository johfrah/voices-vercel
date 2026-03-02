import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { getServerUser, isAdminUser } from '@/lib/auth/server-auth';
import { redirect } from 'next/navigation';
import { StudioDataBridge } from '@/lib/bridges/studio-bridge';
import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { Users, Calendar, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

/**
 * 🎓 BERNY'S INSCHRIJVINGEN DASHBOARD
 * 
 * Exclusief voor Johfrah en Bernadette (Studio Lead).
 * Toont alle deelnemers per workshop-editie.
 * 
 * @route /admin/studio/inschrijvingen
 */
export default async function StudioInschrijvingenPage() {
  const user = await getServerUser();
  if (!user) redirect('/account');
  if (!isAdminUser(user)) redirect('/studio');

  //  CHRIS-PROTOCOL: Fetch all editions (participants will be fetched per edition)
  const editions = await StudioDataBridge.getAllEditions();
  const now = new Date();
  
  // Filter upcoming editions only
  const upcomingEditions = editions.filter(e => {
    const editionDate = new Date(e.date);
    return editionDate >= now && e.status !== 'cancelled';
  });

  // Sort by date
  upcomingEditions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Fetch participants for each edition
  const editionsWithParticipants = await Promise.all(
    upcomingEditions.map(async (edition) => {
      const participants = await StudioDataBridge.getEditionParticipants(edition.id);
      return { ...edition, participants };
    })
  );
  
  // Filter only editions with participants
  const upcomingWithParticipants = editionsWithParticipants.filter(e => e.participants && e.participants.length > 0);

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20">
      {/* HEADER */}
      <ContainerInstrument className="mb-20 space-y-6">
        <ContainerInstrument plain className="flex items-center gap-4">
          <ContainerInstrument plain className="w-16 h-16 bg-primary/10 rounded-[20px] flex items-center justify-center">
            <Users strokeWidth={1.5} className="text-primary" size={32} />
          </ContainerInstrument>
          <ContainerInstrument plain>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter">
              <VoiceglotText translationKey="admin.studio.registrations.title" defaultText="Inschrijvingen" />
            </HeadingInstrument>
            <TextInstrument className="text-xl text-va-black/40 font-light mt-2">
              <VoiceglotText 
                translationKey="admin.studio.registrations.subtitle" 
                defaultText="Overzicht van alle deelnemers per workshop-editie" 
              />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* EDITIONS WITH PARTICIPANTS */}
      {upcomingWithParticipants.length === 0 ? (
        <BentoCard span="full" className="p-20 text-center">
          <ContainerInstrument plain className="w-20 h-20 bg-va-black/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Users strokeWidth={1.5} className="text-va-black/20" size={40} />
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black/60 mb-4">
            <VoiceglotText translationKey="admin.studio.registrations.empty.title" defaultText="Geen inschrijvingen" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] text-va-black/40 font-light">
            <VoiceglotText 
              translationKey="admin.studio.registrations.empty.text" 
              defaultText="Er zijn momenteel geen inschrijvingen voor aankomende workshops." 
            />
          </TextInstrument>
        </BentoCard>
      ) : (
        <ContainerInstrument plain className="space-y-12">
          {upcomingWithParticipants.map((edition) => (
            <BentoCard key={edition.id} span="full" className="p-12">
              {/* EDITION HEADER */}
              <ContainerInstrument plain className="flex items-start justify-between mb-12 pb-8 border-b border-black/5">
                <ContainerInstrument plain>
                  <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black mb-2">
                    {edition.workshop?.title || 'Workshop'}
                  </HeadingInstrument>
                  <ContainerInstrument plain className="flex items-center gap-6 text-[15px] text-va-black/40 font-light">
                    <ContainerInstrument plain className="flex items-center gap-2">
                      <Calendar strokeWidth={1.5} size={16} />
                      {new Date(edition.date).toLocaleDateString('nl-BE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </ContainerInstrument>
                    <ContainerInstrument plain className="flex items-center gap-2">
                      <Image src="/assets/common/branding/icons/INFO.svg" width={16} height={16} alt="" style={{ opacity: 0.4 }} />
                      {edition.location?.name || 'Locatie onbekend'}
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument plain className="text-right">
                  <TextInstrument className="text-5xl font-light tracking-tighter text-va-black">
                    {edition.participants?.length || 0}
                  </TextInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest mt-1">
                    <VoiceglotText 
                      translationKey="admin.studio.registrations.participants" 
                      defaultText="Deelnemers" 
                    />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              {/* PARTICIPANTS LIST */}
              <BentoGrid columns={2}>
                {edition.participants?.map((participant: any) => (
                  <BentoCard 
                    key={participant.id} 
                    span="sm"
                    className="p-8 bg-va-off-white hover:bg-white transition-all"
                  >
                    <ContainerInstrument plain className="space-y-4">
                      {/* NAME */}
                      <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-va-black">
                        {participant.first_name} {participant.last_name}
                      </HeadingInstrument>

                      {/* CONTACT INFO */}
                      <ContainerInstrument plain className="space-y-2">
                        {participant.email && (
                          <ContainerInstrument plain className="flex items-center gap-3">
                            <Mail strokeWidth={1.5} size={16} className="text-va-black/30" />
                            <TextInstrument className="text-[15px] text-va-black/60 font-light">
                              {participant.email}
                            </TextInstrument>
                          </ContainerInstrument>
                        )}
                        {participant.phone && (
                          <ContainerInstrument plain className="flex items-center gap-3">
                            <Phone strokeWidth={1.5} size={16} className="text-va-black/30" />
                            <TextInstrument className="text-[15px] text-va-black/60 font-light">
                              {participant.phone}
                            </TextInstrument>
                          </ContainerInstrument>
                        )}
                      </ContainerInstrument>

                      {/* META INFO */}
                      {(participant.age || participant.profession) && (
                        <ContainerInstrument plain className="pt-4 border-t border-black/5 flex gap-6 text-[15px] text-va-black/40 font-light">
                          {participant.age && (
                            <ContainerInstrument plain>
                              <VoiceglotText translationKey="common.age" defaultText="Leeftijd" />: {participant.age}
                            </ContainerInstrument>
                          )}
                          {participant.profession && (
                            <ContainerInstrument plain>
                              <VoiceglotText translationKey="common.profession" defaultText="Beroep" />: {participant.profession}
                            </ContainerInstrument>
                          )}
                        </ContainerInstrument>
                      )}

                      {/* PAYMENT STATUS */}
                      {participant.payment_status && (
                        <ContainerInstrument plain className="pt-4">
                          <ContainerInstrument 
                            plain 
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${
                              participant.payment_status === 'paid' 
                                ? 'bg-emerald-500/10 text-emerald-700' 
                                : participant.payment_status === 'pending'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-va-black/5 text-va-black/40'
                            }`}
                          >
                            {participant.payment_status === 'paid' ? 'BETAALD' : participant.payment_status === 'pending' ? 'IN AFWACHTING' : participant.payment_status}
                          </ContainerInstrument>
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>
                  </BentoCard>
                ))}
              </BentoGrid>
            </BentoCard>
          ))}
        </ContainerInstrument>
      )}
    </PageWrapperInstrument>
  );
}
