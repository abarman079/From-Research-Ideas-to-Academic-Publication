import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookLanding from '@/components/BookLanding';
import { getCopy, isLocale } from '@/i18n/copy';

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: 'bn' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { title, description } = getCopy(locale).metadata;
  return { title, description, openGraph: { title, description, locale: locale === 'bn' ? 'bn_BD' : 'en_US', type: 'website' } };
}

export default async function LocalizedBookPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <BookLanding locale={locale} />;
}
