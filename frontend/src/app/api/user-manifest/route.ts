import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * Serves the PWA Web App Manifest for regular (non-admin) users.
 * The start_url points to '/' so the app opens on the home page.
 * Uses absolute icon URLs so Chrome resolves them correctly regardless of scope.
 */
export function GET(request: NextRequest) {
  // Build the base URL from the incoming request so icons resolve correctly
  // in any environment (local, staging, production) without hardcoding.
  const { origin } = new URL(request.url);

  const manifest = {
    id: '/',
    name: 'Techno Fit',
    short_name: 'TechnoFit',
    description: 'Sistema de Gestión de Rutinas para Gimnasio',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#10b981',
    icons: [
      {
        src: `${origin}/logo-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: `${origin}/logo-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
