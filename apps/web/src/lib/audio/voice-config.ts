/**
 *  NUCLEAR VOICE CONFIG ENGINE (2026)
 * 
 * Beheert stem-configuraties en tokenized URL's.
 * Vervangt de PHP VoicesConfigEngine en zorgt voor schone URL's (?vcfg=).
 */

import { db, appConfigs } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface VoiceSettings {
  usage?: string;
  type?: string;
  media?: string;
  shortlist?: string[];
  source?: string;
}

/**
 *  GENERATE TOKEN
 * Maakt een unieke MD5 hash van de instellingen en slaat deze op.
 */
export async function generateVoiceConfigToken(settings: VoiceSettings): Promise<string> {
  const serialized = JSON.stringify(settings);
  const token = crypto.createHash('md5').update(serialized + 'voices_nuclear_2026').digest('hex');
  
  // Sla op in de database (we kunnen hier een specifieke tabel voor maken of appConfigs misbruiken)
  // Voor nu simuleren we de opslag in de 'app_configs' tabel met een prefix
  await db.insert(appConfigs).values({
    key: `vcfg_${token}`,
    value: settings,
    description: 'Core Voice Configuration Token'
  }).onConflictDoNothing();

  return token;
}

/**
 *  LOAD CONFIG
 * Haalt instellingen op basis van een token.
 */
export async function loadVoiceConfig(token: string): Promise<VoiceSettings | null> {
  const [result] = await db.select()
    .from(appConfigs)
    .where(eq(appConfigs.key, `vcfg_${token}`))
    .limit(1);

  return (result?.value as VoiceSettings) || null;
}

/**
 *  PARSE URL
 * Detecteert vcfg token of losse parameters in de URL.
 */
export function getVoiceSettingsFromParams(searchParams: URLSearchParams): VoiceSettings {
  const vcfg = searchParams.get('vcfg');
  if (vcfg && vcfg.length === 32) {
    // Let op: Dit moet async worden afgehandeld in de component/page
    return {}; 
  }

  return {
    usage: searchParams.get('usage') || searchParams.get('gebruik') || undefined,
    type: searchParams.get('usage_type') || undefined,
    media: searchParams.get('media') || undefined,
    shortlist: searchParams.get('shortlist')?.split(',') || undefined
  };
}
