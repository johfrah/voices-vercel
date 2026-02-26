import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { GhostModeBar } from "@/components/admin/GhostModeBar";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import { LoadingScreenInstrument } from "@/components/ui/LayoutInstruments";
import { PageWrapperInstrument } from "@/components/ui/LayoutInstrumentsServer";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstrumentsServer";
import { CookieBanner } from "@/components/ui/Legal/CookieBanner";
import { GlobalModalManager } from "@/components/ui/GlobalModalManager";
import { LiquidTransitionOverlay } from "@/components/ui/LiquidTransitionOverlay";
import { MarketManagerServer } from "@/lib/system/market-manager-server";
import { MarketDatabaseService } from "@/lib/system/market-manager-db";
import { Analytics } from "@vercel/analytics/react";
import { VercelToolbar } from "@vercel/toolbar/next";
import type { Metadata, Viewport } from "next";
import { Inter, Raleway, Cormorant_Garamond } from "next/font/google";
import { headers } from "next/headers";
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
    return await Promise.race([marketPromise, timeoutPromise]) as any;
  } catch (err) {
    console.error(' getMarketSafe: Failed or timed out:', err);
    return MarketManagerServer.getCurrentMarket(process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManagerServer.getMarketDomains()['BE'].replace('https://', ''));
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

  // 🛡️ CHRIS-PROTOCOL: Parallel Pulse Fetching (v2.14.798)
  // We fetch market, locales and translations in parallel to minimize TTFB
  const [market, alternateLanguages, translations] = await Promise.all([
    getMarketSafe(lookupHost),
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
    icon: '/assets/ademing/favicon.ico',
    apple: '/assets/ademing/apple-touch-icon.png',
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

  //  CHRIS-PROTOCOL: Parallel Pulse Fetching (v2.14.798)
  const [market, translations] = await Promise.all([
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
    })()
  ]);
  
  // 🛡️ CHRIS-PROTOCOL: Journey Detection for Provider Injection
  const segments = params.slug || pathname.split('/').filter(Boolean);
  const journeySegment = segments[1]?.toLowerCase();
  const journeyMap: Record<string, any> = {
    'telefoon': 'telephony',
    'telefooncentrale': 'telephony',
    'telephony': 'telephony',
    'video': 'video',
    'commercial': 'commercial',
    'reclame': 'commercial'
  };
  const initialJourney = journeySegment ? journeyMap[journeySegment] : undefined;
  const initialUsage = initialJourney ? (initialJourney === 'telephony' ? 'telefonie' : (initialJourney === 'commercial' ? 'commercial' : 'unpaid')) : undefined;

  // 🛡️ CHRIS-PROTOCOL: Server-side Nav Config Fetching (v2.14.611)
  const getJourneyKey = (marketCode: string) => {
    switch (marketCode) {
      case 'ADEMING': return 'ademing';
      case 'PORTFOLIO': return 'portfolio';
      case 'ARTIST': return 'artist';
      case 'STUDIO': return 'studio';
      case 'ACADEMY': return 'academy';
      default: return 'agency';
    }
  };
  const navConfig = await ConfigBridge.getNavConfig(getJourneyKey(market.market_code));

  // 🛡️ CHRIS-PROTOCOL: Force Client-Only rendering for Admin routes to prevent hydration mismatch (#419)
  const isAdminRoute = pathname.startsWith('/admin') || segments[0] === 'admin';
  
  // 🛡️ CHRIS-PROTOCOL: Force Client-Only rendering for Studio page to prevent hydration mismatch (#419)
  const isStudioPage = pathname.startsWith('/studio/') || pathname === '/studio' || pathname === '/workshops' || pathname === '/voorwaarden-studio';
  
  const isAdeming = market.market_code === 'ADEMING';
  const htmlClass = `${raleway.className} ${inter.className} ${cormorant.variable} theme-${isAdeming ? 'ademing' : market.theme} ${raleway.variable}`;
  const bodyClass = cn(
    "pb-24 md:pb-0 touch-manipulation va-main-layout",
    !isAdeming && "pt-[80px] md:pt-[110px]",
    isAdeming && "bg-background text-foreground"
  );
  const lang = langHeader || (pathname.includes('/artist/youssef') || market.market_code === 'ARTIST' ? 'en-EU' : (market.primary_language || 'nl-BE'));

  if (isAdminRoute || isStudioPage) {
    return (
      <html lang={lang} className={htmlClass} suppressHydrationWarning>
        <body className={bodyClass}>
          <Providers lang={lang} market={market} initialTranslations={translations} initialJourney={initialJourney} initialUsage={initialUsage}>
            <SafeErrorGuard>
              <Suspense fallback={<LoadingScreenInstrument text={isAdminRoute ? "Beheer laden..." : "Studio laden..."} />}>
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
  const showTopBar = !isArtistJourney && !isUnderConstruction && market.market_code !== 'ADEMING';
  const showGlobalNav = !isUnderConstruction && market.market_code !== 'ADEMING';

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
        <Providers lang={lang} market={market} initialTranslations={translations} initialJourney={initialJourney} initialUsage={initialUsage}>
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
        <Providers lang={lang} market={market} initialTranslations={translations} initialJourney={initialJourney} initialUsage={initialUsage}>
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
              <Suspense fallback={null}>
                <VoicejarTracker />
              </Suspense>
              <div className="fixed top-0 left-0 right-0 z-[200]">
                <Suspense fallback={<div className="h-10 bg-va-off-white/50 animate-pulse" />}>
                  {showTopBar && <TopBar />}
                  {showGlobalNav && <GlobalNav initialNavConfig={navConfig || undefined} />}
                </Suspense>
              </div>
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
              <CookieBanner />
              {market.market_code !== 'ADEMING' && <FooterWrapper />}
            </EditModeOverlay>
          </SafeErrorGuard>
        </Providers>
      </body>
    </html>
  );
}
