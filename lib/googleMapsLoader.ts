
import { getPublicConfig } from './publicEnv';

/**
 * Singleton state for Google Maps loader
 */
let mapsPromise: Promise<void> | null = null;
let mapsStatus: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
let lastError: string | null = null;

/**
 * Returns the current loader status and last error
 */
export function getMapsStatus() {
  return { mapsStatus, lastError };
}

/**
 * Idempotent loader for Google Maps Places library.
 * Returns the same cached promise if called multiple times.
 */
export async function loadGoogleMapsPlaces(): Promise<void> {
  // 1. If already ready, resolve immediately
  if ((window as any).google?.maps?.places) {
    mapsStatus = 'ready';
    return Promise.resolve();
  }

  // 2. If already loading, return existing promise
  if (mapsPromise) {
    return mapsPromise;
  }

  // 3. Start loading process
  console.debug("Maps loader: start");
  mapsStatus = 'loading';

  mapsPromise = new Promise(async (resolve, reject) => {
    try {
      // Fetch runtime config (to avoid build-time env injection issues)
      const config = await getPublicConfig();
      const key = config.googleMapsKey;

      if (!key || key === 'undefined' || key.trim() === '' || key.length < 10) {
        lastError = "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in client bundle (via /api/public-config)";
        mapsStatus = 'error';
        console.error("Maps loader error:", lastError);
        return reject(new Error(lastError));
      }

      // Check for existing script tag
      const scriptId = 'google-maps-js';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      // Handle auth failure globally
      (window as any).gm_authFailure = () => {
        lastError = "Google Maps authentication failed (billing, restrictions, or invalid key)";
        mapsStatus = 'error';
        console.error("Maps loader error:", lastError);
      };

      const timeoutId = setTimeout(() => {
        if (mapsStatus !== 'ready') {
          lastError = "Maps load timeout (12s)";
          mapsStatus = 'error';
          console.error("Maps loader error:", lastError);
          reject(new Error(lastError));
        }
      }, 12000);

      script.onload = () => {
        // Double check for library availability using interval to catch race conditions
        const checkInterval = setInterval(() => {
          if ((window as any).google?.maps?.places) {
            clearTimeout(timeoutId);
            clearInterval(checkInterval);
            mapsStatus = 'ready';
            console.debug("Maps loader: ready");
            resolve();
          }
        }, 100);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        lastError = "Script failed to load";
        mapsStatus = 'error';
        console.error("Maps loader error:", lastError);
        reject(new Error(lastError));
      };
    } catch (err: any) {
      lastError = err.message || "Unknown loader error";
      mapsStatus = 'error';
      console.error("Maps loader error:", lastError);
      reject(new Error(lastError));
    }
  });

  return mapsPromise;
}
