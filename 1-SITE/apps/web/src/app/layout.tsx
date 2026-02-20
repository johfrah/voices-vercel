import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { GhostModeBar } from "@/components/admin/GhostModeBar";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import FooterWrapper from "@/components/ui/FooterWrapper";
import { TopBar } from "@/components/ui/TopBar";
import { LoadingScreenInstrument, PageWrapperInstrument, RootLayoutInstrument } from "@/components/ui/LayoutInstruments";
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
function getMarketSafe(host: string) {
  try {
    return MarketManager.getCurrentMarket(host);
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
  const host = headersList.get("host") || "voices.be";
  const market = getMarketSafe(host);
  const baseUrl = `https://${host}`;

  const isAdeming = market.market_code === 'ADEMING';
  const isJohfrah = market.market_code === 'JOHFRAH';

  return {
    title: {
      default: isAdeming ? "Ademing | Kom tot rust" : isJohfrah ? "Johfrah Lefebvre | Vlaamse Voice-over & Regisseur" : "Voices | Het Vriendelijkste Stemmenbureau",
      template: isAdeming ? "%s | Ademing" : isJohfrah ? "%s | Johfrah Lefebvre" : "%s | Voices",
    },
    description: isAdeming 
      ? "Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf." 
      : isJohfrah
      ? "De stem achter het verhaal. Warme, natuurlijke Vlaamse voice-over & host voor nationale TV-spots en corporate video's."
      : "Een warm en vertrouwd geluid voor elk project. Wij helpen je de perfecte stem te vinden.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
      languages: {
        "nl-BE": "https://voices.be",
        "nl-NL": "https://voices.nl",
        "fr-FR": "https://voices.fr",
        "de-DE": "https://voices.de",
      },
    },
    openGraph: {
      type: "website",
      locale: market.language === "nl" ? "nl_BE" : "fr_FR",
      url: baseUrl,
      siteName: isJohfrah ? "Johfrah Lefebvre" : "Voices",
      images: [
        {
          url: isJohfrah ? "/assets/common/branding/johfrah/johfrah-hero.jpg" : "/assets/common/og-image.jpg",
          width: 1200,
          height: 630,
          alt: isJohfrah ? "Johfrah Lefebvre - Vlaamse Voice-over" : "Voices - Het Vriendelijkste Stemmenbureau",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@voices",
      creator: "@johfrah",
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
  const host = headersList.get("host") || "voices.be";
  const market = getMarketSafe(host);
  const isAdeming = market.market_code === 'ADEMING';
  const isJohfrah = market.market_code === 'JOHFRAH';
  const isUnderConstruction = headersList.get('x-voices-under-construction') === 'true' || 
    headersList.get('x-voices-pathname') === '/under-construction' ||
    headersList.get('x-voices-pathname') === '/under-construction/';
  
  const langHeader = headersList.get('x-voices-lang');
  const pathname = headersList.get('x-voices-pathname') || '';
  const isYoussefJourney = pathname.includes('/artist/youssef') || market.market_code === 'YOUSSEF';
  
  const lang = langHeader || (isYoussefJourney ? 'en' : (market.language || 'nl'));
  const translations = await getTranslationsServer(lang);

  const isYoussefMarket = market.market_code === 'YOUSSEF' || pathname.includes('/artist/youssef') || host.includes('youssefzaki.eu');
  const isArtistJourney = pathname.includes('/artist/') || pathname.includes('/voice/') || host.includes('youssefzaki.eu');
  const showVoicy = !isArtistJourney && !isUnderConstruction;
  const showTopBar = !isArtistJourney && !isUnderConstruction;
  const showGlobalNav = !isUnderConstruction;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isAdeming ? "WebApplication" : isJohfrah ? "Person" : isYoussefMarket ? "Person" : "Organization",
    "name": isAdeming ? "Ademing" : isJohfrah ? "Johfrah Lefebvre" : isYoussefMarket ? "Youssef Zaki" : "Voices",
    "url": `https://${host}`,
    "logo": isYoussefMarket ? `https://${host}/assets/common/branding/Voices-Artists-LOGO.webp` : `https://${host}${market.logo_url}`,
    "sameAs": isJohfrah ? [
      "https://www.instagram.com/johfrah",
      "https://www.linkedin.com/in/johfrah"
    ] : isYoussefMarket ? [
      "https://www.instagram.com/youssefzaki.eu",
      "https://www.youtube.com/@youssefzaki"
    ] : [
      "https://www.instagram.com/voices.be",
      "https://www.linkedin.com/company/voices-be"
    ],
    "jobTitle": isJohfrah ? "Voice-over & Regisseur" : isYoussefMarket ? "Artist & Singer" : undefined,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": market.phone,
      "contactType": "customer service",
      "email": market.email,
      "availableLanguage": ["Dutch", "French", "English"]
    },
    "founder": (!isJohfrah && !isYoussefMarket) ? {
      "@type": "Person",
      "name": "Johfrah Lefebvre",
      "sameAs": "https://www.johfrah.be"
    } : undefined
  };

  // UNDER CONSTRUCTION MODE: Minimalistische layout zonder navigatie/footer/voicy
  if (isUnderConstruction) {
    return (
      <RootLayoutInstrument lang={lang} className={`${raleway.className} ${inter.className} theme-${market.theme} ${raleway.variable}`}>
        <Providers initialTranslations={translations}>
          <SonicDNAHandler />
          <PageWrapperInstrument>
            {children}
          </PageWrapperInstrument>
        </Providers>
      </RootLayoutInstrument>
    );
  }

  return (
    <RootLayoutInstrument lang={lang} className={`${raleway.className} ${inter.className} theme-${market.theme} ${raleway.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Providers initialTranslations={translations}>
        <GhostModeBar />
        <EditModeOverlay>
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
          <VercelToolbar />
          <CommandPalette />
          <SpotlightDashboard />
          <Toaster position="bottom-right" />
          <GlobalModalManager />
          <PageWrapperInstrument>
            <Suspense fallback={<LoadingScreenInstrument />}>
              {children}
            </Suspense>
          </PageWrapperInstrument>
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
    </RootLayoutInstrument>
  );
}
