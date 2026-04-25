import { NextResponse } from 'next/server';

/**
 * Serves the PWA Web App Manifest for regular (non-admin) users.
 * The start_url points to '/' so the app opens on the home page.
 * Icon src values are relative to the manifest URL per the PWA spec,
 * so they resolve to https://domain.com/logo-*.png in all environments.
 */
export function GET() {
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
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: '/logo-512.png',
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
