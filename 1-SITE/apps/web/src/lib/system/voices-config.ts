/**
 * ⚡ VOICES CONFIGURATION (2026)
 * Central source of truth for API endpoints and Asset paths.
 * 
 * ☢️ STATUS: SHARED - Safe for Browser and Server.
 * 
 * 🛡️ CHRIS-PROTOCOL: Nuclear Internal Bridge (v2.14.503)
 * This file exports both configuration and schema, ensuring Vercel
 * can resolve all database entities within the app source tree.
 */

import { VOICES_CONFIG as REAL_CONFIG } from '../core-internal/config.ts';
export const VOICES_CONFIG = REAL_CONFIG;

// 🛡️ CHRIS-PROTOCOL: Schema Exports (Internalized for Vercel)
// We only export schema on the server to prevent bundling large schema objects in the browser,
// which can lead to minification collisions (e.g. 'tl' ReferenceError).
export const schema = typeof window === 'undefined' 
  ? require('../core-internal/database/schema/index.ts')
  : {};

// 🛡️ CHRIS-PROTOCOL: Conditional DB Export
// We only export 'db' on the server to prevent bundling 'postgres' in the browser.
export const db = typeof window === 'undefined' 
  ? require('../core-internal/database/index.ts').db 
  : null;

export default VOICES_CONFIG;
