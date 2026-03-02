import { get } from '@vercel/edge-config';

/**
 * Voices Global Config
 * 
 * Deze helper haalt real-time instellingen op uit de Vercel Edge Config.
 * Gebruik dit voor prijzen (Kelly), onderhoud (Anna) en feature flags.
 */
export async function getVoicesConfig<T>(key: string): Promise<T | undefined> {
  // 🛡️ CHRIS-PROTOCOL: Resilient Edge Config (v2.14.346)
  // Voorkom noisy errors in dev mode als de token ontbreekt of ongeldig is.
  if (process.env.NODE_ENV === 'development' && !process.env.EDGE_CONFIG?.includes('token=')) {
    return undefined;
  }

  try {
    return await get<T>(key);
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      // Silent fail voor unauthorized in dev
      return undefined;
    }
    console.error(`[EdgeConfig] Fout bij ophalen van key "${key}":`, error);
    return undefined;
  }
}

/**
 * Specifieke helpers voor de agents
 */
export const voicesConfig = {
  // Voor Anna: Check of de site in onderhoud is
  isMaintenanceMode: async () => await getVoicesConfig<boolean>('maintenanceMode') ?? false,
  
  // Voor Kelly: Haal de actuele BSF (Base Session Fee) op
  getBaseTariffBSF: async () => await getVoicesConfig<number>('baseTariffBSF') ?? 250,
  
  // Voor Mark: Haal de actuele campagne-tekst op voor de TopBar
  getCampaignMessage: async () => await getVoicesConfig<string>('campaignMessage'),
};
