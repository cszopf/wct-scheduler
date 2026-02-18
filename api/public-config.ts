
/**
 * Runtime configuration endpoint.
 * This runs on the server (Vercel) where all environment variables are accessible.
 */
export default async function handler() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null;

  return new Response(
    JSON.stringify({ googleMapsKey: key }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
