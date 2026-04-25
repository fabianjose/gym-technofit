import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * Serves a PWA Web App Manifest tailored for the admin panel.
 * The key difference from the user manifest is `start_url` pointing
 * to `/admin/dashboard` so that when an admin installs the PWA from
 * the admin section, the app opens directly in the dashboard.
 * Uses absolute icon URLs so Chrome resolves them correctly regardless of scope.
 */
export function GET(request: NextRequest) {
  // Build the base URL from the incoming request so icons resolve correctly
  // in any environment (local, staging, production) without hardcoding.
  const { origin } = new URL(request.url);

  const manifest = {
    id: '/admin',
    name: 'Techno Fit Admin',
    short_name: 'TechnoFit Admin',
    description: 'Panel de Administración - Techno Fit',
    start_url: '/admin/dashboard',
    scope: '/admin/',
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
