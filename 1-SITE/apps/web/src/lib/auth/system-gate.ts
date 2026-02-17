/**
 *  NUCLEAR AUTH GATE (2026)
 * 
 * Beveiligingslaag voor de Next.js Core-laag.
 * Vervangt de PHP voices_ajax_verify() en beheert Admin Edit Mode.
 */

import { cookies } from 'next/headers';

export type UserRole = 'guest' | 'user' | 'admin' | 'ai';

export interface AuthSession {
  userId?: number;
  role: UserRole;
  isEditMode: boolean;
}

/**
 * Controleert of de huidige sessie admin-rechten heeft.
 * Gebruikt voor de "Edit Mode Gating" wet.
 */
export async function getAuthSession(): Promise<AuthSession> {
  // In een echte implementatie halen we dit uit een JWT of Supabase Auth
  const cookieStore = cookies();
  const role = cookieStore.get('voices_role')?.value as UserRole || 'guest';
  const isEditMode = cookieStore.get('voices_edit_mode')?.value === 'true';
  
  return {
    role,
    isEditMode: role === 'admin' && isEditMode
  };
}

/**
 *  EDIT MODE GATE
 * Gooit een error als de gebruiker niet in Edit Mode is terwijl dat wel moet.
 */
export async function validateEditMode() {
  const session = await getAuthSession();
  if (!session.isEditMode) {
    throw new Error(' NUCLEAR ACCESS DENIED: Action requires Admin Edit Mode.');
  }
}

/**
 * CSRF / Nonce simulatie voor Next.js API routes.
 */
export function verifyCoreNonce(nonce: string, action: string): boolean {
  // In 2026 gebruiken we stateless JWT's of actie-specifieke tokens
  if (!nonce) return false;
  // TODO: Implementeer cryptografische verificatie
  return true; 
}
