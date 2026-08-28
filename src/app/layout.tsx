import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import PwaRegister from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'LMS Inovasi Media Pembelajaran Bahasa Arab',
  description: 'LMS ringan berbasis Next.js, Google Apps Script, Sheets, dan Drive.',
  manifest: '/manifest.webmanifest',
  icons: { icon:'/icon-192.png', apple:'/icon-192.png' }
};

export const viewport: Viewport = {
  themeColor:'#0A7C6E',
  width:'device-width',
  initialScale:1,
  viewportFit:'cover'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body><AuthProvider>{children}<PwaRegister/></AuthProvider></body></html>;
}
