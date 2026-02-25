/**
 * 🛡️ CHRIS-PROTOCOL: Server-Only Database Instance
 * 
 * DIT BESTAND MAG NOOIT IN EEN CLIENT COMPONENT WORDEN GEÏMPORTEERD.
 */

import { VOICES_CONFIG as REAL_CONFIG } from '../core-internal/config.ts';
export const VOICES_CONFIG = REAL_CONFIG;

export { db } from '../core-internal/database/index.ts';
export * from '../core-internal/database/schema/index.ts';
