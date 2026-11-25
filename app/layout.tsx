import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles
import OfflineIndicator from '@/components/OfflineIndicator';

export const viewport: Viewport = {
  themeColor: '#d97706',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធលក់ និងគ្រប់គ្រងអាហារ - Food POS',
  description: 'កម្មវិធីគ្រប់គ្រងមុខម្ហូប ការលក់បុងអាហារ និងរបាយការណ៍ចំណេញ-ខាត ដំណើរការដោយគ្មានអ៊ីនធឺណិត (Offline PWA)',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ចឹកមី POS',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ប្រព័ន្ធលក់ និងគ្រប់គ្រងអាហារ - Food POS',
    description: 'កម្មវិធីគ្រប់គ្រងមុខម្ហូប ការលក់បុងអាហារ និងរបាយការណ៍ចំណេញ-ខាត',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ប្រព័ន្ធលក់ និងគ្រប់គ្រងអាហារ - Food POS',
    description: 'កម្មវិធីគ្រប់គ្រងមុខម្ហូប ការលក់បុងអាហារ និងរបាយការណ៍ចំណេញ-ខាត',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="km" className="overflow-x-hidden">
      <body className="font-['Kantumruy_Pro',sans-serif] bg-neutral-900 text-neutral-100 antialiased selection:bg-amber-500 selection:text-neutral-950 min-h-screen overflow-x-hidden" suppressHydrationWarning>
        {children}
        <OfflineIndicator />
      </body>
    </html>
  );
}

