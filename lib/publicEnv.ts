
/**
 * Runtime public environment configuration.
 * Fetches configuration from the server at runtime to ensure availability.
 */

interface PublicConfig {
  googleMapsKey: string | null;
}

let cachedConfig: PublicConfig | null = null;

export async function getPublicConfig(): Promise<PublicConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const response = await fetch('/api/public-config');
    if (!response.ok) throw new Error('Failed to fetch runtime config');
    cachedConfig = await response.json();
  } catch (error) {
    console.error('[PublicEnv] Error fetching runtime config:', error);
    cachedConfig = { googleMapsKey: null };
  }

  return cachedConfig!;
}

/**
 * Synchronous check for key presence. 
 * Note: Only reliable after getPublicConfig() has been called and resolved.
 */
export const hasGoogleMapsKeySync = () => !!cachedConfig?.googleMapsKey && cachedConfig.googleMapsKey.length > 10;
export const getGoogleMapsKeySync = () => cachedConfig?.googleMapsKey || "";
