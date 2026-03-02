import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { GhostModeBar } from "@/components/admin/GhostModeBar";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import { LoadingScreenInstrument, PageWrapperInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { CookieBanner } from "@/components/ui/Legal/CookieBanner";
import { GlobalModalManager } from "@/components/ui/GlobalModalManager";
import { LiquidTransitionOverlay } from "@/components/ui/LiquidTransitionOverlay";
import { MarketManagerServer } from "@/lib/system/market-manager-server";
import { MarketDatabaseService } from "@/lib/system/market-manager-db";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/react";
import { VercelToolbar } from "@vercel/toolbar/next";
import type { Metadata, Viewport } from "next";
import { Inter, Raleway, Cormorant_Garamond } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";
import { Providers } from "./Providers";
import { getTranslationsServer } from "@/lib/services/api-server";
import { cn } from "@/lib/utils";
import { SafeErrorGuard } from "@/components/ui/SafeErrorGuard";
import { ConfigBridge } from "@/lib/utils/config-bridge";

//  NUCLEAR LOADING MANDATE: Zware instrumenten dynamisch laden (ssr: false) voor 100ms LCP
const JohfrahActionDock = dynamic(() => import("@/components/portfolio/JohfrahActionDock").then(mod => mod.JohfrahActionDock), { ssr: false, loading: () => null });
const JohfrahConfiguratorSPA = dynamic(() => import("@/components/portfolio/JohfrahConfiguratorSPA").then(mod => mod.JohfrahConfiguratorSPA), { ssr: false, loading: () => null });
const CastingDock = dynamic(() => import("@/components/ui/CastingDock").then(mod => mod.CastingDock), { ssr: false, loading: () => null });
const SonicDNAHandler = dynamic(() => import("@/components/ui/SonicDNA").then(mod => mod.SonicDNAHandler), { ssr: false, loading: () => null });
const GlobalAudioOrchestrator = dynamic(() => import("@/components/ui/GlobalAudioOrchestrator").then(mod => mod.GlobalAudioOrchestrator), { ssr: false, loading: () => null });
const TopBar = dynamic(() => import("@/components/ui/TopBar").then(mod => mod.TopBar), { ssr: false, loading: () => <div className="h-[80px] bg-va-off-white/50 backdrop-blur-md" /> });
const GlobalNav = dynamic(() => import("@/components/ui/GlobalNav"), { ssr: false, loading: () => <div className="h-[60px] bg-va-off-white/50 backdrop-blur-md" /> });
const FooterWrapper = dynamic(() => import("@/components/ui/FooterWrapper"), { ssr: false, loading: () => null });
const VoicejarTracker = dynamic(() => import("@/components/ui/VoicejarTracker").then(mod => mod.VoicejarTracker), { ssr: false, loading: () => null });
const VoicyBridge = dynamic(() => import("@/components/ui/VoicyBridge").then(mod => mod.VoicyBridge), { ssr: false, loading: () => null });
const VoicyChat = dynamic(() => import("@/components/ui/VoicyChat").then(mod => ({ default: mod.VoicyChatV2 })), { 
  ssr: false,
  loading: () => null 
});

const inter = Inter({ subsets: ["latin"] });

  /** Veilige market-resolutie: voorkomt 500 bij onverwachte hosts (Combell proxy, etc.) */
async function getMarketSafe(host: string) {
  try {
    //  CHRIS-PROTOCOL: Voeg een timeout toe aan de market resolution
    const marketPromise = MarketDatabaseService.getCurrentMarketAsync(host);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Market Resolution Timeout')), 3000)
    );
    const market = await Promise.race([marketPromise, timeoutPromise]) as any;
    
    // 🛡️ CHRIS-PROTOCOL: Null-Safety Guard (v2.27.7)
    if (!market || !market.market_code) {
      console.error(' getMarketSafe: Market resolution returned invalid data, using fallback');
      return MarketManagerServer.getCurrentMarket(process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    }
    
    return market;
  } catch (err) {
    console.error(' getMarketSafe: Failed or timed out:', err);
    const fallbackHost = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be';
    return MarketManagerServer.getCurrentMarket(fallbackHost);
  }
}
const raleway = Raleway({ subsets: ["latin"], variable: '--font-raleway' });
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic']
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const langHeader = headersList.get('x-voices-lang');
  const domains = MarketManagerServer.getMarketDomains();
  const pathname = headersList.get('x-voices-pathname') || '';
  const host = headersList.get("x-voices-host") || headersList.get("host") || process.env.NEXT_PUBLIC_SITE_URL || MarketManagerServer.getMarketDomains()['BE'].replace('https://', '');
  const cleanHost = host.replace(/^https?:\/\//, '');
  
  // 🛡️ CHRIS-PROTOCOL: Pass pathname to market manager for sub-journey detection (e.g. /studio, /academy)
  let lookupHost = cleanHost;
  if (pathname.startsWith('/studio')) lookupHost = `${cleanHost}/studio`;
  else if (pathname.startsWith('/academy')) lookupHost = `${cleanHost}/academy`;
  
  // 🛡️ CHRIS-PROTOCOL: ID-First Context Resolution (v3.0.0)
  const { worldId, languageId, journeyId } = MarketManagerServer.resolveContext(cleanHost, pathname);

  // 🛡️ CHRIS-PROTOCOL: Parallel Pulse Fetching (v2.14.798)
  // We fetch market, locales and translations in parallel to minimize TTFB
  const [market, worldConfig, alternateLanguages, studioTranslations] = await Promise.all([
    getMarketSafe(lookupHost),
    ConfigBridge.getWorldConfig(worldId, languageId),
    (async () => {
      try {
        const localesPromise = MarketDatabaseService.getAllLocalesAsync();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Locales Timeout')), 2500)
        );
        return await Promise.race([localesPromise, timeoutPromise]) as any;
      } catch (err) {
        console.error(' generateMetadata: Failed to load locales:', err);
        const staticDomains = MarketManagerServer.getMarketDomains();
        return {
          'nl-BE': staticDomains['BE'],
          'nl-NL': staticDomains['NLNL'],
          'fr-FR': staticDomains['FR'],
          'en-EU': staticDomains['EU']
        };
      }
    })(),
    (async () => {
      try {
        const translationPromise = getTranslationsServer(langHeader || 'nl');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Translation Timeout')), 2500)
        );
        return await Promise.race([translationPromise, timeoutPromise]) as any;
      } catch (err) {
        console.error(' generateMetadata: Failed to load translations:', err);
        return {};
      }
    })()
  ]);

  if (!market) {
    throw new Error('Market configuration could not be resolved.');
  }

  const baseUrl = `https://${market.market_code === 'BE' ? MarketManagerServer.getMarketDomains()['BE'].replace('https://', '') : (market.market_code === 'NLNL' ? (MarketManagerServer.getMarketDomains()['NLNL']?.replace('https://', '') || 'www.voices.nl') : cleanHost)}`;

  const isAdeming = market.market_code === 'ADEMING';
  const isJohfrah = market.market_code === 'PORTFOLIO';
  const isArtist = market.market_code === 'ARTIST';

  const title = isAdeming 
    ? "Ademing | Kom tot rust" 
    : isJohfrah 
    ? "Johfrah Lefebvre | Vlaamse Voice-over & Regisseur" 
    : isArtist
    ? "Voices Artist | Premium Voice-over Talent"
    : "Voices | Het Vriendelijkste Stemmenbureau";

  const description = isAdeming 
    ? "Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf." 
    : isJohfrah
    ? "De stem achter het verhaal. Warme, natuurlijke Vlaamse voice-over & host voor nationale TV-spots en corporate video's."
    : "Een warm en vertrouwd geluid voor elk project. Wij helpen je de perfecte stem te vinden.";

  const icons = isAdeming ? {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  } : isJohfrah ? {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  } : {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  };

  return {
    title: {
      default: title,
      template: `%s | ${market.name}`,
    },
    description,
    icons,
    metadataBase: host ? new URL(baseUrl) : undefined,
    alternates: {
      canonical: "/",
      languages: alternateLanguages,
    },
    openGraph: {
      type: "website",
      locale: market.seo_data?.locale_code?.replace('-', '_') || (market.primary_language.replace('-', '_')),
      url: baseUrl,
      siteName: market.name,
      images: [
        {
          url: market.seo_data?.og_image || (market.market_code === 'PORTFOLIO' ? "/assets/common/branding/johfrah/johfrah-hero.jpg" : "/assets/common/og-image.jpg"),
          width: 1200,
          height: 630,
          alt: `${market.name} - ${description.substring(0, 50)}`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { slug?: string[] };
}) {
  const headersList = headers();
  const langHeader = headersList.get('x-voices-lang');
  const domains = MarketManagerServer.getMarketDomains();
  const pathname = headersList.get('x-voices-pathname') || '';
  const host = headersList.get("x-voices-host") || headersList.get("host") || process.env.NEXT_PUBLIC_SITE_URL || MarketManagerServer.getMarketDomains()['BE'].replace('https://', '');
  const cleanHost = host.replace(/^https?:\/\//, '');
  
  // 🛡️ CHRIS-PROTOCOL: Pass pathname to market manager for sub-journey detection (e.g. /studio, /academy)
  let lookupHost = cleanHost;
  if (pathname.startsWith('/studio')) lookupHost = `${cleanHost}/studio`;
  else if (pathname.startsWith('/academy')) lookupHost = `${cleanHost}/academy`;

  // 🛡️ CHRIS-PROTOCOL: ID-First Context Resolution (v3.0.0)
  const { worldId, languageId, journeyId } = MarketManagerServer.resolveContext(cleanHost, pathname);

  //  CHRIS-PROTOCOL: Parallel Pulse Fetching (v2.14.798)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [market, studioTranslations, worldLanguages, worldConfig] = await Promise.all([
    getMarketSafe(lookupHost),
    (async () => {
      try {
        const translationPromise = getTranslationsServer(langHeader || 'nl');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Translation Timeout')), 2500)
        );
        return await Promise.race([translationPromise, timeoutPromise]) as any;
      } catch (err) {
        console.error(' RootLayout: Failed to load translations:', err);
        return {};
      }
    })(),
    (async () => {
      try {
        const { data } = await supabase.from('world_languages').select('*');
        return data || [];
      } catch (err) {
        console.error(' RootLayout: Failed to load world languages:', err);
        return [];
      }
    })(),
    ConfigBridge.getWorldConfig(worldId, languageId)
  ]);

  if (!market) {
    throw new Error('Market configuration could not be resolved.');
  }
  
  // 🛡️ CHRIS-PROTOCOL: Prime MarketManager with World Languages
  MarketManagerServer.setWorldLanguages(worldLanguages);
  
  // 🛡️ CHRIS-PROTOCOL: World Detection for Provider Injection (v2.25.1)
  const isStudioPage = pathname.startsWith('/studio/') || pathname === '/studio' || pathname === '/workshops' || pathname === '/voorwaarden-studio' || pathname.includes('/studio');
  const isAcademyPage = pathname.startsWith('/academy/') || pathname === '/academy' || pathname.includes('/academy');
  
  const journeyKey = isStudioPage ? 'studio' : (isAcademyPage ? 'academy' : (market.market_code === 'ADEMING' ? 'ademing' : (market.market_code === 'PORTFOLIO' ? 'portfolio' : (market.market_code === 'ARTIST' ? 'artist' : 'agency'))));
  const navConfig = await ConfigBridge.getNavConfig(journeyKey, langHeader || 'nl');

  const initialJourney = isStudioPage ? 'studio' : (isAcademyPage ? 'academy' : (market.market_code === 'ADEMING' ? 'ademing' : (market.market_code === 'PORTFOLIO' ? 'portfolio' : (market.market_code === 'ARTIST' ? 'artist' : 'agency'))));
  const initialUsage = isStudioPage || isAcademyPage ? 'subscription' : (market.market_code === 'ADEMING' ? 'subscription' : 'unpaid');

  // 🛡️ CHRIS-PROTOCOL: Force Client-Only rendering for Admin routes to prevent hydration mismatch (#419)
  const isAdminRoute = pathname.startsWith('/admin') || (pathname.split('/').filter(Boolean)[0] === 'admin');
  
  const isAdeming = market.market_code === 'ADEMING';
  const isOffline = process.env.ADEMING_OFFLINE === 'true';
  const isAdmin = isAdminRoute; // Simple check for layout logic
  
  const htmlClass = `${isAdeming ? cormorant.className : raleway.className} ${inter.className} ${cormorant.variable} theme-${isAdeming ? 'ademing' : market.theme} ${raleway.variable}`;
  const bodyClass = cn(
    "pb-24 md:pb-0 touch-manipulation va-main-layout",
    !isAdeming && "pt-[80px] md:pt-[110px]",
    isAdeming && "bg-background text-foreground"
  );
  const lang = langHeader || (pathname.includes('/artist/youssef') || market.market_code === 'ARTIST' ? 'en-EU' : (market.primary_language || 'nl-BE'));

  // 🛡️ CHRIS-PROTOCOL: ID-First Handshake (v3.0.0)
  // We pass worldId and languageId to Providers to anchor the entire client-side context.
  const handshakeContext = {
    worldId,
    languageId,
    journeyId,
    worldConfig
  };

  if (isAdminRoute || isStudioPage || (isAdeming && isOffline && !isAdmin)) {
    return (
      <html lang={lang} className={htmlClass} suppressHydrationWarning>
        <body className={bodyClass} suppressHydrationWarning>
          <Providers 
            lang={lang} 
            market={market} 
            initialTranslations={studioTranslations} 
            initialJourney={initialJourney} 
            initialUsage={initialUsage}
            handshakeContext={handshakeContext}
          >
            <SafeErrorGuard>
              <Suspense fallback={isAdeming && isOffline ? null : <LoadingScreenInstrument text={isAdminRoute ? "Beheer laden..." : "Studio laden..."} />}>
                {children}
              </Suspense>
            </SafeErrorGuard>
          </Providers>
        </body>
      </html>
    );
  }
  
  // 🛡️ VISIONARY MANDATE: Journey logic exclusively from market data
  const isSpecialJourney = ['ADEMING', 'PORTFOLIO', 'ARTIST'].includes(market.market_code);
  const isStudioJourney = ['STUDIO', 'ACADEMY'].includes(market.market_code);
  
  const isUnderConstruction = headersList.get('x-voices-under-construction') === 'true' || 
    pathname === '/under-construction' ||
    pathname === '/under-construction/';
  
  const isYoussefJourney = pathname.includes('/artist/youssef') || market.market_code === 'ARTIST';
  
  const isArtistJourney = market.market_code === 'ARTIST' || pathname.includes('/artist/') || pathname.includes('/voice/');

  const showVoicy = !isArtistJourney && !isUnderConstruction && market.market_code !== 'ADEMING';
  const showTopBar = !isArtistJourney && !isUnderConstruction && market.market_code !== 'ADEMING' && market.market_code !== 'PORTFOLIO';
  const showGlobalNav = !isUnderConstruction && market.market_code !== 'ADEMING' && market.market_code !== 'PORTFOLIO';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": market.market_code === 'ADEMING' ? "WebApplication" : (['PORTFOLIO', 'ARTIST'].includes(market.market_code) ? "Person" : "Organization"),
    "name": market.name,
    "url": `https://${cleanHost}`,
    "logo": `https://${cleanHost}${market.logo_url}`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": market.phone,
      "contactType": "customer service",
      "email": market.email,
      "availableLanguage": ["Dutch", "French", "English"]
    }
  };

  // UNDER CONSTRUCTION MODE: Minimalistische layout zonder navigatie/footer/voicy
  if (isUnderConstruction) {
    return (
      <html lang={lang} className={htmlClass} suppressHydrationWarning>
      <body className={bodyClass}>
        <Providers 
          lang={lang} 
          market={market} 
          initialTranslations={studioTranslations} 
          initialJourney={initialJourney} 
          initialUsage={initialUsage}
          handshakeContext={handshakeContext}
        >
          <Suspense fallback={null}>
            <SonicDNAHandler />
          </Suspense>
          <PageWrapperInstrument>
            {children}
          </PageWrapperInstrument>
        </Providers>
      </body>
    </html>
    );
  }

  return (
    <html lang={lang} className={htmlClass} suppressHydrationWarning>
      <body className={bodyClass}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers 
          lang={lang} 
          market={market} 
          initialTranslations={studioTranslations} 
          initialJourney={initialJourney} 
          initialUsage={initialUsage}
          handshakeContext={handshakeContext}
        >
          <SafeErrorGuard>
            <PageWrapperInstrument>
              <Suspense fallback={<LoadingScreenInstrument text="Voices laden..." />}>
                {children}
              </Suspense>
            </PageWrapperInstrument>
            <EditModeOverlay>
              <GhostModeBar />
              <LiquidTransitionOverlay />
              <CodyPreviewBanner />
              <SafeErrorGuard name="Instruments" fallback={null}>
                <Suspense fallback={null}>
                  <VoicejarTracker />
                </Suspense>
                <Analytics />
                {process.env.NODE_ENV === 'development' && <VercelToolbar />}
                <CommandPalette />
                <SpotlightDashboard />
                <GlobalModalManager />
                {!isArtistJourney && market.market_code !== 'ARTIST' && (
                  <Suspense fallback={null}>
                    {market.market_code === 'PORTFOLIO' && <JohfrahActionDock />}
                    {market.market_code === 'PORTFOLIO' && <JohfrahConfiguratorSPA />}
                    {market.market_code === 'BE' && <CastingDock />}
                  </Suspense>
                )}
                <Suspense fallback={null}>
                  <SonicDNAHandler isAdeming={market.market_code === 'ADEMING'} />
                  <GlobalAudioOrchestrator />
                </Suspense>
                {showVoicy && (
                  <Suspense fallback={null}>
                    <VoicyBridge />
                    <VoicyChat />
                  </Suspense>
                )}
              </SafeErrorGuard>
              
              {/* 🎭 PORTFOLIO WORLD: Custom Navigation (Johfrah Branding) */}
              {market.market_code === 'PORTFOLIO' && (
                <ContainerInstrument plain className="fixed top-0 left-0 right-0 z-[200]">
                  <ContainerInstrument plain className="h-[80px] bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-8">
                    <Link href="/" className="text-2xl font-light tracking-tighter">
                      JOHFRAH<span className="text-primary">.</span>
                    </Link>
                    <div className="flex gap-8 items-center text-[13px] font-bold tracking-[0.2em] uppercase text-va-black/40">
                      <Link href="/portfolio" className="hover:text-primary transition-colors">Portfolio</Link>
                      <Link href="/tarieven" className="hover:text-primary transition-colors">Tarieven</Link>
                      <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </div>
                  </ContainerInstrument>
                </ContainerInstrument>
              )}

              <ContainerInstrument plain className="fixed top-0 left-0 right-0 z-[200]">
                <SafeErrorGuard name="GlobalNav" fallback={<ContainerInstrument plain className="h-[60px] bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center px-6"><ContainerInstrument plain className="h-8 w-32 bg-va-black/10 animate-pulse rounded-md" /></ContainerInstrument>}>
                  <Suspense fallback={<ContainerInstrument plain className="h-10 bg-va-off-white/50 animate-pulse" />}>
                    {showTopBar && <TopBar />}
                    {showGlobalNav && <GlobalNav initialNavConfig={navConfig || undefined} />}
                  </Suspense>
                </SafeErrorGuard>
              </ContainerInstrument>
              <CookieBanner />
              <SafeErrorGuard name="Footer" fallback={<div className="py-12 bg-va-off-white border-t border-black/5 text-center text-[11px] text-va-black/20 uppercase tracking-widest">Voices Footer Safe-Mode</div>}>
                {market.market_code !== 'ADEMING' && market.market_code !== 'PORTFOLIO' && <FooterWrapper />}
                
                {/* 🎭 PORTFOLIO WORLD: Custom Footer */}
                {market.market_code === 'PORTFOLIO' && (
                  <footer className="py-24 bg-va-black text-white">
                    <ContainerInstrument className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                      <div className="text-3xl font-light tracking-tighter">
                        JOHFRAH<span className="text-primary">.</span>
                      </div>
                      <div className="flex gap-12 text-[11px] font-bold tracking-[0.3em] uppercase text-white/40">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                      </div>
                      <div className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/20">
                        © 2026 Pure Excellence
                      </div>
                    </ContainerInstrument>
                  </footer>
                )}
              </SafeErrorGuard>
            </EditModeOverlay>
          </SafeErrorGuard>
        </Providers>
      </body>
    </html>
  );
}
