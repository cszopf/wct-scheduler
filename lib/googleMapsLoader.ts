
/**
 * Singleton loader for Google Maps JavaScript API with diagnostics
 */

let lastMapsError: string | null = null;
let loadPromise: Promise<void> | null = null;

/**
 * Returns the last recorded error during Maps initialization
 */
export const getLastMapsLoadError = () => lastMapsError;

export const loadGoogleMapsPlaces = (): Promise<void> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;

    // 1. Validate the key early
    const rawKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim();
    
    // Check for common misconfigurations
    if (!rawKey || rawKey === 'undefined' || rawKey === 'null') {
      const err = "Missing or invalid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Ensure it is set in Vercel/environment.";
      lastMapsError = err;
      console.error(`[GoogleMapsLoader] ${err}`);
      reject(new Error(err));
      return;
    }

    console.debug("[GoogleMapsLoader] Maps key present:", !!rawKey);

    // 2. Check if already loaded
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }

    // 3. Add gm_authFailure hook BEFORE loading script
    // This catches common billing/restriction issues immediately
    (window as any).gm_authFailure = () => {
      const err = "gm_authFailure: likely billing, key, or referrer restriction. Check Google Cloud Console.";
      lastMapsError = err;
      console.error(`[GoogleMapsLoader] ${err} Hostname: ${window.location.hostname}`);
    };

    const scriptId = 'google-maps-js';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      // 4. Build script URL EXACTLY as requested
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${rawKey}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // 5. 12-second timeout and availability check
    let timeoutId = setTimeout(() => {
      if (!(window as any).google?.maps?.places) {
        const err = "Google Maps JS loaded but Places library unavailable after 12s.";
        lastMapsError = err;
        reject(new Error(err));
      }
    }, 12000);

    const checkAvailability = setInterval(() => {
      if ((window as any).google?.maps?.places) {
        clearTimeout(timeoutId);
        clearInterval(checkAvailability);
        resolve();
      }
    }, 200);

    script.addEventListener('load', () => {
      // Wait for setInterval to verify 'places' object
    });

    script.addEventListener('error', () => {
      clearTimeout(timeoutId);
      clearInterval(checkAvailability);
      const err = `Failed to inject script. Hostname: ${window.location.hostname}`;
      lastMapsError = err;
      reject(new Error(err));
    });
  });

  return loadPromise;
};
