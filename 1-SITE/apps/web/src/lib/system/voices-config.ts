/**
 * ⚡ VOICES CONFIGURATION (2026)
 * Central source of truth for API endpoints and Asset paths.
 * 
 * ☢️ STATUS: FULL NUCLEAR - Legacy API Decommissioned.
 */

import { VOICES_CONFIG as REAL_CONFIG } from '../core-internal/config.ts';
export const VOICES_CONFIG = REAL_CONFIG;

/**
 * 🛡️ CHRIS-PROTOCOL: Build-Safe Database Bridge
 * We exporteren hier de echte definities vanuit de interne kopie
 * om Vercel build-fouten te voorkomen.
 */
export { db } from '../core-internal/database/index.ts';
export * from '../core-internal/database/schema/index.ts';

export default VOICES_CONFIG;
