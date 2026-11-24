import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'អាហារដ្ឋាន ចឹកមី - Food POS',
  description: 'ប្រព័ន្ធគ្រប់គ្រងការលក់តាមតុ មុខម្ហូប និងរបាយការណ៍ចំណេញ-ខាត អាហារដ្ឋាន ចឹកមី',
  openGraph: {
    title: 'អាហារដ្ឋាន ចឹកមី - Food POS',
    description: 'ប្រព័ន្ធគ្រប់គ្រងការលក់តាមតុ មុខម្ហូប និងរបាយការណ៍ចំណេញ-ខាត អាហារដ្ឋាន ចឹកមី',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'អាហារដ្ឋាន ចឹកមី - Food POS',
    description: 'ប្រព័ន្ធគ្រប់គ្រងការលក់តាមតុ មុខម្ហូប និងរបាយការណ៍ចំណេញ-ខាត អាហារដ្ឋាន ចឹកមី',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="km">
      <body className="font-['Kantumruy_Pro',sans-serif] bg-neutral-900 text-neutral-100 antialiased selection:bg-amber-500 selection:text-neutral-950 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

