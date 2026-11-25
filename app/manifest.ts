import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'អាហារដ្ឋាន ចឹកមី - Food POS',
    short_name: 'ចឹកមី POS',
    description: 'ប្រព័ន្ធលក់ និងគ្រប់គ្រងអាហារដ្ឋាន ចឹកមី ដំណើរការដោយគ្មានអ៊ីនធឺណិត (Offline PWA)',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#171717',
    theme_color: '#d97706',
    lang: 'km',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['food', 'business', 'productivity'],
  };
}
