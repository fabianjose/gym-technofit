import { NextResponse } from 'next/server';

/**
 * Serves a PWA Web App Manifest tailored for the admin panel.
 * The key difference from the default manifest is `start_url` pointing
 * to `/admin/dashboard` so that when an admin installs the PWA from
 * the admin section, the app opens directly in the dashboard.
 */
export function GET() {
  const manifest = {
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
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      // Allow browsers to cache but revalidate
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
