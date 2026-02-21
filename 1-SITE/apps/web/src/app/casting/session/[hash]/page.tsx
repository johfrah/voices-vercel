"use client";

import { CollaborativeStudio } from '@/components/ui/CollaborativeStudio';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { LucideLock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function CastingSessionPage({ params }: { params: { hash: string } }) {
  const { state } = useVoicesState();
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      if (!params.hash) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('casting_lists')
        .select(`
          *,
          casting_list_items (
            *,
            actors (*)
          )
        `)
        .eq('hash', params.hash)
        .single();

      if (error) {
        console.error(' [Casting Session] Fetch error:', error);
      }

      if (data) {
        setSessionData(data);
      }
      setLoading(false);
    };

    fetchSession();
  }, [params.hash, supabase]);

  if (loading) {
    return (
      <ContainerInstrument className="min-h-screen bg-va-off-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </ContainerInstrument>
    );
  }

  if (!sessionData) {
    return (
      <ContainerInstrument className="min-h-screen bg-va-off-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-va-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <LucideLock className="text-va-black/20" size={32} strokeWidth={1.5} />
          </div>
          <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter">
            <VoiceglotText translationKey="casting.session.not_found.title" defaultText="Sessie niet gevonden" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light leading-relaxed">
            <VoiceglotText translationKey="casting.session.not_found.text" defaultText="Deze casting sessie bestaat niet of is niet langer beschikbaar." />
          </TextInstrument>
        </div>
      </ContainerInstrument>
    );
  }

  // Map de geselecteerde stemmen naar het formaat van de CollaborativeStudio
  const auditions = sessionData.casting_list_items?.map((item: any) => ({
    id: item.id,
    actorId: item.actor_id,
    actor: {
      firstName: item.actors?.first_name || t('common.unknown', 'Onbekend'),
      photoUrl: item.actors?.photo_url || item.actors?.photoUrl
    },
    status: 'pending',
    duration: '--:--',
    auditionFileUrl: null
  })) || [];

  return (
    <CollaborativeStudio 
      mode={isAdmin ? 'production' : 'demo'} 
      auditions={auditions}
      script={sessionData.settings?.script}
      projectName={sessionData.name}
      dropboxUrl={sessionData.settings?.dropbox_url}
    />
  );
}
