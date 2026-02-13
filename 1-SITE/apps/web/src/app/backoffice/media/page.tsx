"use client";

import { MediaLibrary } from '@/components/backoffice/MediaLibrary';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function MediaPage() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreenInstrument />;

  if (!isAdmin) {
    return (
      <PageWrapperInstrument className="min-h-screen bg-va-off-white flex items-center justify-center p-6">
        <SectionInstrument className="bg-white p-12 rounded-[40px] shadow-aura text-center max-w-md space-y-6">
          <ContainerInstrument className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <Shield strokeWidth={1.5}Alert className="text-red-500" size={32} />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-2xl font-black tracking-tighter">
            <VoiceglotText translationKey="admin.access_denied.title" defaultText="Toegang Geweigerd" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium leading-relaxed">
            <VoiceglotText 
              translationKey="admin.access_denied.text" 
              defaultText="Deze sectie is uitsluitend toegankelijk voor beheer." 
            />
          </TextInstrument>
          <ButtonInstrument as="a" href="/" className="va-btn-pro inline-block">
            <VoiceglotText translationKey="common.back_to_home" defaultText="Terug" />
          </ButtonInstrument>
        </SectionInstrument>
      </PageWrapperInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 md:p-12 lg:p-20">
      <SectionInstrument className="max-w-7xl mx-auto">
        <MediaLibrary />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
