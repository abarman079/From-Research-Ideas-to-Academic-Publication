/** Actual book identity and public image locations. Keep source/full manuscripts outside /public. */
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
  { id: 'inside', src: `${base}/gallery/interior.jpg` },
];

// Public sample ONLY: exactly five approved image files, never the full print PDF.
export const previewPages = Array.from({ length: 5 }, (_, i) => ({
  src: `${base}/preview/sample-${String(i + 1).padStart(2, '0')}.jpg`,
}));
