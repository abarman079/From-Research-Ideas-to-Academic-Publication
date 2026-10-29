import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookLanding from "@/components/BookLanding";
import { getCopy, isLocale } from "@/i18n/copy";
import { book, gallery } from "@/lib/book";
import { getSiteUrl, isIndexableDeployment } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "bn" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { title, description } = getCopy(locale).metadata;
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}`;
  const imageUrl = `${siteUrl}/opengraph-image.jpg`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        "bn-BD": `${siteUrl}/bn`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/bn`,
      },
    },
    robots: isIndexableDeployment()
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "IOJH Book Collection",
      url: pageUrl,
      title,
      description,
      locale: locale === "bn" ? "bn_BD" : "en_US",
      alternateLocale: [locale === "bn" ? "en_US" : "bn_BD"],
      images: [
        {
          url: imageUrl,
          alt: locale === "bn" ? book.title : book.englishTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function LocalizedBookPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const siteUrl = getSiteUrl();
  const description = getCopy(locale).metadata.description;
  // The seller is IOJH, but the book's publisher should not be inferred from the seller.
  // Prices, availability, ratings and edition dates are intentionally absent until verified.
  const bookStructuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternateName: book.englishTitle,
    isbn: book.isbn,
    author: { "@type": "Person", name: book.authorEnglish },
    inLanguage: "bn",
    image: `${siteUrl}${gallery[0].src}`,
    url: `${siteUrl}/${locale}`,
    description,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bookStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <BookLanding locale={locale} />
    </>
  );
}
