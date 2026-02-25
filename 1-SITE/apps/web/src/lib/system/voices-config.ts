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
 * 
 * ⚠️ CRITICAL: De database-client mag NOOIT in de browser geladen worden.
 * We gebruiken dynamic imports of conditionele exports om te voorkomen dat 
 * Webpack probeert 'postgres' of 'net/tls' te bundelen voor de client.
 */

// We exporteren de types altijd (veilig voor browser)
export * from '../core-internal/database/schema/index.ts';

// De 'db' instance mag alleen op de server bestaan
export const db = (typeof window === 'undefined') 
  ? require('../core-internal/database/index.ts').db 
  : ({} as any);

export default VOICES_CONFIG;
