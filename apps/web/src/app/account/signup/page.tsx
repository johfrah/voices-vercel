import { ActorProfileForm } from '@/components/forms/ActorProfileForm';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { db, users, actors, actorLanguages, actorTones } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';

export default async function ActorSignupPage({ searchParams }: { searchParams: { token?: string, enrich?: string } }) {
  let initialData = null;
  let isEnrichment = searchParams.enrich === 'true';
  let error = null;

  // 🛡️ CHRIS-PROTOCOL: Enrichment Handshake (v2.28.48)
  if (searchParams.token) {
    try {
      const secret = process.env.JWT_SECRET || 'voices-secret-2026';
      const payload = verify(searchParams.token, secret) as any;
      
      if (payload.userId) {
        // Fetch existing actor data
        const actorResult = await db.select().from(actors).where(eq(actors.userId, payload.userId)).limit(1);
        const userResult = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
        
        if (actorResult.length > 0) {
          const actor = actorResult[0];
          const user = userResult[0];
          
          // Fetch relations
          const langs = await db.select().from(actorLanguages).where(eq(actorLanguages.actorId, actor.id));
          const tones = await db.select().from(actorTones).where(eq(actorTones.actorId, actor.id));

          initialData = {
            ...actor,
            email: user?.email,
            first_name: actor.firstName || user?.first_name,
            last_name: actor.lastName || user?.last_name,
            native_lang_id: actor.nativeLanguageId,
            country_id: actor.countryId,
            extra_lang_ids: langs.filter(l => !l.isNative).map(l => l.languageId),
            tone_ids: tones.map(t => t.toneId),
            is_enrichment: true,
            userId: payload.userId
          };
        }
      }
    } catch (e) {
      console.error('[Signup] Token verification failed:', e);
      error = "De uitnodigingslink is ongeldig of verlopen.";
    }
  }

  const handleSignup = async (data: any) => {
    "use server";
    console.log(' CHRIS-PROTOCOL: Processing actor data...', data);
    // Update logic will be handled in the API
  };

  if (error) {
    return (
      <PageWrapperInstrument className="min-h-screen flex items-center justify-center bg-va-off-white">
        <ContainerInstrument className="bg-white p-12 rounded-[40px] shadow-aura border border-red-100 text-center space-y-4 max-w-md">
          <AlertCircle className="text-red-500 mx-auto" size={48} />
          <HeadingInstrument level={2} className="text-2xl tracking-tighter">Oeps!</HeadingInstrument>
          <TextInstrument className="text-va-black/40">{error}</TextInstrument>
          <ButtonInstrument href="/account/signup" className="va-btn-pro !bg-va-black w-full">Nieuwe aanvraag</ButtonInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white relative overflow-hidden py-20 px-6">
      {/*  Liquid Background DNA */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <SectionInstrument className="max-w-4xl mx-auto relative z-10 space-y-12">
        <ContainerInstrument className="text-center space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10 mx-auto">
            <Sparkles strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText 
              translationKey={isEnrichment ? "enrichment.badge" : "signup.badge"} 
              defaultText={isEnrichment ? "Profiel Verrijken" : "Join the Agency"} 
            />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-7xl font-light tracking-tighter leading-[0.9]">
            <VoiceglotText 
              translationKey={isEnrichment ? "enrichment.title" : "signup.title"} 
              defaultText={isEnrichment ? "Vervolledig je Profiel" : "Word een Voices Stem"} 
            />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-lg max-w-2xl mx-auto">
            <VoiceglotText 
              translationKey={isEnrichment ? "enrichment.subtitle" : "signup.subtitle"} 
              defaultText={isEnrichment ? "Welkom terug! We hebben je profiel alvast klaargezet. Vul de ontbrekende gegevens aan voor de nieuwe 2026 standaard." : "Sluit je aan bij het meest exclusieve voice-over netwerk van de Benelux. In drie stappen staat je profiel klaar voor review."} 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ActorProfileForm 
          mode={isEnrichment ? "settings" : "signup"} 
          initialData={initialData} 
          onSave={handleSignup} 
        />

        <ContainerInstrument className="text-center pt-8">
          <TextInstrument className="text-va-black/20 text-[13px] font-light italic">
            <VoiceglotText translationKey="signup.terms_agreement" defaultText="Door je aan te melden ga je akkoord met onze algemene voorwaarden voor stemacteurs." />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
