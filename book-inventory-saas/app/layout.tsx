import type { Metadata } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'BookStock Manager',
  description: 'Multi-tenant bookstore inventory, sales and purchasing management.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister/>{children}</body></html>;
}
