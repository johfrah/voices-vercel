"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument,
  LabelInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { VoiceglotImage } from "@/components/ui/VoiceglotImage";
import { useEditMode } from "@/contexts/EditModeContext";
import { Mic, Phone, Zap, ShieldCheck, ArrowRight, Globe, Clock, CheckCircle2, Loader2, Play, Sparkles, Building2, Check, Copy, Music, ChevronDown, ChevronUp, Plus, Share2, Mail, User, MessageSquare, Download, Lock, Sliders, X, Calendar, Clock4, Info } from "lucide-react";
import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { SmartDemoExplorer } from "@/components/johfrai/SmartDemoExplorer";
import { getActors, getMusicLibrary } from "@/lib/api";
import { PricingEngine, PlanType } from "@/lib/pricing-engine";
import { useCheckout } from "@/contexts/CheckoutContext";
import { LiveMixerInstrument } from "@/components/johfrai/LiveMixerInstrument";

const TELEPHONY_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Welkomstbegroeting',
    text: '(Welkomstbegroeting)\nWelkom bij {Bedrijfsnaam}. Fijn dat je belt. We helpen je zo dadelijk verder.'
  },
  {
    id: 'menu',
    title: 'Keuzemenu (IVR)',
    text: '(Keuzemenu)\nWelkom bij {Bedrijfsnaam}. Voor sales, druk 1. Voor support, druk 2. Voor administratie, druk 3. Blijf aan de lijn voor al je andere vragen.'
  },
  {
    id: 'waiting',
    title: 'Wachtbericht',
    text: '(Wachtbericht)\nAl onze medewerkers zijn momenteel in gesprek. Een momentje geduld alsjeblieft, we helpen je zo snel mogelijk.'
  },
  {
    id: 'closed',
    title: 'Gesloten Bericht',
    text: '(Gesloten Bericht)\nWelkom bij {Bedrijfsnaam}. Helaas zijn we nu gesloten. We zijn telefonisch bereikbaar op {Openingsuren}. Je kunt ons ook mailen op {Emailadres}.'
  },
  {
    id: 'holiday',
    title: 'Vakantiebericht',
    text: '(Vakantiebericht)\nWelkom bij {Bedrijfsnaam}. In verband met de vakantieperiode zijn wij gesloten van {Vakantie_Van} tot en met {Vakantie_Tot}. Vanaf {Vakantie_Terug} staan we weer voor je klaar.'
  },
  {
    id: 'feestdag',
    title: 'Feestdag',
    text: '(Feestdag)\nPrettige feestdagen van het hele team van {Bedrijfsnaam}! Let op: we zijn vandaag gesloten. Morgen staan we weer voor je klaar vanaf {Openingsuren}.'
  },
  {
    id: 'voicemail',
    title: 'Voicemail',
    text: '(Voicemail)\nWelkom, je bent verbonden met de voicemail van {Bedrijfsnaam}. Laat je naam en nummer achter na de toon, dan bellen we je zo snel mogelijk terug.'
  },
  {
    id: 'service',
    title: 'Service Bericht',
    text: '(Service Bericht)\nOp dit moment ervaren wij een technische storing. Onze excuses voor het ongemak. We werken aan een oplossing en hopen snel weer bereikbaar te zijn.'
  },
  {
    id: 'info',
    title: 'Informatief',
    text: '(Informatief)\nWist u dat u veel zaken ook direct online kunt regelen? Bezoek onze website op {Website} voor meer informatie en antwoorden op veelgestelde vragen.'
  },
  {
    id: 'callback',
    title: 'Call-back',
    text: '(Call-back)\nHet is momenteel erg druk. Laat uw telefoonnummer achter na de piep, dan belt een van onze medewerkers u binnen 30 minuten terug.'
  }
];

