'use client';

import { 
  ContainerInstrument,
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface JitsiMeetingProps {
  roomName: string;
  userName: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({ roomName, userName }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise<void>((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://meet.ffmuc.net/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadJitsiScript().then(() => {
      if (jitsiContainerRef.current && !api) {
        const domain = 'meet.ffmuc.net';
        const meetingTitle = `Kennismaking met ${userName} & Johfrah`;
        
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: true,
            disableDeepLinking: true,
            backgroundColor: '#FAFAFA',
            enableWelcomePage: false,
            enableNoisyMicDetection: false,
            disableInviteFunctions: true,
            doNotStoreRoom: true,
            enableClosePage: false,
            lobby: {
              enabled: true
            },
            toolbarButtons: ['microphone', 'camera', 'hangup', 'settings']
          },
          interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: '#FAFAFA',
            TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'settings'],
            SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
            SHOW_CHROME_EXTENSION_BANNER: false,
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            JITSI_WATERMARK_LINK: '',
            WAITING_MESSAGE: `Hé ${userName}! Johfrah laat je zo dadelijk binnen in het gesprek. Bereid je alvast voor!`,
            APP_NAME: 'Voices Studio',
            NATIVE_APP_NAME: 'Voices Studio',
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          }
        };

        const newApi = new window.JitsiMeetExternalAPI(domain, options);
        
        newApi.executeCommand('subject', meetingTitle);
        
        newApi.addEventListener('videoConferenceLeft', () => {
          router.push('/studio/bedankt-meeting');
        });

        newApi.addEventListener('videoConferenceJoined', () => {
          setLoading(false);
        });

        setApi(newApi);
      }
    });

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [roomName, userName, router, api]);

  return (
    <ContainerInstrument id="voices-meeting-container" className="relative h-[80vh] w-full bg-va-off-white rounded-[20px] overflow-hidden shadow-aura border border-va-black/5">
      <div ref={jitsiContainerRef} className="h-full w-full" />
      
      {loading && (
        <ContainerInstrument className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <ContainerInstrument className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <TextInstrument className="text-[13px] font-light tracking-widest text-va-black/60 ">
            <VoiceglotText translationKey="studio.meeting.preparing" defaultText="Meeting room voorbereiden..." />
          </TextInstrument>
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );
};
