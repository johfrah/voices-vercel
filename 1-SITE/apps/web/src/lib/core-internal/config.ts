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
    // 🛡️ CHRIS-PROTOCOL: ID-First Asset Fallbacks (v3.0.0)
    // Alle branding assets worden nu via de Media Engine (mediaId) in de database geregeld.
    // Deze placeholders dienen enkel als absolute nood-fallback.
    placeholders: {
      voice: '/assets/common/placeholders/placeholder-voice.jpg',
      voicy: '/assets/common/branding/voicy/voicy-avatar.png',
    }
  }
};

export default VOICES_CONFIG;
