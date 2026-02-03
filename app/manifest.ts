import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DS Nails',
    short_name: 'DS Nails',
    description: 'Premium nail care in Quatre Bornes. Book appointments, manage services, and view invoices.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8e7df',
    theme_color: '#d58d9c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
