import { CodyPreviewBanner } from "@/components/admin/CodyPreviewBanner";
import { GhostModeBar } from "@/components/admin/GhostModeBar";
import { EditModeOverlay } from "@/components/admin/EditModeOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import { LoadingScreenInstrument, PageWrapperInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { CookieBanner } from "@/components/ui/Legal/CookieBanner";
import { GlobalModalManager } from "@/components/ui/GlobalModalManager";
import { LiquidTransitionOverlay } from "@/components/ui/LiquidTransitionOverlay";
import { MarketManagerServer } from "@/lib/system/core/market-manager";
import { MarketDatabaseService } from "@/lib/system/market-manager-db";
import { createClient } from "@supabase/supabase-js";
import type { Metadata, Viewport } from "next";
import { Inter, Raleway, Cormorant_Garamond } from "next/font/google";
import { cookies, headers } from "next/headers";
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
import { localeToBcp47, normalizeLocale, stripLocalePrefix, withLocalePrefix } from "@/lib/system/locale-utils";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { TemporaryLightMode } from "@/components/light/temporary-light-mode";

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
async function withTimeoutFallback<T>(executor: () => Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => {
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    return await Promise.race([executor(), timeoutPromise]);
  } catch (error) {
    console.warn('[layout] withTimeoutFallback triggered fallback after error:', error);
    return fallbackValue;
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && /timeout/i.test(error.message);
}

const inter = Inter({ subsets: ["latin"] });

const FALLBACK_LOCALE_DOMAINS: Record<string, string> = {
  'nl-be': 'https://www.voices.be',
  'nl-nl': 'https://www.voices.nl',
  'fr-fr': 'https://www.voices.fr',
  'en-gb': 'https://www.voices.eu',
  'de-de': 'https://www.voices.eu',
  'es-es': 'https://www.voices.es',
  'pt-pt': 'https://www.voices.pt',
  'it-it': 'https://www.voices.eu',
};

function normalizeLocaleDomainMap(rawLocales?: Record<string, string>) {
  const merged: Record<string, string> = { ...FALLBACK_LOCALE_DOMAINS };
  for (const [locale, domain] of Object.entries(rawLocales || {})) {
    if (!domain) continue;
    const normalizedLocale = normalizeLocale(locale);
    const normalizedDomain = domain.replace(/\/$/, '');
    const host = normalizedDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const isVoicesDomain = host.includes('voices.');
    if (!isVoicesDomain && FALLBACK_LOCALE_DOMAINS[normalizedLocale]) {
      continue;
    }
    merged[normalizedLocale] = normalizedDomain;
  }
  return merged;
}

function getPrimaryLocaleForDomain(domain: string): string {
  const host = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (host.endsWith('voices.fr')) return 'fr-fr';
  if (host.endsWith('voices.es')) return 'es-es';
  if (host.endsWith('voices.pt')) return 'pt-pt';
  if (host.endsWith('voices.nl')) return 'nl-nl';
  if (host.endsWith('voices.eu')) return 'en-gb';
  return 'nl-be';
}

function buildLocaleUrl(locale: string, pathname: string, localeDomainMap: Record<string, string>): string {
  const normalizedLocale = normalizeLocale(locale);
  const domain = localeDomainMap[normalizedLocale] || FALLBACK_LOCALE_DOMAINS[normalizedLocale] || FALLBACK_LOCALE_DOMAINS['en-gb'];
  const primaryLocale = getPrimaryLocaleForDomain(domain);
  const cleanPath = stripLocalePrefix(pathname || '/');
  const localizedPath = withLocalePrefix(cleanPath, normalizedLocale, primaryLocale);
  return `${domain.replace(/\/$/, '')}${localizedPath === '/' ? '/' : localizedPath}`;
}

function buildAlternatesForPath(pathname: string, rawLocales?: Record<string, string>) {
  const localeDomainMap = normalizeLocaleDomainMap(rawLocales);
  const alternates: Record<string, string> = {};
  for (const locale of Object.keys(localeDomainMap)) {
    alternates[localeToBcp47(locale)] = buildLocaleUrl(locale, pathname, localeDomainMap);
  }
  alternates['x-default'] = buildLocaleUrl('en-gb', pathname, localeDomainMap);
  return alternates;
}

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
    if (isTimeoutError(err)) {
      console.warn(' getMarketSafe: timed out, using fallback host');
    } else {
      console.error(' getMarketSafe: Failed:', err);
    }
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#101015" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const langHeader = headersList.get('x-voices-lang');
  const activeLocale = normalizeLocale(langHeader || 'nl-be');
  const pathname = headersList.get('x-voices-pathname') || '';
  const host = headersList.get("x-voices-host") || headersList.get("host") || process.env.NEXT_PUBLIC_SITE_URL || MarketManagerServer.getMarketDomains()['BE'].replace('https://', '');
  const cleanHost = host.replace(/^https?:\/\//, '');
  const marketHost = cleanHost.split('/')[0];
  const { worldId, languageId, journeyId } = MarketManagerServer.resolveContext(cleanHost, pathname);

  // 🛡️ CHRIS-PROTOCOL: Parallel Pulse Fetching (v2.14.798)
  // We fetch market, locales and translations in parallel to minimize TTFB
  const [market, alternateLanguages, studioTranslations] = await Promise.all([
    getMarketSafe(marketHost),
    (async () => {
      try {
        const localesPromise = MarketDatabaseService.getAllLocalesAsync();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Locales Timeout')), 2500)
        );
        return await Promise.race([localesPromise, timeoutPromise]) as any;
      } catch (err) {
        if (isTimeoutError(err)) {
          console.warn(' generateMetadata: locales timeout, using static domains fallback');
        } else {
          console.error(' generateMetadata: Failed to load locales:', err);
        }
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
        const translationPromise = getTranslationsServer(activeLocale);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Translation Timeout')), 2500)
        );
        return await Promise.race([translationPromise, timeoutPromise]) as any;
      } catch (err) {
        if (isTimeoutError(err)) {
          console.warn(' generateMetadata: translations timeout, using empty fallback');
        } else {
          console.error(' generateMetadata: Failed to load translations:', err);
        }
        return {};
      }
    })()
  ]);

  if (!market) {
    throw new Error('Market configuration could not be resolved.');
  }
  const metadataTranslations = (studioTranslations || {}) as Record<string, string>;
  const mt = (key: string, fallback: string) => {
    const translated = metadataTranslations[key];
    return typeof translated === 'string' && translated.trim().length > 0 ? translated : fallback;
  };

  const alternateMap = buildAlternatesForPath(pathname || '/', alternateLanguages);
  const canonicalUrl = alternateMap[localeToBcp47(activeLocale)] || buildLocaleUrl(activeLocale, pathname || '/', normalizeLocaleDomainMap(alternateLanguages));

  const isAdeming = market.market_code === 'ADEMING';
  const isJohfrah = market.market_code === 'PORTFOLIO';
  const isArtist = market.market_code === 'ARTIST';

  const title = isAdeming 
    ? mt('meta.title.ademing', "Ademing | Kom tot rust")
    : isJohfrah 
    ? mt('meta.title.portfolio', "Johfrah Lefebvre | Vlaamse Voice-over & Regisseur")
    : isArtist
    ? mt('meta.title.artist', "Voices Artist | Premium Voice-over Talent")
    : mt('meta.title.default', "Voices | Het Vriendelijkste Stemmenbureau");

  const description = isAdeming 
    ? mt('meta.description.ademing', "Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf.")
    : isJohfrah
    ? mt('meta.description.portfolio', "De stem achter het verhaal. Warme, natuurlijke Vlaamse voice-over & host voor nationale TV-spots en corporate video's.")
    : mt('meta.description.default', "Een warm en vertrouwd geluid voor elk project. Wij helpen je de perfecte stem te vinden.");

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
    manifest: "/manifest.webmanifest",
    icons,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Voices Admin",
      startupImage: ["/favicon.svg"],
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    metadataBase: host ? new URL(new URL(canonicalUrl).origin) : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: alternateMap,
    },
    openGraph: {
      type: "website",
      locale: market.seo_data?.locale_code?.replace('-', '_') || (market.primary_language.replace('-', '_')),
      url: canonicalUrl,
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
  const headersList = await headers();
  const langHeader = headersList.get('x-voices-lang');
  const pathname = headersList.get('x-voices-pathname') || '';
  const host = headersList.get("x-voices-host") || headersList.get("host") || process.env.NEXT_PUBLIC_SITE_URL || MarketManagerServer.getMarketDomains()['BE'].replace('https://', '');
  const cleanHost = host.replace(/^https?:\/\//, '');
  
  // 🛡️ CHRIS-PROTOCOL: Market altijd op domein resolven (geen path in host). Studio/Academy zijn journeys op hetzelfde domein (BE).
  const marketHost = cleanHost.split('/')[0];
  // 🛡️ ID-First Context Resolution: pathname voor worldId/journeyId (Studio=2, Academy=3)
  const { worldId, languageId, journeyId } = MarketManagerServer.resolveContext(cleanHost, pathname);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // CHRIS-PROTOCOL: `world_languages` ontbreekt momenteel in production schema.
  // Vermijd per-request 404 storm; language switcher gebruikt dan de bestaande market fallback.
  const [market, studioTranslations, handshakeLanguages, worldConfig, temporaryLightModeRaw] = await Promise.all([
    getMarketSafe(marketHost),
    (async () => {
      try {
        const translationPromise = getTranslationsServer(normalizeLocale(langHeader || 'nl-be'));
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Translation Timeout')), 2500)
        );
        return await Promise.race([translationPromise, timeoutPromise]) as any;
      } catch (err) {
        if (isTimeoutError(err)) {
          console.warn(' RootLayout: translations timeout, using empty fallback');
        } else {
          console.error(' RootLayout: Failed to load translations:', err);
        }
        return {};
      }
    })(),
    withTimeoutFallback(async () => {
      try {
        const { data } = await supabase.from('languages').select('id, code, label');
        return data || [];
      } catch (err) {
        if (isTimeoutError(err)) {
          console.warn(' RootLayout: language registry timeout, using empty fallback');
        } else {
          console.error(' RootLayout: Failed to load language registry:', err);
        }
        return [];
      }
    }, 2500, []),
    withTimeoutFallback(() => ConfigBridge.getWorldConfig(worldId, languageId), 2500, null),
    withTimeoutFallback(async () => {
      try {
        const { data, error } = await supabase
          .from('app_configs')
          .select('value')
          .eq('key', 'temporary_light_mode')
          .maybeSingle();

        if (error) throw error;
        return data?.value ?? null;
      } catch (err) {
        if (isTimeoutError(err)) {
          console.warn(' RootLayout: temporary light mode config timeout, using null fallback');
        } else {
          console.error(' RootLayout: Failed to load temporary light mode config:', err);
        }
        return null;
      }
    }, 2500, null)
  ]);

  const worldLanguages: Array<{ world_id: number; language_id: number; is_primary: boolean; is_popular: boolean }> = [];

  if (!market) {
    throw new Error('Market configuration could not be resolved.');
  }
  
  // 🛡️ CHRIS-PROTOCOL: Prime MarketManager with World Languages
  MarketManagerServer.setWorldLanguages(worldLanguages);
  MarketManagerServer.setLanguages(handshakeLanguages);
  
  // 🛡️ CHRIS-PROTOCOL: World Detection for Provider Injection (v2.25.1)
  const isStudioPage = pathname.startsWith('/studio/') || pathname === '/studio' || pathname === '/workshops' || pathname === '/voorwaarden-studio' || pathname.includes('/studio');
  const isAcademyPage = pathname.startsWith('/academy/') || pathname === '/academy' || pathname.includes('/academy');
  
  const journeyKey = isStudioPage ? 'studio' : (isAcademyPage ? 'academy' : (market.market_code === 'ADEMING' ? 'ademing' : (market.market_code === 'PORTFOLIO' ? 'portfolio' : (market.market_code === 'ARTIST' ? 'artist' : 'agency'))));
  const initialJourney = isStudioPage ? 'studio' : (isAcademyPage ? 'academy' : (market.market_code === 'ADEMING' ? 'ademing' : (market.market_code === 'PORTFOLIO' ? 'portfolio' : (market.market_code === 'ARTIST' ? 'artist' : 'agency'))));
  const initialUsage = isStudioPage || isAcademyPage ? 'subscription' : (market.market_code === 'ADEMING' ? 'subscription' : 'unpaid');

  // 🛡️ CHRIS-PROTOCOL: Force Client-Only rendering for Admin routes to prevent hydration mismatch (#419)
  const isAdminRoute = pathname.startsWith('/admin') || (pathname.split('/').filter(Boolean)[0] === 'admin');
  
  const isAdeming = market.market_code === 'ADEMING';
  const isOffline = process.env.ADEMING_OFFLINE === 'true';
  const isAdmin = isAdminRoute; // Simple check for layout logic
  const isAuthRoute = pathname.startsWith('/account') || pathname.startsWith('/auth');
  const isTemporaryLightModeEnabled =
    temporaryLightModeRaw === true ||
    (typeof temporaryLightModeRaw === 'object' &&
      temporaryLightModeRaw !== null &&
      (temporaryLightModeRaw as { enabled?: boolean }).enabled === true);
  const serverUser = isTemporaryLightModeEnabled ? await getServerUser() : null;
  const cookieStore = await cookies();
  const hasLegacyAdminCookieBridge =
    process.env.VOICES_ENABLE_LEGACY_ADMIN_BRIDGE === 'true' &&
    cookieStore.get('voices_role')?.value === 'admin' &&
    Boolean(cookieStore.get('sb-access-token')?.value);
  const isAdminViewer = isAdminUser(serverUser) || hasLegacyAdminCookieBridge;
  
  const htmlClass = `${isAdeming ? cormorant.className : raleway.className} ${inter.className} ${cormorant.variable} theme-${isAdeming ? 'ademing' : market.theme} ${raleway.variable}`;
  const bodyClass = cn(
    "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0 touch-manipulation va-main-layout overflow-x-hidden",
    !isAdeming && "pt-[80px] md:pt-[110px]",
    isAdeming && "bg-background text-foreground"
  );
  const lang = normalizeLocale(
    langHeader || (pathname.includes('/artist/youssef') || market.market_code === 'ARTIST' ? 'en-gb' : (market.primary_language || 'nl-be'))
  );
  const htmlLang = localeToBcp47(lang);

  // 🛡️ CHRIS-PROTOCOL: ID-First Handshake (v3.0.0)
  // We pass worldId and languageId to Providers to anchor the entire client-side context.
  const handshakeContext = {
    worldId,
    languageId,
    journeyId,
    worldConfig
  };

  // Minimal layout alleen voor Admin en Ademing offline. Studio/Academy krijgen volle layout (menu + taalswitcher).
  if (isAdminRoute || (isAdeming && isOffline && !isAdmin)) {
    return (
      <html lang={htmlLang} className={htmlClass} suppressHydrationWarning>
        <body className={bodyClass} suppressHydrationWarning>
          <Providers 
            lang={lang} 
            market={market} 
            initialTranslations={studioTranslations} 
            initialJourney={initialJourney} 
            initialUsage={initialUsage}
            handshakeContext={handshakeContext}
            handshakeLanguages={handshakeLanguages}
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

  if (isTemporaryLightModeEnabled && !isAdminViewer && !isAuthRoute) {
    const lightBodyClass = cn(
      "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0 touch-manipulation va-main-layout overflow-x-hidden",
      "pt-0"
    );

    return (
      <html lang={htmlLang} className={htmlClass} suppressHydrationWarning>
        <body className={lightBodyClass} suppressHydrationWarning>
          <Providers
            lang={lang}
            market={market}
            initialTranslations={studioTranslations}
            initialJourney={initialJourney}
            initialUsage={initialUsage}
            handshakeContext={handshakeContext}
            handshakeLanguages={handshakeLanguages}
          >
            <SafeErrorGuard>
              <Suspense fallback={<LoadingScreenInstrument text="Light modus laden..." />}>
                <TemporaryLightMode />
              </Suspense>
            </SafeErrorGuard>
          </Providers>
        </body>
      </html>
    );
  }
  const navConfig = await withTimeoutFallback(
    () => ConfigBridge.getNavConfig(journeyKey, normalizeLocale(langHeader || 'nl-be')),
    2500,
    null
  );
  
  // 🛡️ VISIONARY MANDATE: Journey logic exclusively from market data
  const isSpecialJourney = ['ADEMING', 'PORTFOLIO', 'ARTIST'].includes(market.market_code);
  const isStudioJourney = ['STUDIO', 'ACADEMY'].includes(market.market_code);
  
  const isYoussefJourney = pathname.includes('/artist/youssef') || market.market_code === 'ARTIST';
  
  const isArtistJourney = market.market_code === 'ARTIST' || pathname.includes('/artist/') || pathname.includes('/voice/');

  // Chat zichtbaar: overal behalve Artist, Ademing. Bij open DevTools rechts kan het bolletje bedekt zijn (fixed right).
  const showVoicy = !isArtistJourney && market.market_code !== 'ADEMING';
  const showTopBar = !isArtistJourney && market.market_code !== 'ADEMING' && market.market_code !== 'PORTFOLIO';
  const showGlobalNav = market.market_code !== 'ADEMING' && market.market_code !== 'PORTFOLIO';
  const schemaLanguages = Array.from(
    new Set((market.supported_languages || [market.primary_language]).map((l: string) => localeToBcp47(l)))
  );

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
      "availableLanguage": schemaLanguages
    }
  };

  return (
    <html lang={htmlLang} className={htmlClass} suppressHydrationWarning>
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
          handshakeLanguages={handshakeLanguages}
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
                      <Link href="/portfolio" className="hover:text-primary transition-colors">
                        <VoiceglotText translationKey="nav.portfolio.link_portfolio" defaultText="Portfolio" />
                      </Link>
                      <Link href="/tarieven" className="hover:text-primary transition-colors">
                        <VoiceglotText translationKey="nav.portfolio.link_rates" defaultText="Tarieven" />
                      </Link>
                      <Link href="/contact" className="hover:text-primary transition-colors">
                        <VoiceglotText translationKey="nav.portfolio.link_contact" defaultText="Contact" />
                      </Link>
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
              <SafeErrorGuard
                name="Footer"
                fallback={
                  <div className="py-12 bg-va-off-white border-t border-black/5 text-center text-[11px] text-va-black/20 uppercase tracking-widest">
                    <VoiceglotText translationKey="footer.safe_mode" defaultText="Voices Footer Safe-Mode" />
                  </div>
                }
              >
                {market.market_code !== 'ADEMING' && market.market_code !== 'PORTFOLIO' && <FooterWrapper />}
                
                {/* 🎭 PORTFOLIO WORLD: Custom Footer */}
                {market.market_code === 'PORTFOLIO' && (
                  <footer className="py-24 bg-va-black text-white">
                    <ContainerInstrument className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                      <div className="text-3xl font-light tracking-tighter">
                        JOHFRAH<span className="text-primary">.</span>
                      </div>
                      <div className="flex gap-12 text-[11px] font-bold tracking-[0.3em] uppercase text-white/40">
                        <Link href="/privacy" className="hover:text-white transition-colors">
                          <VoiceglotText translationKey="footer.portfolio.privacy" defaultText="Privacy" />
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                          <VoiceglotText translationKey="footer.portfolio.terms" defaultText="Terms" />
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors">
                          <VoiceglotText translationKey="footer.portfolio.contact" defaultText="Contact" />
                        </Link>
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
