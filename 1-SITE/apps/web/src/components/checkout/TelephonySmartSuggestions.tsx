"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import React, { useEffect, useState } from 'react';
import { VoiceglotText } from '../ui/VoiceglotText';
import Image from 'next/image';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  LabelInstrument,
  InputInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';

const TELEPHONY_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Welkomstbegroeting',
    text: 'Welkom bij [Bedrijf]. Fijn dat je belt. We helpen je zo dadelijk verder.'
  },
  {
    id: 'menu',
    title: 'Keuzemenu',
    text: 'Welkom bij [Bedrijf]. Voor sales, druk 1. Voor support, druk 2. Voor administratie, druk 3. Blijf aan de lijn voor al je andere vragen.'
  },
  {
    id: 'voicemail',
    title: 'Voicemail',
    text: 'Welkom, je bent verbonden met de voicemail van [Bedrijf]. Laat je naam en nummer achter na de toon, dan bellen we je zo snel mogelijk terug.'
  },
  {
    id: 'closed',
    title: 'Buiten kantooruren',
    text: 'Welkom bij [Bedrijf]. Helaas zijn we nu gesloten. Je kunt ons bereiken van maandag tot vrijdag, tussen 9:00 en 17:00. Stuur ons gerust een mailtje op info@[bedrijf].be.'
  },
  {
    id: 'waiting',
    title: 'Wachtbericht',
    text: 'Al onze medewerkers zijn momenteel in gesprek. Een momentje geduld alsjeblieft, we helpen je zo snel mogelijk.'
  }
];

export const TelephonySmartSuggestions: React.FC = () => {
  const { state, updateBriefing, updateCustomer } = useCheckout();
  const [companyName, setCompanyName] = useState(state.customer.company || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (state.customer.company && !companyName) {
      setCompanyName(state.customer.company);
    }
  }, [state.customer.company, companyName]);

  const handleApplyTemplate = (templateText: string, id: string) => {
    const processedText = templateText
      .replace(/\[Bedrijf\]/g, companyName || '[Bedrijfsnaam]')
      .replace(/\[bedrijf\]/g, (companyName || 'bedrijf').toLowerCase().replace(/\s+/g, ''));
    
    // Append or replace? Let's append with a newline if there's already content
    const currentBriefing = state.briefing.trim();
    const newBriefing = currentBriefing 
      ? `${currentBriefing}\n\n${processedText}`
      : processedText;
    
    updateBriefing(newBriefing);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCompanyChange = (val: string) => {
    setCompanyName(val);
    updateCustomer({ company: val });
  };

  if (state.usage !== 'telefonie') return null;

  return (
    <ContainerInstrument className="bg-va-off-white/50 rounded-[20px] p-6 md:p-8 border-none shadow-none space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ContainerInstrument className="flex items-center gap-3">
        <ContainerInstrument className="w-10 h-10 bg-primary/10 rounded-[10px] flex items-center justify-center text-primary">
          <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
        </ContainerInstrument>
        <ContainerInstrument>
          <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-va-black">
            <VoiceglotText  translationKey="checkout.telephony.suggestions.title" defaultText="Smart suggestions" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] font-light text-va-black/40 tracking-wider">
            <VoiceglotText  translationKey="checkout.telephony.suggestions.subtitle" defaultText="Telephony script assistant" />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="space-y-3 md:space-y-4">
        <LabelInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/30">
          <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> <VoiceglotText  translationKey="checkout.telephony.company_label" defaultText="Jouw bedrijfsnaam" />
        </LabelInstrument>
        <InputInstrument
          type="text"
          value={companyName}
          onChange={(e: any) => handleCompanyChange(e.target.value)}
          placeholder="Bijv. Voices.be"
          className="w-full bg-white border-none rounded-[10px] py-3 px-4 md:py-4 md:px-6 text-[15px] font-light shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </ContainerInstrument>

      <ContainerInstrument className="grid grid-cols-1 gap-3">
        {TELEPHONY_TEMPLATES.map((template) => (
          <ButtonInstrument
            key={template.id}
            onClick={() => handleApplyTemplate(template.text, template.id)}
            className="group flex items-center justify-between p-3 md:p-4 bg-white hover:bg-primary hover:text-white rounded-[10px] transition-all text-left shadow-sm"
          >
            <ContainerInstrument className="flex-1">
              <TextInstrument className="text-[15px] font-light tracking-widest opacity-40 group-hover:opacity-100 mb-1">
                {template.title}
              </TextInstrument>
              <TextInstrument className="text-[15px] font-light line-clamp-1 opacity-80 group-hover:opacity-100">
                {template.text.replace(/\[Bedrijf\]/g, companyName || '...') }
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="ml-3 md:ml-4">
              {copiedId === template.id ? (
                <Image  src="/assets/common/branding/icons/INFO.svg" width={16} height={16} alt="" className="brightness-0 invert" />
              ) : (
                <Image  src="/assets/common/branding/icons/FORWARD.svg" width={16} height={16} alt="" className="opacity-20 group-hover:opacity-100" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              )}
            </ContainerInstrument>
          </ButtonInstrument>
        ))}
      </ContainerInstrument>
      
      <TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest text-center">
        <VoiceglotText  translationKey="checkout.telephony.suggestions.hint" defaultText="Klik op een suggestie om deze toe te voegen aan je script" />
      </TextInstrument>
    </ContainerInstrument>
  );
};
