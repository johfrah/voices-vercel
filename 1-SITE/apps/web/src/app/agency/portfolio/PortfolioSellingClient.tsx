"use client";

import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Shield, Zap, Layout, MessageSquare, BarChart3, Check, ArrowRight, Mic2, Star, ChevronLeft, ChevronRight, Monitor, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });

export function PortfolioSellingClient({ products }: { products: any[] }) {
  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      
      {/* HERO SECTION - ADEMING STYLE */}
      <ContainerInstrument className="pt-64 pb-32 relative z-10 max-w-6xl mx-auto px-6 text-center">
        <header className="max-w-5xl mx-auto">
          <TextInstrument className="text-[15px] font-light tracking-[0.4em] text-primary/60 mb-12 block">
            <VoiceglotText translationKey="portfolio_selling.pretitle" defaultText="Portfolio powered by Voices.be" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-[8vw] lg:text-[120px] font-extralight tracking-tighter mb-12 leading-[0.85] text-va-black">
            <VoiceglotText translationKey="portfolio_selling.title" defaultText="De complete winkel voor stemacteurs." />
          </HeadingInstrument>
          <TextInstrument className="text-2xl lg:text-3xl font-light text-va-black/40 max-w-3xl mx-auto leading-tight tracking-tight">
            <VoiceglotText 
              translationKey="portfolio_selling.subtitle" 
              defaultText="Je bouwt geen website, je zet een verkoopmotor aan. Jouw eigen plek op het internet, aangedreven door de slimme techniek van Voices." 
            />
          </TextInstrument>
          <ContainerInstrument className="w-24 h-1 bg-black/5 rounded-full mx-auto mt-12" />
        </header>
      </ContainerInstrument>

      {/* THE PROOF - JOHFRAH.BE SHOWCASE */}
      <SectionInstrument className="py-32 relative z-10 max-w-6xl mx-auto px-6">
        <ContainerInstrument className="bg-white/80 backdrop-blur-xl rounded-[20px] border border-white/20 shadow-aura p-12 lg:p-24 overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-10">
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full">
                <Star strokeWidth={1.5} size={16} className="text-primary" />
                <TextInstrument className="text-[11px] font-bold tracking-widest text-primary uppercase">Live Case Study</TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl lg:text-6xl font-light tracking-tighter text-va-black leading-none">
                johfrah.be
              </HeadingInstrument>
              <TextInstrument className="text-lg font-light text-va-black/60 leading-relaxed">
                <VoiceglotText translationKey="portfolio_selling.case_study.text" defaultText="Het eerste volledige portfolio powered by Voices.be. Een eigen domein, een eigen branding, maar met de onverwoestbare kassa en configurator van ons platform onder de motorkap." />
              </TextInstrument>
              <div className="flex flex-col gap-4 pt-4">
                <Link href="/portfolio/johfrah" className="inline-flex items-center gap-4 text-va-black/40 hover:text-primary font-medium text-[13px] tracking-widest transition-all duration-500 group/link uppercase">
                  <VoiceglotText translationKey="portfolio_selling.case_study.cta" defaultText="Bekijk de live demo" />
                  <ArrowRight size={18} className="group-hover/link:translate-x-2 transition-transform duration-500" />
                </Link>
                <ContainerInstrument className="inline-flex items-center gap-3 text-primary/60 text-[13px] font-medium tracking-widest uppercase">
                  <Zap size={14} />
                  <VoiceglotText translationKey="portfolio_selling.case_study.preview" defaultText="24u Gratis Preview Beschikbaar" />
                </ContainerInstrument>
              </div>
            </div>
            <div className="lg:col-span-7 relative">
              <ContainerInstrument className="aspect-video rounded-[20px] overflow-hidden shadow-aura-lg border border-black/5 relative">
                <Image 
                  src="/assets/common/branding/johfrah/johfrah-hero.jpg" 
                  alt="Johfrah.be Portfolio"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] va-bezier"
                />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/40 to-transparent" />
              </ContainerInstrument>
              {/* Floating DNA Element */}
              <ContainerInstrument className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* PRICING MATRIX - THE TIERED MODEL */}
      <SectionInstrument className="py-32 relative z-10 max-w-6xl mx-auto px-6">
        <header className="mb-24 text-center">
          <HeadingInstrument level={2} className="text-5xl lg:text-7xl font-light tracking-tighter text-va-black mb-6">
            <VoiceglotText translationKey="portfolio_selling.pricing.title" defaultText="Kies jouw portfolio." />
          </HeadingInstrument>
          <TextInstrument className="text-xl font-light text-va-black/40 max-w-2xl mx-auto">
            <VoiceglotText translationKey="portfolio_selling.pricing.subtitle" defaultText="Drie niveaus van ontlasting en autoriteit. Groei mee met de motor van Voices." />
          </TextInstrument>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <PricingCard 
              key={product.id}
              tier={product.name}
              price={product.price}
              highlighted={product.tier === 'studio'}
              description={product.description}
              features={product.features || []}
            />
          ))}
        </div>
        
        <ContainerInstrument className="mt-16 text-center">
          <TextInstrument className="text-sm text-va-black/30 font-light italic">
            <VoiceglotText translationKey="portfolio_selling.pricing.disclaimer" defaultText="* Prijzen zijn exclusief BTW en worden jaarlijks gefactureerd. Eenmalige setup-fee van €149 voor configuratie en assistentie bij het koppelen van je eigen domeinnaam." />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* DE WERKKWIJZE - BOXED ISLANDS */}
      <SectionInstrument className="py-32 relative z-10 max-w-6xl mx-auto px-6">
        <header className="mb-24 text-center">
          <HeadingInstrument level={2} className="text-5xl lg:text-7xl font-light tracking-tighter text-va-black mb-6">
            <VoiceglotText translationKey="portfolio_selling.workflow.title" defaultText="Zo werkt jouw winkel." />
          </HeadingInstrument>
          <TextInstrument className="text-xl font-light text-va-black/40">
            <VoiceglotText translationKey="portfolio_selling.workflow.subtitle" defaultText="Kwaliteit als een service, zonder de technische kopzorgen." />
          </TextInstrument>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BoxedFeature 
            index="01"
            icon={<Zap className="text-primary/40" strokeWidth={1.5} />}
            title="Slimme uploads met AI"
            description="Gooi al je audio en video in één keer in de tool. Onze AI luistert mee, labelt je demo's automatisch en zet ze direct in de juiste categorie."
          />
          <BoxedFeature 
            index="02"
            icon={<Layout className="text-primary/40" strokeWidth={1.5} />}
            title="Geen website-gedoe meer"
            description="Stop met het prutsen aan updates of dode links. Wij beheren de techniek op je eigen domein, zodat je site altijd razendsnel en up-to-date is."
          />
          <BoxedFeature 
            index="03"
            icon={<Zap className="text-primary/40" strokeWidth={1.5} />}
            title="Verkoop terwijl je slaapt"
            description="Je winkel rekent zelf de juiste prijs uit voor je klant. Geen gemail meer over tarieven; je klant bestelt en betaalt direct."
          />
          <BoxedFeature 
            index="04"
            icon={<Shield className="text-primary/40" strokeWidth={1.5} />}
            title="Zorgeloze Kassa"
            description="Wij regelen de betaling met je klant via ons beveiligde systeem. De klant betaalt vooraf, zodat jij altijd zeker bent van je geld."
          />
          <BoxedFeature 
            index="05"
            icon={<BarChart3 className="text-primary/40" strokeWidth={1.5} />}
            title="Wie kijkt er mee?"
            description="Zie wie er op je site komt en naar welke demo's ze luisteren. Zo weet je precies wat je klanten zoeken."
          />
          <BoxedFeature 
            index="06"
            icon={<MessageSquare className="text-primary/40" strokeWidth={1.5} />}
            title="Je eigen assistent"
            description="Een digitale assistent beantwoordt 24/7 de eerste vragen van je klanten. Zo kun jij ongestoord in de studio staan."
          />
        </div>
      </SectionInstrument>

      {/* INSTANT PREVIEW - THE MAGIC MOMENT */}
      <SectionInstrument className="py-32 relative z-10 max-w-6xl mx-auto px-6">
        <ContainerInstrument className="bg-primary/5 border border-primary/10 rounded-[32px] p-12 lg:p-24 text-center relative overflow-hidden group">
          <ContainerInstrument className="relative z-10 max-w-3xl mx-auto space-y-12">
            <header className="space-y-6">
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-full text-primary">
                <Sparkles size={18} className="animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest uppercase">Instant Magic</span>
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl lg:text-7xl font-light tracking-tighter text-va-black">
                <VoiceglotText translationKey="portfolio_selling.instant.title" defaultText="Jouw winkel online in 10 minuten." />
              </HeadingInstrument>
              <TextInstrument className="text-xl font-light text-va-black/60">
                <VoiceglotText translationKey="portfolio_selling.instant.subtitle" defaultText="Vul je naam in en zie direct je nieuwe portfolio op voices.be/portfolio/jouwnaam." />
              </TextInstrument>
            </header>

            <ContainerInstrument className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <ContainerInstrument className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Jouw volledige naam..." 
                  className="w-full h-16 px-8 rounded-[15px] border border-black/5 bg-white text-lg font-light focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </ContainerInstrument>
              <ButtonInstrument className="h-16 px-12 !rounded-[15px] bg-va-black text-white hover:bg-primary transition-all duration-500 shadow-xl group/btn">
                <ContainerInstrument className="flex items-center gap-3">
                  <VoiceglotText translationKey="portfolio_selling.instant.cta" defaultText="Start 14 dagen gratis" />
                  <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                </ContainerInstrument>
              </ButtonInstrument>
            </ContainerInstrument>

            <TextInstrument className="text-sm text-va-black/30 font-light italic">
              <VoiceglotText translationKey="portfolio_selling.instant.note" defaultText="* Geen creditcard nodig. Na 14 dagen beslis je pas of je doorgaat." />
            </TextInstrument>
          </ContainerInstrument>
          
          {/* Background Decoration */}
          <ContainerInstrument className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <ContainerInstrument className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </ContainerInstrument>
      </SectionInstrument>

      {/* SKELETON TEMPLATES - INTERACTIVE SLIDER */}
      <SectionInstrument className="py-32 relative z-10 max-w-6xl mx-auto px-6">
        <header className="mb-24 text-center">
          <HeadingInstrument level={2} className="text-5xl lg:text-7xl font-light tracking-tighter text-va-black mb-6">
            <VoiceglotText translationKey="portfolio_selling.slider.title" defaultText="Kijk in de machine." />
          </HeadingInstrument>
          <TextInstrument className="text-xl font-light text-va-black/40 max-w-2xl mx-auto">
            <VoiceglotText translationKey="portfolio_selling.slider.subtitle" defaultText="Swipe door de templates van je nieuwe winkel en je beheerders-dashboard." />
          </TextInstrument>
        </header>

        <SkeletonSlider />
      </SectionInstrument>

      {/* SIGNATURE CTA */}
      <footer className="py-48 relative z-10 max-w-6xl mx-auto px-6">
        <ContainerInstrument className="bg-va-black text-white p-24 lg:p-32 rounded-[20px] shadow-aura-lg relative overflow-hidden group text-center">
          <ContainerInstrument className="relative z-10">
            <TextInstrument className="text-[15px] font-light tracking-[0.4em] text-primary/60 mb-12 block uppercase">
              <VoiceglotText translationKey="cta.next_step" defaultText="volgende stap" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-[8vw] lg:text-8xl font-extralight tracking-tighter mb-20 leading-[0.9] text-white">
              <VoiceglotText translationKey="portfolio_selling.footer.title" defaultText="Klaar om de regie te nemen?" />
            </HeadingInstrument>
            <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-12">
              <Link href="/contact" className="bg-va-off-white text-va-black px-24 py-12 rounded-[10px] font-medium text-base tracking-widest hover:scale-105 transition-all duration-700 shadow-2xl hover:bg-white uppercase">
                <VoiceglotText translationKey="portfolio_selling.footer.cta" defaultText="Vraag je portfolio aan" />
              </Link>
              <Link href="/portfolio/johfrah" className="text-white/30 hover:text-white font-medium text-base tracking-widest flex items-center gap-6 group/link transition-all duration-700 uppercase">
                <VoiceglotText translationKey="portfolio_selling.footer.demo" defaultText="Bekijk johfrah.be" />
                <ArrowRight strokeWidth={1.5} size={28} className="group-hover/link:translate-x-4 transition-transform duration-700" />
              </Link>
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent" />
        </ContainerInstrument>
      </footer>
    </PageWrapperInstrument>
  );
}

