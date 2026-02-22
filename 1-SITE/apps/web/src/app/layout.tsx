import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { GhostModeBar } from "@/components/admin/GhostModeBar";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import FooterWrapper from "@/components/ui/FooterWrapper";
import { TopBar } from "@/components/ui/TopBar";
import { LoadingScreenInstrument } from "@/components/ui/LayoutInstruments";
import { PageWrapperInstrument } from "@/components/ui/LayoutInstrumentsServer";
import { CookieBanner } from "@/components/ui/Legal/CookieBanner";
import { GlobalModalManager } from "@/components/ui/GlobalModalManager";
import { LiquidTransitionOverlay } from "@/components/ui/LiquidTransitionOverlay";
import { MarketManager } from "@config/market-manager";
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
import { getTranslationsServer } from "@/lib/api-server";

//  NUCLEAR LOADING MANDATE: Zware instrumenten dynamisch laden (ssr: false) voor 100ms LCP
const JohfrahActionDock = dynamic(() => import("@/components/portfolio/JohfrahActionDock").then(mod => mod.JohfrahActionDock), { ssr: false });
const JohfrahConfiguratorSPA = dynamic(() => import("@/components/portfolio/JohfrahConfiguratorSPA").then(mod => mod.JohfrahConfiguratorSPA), { ssr: false });
const CastingDock = dynamic(() => import("@/components/ui/CastingDock").then(mod => mod.CastingDock), { ssr: false });
const SonicDNAHandler = dynamic(() => import("@/components/ui/SonicDNA").then(mod => mod.SonicDNAHandler), { ssr: false });
const GlobalAudioOrchestrator = dynamic(() => import("@/components/ui/GlobalAudioOrchestrator").then(mod => mod.GlobalAudioOrchestrator), { ssr: false });
const GlobalNav = dynamic(() => import("@/components/ui/GlobalNav"), { ssr: false });
const VoicejarTracker = dynamic(() => import("@/components/ui/VoicejarTracker").then(mod => mod.VoicejarTracker), { ssr: false });
const VoicyBridge = dynamic(() => import("@/components/ui/VoicyBridge").then(mod => mod.VoicyBridge), { ssr: false });
const VoicyChat = dynamic(() => import("@/components/ui/VoicyChat").then(mod => mod.VoicyChatV2).then(mod => ({ default: mod })), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

/** Veilige market-resolutie: voorkomt 500 bij onverwachte hosts (Combell proxy, etc.) */
async function getMarketSafe(host: string) {
  try {
    return await MarketManager.getCurrentMarketAsync(host);
  } catch {
    return MarketManager.getCurrentMarket("voices.be");
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
  const host = headersList.get("x-voices-host") || headersList.get("host") || "voices.be";
  const pathname = headersList.get('x-voices-pathname') || '';
  
  // 🛡️ CHRIS-PROTOCOL: Pass pathname to market manager for sub-journey detection (e.g. /studio, /academy)
  let lookupHost = host;
  if (pathname.startsWith('/studio')) lookupHost = `${host}/studio`;
  else if (pathname.startsWith('/academy')) lookupHost = `${host}/academy`;

  const market = await getMarketSafe(lookupHost);
  const baseUrl = `https://${host}`;

  const isAdeming = market.market_code === 'ADEMING';
  const isPortfolioMarket = market.market_code === 'PORTFOLIO';
  const isArtistMarket = market.market_code === 'ARTIST';
  const isStudioMarket = market.market_code === 'STUDIO';
  const isAcademyMarket = market.market_code === 'ACADEMY';

  //  CHRIS-PROTOCOL: Dynamically generate alternate languages from MarketManager (Data-Driven)
  const alternateLanguages = await MarketManager.getAllLocalesAsync();

  return {
    title: {
      default: isAdeming ? "Ademing | Kom tot rust" : isPortfolioMarket ? `${market.name} | Vlaamse Voice-over & Regisseur` : isArtistMarket ? `${market.name} | Artist & Singer` : "Voices | Het Vriendelijkste Stemmenbureau",
      template: isAdeming ? "%s | Ademing" : isPortfolioMarket ? `%s | ${market.name}` : isArtistMarket ? `%s | ${market.name}` : "%s | Voices",
    },
    description: market.seo_data?.description || (isAdeming 
      ? "Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf." 
      : isPortfolioMarket
      ? "De stem achter het verhaal. Warme, natuurlijke Vlaamse voice-over & host voor nationale TV-spots en corporate video's."
      : isArtistMarket
      ? "The voice of a new generation. Discover the music and story of Youssef Zaki."
      : isStudioMarket
      ? "Professionele voice-over workshops."
      : isAcademyMarket
      ? "Leer de kunst van voice-over bij de Voices Academy."
      : "Een warm en vertrouwd geluid voor elk project. Wij helpen je de perfecte stem te vinden."),
    metadataBase: new URL(baseUrl),
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
          url: isPortfolioMarket ? "/assets/common/branding/johfrah/johfrah-hero.jpg" : "/assets/common/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${market.name} - ${market.seo_data?.description?.substring(0, 50) || 'Voices'}`,
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
  const host = headersList.get("x-voices-host") || headersList.get("host") || "voices.be";
  const pathname = headersList.get('x-voices-pathname') || '';
  
  // 🛡️ CHRIS-PROTOCOL: Pass pathname to market manager for sub-journey detection (e.g. /studio, /academy)
  let lookupHost = host;
  if (pathname.startsWith('/studio')) lookupHost = `${host}/studio`;
  else if (pathname.startsWith('/academy')) lookupHost = `${host}/academy`;

  const market = await getMarketSafe(lookupHost);
  const isAdeming = market.market_code === 'ADEMING';
  const isPortfolioMarket = market.market_code === 'PORTFOLIO';
  const isArtistMarket = market.market_code === 'ARTIST';
  const isStudioMarket = market.market_code === 'STUDIO';
  const isAcademyMarket = market.market_code === 'ACADEMY';
  
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
  const showVoicy = !isArtistJourney && !isUnderConstruction;
  const showTopBar = !isArtistJourney && !isUnderConstruction;
  const showGlobalNav = !isUnderConstruction;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": market.seo_data?.schema_type || (isAdeming ? "WebApplication" : (isPortfolioMarket || isArtistMarket) ? "Person" : "Organization"),
    "name": market.name,
    "url": `https://${host}`,
    "logo": `https://${host}${market.logo_url}`,
    "description": market.seo_data?.description || (isAdeming 
      ? "Platform voor meditatie en innerlijke rust." 
      : isPortfolioMarket 
      ? "Vlaamse voice-over & regisseur." 
      : isArtistMarket 
      ? "Artist and Singer." 
      : isStudioMarket
      ? "Professionele voice-over workshops."
      : isAcademyMarket
      ? "Leer de kunst van voice-over bij de Voices Academy."
      : "Het vriendelijkste stemmenbureau."),
    "sameAs": Object.values(market.social_links || {}).filter(Boolean),
    "jobTitle": (isPortfolioMarket || isArtistMarket) ? market.seo_data?.description?.split('.')[0] : undefined,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": market.phone,
      "contactType": "customer service",
      "email": market.email,
      "availableLanguage": market.supported_languages
    },
    "founder": (!isPortfolioMarket && !isArtistMarket) ? {
      "@type": "Person",
      "name": "Johfrah Lefebvre",
      "sameAs": "https://www.johfrah.be"
    } : undefined
  };

  const htmlClass = `${raleway.className} ${inter.className} theme-${market.theme} ${raleway.variable}`;
  const bodyClass = "pb-24 md:pb-0 touch-manipulation va-main-layout";

  // UNDER CONSTRUCTION MODE: Minimalistische layout zonder navigatie/footer/voicy
  if (isUnderConstruction) {
    return (
      <html lang={lang} className={htmlClass}>
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
    <html lang={lang} className={htmlClass}>
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
            {!isArtistJourney && (
              <Suspense fallback={null}>
                <JohfrahActionDock />
                <JohfrahConfiguratorSPA />
                <CastingDock />
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
