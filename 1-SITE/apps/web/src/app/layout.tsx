import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { GhostModeBar } from "@/components/admin/GhostModeBar";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import FooterWrapper from "@/components/ui/FooterWrapper";
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
import { Inter, Raleway } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";
import { Providers } from "./Providers";
import { getTranslationsServer } from "@/lib/services/api-server";
import { cn } from "@/lib/utils/utils";

//  NUCLEAR LOADING MANDATE: Zware instrumenten dynamisch laden (ssr: false) voor 100ms LCP
const JohfrahActionDock = dynamic(() => import("@/components/portfolio/JohfrahActionDock").then(mod => mod.JohfrahActionDock), { ssr: false });
const JohfrahConfiguratorSPA = dynamic(() => import("@/components/portfolio/JohfrahConfiguratorSPA").then(mod => mod.JohfrahConfiguratorSPA), { ssr: false });
const CastingDock = dynamic(() => import("@/components/ui/CastingDock").then(mod => mod.CastingDock), { ssr: false });
const SonicDNAHandler = dynamic(() => import("@/components/ui/SonicDNA").then(mod => mod.SonicDNAHandler), { ssr: false });
const GlobalAudioOrchestrator = dynamic(() => import("@/components/ui/GlobalAudioOrchestrator").then(mod => mod.GlobalAudioOrchestrator), { ssr: false });
const TopBar = dynamic(() => import("@/components/ui/TopBar").then(mod => mod.TopBar), { ssr: false });
const GlobalNav = dynamic(() => import("@/components/ui/GlobalNav"), { ssr: false });
const VoicejarTracker = dynamic(() => import("@/components/ui/VoicejarTracker").then(mod => mod.VoicejarTracker), { ssr: false });
const VoicyBridge = dynamic(() => import("@/components/ui/VoicyBridge").then(mod => mod.VoicyBridge), { ssr: false });
const VoicyChat = dynamic(() => import("@/components/ui/VoicyChat").then(mod => mod.VoicyChatV2).then(mod => ({ default: mod })), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

/** Veilige market-resolutie: voorkomt 500 bij onverwachte hosts (Combell proxy, etc.) */
async function getMarketSafe(host: string) {
  try {
    return await MarketDatabaseService.getCurrentMarketAsync(host);
  } catch {
    return MarketManagerServer.getCurrentMarket(process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || "voices.be");
  }
}
const raleway = Raleway({ subsets: ["latin"], variable: '--font-raleway' });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const domains = MarketManagerServer.getMarketDomains();
  const pathname = headersList.get('x-voices-pathname') || '';
  const host = headersList.get("x-voices-host") || headersList.get("host") || process.env.NEXT_PUBLIC_SITE_URL || 'www.voices.be';
  const cleanHost = host.replace(/^https?:\/\//, '');
  
  // 🛡️ CHRIS-PROTOCOL: Pass pathname to market manager for sub-journey detection (e.g. /studio, /academy)
  let lookupHost = cleanHost;
  if (pathname.startsWith('/studio')) lookupHost = `${cleanHost}/studio`;
  else if (pathname.startsWith('/academy')) lookupHost = `${cleanHost}/academy`;

  const market = await getMarketSafe(lookupHost);
  const baseUrl = `https://${market.market_code === 'BE' ? 'www.voices.be' : (market.market_code === 'NLNL' ? 'www.voices.nl' : cleanHost)}`;

  // 🛡️ VISIONARY MANDATE: Title and description exclusively from market data
  const title = market.seo_data?.title || (
    market.market_code === 'ADEMING' ? "Ademing | Kom tot rust" : 
    (market.market_code === 'PORTFOLIO' || market.market_code === 'ARTIST') ? `${market.name} | Vlaamse Voice-over & Regisseur` : 
    `${market.name} | Het Vriendelijkste Stemmenbureau`
  );

  const description = market.seo_data?.description || (
    market.market_code === 'ADEMING' ? "Adem in. Kom tot rust." :
    market.market_code === 'PORTFOLIO' ? "De stem achter het verhaal." :
    "Een warm en vertrouwd geluid voor elk project."
  );

  //  CHRIS-PROTOCOL: Dynamically generate alternate languages from MarketManager (Data-Driven)
  let alternateLanguages = {};
  try {
    alternateLanguages = await MarketDatabaseService.getAllLocalesAsync();
  } catch (err) {
    console.error(' generateMetadata: Failed to load locales:', err);
    alternateLanguages = {
      'nl-BE': 'https://www.voices.be',
      'nl-NL': 'https://www.voices.nl',
      'fr-FR': 'https://www.voices.fr',
      'en-EU': 'https://www.voices.eu'
    };
  }

  return {
    title: {
      default: title,
      template: `%s | ${market.name}`,
    },
    description,
    metadataBase: host ? new URL(baseUrl) : undefined,
    alternates: {
      canonical: "/",
      languages: alternateLanguages,
    },
    openGraph: {
      type: "website",
      locale: market.seo_data?.locale_code?.replace('-', '_') || (market.language === "nl" ? "nl_BE" : "fr_FR"),
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const domains = MarketManagerServer.getMarketDomains();
  const pathname = headersList.get('x-voices-pathname') || '';
  const host = headersList.get("x-voices-host") || headersList.get("host") || process.env.NEXT_PUBLIC_SITE_URL || 'www.voices.be';
  const cleanHost = host.replace(/^https?:\/\//, '');
  
  // 🛡️ CHRIS-PROTOCOL: Pass pathname to market manager for sub-journey detection (e.g. /studio, /academy)
  let lookupHost = cleanHost;
  if (pathname.startsWith('/studio')) lookupHost = `${cleanHost}/studio`;
  else if (pathname.startsWith('/academy')) lookupHost = `${cleanHost}/academy`;

  const market = await getMarketSafe(lookupHost);
  
  // 🛡️ VISIONARY MANDATE: Journey logic exclusively from market data
  const isSpecialJourney = ['ADEMING', 'PORTFOLIO', 'ARTIST'].includes(market.market_code);
  const isStudioJourney = ['STUDIO', 'ACADEMY'].includes(market.market_code);
  
  const isUnderConstruction = headersList.get('x-voices-under-construction') === 'true' || 
    pathname === '/under-construction' ||
    pathname === '/under-construction/';
  
  const langHeader = headersList.get('x-voices-lang');
  const isYoussefJourney = pathname.includes('/artist/youssef') || market.market_code === 'ARTIST';
  
  const lang = langHeader || (isYoussefJourney ? 'en' : (market.language || 'nl'));
  
  //  CHRIS-PROTOCOL: Safe translation loading to prevent 500 on root layout
  let translations = {};
  try {
    translations = await getTranslationsServer(lang);
  } catch (err: any) {
    console.error(' RootLayout: Failed to load translations:', err);
  }

  const isArtistJourney = market.market_code === 'ARTIST' || pathname.includes('/artist/') || pathname.includes('/voice/');
  const showVoicy = market.has_voicy !== false && !isArtistJourney && !isUnderConstruction;
  const showTopBar = !isUnderConstruction;
  const showGlobalNav = !isUnderConstruction;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": market.seo_data?.schema_type || (market.market_code === 'ADEMING' ? "WebApplication" : (market.market_code === 'PORTFOLIO' || market.market_code === 'ARTIST') ? "Person" : "Organization"),
    "name": market.name,
    "url": cleanHost ? `https://${cleanHost}` : '',
    "logo": market.logo_url?.startsWith('http') ? market.logo_url : `https://${cleanHost}${market.logo_url || ''}`,
    "description": market.seo_data?.description || (
      market.market_code === 'ADEMING' ? "Platform voor meditatie en innerlijke rust." : 
      market.market_code === 'PORTFOLIO' ? "Vlaamse voice-over & regisseur." : 
      "Het vriendelijkste stemmenbureau."
    ),
    "sameAs": Object.values(market.social_links || {}).filter(Boolean),
    "jobTitle": (market.market_code === 'PORTFOLIO' || market.market_code === 'ARTIST') ? (market.seo_data?.description || '').split('.')[0] : undefined,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": market.phone || '',
      "contactType": "customer service",
      "email": market.email || '',
      "availableLanguage": market.supported_languages || []
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": market.address || '',
      "addressLocality": "Leuven",
      "addressRegion": "Vlaams-Brabant",
      "postalCode": "3000",
      "addressCountry": "BE"
    },
    "vatID": market.vat_number || '',
    "founder": (market.market_code !== 'PORTFOLIO' && market.market_code !== 'ARTIST') ? {
      "@type": "Person",
      "name": "Johfrah Lefebvre",
      "sameAs": (MarketManagerServer.getMarketDomains() || {})['BE']
    } : undefined
  };

  const htmlClass = `${raleway.className} ${inter.className} theme-${market.theme} ${raleway.variable}`;
  const bodyClass = "pb-24 md:pb-0 touch-manipulation va-main-layout pt-[80px] md:pt-[110px]";

  // UNDER CONSTRUCTION MODE: Minimalistische layout zonder navigatie/footer/voicy
  if (isUnderConstruction) {
    return (
      <html lang={lang} className={htmlClass} data-build-id={Date.now()} suppressHydrationWarning>
        <body className={bodyClass}>
          <Providers lang={lang} initialTranslations={translations}>
            <SonicDNAHandler />
            <PageWrapperInstrument>
              {children}
            </PageWrapperInstrument>
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang={lang} className={htmlClass} data-build-id={Date.now()} suppressHydrationWarning>
      <body className={bodyClass}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers lang={lang} initialTranslations={translations}>
          <PageWrapperInstrument>
            <Suspense fallback={<LoadingScreenInstrument />}>
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
                {showGlobalNav && <GlobalNav />}
              </Suspense>
            </div>
            <Analytics />
            {process.env.NODE_ENV === 'development' && <VercelToolbar />}
            <CommandPalette />
            <SpotlightDashboard />
            <Toaster position="bottom-right" />
            <GlobalModalManager />
            {!isArtistJourney && market.market_code !== 'ARTIST' && (
              <Suspense fallback={null}>
                {market.market_code === 'PORTFOLIO' && <JohfrahActionDock />}
                {market.market_code === 'PORTFOLIO' && <JohfrahConfiguratorSPA />}
                {market.market_code === 'BE' && <CastingDock />}
              </Suspense>
            )}
            <Suspense fallback={null}>
              <SonicDNAHandler />
              <GlobalAudioOrchestrator />
            </Suspense>
            {showVoicy && (
              <Suspense fallback={null}>
                <VoicyBridge />
                <VoicyChat />
              </Suspense>
            )}
            <CookieBanner />
            <FooterWrapper />
          </EditModeOverlay>
        </Providers>
      </body>
    </html>
  );
}
