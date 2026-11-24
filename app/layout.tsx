import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធលក់ និងគ្រប់គ្រងអាហារ - Food POS',
  description: 'កម្មវិធីគ្រប់គ្រងមុខម្ហូប ការលក់បុងអាហារ និងរបាយការណ៍ចំណេញ-ខាត',
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
      </body>
    </html>
  );
}