function BoxedFeature({ index, icon, title, description }: { index: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <ContainerInstrument className="p-12 bg-white/80 backdrop-blur-xl rounded-[20px] border border-white/20 shadow-aura hover:shadow-aura-lg transition-all duration-700 hover:-translate-y-2 group/step flex flex-col h-full min-h-[420px]">
      <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-full flex items-center justify-center mb-10 group-hover:bg-primary/10 transition-colors duration-1000">
        <ContainerInstrument className="group-hover:scale-110 transition-transform duration-500">
          {icon}
        </ContainerInstrument>
      </ContainerInstrument>
      <HeadingInstrument level={3} className="text-3xl font-light mb-6 tracking-tight text-va-black leading-tight">
        <VoiceglotText translationKey={`portfolio_selling.feature.${index}.title`} defaultText={title} />
      </HeadingInstrument>
      <TextInstrument className="text-lg text-va-black/50 font-light leading-relaxed tracking-tight">
        <VoiceglotText translationKey={`portfolio_selling.feature.${index}.desc`} defaultText={description} />
      </TextInstrument>
      <ContainerInstrument className="mt-auto pt-10">
        <TextInstrument className="text-va-black/5 font-black text-6xl tracking-tighter italic">{index}</TextInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

function PricingCard({ tier, price, description, features, highlighted = false }: { tier: string, price: string, description: string, features: string[], highlighted?: boolean }) {
  return (
    <ContainerInstrument className={cn(
      "p-12 rounded-[20px] border transition-all duration-700 flex flex-col h-full min-h-[550px] relative overflow-hidden",
      highlighted 
      ? "bg-va-black text-white shadow-aura-lg border-primary/20 scale-105 z-10" 
      : "bg-white/80 backdrop-blur-xl border-white/20 shadow-aura text-va-black"
    )}>
      {highlighted && (
        <ContainerInstrument className="absolute top-6 right-6 px-3 py-1 bg-primary rounded-full text-[10px] font-bold tracking-widest text-white uppercase">
          Most Popular
        </ContainerInstrument>
      )}
      <ContainerInstrument className="mb-12">
        <TextInstrument className={cn("text-[13px] font-bold tracking-[0.3em] uppercase mb-4 block", highlighted ? "text-primary" : "text-primary/60")}>
          {tier}
        </TextInstrument>
        <ContainerInstrument className="flex items-baseline gap-2 mb-6">
          <span className="text-6xl font-extralight tracking-tighter">€{price}</span>
          <span className={cn("text-sm font-light", highlighted ? "text-white/40" : "text-va-black/40")}>/ maand</span>
        </ContainerInstrument>
        <TextInstrument className={cn("text-base font-light leading-relaxed", highlighted ? "text-white/60" : "text-va-black/60")}>
          <VoiceglotText translationKey={`portfolio_selling.pricing.${tier.toLowerCase().replace(' ', '_')}.desc`} defaultText={description} />
        </TextInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="space-y-6 mb-12">
        {features.map((feature, i) => (
          <ContainerInstrument key={i} className="flex items-start gap-4">
            <Check size={18} className={cn("shrink-0 mt-0.5", highlighted ? "text-primary" : "text-primary/60")} />
            <TextInstrument className={cn("text-[15px] font-light", highlighted ? "text-white/80" : "text-va-black/80")}>
              <VoiceglotText translationKey={`portfolio_selling.pricing.${tier.toLowerCase().replace(' ', '_')}.feature.${i}`} defaultText={feature} />
            </TextInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      <ContainerInstrument className="mt-auto">
        <Link href="/contact" className="w-full">
          <ButtonInstrument className={cn(
            "w-full py-6 !rounded-[10px] text-sm font-bold tracking-widest uppercase transition-all duration-500",
            highlighted 
            ? "bg-primary text-white hover:bg-white hover:text-va-black" 
            : "bg-va-black text-white hover:bg-primary"
          )}>
            <VoiceglotText translationKey="portfolio_selling.pricing.cta" defaultText={`Kies ${tier}`} />
          </ButtonInstrument>
        </Link>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

function SkeletonSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const slides = [
    {
      title: "De Homepage",
      type: "Frontend",
      icon: <Monitor size={20} />,
      description: "Een rustige, high-end binnenkomer die direct jouw stem en merk centraal zet.",
      benefits: ["100ms laadtijd", "Mobile-first design", "Directe 'Call to Action'"],
      skeleton: (
        <ContainerInstrument className="space-y-6 opacity-40">
          <ContainerInstrument className="h-12 bg-va-black/10 rounded-full w-1/3" />
          <ContainerInstrument className="h-32 bg-va-black/5 rounded-[20px] w-full" />
          <ContainerInstrument className="grid grid-cols-3 gap-4">
            <ContainerInstrument className="h-40 bg-va-black/5 rounded-[20px]" />
            <ContainerInstrument className="h-40 bg-va-black/5 rounded-[20px]" />
            <ContainerInstrument className="h-40 bg-va-black/5 rounded-[20px]" />
          </ContainerInstrument>
        </ContainerInstrument>
      )
    },
    {
      title: "Jouw Dashboard",
      type: "Backend",
      icon: <Lock size={20} />,
      description: "De cockpit waar je alles beheert, van je demo's tot je prijzen en klantgegevens.",
      benefits: ["Real-time statistieken", "Eenvoudig demo management", "Order overzicht"],
      skeleton: (
        <ContainerInstrument className="space-y-6 opacity-40">
          <ContainerInstrument className="flex gap-4">
            <ContainerInstrument className="h-20 bg-primary/10 rounded-[15px] flex-1" />
            <ContainerInstrument className="h-20 bg-primary/10 rounded-[15px] flex-1" />
            <ContainerInstrument className="h-20 bg-primary/10 rounded-[15px] flex-1" />
          </ContainerInstrument>
          <ContainerInstrument className="h-64 bg-va-black/5 rounded-[20px] w-full" />
        </ContainerInstrument>
      )
    },
    {
      title: "De Kassa",
      type: "Checkout",
      icon: <Zap size={20} />,
      description: "De Solo-Configurator waar klanten hun project samenstellen and direct afrekenen.",
      benefits: ["Automatische buyouts", "Mollie integratie", "Directe facturatie"],
      skeleton: (
        <ContainerInstrument className="grid grid-cols-12 gap-6 opacity-40">
          <ContainerInstrument className="col-span-8 h-80 bg-va-black/5 rounded-[20px]" />
          <ContainerInstrument className="col-span-4 h-80 bg-va-black/10 rounded-[20px]" />
        </ContainerInstrument>
      )
    }
  ];

  const next = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <ContainerInstrument className="relative">
      <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text Side */}
        <ContainerInstrument className="lg:col-span-5 space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-8"
            >
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full text-primary">
                {slides[currentIndex].icon}
                <span className="text-[11px] font-bold tracking-widest uppercase">{slides[currentIndex].type}</span>
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-5xl font-light tracking-tighter text-va-black">
                <VoiceglotText translationKey={`portfolio_selling.slider.${currentIndex}.title`} defaultText={slides[currentIndex].title} />
              </HeadingInstrument>
              <TextInstrument className="text-xl font-light text-va-black/60 leading-relaxed">
                <VoiceglotText translationKey={`portfolio_selling.slider.${currentIndex}.desc`} defaultText={slides[currentIndex].description} />
              </TextInstrument>
              <ContainerInstrument className="space-y-4 pt-4">
                {slides[currentIndex].benefits.map((benefit, i) => (
                  <ContainerInstrument key={i} className="flex items-center gap-3">
                    <ContainerInstrument className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check size={12} className="text-primary" />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light text-va-black/80">
                      <VoiceglotText translationKey={`portfolio_selling.slider.${currentIndex}.benefit.${i}`} defaultText={benefit} />
                    </TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </motion.div>
          </AnimatePresence>

          <ContainerInstrument className="flex gap-4 pt-8">
            <button onClick={prev} className="w-14 h-14 rounded-full border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all duration-500">
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button onClick={next} className="w-14 h-14 rounded-full border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all duration-500">
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Visual Side (Skeleton) */}
        <ContainerInstrument className="lg:col-span-7">
          <ContainerInstrument className="bg-va-off-white rounded-[32px] p-12 lg:p-20 shadow-aura-lg border border-black/[0.03] min-h-[500px] flex items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="w-full"
              >
                {slides[currentIndex].skeleton}
              </motion.div>
            </AnimatePresence>
            {/* DNA Decoration */}
            <ContainerInstrument className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
