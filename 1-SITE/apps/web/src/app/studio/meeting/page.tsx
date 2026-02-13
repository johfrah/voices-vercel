import React from 'react';
import { JitsiMeeting } from '@/components/studio/JitsiMeeting';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  HeadingInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export const dynamic = 'force-dynamic';

export default function MeetingPage({
  searchParams,
}: {
  searchParams: { room?: string; name?: string };
}) {
  const roomName = searchParams.room || 'VoicesStudio_General';
  const userName = searchParams.name || 'Bezoeker';

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-20 px-6">
      <SectionInstrument className="max-w-6xl mx-auto space-y-12">
        <ContainerInstrument className="text-center space-y-4">
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
            <VoiceglotText  translationKey="studio.meeting.title" defaultText="Studio Meeting" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-lg">
            <VoiceglotText  
              translationKey="studio.meeting.subtitle" 
              defaultText="Welkom in de virtuele studio. Johfrah laat je zo dadelijk binnen." 
            />
          </TextInstrument>
        </ContainerInstrument>

        <JitsiMeeting  roomName={roomName} userName={userName} />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
