/**
 * ⚡ VOICES CONFIGURATION (2026)
 * Central source of truth for API endpoints and Asset paths.
 * 
 * ☢️ STATUS: FULL NUCLEAR - Legacy API Decommissioned.
 */

export const VOICES_CONFIG = {
  // 🚀 THE ENGINE: De nieuwe Supabase/Node.js backend (Single Source of Truth)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // 🏢 COMPANY DEFAULTS (Shared across markets)
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || '',
    vat: process.env.NEXT_PUBLIC_COMPANY_VAT || '',
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || '',
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || ''
  },

  // 🎨 ASSET ARCHITECTURE
  assets: {
    baseUrl: '/assets',
    logos: {
      be: '/assets/common/branding/Voices-LOGO-Animated.svg',
      nl: '/assets/common/branding/Voices_LOGO_NL.svg',
      fr: '/assets/common/branding/Voices_LOGO_FR.svg',
      eu: '/assets/common/branding/Voices_LOGO_EU.svg',
      es: '/assets/common/branding/Voices_LOGO_ES.svg',
      pt: '/assets/common/branding/Voices_LOGO_PT.svg',
      ademing: '/assets/common/branding/Voices-LOGO-Animated.svg',
      johfrah: '/assets/common/branding/johfrah.be_LOGO.svg',
    },
    placeholders: {
      voice: '/assets/common/placeholders/placeholder-voice.jpg',
      voicy: '/assets/common/branding/voicy/voicy-avatar.png',
    }
  }
};

/**
 * 🛡️ CHRIS-PROTOCOL: Build-Safe Database Bridge
 * We exporteren hier alleen de types of mock-definities die nodig zijn voor de build
 * als de fysieke packages buiten de root niet bereikbaar zijn.
 */
export const db = {} as any;
export const actors = {} as any;
export const actorDemos = {} as any;
export const actorVideos = {} as any;
export const contentArticles = {} as any;
export const contentBlocks = {} as any;
export const faq = {} as any;
export const lessons = {} as any;
export const media = {} as any;
export const products = {} as any;
export const reviews = {} as any;
export const translations = {} as any;
export const orderItems = {} as any;
export const orders = {} as any;
export const users = {} as any;
export const vaultFiles = {} as any;
export const appConfigs = {} as any;
export const languages = {} as any;
export const actorDialects = {} as any;

export default VOICES_CONFIG;

