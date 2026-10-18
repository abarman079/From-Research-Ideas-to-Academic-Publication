import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/copy';
import '../../globals.css';

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

/** This is a ROOT layout: /bn and /en get the correct HTML language in server-rendered markup. */
export default async function LocalizedRootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale === 'bn' ? 'bn-BD' : 'en'}><body>{children}</body></html>;
}
