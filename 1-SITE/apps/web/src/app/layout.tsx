import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import FooterWrapper from "@/components/ui/FooterWrapper";
import GlobalNav from "@/components/ui/GlobalNav";
import { LoadingScreenInstrument, PageWrapperInstrument, RootLayoutInstrument } from "@/components/ui/LayoutInstruments";
import { CookieBanner } from "@/components/ui/Legal/CookieBanner";
import { MobileFloatingDock } from "@/components/ui/MobileFloatingDock";
import { SonicDNAHandler } from "@/components/ui/SonicDNA";
import { VoicejarTracker } from "@/components/ui/VoicejarTracker";
import { VoicyBridge } from "@/components/ui/VoicyBridge";
import { VoicyChat } from "@/components/ui/VoicyChat";
import { GlobalAudioOrchestrator } from "@/components/ui/GlobalAudioOrchestrator";
import { MarketManager } from "@config/market-manager";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter, Raleway } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";
import { Providers } from "./Providers";

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

  return {
    title: {
      default: isAdeming ? "Ademing | Kom tot rust" : "Voices | Het Vriendelijkste Stemmenbureau",
      template: isAdeming ? "%s | Ademing" : "%s | Voices",
    },
    description: isAdeming 
      ? "Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf." 
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
      siteName: "Voices",
      images: [
        {
          url: "/assets/common/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Voices - Het Vriendelijkste Stemmenbureau",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const host = headersList.get("host") || "voices.be";
  const isUnderConstruction = headersList.get('x-voices-under-construction') === 'true' || headersList.get('x-voices-pathname') === '/under-construction';
  const market = getMarketSafe(host);
  const isAdeming = market.market_code === 'ADEMING';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isAdeming ? "WebApplication" : "Organization",
    "name": isAdeming ? "Ademing" : "Voices",
    "url": `https://${host}`,
    "logo": `https://${host}${market.logo_url}`,
    "sameAs": [
      "https://www.instagram.com/voices.be",
      "https://www.linkedin.com/company/voices-be"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": market.phone,
      "contactType": "customer service",
      "email": market.email,
      "availableLanguage": ["Dutch", "French", "English"]
    }
  };

  // 🚧 UNDER CONSTRUCTION MODE: Minimalistische layout zonder navigatie/footer
  if (isUnderConstruction) {
    return (
      <RootLayoutInstrument lang={market.language} className={`${raleway.className} theme-${market.theme} ${raleway.variable}`}>
        <Providers>
          <SonicDNAHandler />
          <PageWrapperInstrument>
            {children}
          </PageWrapperInstrument>
        </Providers>
      </RootLayoutInstrument>
    );
  }

  return (
    <RootLayoutInstrument lang={market.language} className={`${raleway.className} theme-${market.theme} ${raleway.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Providers>
        <EditModeOverlay>
          <CodyPreviewBanner />
          <VoicejarTracker />
          <GlobalNav />
          <MobileFloatingDock />
          <Analytics />
          <CommandPalette />
          <Toaster position="bottom-right" />
          <SonicDNAHandler />
          <GlobalAudioOrchestrator />
          <Suspense fallback={null}>
            <VoicyBridge />
          </Suspense>
          <VoicyChat />
          <PageWrapperInstrument>
            <Suspense fallback={<LoadingScreenInstrument />}>
              {children}
            </Suspense>
          </PageWrapperInstrument>
          <CookieBanner />
          <FooterWrapper />
        </EditModeOverlay>
      </Providers>
    </RootLayoutInstrument>
  );
}
