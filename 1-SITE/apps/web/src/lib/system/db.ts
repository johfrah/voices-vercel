/**
 * 🛡️ CHRIS-PROTOCOL: Server-Only Database Instance
 * 
 * DIT BESTAND MAG NOOIT IN EEN CLIENT COMPONENT WORDEN GEÏMPORTEERD.
 */

import { VOICES_CONFIG as REAL_CONFIG } from '../core-internal/config.ts';
export const VOICES_CONFIG = REAL_CONFIG;

export { db } from '../core-internal/database/index.ts';
// 🛡️ CHRIS-PROTOCOL: Schema Exports (Internalized for Vercel)
// We only export schema on the server to prevent bundling large schema objects in the browser.
export const schema = typeof window === 'undefined' 
  ? require('../core-internal/database/schema/index.ts')
  : {};

