import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
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
        purpose: 'maskable any', // Requerido por Chrome Android para mostrar el ícono en homescreen
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
      }
    ],
  }
}
