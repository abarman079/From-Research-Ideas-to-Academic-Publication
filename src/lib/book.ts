/** IOJH book — product information and approved public product photographs. */
export const book = {
  title: 'রিসার্চ মেথড, ম্যানুস্ক্রিপ্ট প্রিপারেশন এবং পাবলিকেশন',
  englishTitle: 'Research Method, Manuscript Preparation and Publication',
  author: 'কারিউল ইসলাম',
  authorEnglish: 'Kariul Islam',
  pageCount: 504,
  isbn: '978-984-37-0566-2',
  productUrl: 'https://iojh.com.bd/product/research-methods-manuscript-preparation-and-publication/',
} as const;

const base = '/books/research-method-manuscript-publication';

export const gallery = [
  { id: 'front', src: `${base}/hero/cover-main.jpg` },
  { id: 'back', src: `${base}/gallery/back-cover.jpg` },
  { id: 'spine', src: `${base}/gallery/spine.jpg` },
  { id: 'inside', src: `${base}/gallery/interior-v2.jpg` },
];

/**
 * The reader only uses the 15 approved JPG pages.
 * These two null exports are retained for compatibility with the older
 * BookLanding.tsx (which still imports PREVIEW_PDF_URL). No PDF is linked.
 */
export const PREVIEW_PDF_FILENAME: string | null = null;
export const PREVIEW_PDF_URL: string | null = null;

export const SAMPLE_PAGE_COUNT = 15;
export const previewPages = Array.from({ length: SAMPLE_PAGE_COUNT }, (_, index) => ({
  src: `${base}/preview/research-book-first-15-pages_page-${String(index + 1).padStart(4, '0')}.jpg`,
}));
