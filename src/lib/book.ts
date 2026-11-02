/** IOJH book — product information and approved public product photographs. */
export const book = {
  title: "রিসার্চ মেথড, ম্যানুস্ক্রিপ্ট প্রিপারেশন এবং পাবলিকেশন",
  englishTitle: "Research Method, Manuscript Preparation and Publication",
  author: "কারিউল ইসলাম",
  authorEnglish: "Kariul Islam",
  isbn: "978-984-37-0566-2",
  productUrl:
    "https://iojh.com.bd/product/research-methods-manuscript-preparation-and-publication/",
} as const;

const base = "/books/research-method-manuscript-publication";

export const gallery = [
  {
    id: "front",
    src: `${base}/hero-cutouts/01_front_cover_web_transparent.webp`,
  },
  {
    id: "back",
    src: `${base}/hero-cutouts/02_back_cover_web_transparent.webp`,
  },
  {
    id: "spine",
    src: `${base}/hero-cutouts/03_spine_web_transparent.webp`,
  },
  {
    id: "inside",
    src: `${base}/hero-cutouts/04_open_pages_web_transparent.webp`,
  },
];

/**
 * The reader only uses the 15 approved JPG pages.
 * These two null exports are retained for compatibility with the older
 * BookLanding.tsx (which still imports PREVIEW_PDF_URL). No PDF is linked.
 */
export const PREVIEW_PDF_FILENAME: string | null = null;
export const PREVIEW_PDF_URL: string | null = null;

export const SAMPLE_PAGE_COUNT = 15;
export const previewPages = Array.from(
  { length: SAMPLE_PAGE_COUNT },
  (_, index) => ({
    src: `${base}/preview/research-book-first-15-pages_page-${String(index + 1).padStart(4, "0")}.jpg`,
  }),
);
