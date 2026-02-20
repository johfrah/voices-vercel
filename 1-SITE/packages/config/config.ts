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
    name: 'Johfrah Comm.V.',
    vat: 'BE 0662.426.460',
    email: 'johfrah@voices.be',
    phone: '+32 (0)2 793 19 91',
    address: 'Jules Delhaziestraat, Brussel / Antwerpen, België'
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

export default VOICES_CONFIG;
