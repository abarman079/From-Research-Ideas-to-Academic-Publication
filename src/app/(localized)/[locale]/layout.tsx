import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/copy';
import '../../globals.css';

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

/** Each language has its own root element for correct server-side lang markup. */
export default async function LocalizedRootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale === 'bn' ? 'bn-BD' : 'en'} suppressHydrationWarning>
      <body>{children}<Analytics /></body>
    </html>
  );
}
