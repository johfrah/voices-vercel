"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { Building2, Check, Copy, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VoiceglotText } from '../ui/VoiceglotText';

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
    <div className="bg-va-off-white/50 rounded-[40px] p-8 border-none shadow-none space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest">
            <VoiceglotText translationKey="checkout.telephony.suggestions.title" defaultText="Smart Suggestions" />
          </h3>
          <p className="text-[10px] font-bold text-va-black/40 uppercase tracking-wider">
            <VoiceglotText translationKey="checkout.telephony.suggestions.subtitle" defaultText="Telephony Script Assistant" />
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/30">
          <Building2 size={12} /> <VoiceglotText translationKey="checkout.telephony.company_label" defaultText="Jouw Bedrijfsnaam" />
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => handleCompanyChange(e.target.value)}
          placeholder="Bijv. Voices.be"
          className="w-full bg-white border-none rounded-xl py-4 px-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TELEPHONY_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleApplyTemplate(template.text, template.id)}
            className="group flex items-center justify-between p-4 bg-white hover:bg-primary hover:text-white rounded-xl transition-all text-left shadow-sm"
          >
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 mb-1">
                {template.title}
              </p>
              <p className="text-xs font-medium line-clamp-1 opacity-80 group-hover:opacity-100">
                {template.text.replace(/\[Bedrijf\]/g, companyName || '...') }
              </p>
            </div>
            <div className="ml-4">
              {copiedId === template.id ? (
                <Check size={16} className="text-green-500 group-hover:text-white" />
              ) : (
                <Copy size={16} className="opacity-20 group-hover:opacity-100" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-[9px] font-bold text-va-black/20 uppercase tracking-widest text-center">
        <VoiceglotText translationKey="checkout.telephony.suggestions.hint" defaultText="Klik op een suggestie om deze toe te voegen aan je script" />
      </p>
    </div>
  );
};
