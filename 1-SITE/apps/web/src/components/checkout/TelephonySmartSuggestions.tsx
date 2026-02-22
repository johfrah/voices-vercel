"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { MarketManager } from '@config/market-manager';
import { Check, Mail, MapPin, Clock, Sparkles, Wand2, Type, MessageSquare, Plus, ChevronUp, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { VoiceglotText } from '../ui/VoiceglotText';
import { motion } from 'framer-motion';

const TELEPHONY_TEMPLATES: Record<string, any[]> = {
  nl: [
    {
      id: 'welcome',
      title: 'Welkomstbegroeting',
      icon: MessageSquare,
      description: 'Een warm welkom voor je bellers',
      text: 'Welkom bij [Bedrijf]. Fijn dat je belt. We helpen je zo dadelijk verder.'
    },
    {
      id: 'menu',
      title: 'Keuzemenu (IVR)',
      icon: Type,
      description: 'Stuur je klanten direct naar de juiste plek',
      text: 'Welkom bij [Bedrijf]. Voor sales, druk 1. Voor support, druk 2. Voor administratie, druk 3. Blijf aan de lijn voor al je andere vragen.'
    },
    {
      id: 'hours',
      title: 'Openingsuren',
      icon: Clock,
      description: 'Wanneer ben je bereikbaar?',
      text: 'Welkom bij [Bedrijf]. We zijn telefonisch bereikbaar op [Uren]. Buiten deze uren kan je ons steeds een bericht nalaten of mailen naar [Email].'
    },
    {
      id: 'voicemail',
      title: 'Voicemail',
      icon: Mail,
      description: 'Laat een bericht achter',
      text: 'Welkom, je bent verbonden met de voicemail van [Bedrijf]. Laat je naam en nummer achter na de toon, dan bellen we je zo snel mogelijk terug.'
    },
    {
      id: 'closed',
      title: 'Buiten kantooruren',
      icon: Clock,
      description: 'Als de zaak even dicht is',
      text: 'Welkom bij [Bedrijf]. Helaas zijn we nu gesloten. Je kunt ons bereiken op [Uren]. Stuur ons gerust een mailtje op [Email].'
    }
  ],
  en: [
    {
      id: 'welcome',
      title: 'Welcome Greeting',
      icon: MessageSquare,
      description: 'A warm welcome for your callers',
      text: 'Welcome to [Bedrijf]. Thank you for calling. We will be with you shortly.'
    },
    {
      id: 'menu',
      title: 'IVR Menu',
      icon: Type,
      description: 'Direct your customers to the right place',
      text: 'Welcome to [Bedrijf]. For sales, press 1. For support, press 2. For administration, press 3. Please stay on the line for all other inquiries.'
    },
    {
      id: 'hours',
      title: 'Opening Hours',
      icon: Clock,
      description: 'When are you available?',
      text: 'Welcome to [Bedrijf]. You can reach us by phone during our office hours: [Uren]. Outside of these hours, please leave a message or email us at [Email].'
    },
    {
      id: 'voicemail',
      title: 'Voicemail',
      icon: Mail,
      description: 'Leave a message',
      text: 'Welcome, you have reached the voicemail of [Bedrijf]. Please leave your name and number after the tone, and we will get back to you as soon as possible.'
    },
    {
      id: 'closed',
      title: 'Outside Office Hours',
      icon: Clock,
      description: 'When the business is closed',
      text: 'Welcome to [Bedrijf]. We are currently closed. You can reach us during our office hours: [Uren]. Please feel free to email us at [Email].'
    }
  ],
  fr: [
    {
      id: 'welcome',
      title: 'Message d\'accueil',
      icon: MessageSquare,
      description: 'Un accueil chaleureux pour vos correspondants',
      text: 'Bienvenue chez [Bedrijf]. Merci de votre appel. Nous allons vous répondre dans un instant.'
    },
    {
      id: 'menu',
      title: 'Menu vocal (IVR)',
      icon: Type,
      description: 'Dirigez vos clients vers le bon service',
      text: 'Bienvenue chez [Bedrijf]. Pour le service commercial, tapez 1. Pour le support technique, tapez 2. Pour l\'administration, tapez 3. Veuillez patienter pour toute autre demande.'
    },
    {
      id: 'hours',
      title: 'Heures d\'ouverture',
      icon: Clock,
      description: 'Quand êtes-vous joignable ?',
      text: 'Bienvenue chez [Bedrijf]. Nous sommes joignables par téléphone pendant nos heures d\'ouverture : [Uren]. En dehors de ces heures, vous pouvez nous laisser un message ou nous envoyer un e-mail à [Email].'
    },
    {
      id: 'closed',
      title: 'En dehors des heures',
      icon: Clock,
      description: 'Quand l\'entreprise est fermée',
      text: 'Bienvenue chez [Bedrijf]. Nous sommes actuellement fermés. Vous pouvez nous joindre pendant nos heures d\'ouverture : [Uren]. N\'hésitez pas à nous envoyer un e-mail à [Email].'
    }
  ],
  de: [
    {
      id: 'welcome',
      title: 'Begrüßung',
      icon: MessageSquare,
      description: 'Ein herzliches Willkommen für Ihre Anrufer',
      text: 'Willkommen bei [Bedrijf]. Vielen Dank für Ihren Anruf. Wir sind gleich für Sie da.'
    },
    {
      id: 'hours',
      title: 'Öffnungszeiten',
      icon: Clock,
      description: 'Wann sind Sie erreichbaar?',
      text: 'Willkommen bei [Bedrijf]. Sie erreichen uns telefonisch zu unseren Geschäftszeiten: [Uren]. Außerhalb dieser Zeiten hinterlassen Sie uns bitte eine Nachricht oder senden Sie eine E-Mail an [Email].'
    },
    {
      id: 'closed',
      title: 'Außerhalb der Geschäftszeiten',
      icon: Clock,
      description: 'Wenn das Geschäft geschlossen ist',
      text: 'Willkommen bei [Bedrijf]. Wir sind derzeit geschlossen. Sie erreichen uns unter [Uren]. Bitte senden Sie uns eine E-Mail an [Email].'
    }
  ]
};

export const TelephonySmartSuggestions: React.FC<{ setLocalBriefing?: (val: string) => void, onMinimize?: () => void }> = ({ setLocalBriefing, onMinimize }) => {
  const { state, updateBriefing, updateCustomer } = useCheckout();
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState(state.customer.company || '');
  const [email, setEmail] = useState(state.customer.email || '');
  const [hours, setHours] = useState('maandag tot vrijdag van 9u tot 17u');
  const [selectedLang, setSelectedLang] = useState('nl');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const market = useMemo(() => {
    if (typeof window !== 'undefined') {
      return MarketManager.getCurrentMarket(window.location.host);
    }
    return MarketManager.getCurrentMarket('voices.be');
  }, []);

  // Sherlock: Bepaal beschikbare talen op basis van geselecteerde stemmen
  const availableLangs = useMemo(() => {
    const langs = new Set<string>(['nl']); // Altijd NL als basis
    if (state.selectedActor) {
      const actor = state.selectedActor;
      if (actor.native_lang) {
        const nativeCode = actor.native_lang.split('-')[0].toLowerCase();
        langs.add(nativeCode);
      }
      if (actor.extra_langs) {
        actor.extra_langs.split(',').forEach(l => {
          const code = l.trim().toLowerCase();
          if (code.length === 2) langs.add(code);
        });
      }
    }
    return Array.from(langs);
  }, [state.selectedActor]);

  // Effect: Zet de geselecteerde taal op de moedertaal van de acteur als die beschikbaar is
  React.useEffect(() => {
    if (state.selectedActor?.native_lang) {
      const nativeCode = state.selectedActor.native_lang.split('-')[0].toLowerCase();
      if (nativeCode !== selectedLang && availableLangs.includes(nativeCode)) {
        setSelectedLang(nativeCode);
      }
    }
  }, [state.selectedActor, availableLangs, selectedLang]);

  // Sherlock: Vertaal openingsuren op basis van geselecteerde taal
  const translatedHours = useMemo(() => {
    if (!hours) return '[Uren]';
    
    // Simpele interpretatie/vertaling voor veelvoorkomende patronen
    if (selectedLang === 'en') {
      return hours
        .replace(/maandag tot vrijdag/gi, 'Monday to Friday')
        .replace(/van/gi, 'from')
        .replace(/tot/gi, 'to')
        .replace(/u/gi, ':00');
    }
    if (selectedLang === 'fr') {
      return hours
        .replace(/maandag tot vrijdag/gi, 'du lundi au vendredi')
        .replace(/van/gi, 'de')
        .replace(/tot/gi, 'à')
        .replace(/u/gi, 'h');
    }
    if (selectedLang === 'de') {
      return hours
        .replace(/maandag tot vrijdag/gi, 'Montag bis Freitag')
        .replace(/van/gi, 'von')
        .replace(/tot/gi, 'bis')
        .replace(/u/gi, ' Uhr');
    }
    return hours;
  }, [hours, selectedLang]);

  const processedLangLabel = useMemo(() => {
    return MarketManager.getLanguageLabel(selectedLang);
  }, [selectedLang]);

  const handleApplyTemplate = (templateText: string, id: string) => {
    // BOB-METHODE: Als de gebruiker een bouwsteen kiest, stoppen we de "Slimme Hulp" (Johfrai)
    // om verwarring tussen de statische templates en de AI-suggesties te voorkomen.
    if (onMinimize) onMinimize();

    const templates = TELEPHONY_TEMPLATES[selectedLang] || TELEPHONY_TEMPLATES['en'] || [];
    const template = templates.find(t => t.id === id);
    
    if (!template) return;

    const processedText = templateText
      .replace(/\[Bedrijf\]/g, companyName || '[Bedrijfsnaam]')
      .replace(/\[Email\]/g, email || '[Email]')
      .replace(/\[Uren\]/g, translatedHours);
    
    const currentBriefing = state.briefing.trim();
    const templateTitle = template.title || 'Script';
    const processedTextWithTitle = `(${templateTitle})\n${processedText}`;
    
    const newBriefing = currentBriefing 
      ? `${currentBriefing}\n\n${processedTextWithTitle}`
      : processedTextWithTitle;
    
    if (setLocalBriefing) {
      setLocalBriefing(newBriefing);
    }
    updateBriefing(newBriefing);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderTemplatePreview = (text: string) => {
    const parts = text.split(/(\[Bedrijf\]|\[Email\]|\[Uren\])/g);
    return parts.map((part, i) => {
      if (part === '[Bedrijf]') return <span key={i} className="font-bold text-primary">{companyName || '...'}</span>;
      if (part === '[Email]') return <span key={i} className="font-bold text-primary">{email || '...'}</span>;
      if (part === '[Uren]') return <span key={i} className="font-bold text-primary">{translatedHours}</span>;
      return part;
    });
  };

  if (state.usage !== 'telefonie') return null;

  return (
    <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-aura-lg space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-va-black text-white rounded-[18px] flex items-center justify-center shadow-xl shadow-va-black/20">
              <Wand2 size={24} strokeWidth={1.5} className="text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-light tracking-tighter text-va-black leading-tight">
                <VoiceglotText translationKey="checkout.telephony.suggestions.title" defaultText="Slimme Schrijfhulp" />
              </h3>
              <p className="text-[14px] font-light text-va-black/40 tracking-tight">
                <VoiceglotText translationKey="checkout.telephony.suggestions.subtitle" defaultText="Kies een template en wij vullen de details voor je in." />
              </p>
            </div>
          </div>
          
          {/* Minimize Button for Mobile/Desktop */}
          {onMinimize && (
            <button 
              onClick={onMinimize}
              className="md:hidden w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 hover:text-primary transition-colors"
            >
              <ChevronUp size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Taalkeuze gebaseerd op stem */}
          {availableLangs.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-va-black/30 px-1">
                <VoiceglotText translationKey="checkout.telephony.suggestions.script_language" defaultText="Taal van script" />
              </span>
              <div className="flex items-center gap-1 bg-va-off-white p-1 rounded-xl border border-black/[0.03]">
                {availableLangs.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                      selectedLang === lang ? "bg-white text-primary shadow-sm" : "text-va-black/30 hover:text-va-black/60"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Minimize Button */}
          {onMinimize && (
            <button 
              onClick={onMinimize}
              className="hidden md:flex w-10 h-10 rounded-full bg-va-off-white items-center justify-center text-va-black/20 hover:text-primary transition-all hover:scale-110"
              title={t('common.minimize', "Minimaliseer")}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="space-y-2 group/input">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/20 group-focus-within/input:text-primary transition-colors">
            <MapPin size={12} strokeWidth={2.5} /> <VoiceglotText translationKey="common.company_name" defaultText="Bedrijfsnaam" />
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => { setCompanyName(e.target.value); updateCustomer({ company: e.target.value }); }}
            placeholder={t('common.placeholder.company', `Bijv. ${market.name}`)}
            className="w-full bg-va-off-white border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[15px] py-4 px-5 text-[15px] font-light transition-all outline-none"
          />
        </div>
        <div className="space-y-2 group/input">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/20 group-focus-within/input:text-primary transition-colors">
            <Mail size={12} strokeWidth={2.5} /> <VoiceglotText translationKey="common.email" defaultText="E-mail" />
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => { setEmail(e.target.value); updateCustomer({ email: e.target.value }); }}
            placeholder={t('common.placeholder.email', "info@bedrijf.be")}
            className="w-full bg-va-off-white border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[15px] py-4 px-5 text-[15px] font-light transition-all outline-none"
          />
        </div>
        <div className="space-y-2 group/input">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/20 group-focus-within/input:text-primary transition-colors">
            <Clock size={12} strokeWidth={2.5} /> <VoiceglotText translationKey="common.opening_hours" defaultText="Openingsuren" />
          </label>
          <input
            type="text"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={t('common.placeholder.hours', "ma-vrij 9u-17u")}
            className="w-full bg-va-off-white border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[15px] py-4 px-5 text-[15px] font-light transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 px-1">
          <Sparkles size={14} className="text-primary/40" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-va-black/30">
            <VoiceglotText translationKey="checkout.telephony.suggestions.available_blocks" defaultText="Beschikbare bouwstenen" />
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(TELEPHONY_TEMPLATES[selectedLang] || TELEPHONY_TEMPLATES['en'] || []).map((template) => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template.text, template.id)}
              className={cn(
                "group flex flex-col p-6 bg-va-off-white/50 hover:bg-white border-2 border-transparent hover:border-primary/20 rounded-[24px] transition-all duration-500 text-left relative overflow-hidden",
                copiedId === template.id && "ring-2 ring-primary bg-white"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <template.icon size={18} strokeWidth={1.5} className="text-va-black/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-va-black leading-none mb-1">
                      {template.title}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-va-black/30">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                  copiedId === template.id ? "bg-primary text-white scale-110" : "bg-white text-primary/20 group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  {copiedId === template.id ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.5} />}
                </div>
              </div>
              
              <div className="bg-white/50 group-hover:bg-va-off-white/30 rounded-xl p-4 transition-colors">
                <p className="text-[14px] font-light text-va-black/60 leading-relaxed line-clamp-2 italic">
                  &ldquo;{renderTemplatePreview(template.text)}&rdquo;
                </p>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t border-black/[0.03] flex items-center justify-center gap-4">
        <p className="text-[11px] font-bold text-va-black/20 tracking-[0.2em] uppercase">
          <VoiceglotText translationKey="checkout.telephony.suggestions.hint" defaultText="Klik op een bouwsteen om deze toe te voegen aan je script" />
        </p>
      </div>
    </div>
  );
};
