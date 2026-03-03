/**
 * Voices Global Config
 * 
 * Deze helper haalt instellingen op uit een lokale JSON env-bridge.
 * Gebruik dit voor prijzen (Kelly), onderhoud (Anna) en feature flags.
 */
let cachedEdgeConfig: Record<string, unknown> | null = null;

function loadEdgeConfigFromEnv(): Record<string, unknown> {
  if (cachedEdgeConfig) return cachedEdgeConfig;

  const raw =
    process.env.VOICES_EDGE_CONFIG_JSON ||
    process.env.VERCEL_EDGE_CONFIG_JSON ||
    '{}';

  try {
    const parsed = JSON.parse(raw);
    cachedEdgeConfig = typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    cachedEdgeConfig = {};
  }

  return cachedEdgeConfig;
}

export async function getVoicesConfig<T>(key: string): Promise<T | undefined> {
  const config = loadEdgeConfigFromEnv();
  return config[key] as T | undefined;
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