function JohfraiContent() {
  const { 
    state: checkoutState,
    updateUsage, 
    updatePlan, 
    updateBriefing, 
    updateMusic,
    setStep 
  } = useCheckout();
  const { canEdit: isAdmin } = useEditMode();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'editor' | 'explorer'>('editor');
  const [text, setText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // 🏢 EXTENDED CONTEXT STATE
  const [openingHours, setOpeningHours] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [holidayFrom, setHolidayFrom] = useState("");
  const [holidayTo, setHolidayTo] = useState("");
  const [holidayBack, setHolidayBack] = useState("");
  const [website, setWebsite] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [price, setPrice] = useState(0);
  const [pricingConfig, setPricingConfig] = useState<Record<string, any>>(PricingEngine.getDefaultConfig());
  const [wordCount, setWordCount] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [promptCount, setPromptCount] = useState(1);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [detectedLanguages, setDetectedLanguages] = useState<string[]>([]);
  const [isMultilingual, setIsMultilingual] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasUsedFreePreview, setHasUsedFreePreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [audioMode, setAudioMode] = useState<'hd' | 'telephony'>('hd');
  const [deliveryMethod, setDeliveryMethod] = useState<'download' | 'whatsapp' | 'email'>('download');
  
  // 🔮 PREDICTIVE STATE
  const [suggestion, setSuggestion] = useState("");
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ SECURE AUDIO STATE
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // 🎚️ LIVE MIXER STATE
  const [generatedSegments, setGeneratedSegments] = useState<{ id: string, title: string, voiceUrl: string, musicUrl?: string | null }[]>([]);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);

  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [isMusicLoading, setIsMusicLoading] = useState(true);

  useEffect(() => {
    async function loadMusic() {
      try {
        const data = await getMusicLibrary();
        setMusicTracks(data);
      } catch (err) {
        console.error('Failed to load music library:', err);
      } finally {
        setIsMusicLoading(false);
      }
    }
    loadMusic();
  }, []);

  // 🔮 PREDICTIVE LOGIC
  const fetchSuggestion = useCallback(async (currentText: string) => {
    if (!currentText || currentText.length < 5 || currentText.endsWith(' ')) {
      setSuggestion("");
      return;
    }

    try {
      setIsFetchingSuggestion(true);
      const response = await fetch('/api/johfrai/predictive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentText, 
          companyName, 
          context: 'telefooncentrale',
          extraContext: {
            openingHours,
            supportEmail,
            holidayFrom,
            holidayTo,
            holidayBack,
            website
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestion(data.suggestion || "");
      }
    } catch (e) {
      console.error("Predictive fetch failed", e);
    } finally {
      setIsFetchingSuggestion(false);
    }
  }, [companyName, openingHours, supportEmail, holidayFrom, holidayTo, holidayBack, website]);

  useEffect(() => {
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    
    if (text && text.length > 5) {
      suggestionTimeoutRef.current = setTimeout(() => {
        fetchSuggestion(text);
      }, 1000); // 1s debounce for predictive
    } else {
      setSuggestion("");
    }

    return () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, [text, fetchSuggestion]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setText(prev => prev + suggestion);
      setSuggestion("");
    }
  };

  // 🗣️ PRONUNCIATION AUTOMATION
  const handleOptimizePronunciation = async () => {
    if (!text || text.length < 5) return;
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/johfrai/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context: 'telefooncentrale' })
      });
      if (response.ok) {
        const data = await response.json();
        setText(data.optimizedText);
        setDetectedLanguages(data.detectedLanguages || []);
        setIsMultilingual(data.isMultilingual || false);
      }
    } catch (e) {
      console.error("Optimization failed", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleTranslate = async (targetLangs: string[]) => {
    if (!text || text.length < 5) return;
    setIsTranslating(true);
    try {
      const response = await fetch('/api/johfrai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLangs })
      });
      if (response.ok) {
        const data = await response.json();
        let translatedContent = text;
        Object.values(data.translations).forEach((translation: any) => {
          translatedContent += `\n\n${translation}`;
        });
        setText(translatedContent);
      }
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  // 🔗 SHARE LINK LOGIC: Load from URL
  useEffect(() => {
    const sharedText = searchParams.get('s');
    const sharedCompany = searchParams.get('c');
    const sharedMusic = searchParams.get('m');
    
    if (sharedText) {
      try {
        const decodedText = atob(sharedText);
        setText(decodedText);
      } catch (e) {
        console.error("Failed to decode shared text", e);
      }
    }
    if (sharedCompany) setCompanyName(sharedCompany);
    if (sharedMusic) {
      updateMusic({ trackId: sharedMusic, asBackground: true });
    }
  }, [searchParams, updateMusic]);

  // 💾 PERSISTENCE
  useEffect(() => {
    if (!searchParams.get('s')) {
      const savedText = localStorage.getItem('johfrai_draft_text');
      const savedCompany = localStorage.getItem('johfrai_draft_company');
      const savedEmail = localStorage.getItem('johfrai_draft_email');
      const savedPhone = localStorage.getItem('johfrai_draft_phone');
      const savedHours = localStorage.getItem('johfrai_draft_hours');
      const savedSupportEmail = localStorage.getItem('johfrai_draft_support_email');
      const savedWebsite = localStorage.getItem('johfrai_draft_website');
      
      if (savedText) setText(savedText);
      if (savedCompany) setCompanyName(savedCompany);
      if (localStorage.getItem('johfrai_draft_firstname')) setFirstName(localStorage.getItem('johfrai_draft_firstname')!);
      if (localStorage.getItem('johfrai_draft_lastname')) setLastName(localStorage.getItem('johfrai_draft_lastname')!);
      if (savedEmail) setEmail(savedEmail);
      if (localStorage.getItem('johfrai_draft_agreed') === 'true') setAgreedToTerms(true);
      if (savedPhone) setPhoneNumber(savedPhone);
      if (savedHours) setOpeningHours(savedHours);
      if (savedSupportEmail) setSupportEmail(savedSupportEmail);
      if (savedWebsite) setWebsite(savedWebsite);
    }
  }, [searchParams]);

  useEffect(() => {
    if (text) localStorage.setItem('johfrai_draft_text', text);
    if (companyName) localStorage.setItem('johfrai_draft_company', companyName);
    if (firstName) localStorage.setItem('johfrai_draft_firstname', firstName);
    if (lastName) localStorage.setItem('johfrai_draft_lastname', lastName);
    if (email) localStorage.setItem('johfrai_draft_email', email);
    if (phoneNumber) localStorage.setItem('johfrai_draft_phone', phoneNumber);
    if (agreedToTerms) localStorage.setItem('johfrai_draft_agreed', 'true');
    else localStorage.removeItem('johfrai_draft_agreed');
    if (openingHours) localStorage.setItem('johfrai_draft_hours', openingHours);
    if (supportEmail) localStorage.setItem('johfrai_draft_support_email', supportEmail);
    if (website) localStorage.setItem('johfrai_draft_website', website);
  }, [text, companyName, firstName, lastName, email, phoneNumber, agreedToTerms, openingHours, supportEmail, website]);

  const captureLead = async () => {
    if (!email || !email.includes('@')) return;
    try {
      const withMusic = checkoutState.music.asBackground || checkoutState.music.asHoldMusic;
      await fetch('/api/mailbox/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          intent: 'johfrai_configurator',
          context: { 
            text, 
            companyName, 
            firstName,
            lastName,
            wordCount, 
            estimatedDuration, 
            withMusic, 
            phoneNumber, 
            deliveryMethod,
            agreedToTerms
          }
        })
      });
    } catch (e) {
      console.error("Lead capture failed", e);
    }
  };

  const handleShare = () => {
    setIsSharing(true);
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedText = btoa(text);
    const params = new URLSearchParams();
    params.append('s', encodedText);
    if (companyName) params.append('c', companyName);
    const withMusic = checkoutState.music.asBackground || checkoutState.music.asHoldMusic;
    if (withMusic) params.append('m', checkoutState.music.trackId || '');
    const shareUrl = `${baseUrl}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => { setShareSuccess(false); setIsSharing(false); }, 2000);
    });
    captureLead();
  };

  useEffect(() => {
    const used = localStorage.getItem('johfrai_free_preview_used') === 'true';
    setHasUsedFreePreview(used);
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/pricing/config');
        if (response.ok) {
          const config = await response.json();
          setPricingConfig(config);
        }
      } catch (e) {
        console.error("Failed to fetch pricing config", e);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const promptMatches = text.match(/\((.*?)\)/g) || [];
    const detectedPrompts = Math.max(1, promptMatches.length);
    setPromptCount(detectedPrompts);
    const cleanText = text.replace(/\((.*?)\)/g, '').replace(/\{.*?\}/g, '');
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    const duration = Math.ceil(words / 2.33);
    setEstimatedDuration(duration);
    const result = PricingEngine.calculatePrice(
      { first_name: 'johfrah', ai_enabled: true },
      { usage: 'telefonie', words, prompts: detectedPrompts, musicMix: checkoutState.music.asBackground || checkoutState.music.asHoldMusic },
      pricingConfig
    );
    const targetPrice = result.price;
    if (price !== targetPrice) {
      const diff = targetPrice - price;
      const step = diff / 10;
      const timer = setTimeout(() => setPrice(prev => +(prev + step).toFixed(2)), 50);
      return () => clearTimeout(timer);
    }
  }, [text, checkoutState.music.asBackground, checkoutState.music.asHoldMusic, pricingConfig, price]);

  const isFreePreview = !isAdmin && wordCount > 0 && wordCount <= 20 && !hasUsedFreePreview;
  const showWatermark = !isAdmin && wordCount > 20;

  const handlePreview = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!text || text.length < 3) return;
    
    if (!isAdmin && wordCount <= 25 && !hasUsedFreePreview) {
      if (!email || !firstName || !lastName || !companyName) {
        toast.error("Vul eerst je naam, bedrijf en e-mailadres in voor je gratis proevertje.");
        return;
      }
      if (!agreedToTerms) {
        toast.error("Ga akkoord met de voorwaarden om je gratis proevertje te ontvangen.");
        return;
      }
    }

    captureLead();
    setIsGenerating(true);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const segments = text.split(/\((.*?)\)/g).filter(Boolean);
      const parsedSegments: { title: string, text: string }[] = [];
      
      let currentTitle = "Preview";
      for (let i = 0; i < segments.length; i++) {
        const part = segments[i].trim();
        if (i % 2 === 0) {
          if (part) {
            parsedSegments.push({ title: currentTitle, text: part });
          }
        } else {
          currentTitle = part;
        }
      }

      const currentMusicUrl = (checkoutState.music.asBackground || checkoutState.music.asHoldMusic) ? musicTracks.find(t => t.id === checkoutState.music.trackId)?.preview : null;

      const newGeneratedSegments = [];
      for (const segment of parsedSegments) {
        const response = await fetch('/api/tts/johfrai', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Johfrai-Subscription': 'false' 
          },
          body: JSON.stringify({ 
            text: segment.text, 
            watermark: showWatermark, 
            audioMode,
            email,
            firstName,
            lastName,
            companyName,
            phone: phoneNumber,
            agreedToTerms,
            visitorHash: localStorage.getItem('voices_visitor_hash')
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const voiceUrl = URL.createObjectURL(blob);
          
          const status = response.headers.get('X-Johfrai-Status');
          if (status === 'watermarked' && !showWatermark) {
            toast.success("Je hebt je gratis proevertje al gebruikt. Deze versie bevat een watermerk.");
          }

          newGeneratedSegments.push({
            id: Math.random().toString(36).substr(2, 9),
            title: segment.title,
            voiceUrl,
            musicUrl: currentMusicUrl
          });
        }
      }

      setGeneratedSegments(newGeneratedSegments);

      if (isFreePreview && !isAdmin) {
        localStorage.setItem('johfrai_free_preview_used', 'true');
        setHasUsedFreePreview(true);
      }
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTemplate = (id: string) => {
    setSelectedTemplates(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const addSelectedTemplates = () => {
    const templatesToAdd = TELEPHONY_TEMPLATES
      .filter(t => selectedTemplates.includes(t.id))
      .map(t => {
        let processedText = t.text;
        processedText = processedText.replace(/\{Bedrijfsnaam\}/g, companyName || '{Bedrijfsnaam}');
        processedText = processedText.replace(/\{Openingsuren\}/g, openingHours || '{Openingsuren}');
        processedText = processedText.replace(/\{Emailadres\}/g, supportEmail || '{Emailadres}');
        processedText = processedText.replace(/\{Vakantie_Van\}/g, holidayFrom || '{Vakantie_Van}');
        processedText = processedText.replace(/\{Vakantie_Tot\}/g, holidayTo || '{Vakantie_Tot}');
        processedText = processedText.replace(/\{Vakantie_Terug\}/g, holidayBack || '{Vakantie_Terug}');
        processedText = processedText.replace(/\{Website\}/g, website || '{Website}');
        return processedText;
      })
      .join('\n\n');
    setText(prev => prev ? `${prev}\n\n${templatesToAdd}` : templatesToAdd);
    setSelectedTemplates([]);
    setShowTemplates(false);
  };

  const renderStyledText = () => {
    if (!text) return null;
    const parts = text.split(/(\(.*?\))|(\{.*?\})/g);
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <TextInstrument as="span" key={i} className="inline-block bg-va-black text-white text-[15px] font-black tracking-widest px-3 py-1 rounded-[20px] mt-6 mb-2 first:mt-0 shadow-lg">
            {part.slice(1, -1)}
          </TextInstrument>
        );
      }
      if (part.startsWith('{') && part.endsWith('}')) {
        return (
          <TextInstrument as="span" key={i} className="inline-block bg-primary/10 text-primary text-[15px] font-black tracking-widest px-2 py-0.5 rounded-md border border-primary/20 mx-1">
            {part.slice(1, -1)}
          </TextInstrument>
        );
      }
      return <TextInstrument as="span" key={i} className="block whitespace-pre-wrap font-light">{part}</TextInstrument>;
    });
  };

  const handleCheckout = (planId: PlanType) => {
    updateUsage('subscription');
    updatePlan(planId);
    updateBriefing(text);
    setStep('details');
    
    setTimeout(() => {
      router.push(`/checkout?usage=subscription&plan=${planId}`);
    }, 100);
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white">
      <SectionInstrument className="relative pt-32 pb-12 overflow-hidden">
        <ContainerInstrument className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/20">
            <Zap strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText strokeWidth={1.5} translationKey="johfrai.badge" defaultText="AI Voice Clone" / />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-7xl md:text-9xl font-black leading-[0.85] tracking-tighter">
            JOHFRAI<TextInstrument as="span" className="text-primary font-light">.</TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-xl md:text-2xl font-medium text-va-black/60 leading-tight max-w-2xl mx-auto">
            <VoiceglotText strokeWidth={1.5} translationKey="johfrai.hero.subtitle" defaultText="Je stem, maar dan sneller. Krijg de iconische stem van Johfrah voor je IVR en video, 24/7 beschikbaar." / />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="pb-20">
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* BASIC */}
            <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm flex flex-col space-y-6 relative overflow-hidden group hover:border-primary/20 transition-all">
              <ContainerInstrument className="space-y-2">
                <HeadingInstrument level={3} className="text-[15px] tracking-widest text-va-black/40 font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.title" defaultText="Basic" / />
                </HeadingInstrument>
                <TextInstrument className="text-4xl font-black">€19<TextInstrument as="span" className="text-[15px] font-medium text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="auto.page._maand.e3e6b0" defaultText="/maand" / /></TextInstrument></TextInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.contract" defaultText="12 maanden contract" / />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument as="ul" className="space-y-3 flex-1">
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.feat1" defaultText="500 woorden / maand" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.feat2" defaultText="Jaarbudget (6.000 w.)" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.feat3" defaultText="Vlaams (NL-BE)" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium text-va-black/30"><X strokeWidth={1.5} size={14} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.feat4" defaultText="Geen FR/EN" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.feat5" defaultText="Telefonie (8kHz)" / /></ContainerInstrument>
              </ContainerInstrument>
              <ButtonInstrument 
                onClick={() => handleCheckout('basic')}
                className="va-btn-secondary w-full"
              >
                <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.basic.cta" defaultText="Kies Basic" / />
              </ButtonInstrument>
            </ContainerInstrument>

            {/* PRO */}
            <ContainerInstrument className="bg-va-black rounded-[40px] p-8 border-4 border-primary shadow-2xl flex flex-col space-y-6 relative overflow-hidden transform md:scale-105 z-10">
              <ContainerInstrument className="absolute top-4 right-4 bg-primary text-white text-[15px] font-black tracking-widest px-3 py-1 rounded-full animate-pulse">
                <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.badge" defaultText="Beste Keuze" / />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <HeadingInstrument level={3} className="text-[15px] tracking-widest text-white/40 font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.title" defaultText="Pro" / />
                </HeadingInstrument>
                <TextInstrument className="text-4xl font-black text-white">€39<TextInstrument as="span" className="text-[15px] font-medium text-white/40"><VoiceglotText strokeWidth={1.5} translationKey="auto.page._maand.e3e6b0" defaultText="/maand" / /></TextInstrument></TextInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-white/30 font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.contract" defaultText="12 maanden contract" / />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument as="ul" className="space-y-3 flex-1 text-white">
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><Zap strokeWidth={1.5} size={14} className="text-primary" fill="currentColor" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.feat1" defaultText="1.500 woorden / maand" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-primary" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.feat2" defaultText="Jaarbudget (18.000 w.)" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-primary" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.feat3" defaultText="Vlaams + FR + EN" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-primary" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.feat4" defaultText="Muziekmix inbegrepen" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-primary" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.feat5" defaultText="HD Video (48kHz)" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><ShieldCheck strokeWidth={1.5} size={14} className="text-primary" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.feat6" defaultText="1× per kwartaal Menselijke Fix" / /></ContainerInstrument>
              </ContainerInstrument>
              <ButtonInstrument 
                onClick={() => handleCheckout('pro')}
                className="va-btn-pro w-full !bg-primary"
              >
                <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.pro.cta" defaultText="Kies Pro" / />
              </ButtonInstrument>
            </ContainerInstrument>

            {/* STUDIO */}
            <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm flex flex-col space-y-6 relative overflow-hidden group hover:border-primary/20 transition-all">
              <ContainerInstrument className="space-y-2">
                <HeadingInstrument level={3} className="text-[15px] tracking-widest text-va-black/40 font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.title" defaultText="Studio" / />
                </HeadingInstrument>
                <TextInstrument className="text-4xl font-black">€99<TextInstrument as="span" className="text-[15px] font-medium text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="auto.page._maand.e3e6b0" defaultText="/maand" / /></TextInstrument></TextInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.contract" defaultText="12 maanden contract" / />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument as="ul" className="space-y-3 flex-1">
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.feat1" defaultText="5.000 woorden / maand" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.feat2" defaultText="Jaarbudget (60.000 w.)" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.feat3" defaultText="Volume/Agency gebruik" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.feat4" defaultText="Custom Dictionary (Studio)" / /></ContainerInstrument>
                <ContainerInstrument as="li" className="flex items-center gap-2 text-[15px] font-medium"><ShieldCheck strokeWidth={1.5} size={14} className="text-green-500" /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.feat5" defaultText="1× per maand Menselijke Fix" / /></ContainerInstrument>
              </ContainerInstrument>
              <ButtonInstrument 
                onClick={() => handleCheckout('studio')}
                className="va-btn-secondary w-full"
              >
                <VoiceglotText strokeWidth={1.5} translationKey="johfrai.pricing.studio.cta" defaultText="Kies Studio" / />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="mt-12 text-center">
            <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-va-black/20"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.geen_paid_ads__geen_.7a223d" defaultText="Geen paid ads, geen radio/TV, geen commercials in deze plannen." / /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="pb-32 px-6">
        <ContainerInstrument className="max-w-4xl mx-auto space-y-6">
          <ContainerInstrument className="flex justify-center mb-8">
            <ContainerInstrument className="bg-white p-1.5 rounded-[24px] shadow-sm border border-black/5 flex gap-1">
              <ButtonInstrument onClick={() => setActiveTab('editor')} className={cn("px-8 py-3 rounded-[20px] text-[15px] font-black uppercase tracking-widest transition-all", activeTab === 'editor' ? "bg-va-black text-white shadow-lg" : "text-va-black/40 hover:text-va-black")}><VoiceglotText strokeWidth={1.5} translationKey="johfrai.tabs.editor" defaultText="Schrijf je script" / /></ButtonInstrument>
              <ButtonInstrument onClick={() => setActiveTab('explorer')} className={cn("px-8 py-3 rounded-[20px] text-[15px] font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'explorer' ? "bg-va-black text-white shadow-lg" : "text-va-black/40 hover:text-va-black")}><Sparkles strokeWidth={1.5} size={12} /><VoiceglotText strokeWidth={1.5} translationKey="johfrai.tabs.explorer" defaultText="Ontdek voorbeelden" / /></ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white rounded-[48px] shadow-aura overflow-hidden border border-black/5 p-8 md:p-12">
            <AnimatePresence strokeWidth={1.5} mode="wait">
              {activeTab === 'editor' ? (
                <motion.div key="editor" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                  <ContainerInstrument className="relative group">
                    <ContainerInstrument className="absolute -top-12 left-0 right-0 flex flex-col md:flex-row justify-between items-center gap-4">
                      <ContainerInstrument className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                        <ContainerInstrument className="relative">
                          <User strokeWidth={1.5} size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20" />
                          <InputInstrument type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Voornaam" className="!py-2 !pl-8 !pr-3 !text-[15px] !font-bold w-full shadow-sm" />
                        </ContainerInstrument>
                        <ContainerInstrument className="relative">
                          <User strokeWidth={1.5} size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20" />
                          <InputInstrument type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Achternaam" className="!py-2 !pl-8 !pr-3 !text-[15px] !font-bold w-full shadow-sm" />
                        </ContainerInstrument>
                        <ContainerInstrument className="relative">
                          <Building2 strokeWidth={1.5} size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20" />
                          <InputInstrument type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Bedrijf" className="!py-2 !pl-8 !pr-3 !text-[15px] !font-bold w-full shadow-sm" />
                        </ContainerInstrument>
                        <ContainerInstrument className="relative">
                          <Mail strokeWidth={1.5} size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20" />
                          <InputInstrument type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="!py-2 !pl-8 !pr-3 !text-[15px] !font-bold w-full shadow-sm" />
                        </ContainerInstrument>
                      </ContainerInstrument>
                      <ButtonInstrument onClick={handleShare} disabled={isSharing || !text} className={cn("va-btn-nav !px-6 !py-2 !shadow-sm shrink-0", shareSuccess ? "bg-green-500 text-white" : "")}>
                        {shareSuccess ? <Check strokeWidth={1.5} size={14} /> : <Share2 strokeWidth={1.5} size={14} / />}
                        {shareSuccess ? <VoiceglotText strokeWidth={1.5} translationKey="common.copied" defaultText="Gekopieerd!" / /> : <VoiceglotText strokeWidth={1.5} translationKey="common.share_link" defaultText="Deel link" / />}
                      </ButtonInstrument>
                    </ContainerInstrument>

                    {!isAdmin && !hasUsedFreePreview && (
                      <ContainerInstrument className="absolute -bottom-16 left-0 right-0 flex justify-center">
                        <LabelInstrument className="flex items-start gap-3 cursor-pointer group max-w-xl text-left">
                          <ContainerInstrument className="relative flex items-center mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={agreedToTerms} 
                              onChange={(e) => setAgreedToTerms(e.target.checked)}
                              className="peer appearance-none w-4 h-4 rounded border-2 border-va-black/10 checked:bg-primary checked:border-primary transition-all cursor-pointer" 
                            />
                            <Check strokeWidth={1.5} size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                          </ContainerInstrument>
                          <TextInstrument as="span" className="text-[15px] font-bold text-va-black/40 leading-tight group-hover:text-va-black/60 transition-colors">
                            Ik ga akkoord met de <TextInstrument as="span" className="underline decoration-primary/30 font-light"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.gebruiksvoorwaarden.64c290" defaultText="gebruiksvoorwaarden" / /></TextInstrument><VoiceglotText strokeWidth={1.5} translationKey="auto.page.__deze_audio_is_uits.364912" defaultText=": deze audio is uitsluitend voor eigen gebruik op mijn telefooncentrale (geen doorverkoop) en ik ontvang graag updates over mijn bestelling en relevante tips." / /></TextInstrument>
                        </LabelInstrument>
                      </ContainerInstrument>
                    )}

                    <ContainerInstrument className="absolute inset-0 p-8 text-xl md:text-2xl font-medium pointer-events-none overflow-hidden text-transparent">
                      {renderStyledText()}
                      {suggestion && (
                        <TextInstrument as="span" className="text-va-black/20 italic font-light">
                          {suggestion}
                          <TextInstrument as="span" className="ml-2 bg-va-black/5 text-[15px] px-1.5 py-0.5 rounded tracking-widest font-black text-va-black/30">Tab</TextInstrument>
                        </TextInstrument>
                      )}
                    </ContainerInstrument>
                    
                    <textarea 
                      ref={textareaRef}
                      value={text} 
                      onChange={(e) => setText(e.target.value)} 
                      onKeyDown={handleKeyDown}
                      placeholder="Typ hier je welkomstboodschap... Gebruik (Titel) voor meerdere bestanden." 
                      className="w-full bg-va-off-white/30 border-2 border-transparent focus:border-primary/20 rounded-[32px] p-8 pb-32 text-xl md:text-2xl font-medium min-h-[450px] outline-none transition-all placeholder:text-va-black/30 text-va-black resize-none relative z-10 caret-primary" 
                    />
                    
                    <ContainerInstrument className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 pointer-events-none z-30">
                        <ContainerInstrument className="flex justify-center pointer-events-auto">
                          <ButtonInstrument type="button" onClick={(e) => handlePreview(e)} disabled={isGenerating || text.length < 3} className={cn("px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[15px] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95", isGenerating || text.length < 3 ? "bg-va-black/10 text-va-black/20 cursor-not-allowed shadow-none" : "bg-primary text-white hover:bg-va-black hover:scale-[1.05] ring-4 ring-white")}>
                            {isGenerating ? (
                              <>
                                <Loader2 strokeWidth={1.5} size={16} className="animate-spin text-white" / /> 
                                <VoiceglotText strokeWidth={1.5} translationKey="common.processing" defaultText="Bezig..." / />
                              </>
                            ) : (
                              <>
                                <Play strokeWidth={1.5} size={16} fill="currentColor" / /> 
                                {isAdmin ? (
                                  <VoiceglotText strokeWidth={1.5} translationKey="admin.preview" defaultText="Admin Preview" / />
                                ) : (
                                  wordCount <= 20 ? (
                                    <VoiceglotText strokeWidth={1.5} translationKey="johfrai.preview.free" defaultText="Gratis Proevertje (Clean)" / />
                                  ) : (
                                    <VoiceglotText strokeWidth={1.5} translationKey="johfrai.preview.watermark" defaultText="Beluister met Watermerk" / />
                                  )
                                )}
                              </>
                            )}
                          </ButtonInstrument>
                        </ContainerInstrument>

                      <ContainerInstrument className="flex justify-between items-center">
                        <ContainerInstrument className="flex gap-2 pointer-events-auto items-center">
                          <ContainerInstrument className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/5">
                            <ContainerInstrument className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-va-black/60">{wordCount} <VoiceglotText strokeWidth={1.5} translationKey="johfrai.metrics.words" defaultText="woorden" / /></TextInstrument>
                          </ContainerInstrument>
                          
                          <ContainerInstrument className="flex gap-1">
                            {detectedLanguages.map(lang => (
                              <ContainerInstrument key={lang} className="px-2 py-1 bg-va-black text-white text-[15px] font-black rounded-md shadow-sm">
                                {lang}
                              </ContainerInstrument>
                            ))}
                          </ContainerInstrument>

                          <ButtonInstrument onClick={handleOptimizePronunciation} disabled={isOptimizing || !text} className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/5 hover:bg-primary hover:text-white transition-all group/opt">
                            {isOptimizing ? <Loader2 strokeWidth={1.5} size={10} className="animate-spin" / /> : <Sparkles strokeWidth={1.5} size={10} className="text-primary group-hover/opt:text-white" />}
                            <TextInstrument as="span" className="text-[15px] font-black tracking-widest">
                              {isOptimizing ? '...' : <VoiceglotText strokeWidth={1.5} translationKey="common.improve" defaultText="Verbeter" / />}
                            </TextInstrument>
                          </ButtonInstrument>

                          <ContainerInstrument className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-black/5">
                            <Globe strokeWidth={1.5} size={10} className="text-va-black/40 mr-1" />
                            {['fr', 'en', 'de'].map(lang => (
                              <ButtonInstrument
                                key={lang}
                                onClick={() => handleTranslate([lang])}
                                disabled={isTranslating || detectedLanguages.includes(lang)}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[15px] font-black uppercase transition-all",
                                  detectedLanguages.includes(lang) ? "bg-green-500 text-white" : "bg-va-black/5 text-va-black/40 hover:bg-primary hover:text-white"
                                )}
                              >
                                +{lang}
                              </ButtonInstrument>
                            ))}
                          </ContainerInstrument>

                          <ContainerInstrument className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/5">
                            <Clock strokeWidth={1.5} size={10} className="text-va-black/40" / />
                            <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-va-black/60">± {estimatedDuration}s</TextInstrument>
                          </ContainerInstrument>
                        </ContainerInstrument>
                        <ContainerInstrument className="flex items-center gap-1.5 bg-va-black/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
                          <ContainerInstrument className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-white">{promptCount} {promptCount === 1 ? <VoiceglotText strokeWidth={1.5} translationKey="johfrai.metrics.file" defaultText="file" / /> : <VoiceglotText strokeWidth={1.5} translationKey="johfrai.metrics.files" defaultText="files" / />}</TextInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {/* 🎚️ LIVE MIXER RESULTS */}
                  <AnimatePresence>
                    {generatedSegments.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                        <ContainerInstrument className="flex items-center justify-between">
                          <HeadingInstrument level={3} className="text-[15px] font-black tracking-widest text-va-black/40 flex items-center gap-2"><Sliders strokeWidth={1.5} size={14} / /><VoiceglotText strokeWidth={1.5} translationKey="auto.page.jouw_audio_mixes.b5bdf5" defaultText="Jouw Audio Mixes" / /></HeadingInstrument>
                          <ButtonInstrument onClick={() => setGeneratedSegments([])} className="text-[15px] font-bold tracking-widest text-va-black/20 hover:text-red-500 transition-colors">Alles wissen</ButtonInstrument>
                        </ContainerInstrument>
                        <ContainerInstrument className="grid grid-cols-1 gap-4">
                          {generatedSegments.map((segment) => (
                            <LiveMixerInstrument key={segment.id} title={segment.title} voiceUrl={segment.voiceUrl} musicUrl={segment.musicUrl} onRemove={() => setGeneratedSegments(prev => prev.filter(s => s.id !== segment.id))} />
                          ))}
                        </ContainerInstrument>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <ContainerInstrument className="space-y-4">
                    <ButtonInstrument onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-2 text-[15px] font-black tracking-[0.2em] text-primary hover:text-va-black transition-colors outline-none"><Sparkles strokeWidth={1.5} size={14} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.editor.suggestions" defaultText="Slimme Suggesties" / />{showTemplates ? <ChevronUp strokeWidth={1.5} size={14} / /> : <ChevronDown strokeWidth={1.5} size={14} />}</ButtonInstrument>
                    <AnimatePresence>{showTemplates && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-6">
                        <ContainerInstrument className="p-6 bg-va-off-white/50 rounded-[32px] border border-black/5 space-y-6">
                          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ContainerInstrument className="space-y-4">
                              <ContainerInstrument className="space-y-2">
                                <LabelInstrument className="flex items-center gap-2 !ml-0"><Building2 strokeWidth={1.5} size={12} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.template.company" defaultText="Bedrijfsnaam" / /></LabelInstrument>
                                <InputInstrument type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Bijv. Voices.be" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                              </ContainerInstrument>
                              <ContainerInstrument className="space-y-2">
                                <LabelInstrument className="flex items-center gap-2 !ml-0"><Clock4 strokeWidth={1.5} size={12} / /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.template.hours" defaultText="Openingsuren" / /></LabelInstrument>
                                <InputInstrument type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="Bijv. ma-vrij 9u tot 17u" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                              </ContainerInstrument>
                              <ContainerInstrument className="space-y-2">
                                <LabelInstrument className="flex items-center gap-2 !ml-0"><Mail strokeWidth={1.5} size={12} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.template.email" defaultText="Support E-mail" / /></LabelInstrument>
                                <InputInstrument type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Bijv. info@voices.be" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                              </ContainerInstrument>
                              <ContainerInstrument className="space-y-2">
                                <LabelInstrument className="flex items-center gap-2 !ml-0"><Globe strokeWidth={1.5} size={12} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.template.website" defaultText="Website" / /></LabelInstrument>
                                <InputInstrument type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Bijv. www.voices.be" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                              </ContainerInstrument>
                            </ContainerInstrument>
                            <ContainerInstrument className="space-y-4">
                              <LabelInstrument className="flex items-center gap-2 !ml-0"><Calendar strokeWidth={1.5} size={12} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.template.holiday" defaultText="Vakantieperiode" / /></LabelInstrument>
                              <ContainerInstrument className="grid grid-cols-2 gap-3">
                                <ContainerInstrument className="space-y-1">
                                  <TextInstrument as="span" className="text-[15px] font-black text-va-black/20"><VoiceglotText strokeWidth={1.5} translationKey="common.from" defaultText="Van" / /></TextInstrument>
                                  <InputInstrument type="text" value={holidayFrom} onChange={(e) => setHolidayFrom(e.target.value)} placeholder="1 juli" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                                </ContainerInstrument>
                                <ContainerInstrument className="space-y-1">
                                  <TextInstrument as="span" className="text-[15px] font-black text-va-black/20"><VoiceglotText strokeWidth={1.5} translationKey="common.to" defaultText="Tot" / /></TextInstrument>
                                  <InputInstrument type="text" value={holidayTo} onChange={(e) => setHolidayTo(e.target.value)} placeholder="15 juli" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                                </ContainerInstrument>
                              </ContainerInstrument>
                              <ContainerInstrument className="space-y-1">
                                <TextInstrument as="span" className="text-[15px] font-black text-va-black/20"><VoiceglotText strokeWidth={1.5} translationKey="common.back_on" defaultText="Terug op" / /></TextInstrument>
                                <InputInstrument type="text" value={holidayBack} onChange={(e) => setHolidayBack(e.target.value)} placeholder="16 juli" className="w-full !py-3 !px-4 !text-[15px] !font-bold" />
                              </ContainerInstrument>
                            </ContainerInstrument>
                          </ContainerInstrument>

                          <ContainerInstrument className="flex justify-end">
                            <ButtonInstrument onClick={addSelectedTemplates} disabled={selectedTemplates.length === 0} className="va-btn-pro !bg-va-black !px-8 !py-4 !rounded-xl">
                              <Plus strokeWidth={1.5} size={14} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.template.add_cta" defaultText={`Voeg ${selectedTemplates.length} toe`} / />
                            </ButtonInstrument>
                          </ContainerInstrument>

                          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {TELEPHONY_TEMPLATES.map((template) => (
                              <ButtonInstrument key={template.id} onClick={() => toggleTemplate(template.id)} className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all text-left border", selectedTemplates.includes(template.id) ? "bg-primary text-white border-primary shadow-md" : "bg-white text-va-black border-black/5 hover:border-primary/20 shadow-sm")}>
                                <ContainerInstrument className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all", selectedTemplates.includes(template.id) ? "bg-white border-white text-primary" : "border-black/10")}>{selectedTemplates.includes(template.id) && <Check strokeWidth={1.5} size={12} />}</ContainerInstrument>
                                <ContainerInstrument className="flex-1">
                                  <TextInstrument className={cn("text-[15px] font-black uppercase tracking-widest mb-0.5", selectedTemplates.includes(template.id) ? "text-white/60" : "text-va-black/30")}>{template.title}</TextInstrument>
                                  <TextInstrument className="text-[15px] font-medium line-clamp-1">
                                    {template.text.split('\n')[1]
                                      .replace(/\{Bedrijfsnaam\}/g, companyName || '{Bedrijfsnaam}')
                                      .replace(/\{Openingsuren\}/g, openingHours || '{Openingsuren}')
                                      .replace(/\{Emailadres\}/g, supportEmail || '{Emailadres}')
                                      .replace(/\{Vakantie_Van\}/g, holidayFrom || '{Vakantie_Van}')
                                      .replace(/\{Vakantie_Tot\}/g, holidayTo || '{Vakantie_Tot}')
                                      .replace(/\{Vakantie_Terug\}/g, holidayBack || '{Vakantie_Terug}')
                                      .replace(/\{Website\}/g, website || '{Website}')
                                    }
                                  </TextInstrument>
                                </ContainerInstrument>
                              </ButtonInstrument>
                            ))}
                          </ContainerInstrument>
                        </ContainerInstrument>
                      </motion.div>
                    )}</AnimatePresence>
                  </ContainerInstrument>

                  <ContainerInstrument className="space-y-4">
                    <ContainerInstrument className="flex items-center justify-between bg-va-off-white/50 p-6 rounded-2xl border border-black/5">
                      <ContainerInstrument className="flex items-center gap-4">
                        <ContainerInstrument className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", (checkoutState.music.asBackground || checkoutState.music.asHoldMusic) ? "bg-primary/10 text-primary" : "bg-va-black/5 text-va-black/20")}><Music strokeWidth={1.5} size={18} / /></ContainerInstrument>
                        <ContainerInstrument>
                          <TextInstrument className="text-[15px] font-black tracking-widest">Wachtmuziek toevoegen (+€{pricingConfig.music_mix})</TextInstrument>
                          <TextInstrument className="text-[15px] font-bold text-va-black/40 tracking-tighter"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.inclusief_mix___loss.0da798" defaultText="Inclusief mix + losse bestanden in HD & 8kHz" / /></TextInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                      <ButtonInstrument type="button" onClick={() => {
                        const isActive = checkoutState.music.asBackground || checkoutState.music.asHoldMusic;
                        if (isActive) {
                          updateMusic({ asBackground: false, asHoldMusic: false });
                        } else {
                          updateMusic({ asBackground: true, trackId: checkoutState.music.trackId || musicTracks[0]?.id });
                        }
                      }} className={cn("w-12 h-6 rounded-full relative transition-all duration-300", (checkoutState.music.asBackground || checkoutState.music.asHoldMusic) ? "bg-primary" : "bg-va-black/10")}><ContainerInstrument className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300", (checkoutState.music.asBackground || checkoutState.music.asHoldMusic) ? "left-7" : "left-1")} /></ButtonInstrument>
                    </ContainerInstrument>
                    {(checkoutState.music.asBackground || checkoutState.music.asHoldMusic) && (
                      <ContainerInstrument className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                        <ContainerInstrument className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {isMusicLoading ? (
                            <ContainerInstrument className="col-span-full flex justify-center py-8">
                              <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={24} / />
                            </ContainerInstrument>
                          ) : (
                            musicTracks.map((track) => (
                              <ContainerInstrument key={track.id} className="relative group/track">
                                <ButtonInstrument type="button" onClick={() => updateMusic({ trackId: track.id })} className={cn("w-full p-4 rounded-xl border-2 transition-all text-left space-y-1", checkoutState.music.trackId === track.id ? "border-primary bg-primary/5 shadow-sm" : "border-black/5 bg-white hover:border-primary/20")}>
                                  <TextInstrument className={cn("text-[15px] font-black uppercase tracking-widest", checkoutState.music.trackId === track.id ? "text-primary" : "text-va-black/40")}>{track.title}</TextInstrument>
                                  <TextInstrument className="text-[15px] font-bold text-va-black/20 tracking-tighter leading-none">{track.vibe}</TextInstrument>
                                </ButtonInstrument>
                                <ButtonInstrument type="button" onClick={(e) => { e.stopPropagation(); const audio = new Audio(track.preview); audio.play(); }} className="absolute top-2 right-2 p-1.5 rounded-[20px] bg-va-black/5 text-va-black/20 hover:bg-primary hover:text-white transition-all opacity-0 group-hover/track:opacity-100" title="Beluister demo"><Play strokeWidth={1.5} size={10} fill="currentColor" / /></ButtonInstrument>
                              </ContainerInstrument>
                            ))
                          )}
                        </ContainerInstrument>

                        {/* 🎵 USE CASE SELECTION */}
                        <ContainerInstrument className="bg-white p-6 rounded-2xl border border-primary/10 space-y-4">
                          <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/60 flex items-center gap-2">
                            <Info strokeWidth={1.5} size={14} className="text-primary" / /><VoiceglotText strokeWidth={1.5} translationKey="auto.page.hoe_wil_je_deze_muzi.e4e63c" defaultText="Hoe wil je deze muziek gebruiken?" / /></TextInstrument>
                          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ButtonInstrument 
                              onClick={() => updateMusic({ asBackground: !checkoutState.music.asBackground })}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                checkoutState.music.asBackground ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                              )}
                            >
                              <ContainerInstrument className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", checkoutState.music.asBackground ? "bg-primary border-primary text-white" : "border-black/10")}>
                                {checkoutState.music.asBackground && <Check strokeWidth={1.5} size={12} />}
                              </ContainerInstrument>
                              <ContainerInstrument>
                                <TextInstrument className="text-[15px] font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.achtergrondmuziek.bb0154" defaultText="Achtergrondmuziek" / /></TextInstrument>
                                <TextInstrument className="text-[15px] font-medium text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.gemixt_onder_de_stem.5c81ba" defaultText="Gemixt onder de stem." / /></TextInstrument>
                              </ContainerInstrument>
                            </ButtonInstrument>

                            <ButtonInstrument 
                              onClick={() => updateMusic({ asHoldMusic: !checkoutState.music.asHoldMusic })}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                checkoutState.music.asHoldMusic ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                              )}
                            >
                              <ContainerInstrument className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", checkoutState.music.asHoldMusic ? "bg-primary border-primary text-white" : "border-black/10")}>
                                {checkoutState.music.asHoldMusic && <Check strokeWidth={1.5} size={12} />}
                              </ContainerInstrument>
                              <ContainerInstrument>
                                <TextInstrument className="text-[15px] font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.wachtmuziek.57fcdd" defaultText="Wachtmuziek" / /></TextInstrument>
                                <TextInstrument className="text-[15px] font-medium text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.als_apart_audiobesta.ce73d8" defaultText="Als apart audiobestand." / /></TextInstrument>
                              </ContainerInstrument>
                            </ButtonInstrument>
                          </ContainerInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>

                  <ContainerInstrument className="space-y-4">
                    <HeadingInstrument level={3} className="text-[15px] tracking-widest text-va-black/40 flex items-center gap-2 font-light">
                      <Zap strokeWidth={1.5} size={14} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.delivery.title" defaultText="Hoe wilt u de bestanden ontvangen?" / />
                    </HeadingInstrument>
                    <ContainerInstrument className="grid grid-cols-3 gap-2">
                      {[ 
                        { id: 'download', label: <VoiceglotText strokeWidth={1.5} translationKey="common.download" defaultText="Download" / />, icon: Download }, 
                        { id: 'whatsapp', label: <VoiceglotText strokeWidth={1.5} translationKey="common.whatsapp" defaultText="WhatsApp" / />, icon: MessageSquare }, 
                        { id: 'email', label: <VoiceglotText strokeWidth={1.5} translationKey="common.email" defaultText="E-mail" / />, icon: Mail } 
                      ].map((method) => (
                        <ButtonInstrument key={method.id} onClick={() => setDeliveryMethod(method.id as any)} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all", deliveryMethod === method.id ? "bg-va-black border-va-black text-white shadow-lg" : "bg-white border-black/5 text-va-black/40 hover:border-black/10")}>
                          <method.icon size={18} />
                          <TextInstrument as="span" className="text-[15px] font-black tracking-widest">{method.label}</TextInstrument>
                        </ButtonInstrument>
                      ))}
                    </ContainerInstrument>
                    <AnimatePresence strokeWidth={1.5} mode="wait">
                      {deliveryMethod === 'whatsapp' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative">
                          <Phone strokeWidth={1.5} size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" />
                          <InputInstrument type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Jouw GSM nummer voor WhatsApp..." className="w-full !pl-10 shadow-sm" />
                        </motion.div>
                      )}
                      {deliveryMethod === 'email' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative">
                          <Mail strokeWidth={1.5} size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" />
                          <InputInstrument type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Jouw e-mailadres voor de bestanden..." className="w-full !pl-10 shadow-sm" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ContainerInstrument>

                  <ContainerInstrument className="flex flex-col md:flex-row gap-4">
                    <ContainerInstrument className="flex-[2] flex flex-col gap-2">
                      <ContainerInstrument className="flex gap-2 mb-2">
                        <ButtonInstrument type="button" onClick={() => setAudioMode('hd')} className={cn("flex-1 py-2 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all border", audioMode === 'hd' ? "bg-va-black text-white border-va-black shadow-md" : "bg-white text-va-black/40 border-black/5 hover:border-black/10")}>
                          <ContainerInstrument className="flex items-center justify-center gap-2"><Globe strokeWidth={1.5} size={12} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.audio_mode.hd" defaultText="HD Studio" / /></ContainerInstrument>
                        </ButtonInstrument>
                        <ButtonInstrument type="button" onClick={() => setAudioMode('telephony')} className={cn("flex-1 py-2 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all border", audioMode === 'telephony' ? "bg-va-black text-white border-va-black shadow-md" : "bg-white text-va-black/40 border-black/5 hover:border-black/10")}>
                          <ContainerInstrument className="flex items-center justify-center gap-2"><Phone strokeWidth={1.5} size={12} /> <VoiceglotText strokeWidth={1.5} translationKey="johfrai.audio_mode.telephony" defaultText="8kHz Telefoon" / /></ContainerInstrument>
                        </ButtonInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <ButtonInstrument as="a" href={`/checkout?usage=subscription&plan=${checkoutState.plan}&voice=johfrah&text=${encodeURIComponent(text)}&music=${checkoutState.music.asBackground || checkoutState.music.asHoldMusic}&track=${checkoutState.music.trackId}&delivery=${deliveryMethod}&phone=${encodeURIComponent(phoneNumber)}&email=${encodeURIComponent(email)}`} className="va-btn-pro !bg-primary flex-1 !py-6 !text-[15px] !tracking-[0.2em] shadow-xl shadow-primary/20 h-fit">
                      {deliveryMethod === 'whatsapp' ? <VoiceglotText strokeWidth={1.5} translationKey="johfrai.checkout.whatsapp" defaultText="Stuur naar WhatsApp" / /> : deliveryMethod === 'email' ? <VoiceglotText strokeWidth={1.5} translationKey="johfrai.checkout.email" defaultText="Stuur naar E-mail" / /> : <VoiceglotText strokeWidth={1.5} translationKey="johfrai.checkout.download" defaultText="Download meteen" / />} (€{price.toFixed(2)}) <ArrowRight strokeWidth={1.5} size={16} />
                    </ButtonInstrument>
                  </ContainerInstrument>

                  <ContainerInstrument className="flex flex-col gap-4">
                    <ContainerInstrument className="flex items-center gap-2 justify-center text-[15px] font-bold text-va-black/30 tracking-widest">
                      <Lock strokeWidth={1.5} size={12} /> 
                      <TextInstrument as="span">
                        <VoiceglotText strokeWidth={1.5} translationKey="johfrai.preview.secure_note" defaultText="Beveiligde Preview: Opname & download geblokkeerd" / />
                      </TextInstrument>
                    </ContainerInstrument>
                    {showWatermark && (
                      <ContainerInstrument className="flex items-center gap-2 justify-center text-[15px] font-black text-primary tracking-widest">
                        <Zap strokeWidth={1.5} size={12} fill="currentColor" />
                        <TextInstrument as="span">
                          <VoiceglotText strokeWidth={1.5} translationKey="johfrai.preview.watermark_note" defaultText="Hoorbaar watermerk actief tegen ongeoorloofd gebruik" / />
                        </TextInstrument>
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>

                  <ContainerInstrument className="md:hidden bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <TextInstrument className="text-[15px] font-bold text-primary flex items-center gap-2">
                      <Zap strokeWidth={1.5} size={12} /> 
                      <VoiceglotText strokeWidth={1.5} translationKey="johfrai.tip.whatsapp" defaultText="Tip: Kies WhatsApp voor directe levering op je gsm." / />
                    </TextInstrument>
                  </ContainerInstrument>
                </motion.div>
              ) : (
                <motion.div key="explorer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <ContainerInstrument className="mb-10 text-center space-y-2">
                    <HeadingInstrument level={2} className="text-2xl font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="johfrai.explorer.title" defaultText="Slimme Voorbeelden" / /></HeadingInstrument>
                    <TextInstrument className="text-[15px] text-va-black/40 font-medium max-w-md mx-auto"><VoiceglotText strokeWidth={1.5} translationKey="johfrai.explorer.description" defaultText="Laat je inspireren door Johfrai demo's uit jouw sector. Luister, leer en adopteer het script met één klik." / /></TextInstrument>
                  </ContainerInstrument>
                  <SmartDemoExplorer strokeWidth={1.5} onAdoptScript={(script) => { setText(script); setActiveTab('editor'); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </ContainerInstrument>

          <ContainerInstrument className="mt-16 grid md:grid-cols-2 gap-8">
            <ContainerInstrument className="bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-black/5 space-y-4">
              <ContainerInstrument className="flex items-center gap-3 text-primary">
                <ShieldCheck strokeWidth={1.5} size={24} />
                <HeadingInstrument level={3} className="text-lg font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="johfrai.guarantee.title" defaultText="De Menselijke Garantie" / /></HeadingInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-[15px] text-va-black/60 leading-relaxed font-light"><VoiceglotText strokeWidth={1.5} 
                  translationKey="johfrai.guarantee.text" 
                  defaultText="Niet 100% tevreden over de AI-versie? Geen zorgen. Je kunt op elk moment upgraden naar een menselijke opname door Johfrah zelf. We verrekenen je eerdere betaling volledig." 
                / /></TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="bg-va-black p-8 rounded-[32px] text-white space-y-4">
              <ContainerInstrument className="flex items-center gap-3 text-primary">
                <Zap strokeWidth={1.5} size={24} />
                <HeadingInstrument level={3} className="text-lg font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="johfrai.result.title" defaultText="Direct Resultaat" / /></HeadingInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-[15px] text-white/60 leading-relaxed font-light"><VoiceglotText strokeWidth={1.5} 
                  translationKey="johfrai.result.text" 
                  defaultText="Johfrai is 24/7 beschikbaar. Je ontvangt je audiobestanden in zowel 48kHz WAV als geoptimaliseerd 8kHz formaat voor je telefooncentrale. Direct klaar voor gebruik." 
                / /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="py-20 bg-va-off-white">
        <ContainerInstrument className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-8">
          <ContainerInstrument className="w-32 h-32 rounded-full overflow-hidden relative shadow-2xl border-4 border-white">
            <VoiceglotImage strokeWidth={1.5} src="/assets/ademing/johfrah-avatar.jpg" alt="Johfrah" fill journey="common" category="branding" className="object-cover" / />
          </ContainerInstrument>
          <ContainerInstrument>
            <TextInstrument className="font-black text-[15px] tracking-[0.2em]"><VoiceglotText strokeWidth={1.5} translationKey="johfrai.founder.name" defaultText="Johfrah Lefebvre" / /></TextInstrument>
            <TextInstrument className="text-va-black/40 text-[15px] tracking-widest mt-1 font-light"><VoiceglotText strokeWidth={1.5} translationKey="johfrai.founder.title" defaultText="Founder Voices.be & De stem achter Johfrai" / /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
      
      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Johfrai AI Voice Clone",
            "description": "Krijg de iconische stem van Johfrah voor je IVR en video via AI voice cloning.",
            "_llm_context": {
              "persona": "AI Architect",
              "journey": "johfrai",
              "intent": "voice_cloning",
              "capabilities": ["generate_voice", "mix_music", "view_pricing", "adopt_script"],
              "lexicon": ["AI Voice", "Voice Clone", "IVR", "Telefooncentrale"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}

export default function JohfraiPage() {
  return (
    <Suspense strokeWidth={1.5} fallback={<ContainerInstrument className="min-h-screen flex items-center justify-center bg-va-off-white"><Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={48} / /></ContainerInstrument>}>
      <JohfraiContent strokeWidth={1.5} / />
    </Suspense>
  );
}
