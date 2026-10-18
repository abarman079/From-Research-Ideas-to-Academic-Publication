// Edit book information and image paths here. Never place the full manuscript in /public.
export const book = {
  title: 'রিসার্চ মেথড, ম্যানুস্ক্রিপ্ট প্রিপারেশন এবং পাবলিকেশন',
  englishTitle: 'Research Method, Manuscript Preparation and Publication',
  author: 'কারিউল ইসলাম',
  pageCount: 504,
  isbn: '978-984-37-0566-2',
  productUrl: 'https://iojh.com.bd/product/research-methods-manuscript-preparation-and-publication/',
};

const base = '/books/research-method-manuscript-publication';

export const gallery = [
  { id: 'front', label: 'সামনের কভার', src: `${base}/hero/cover-main.jpg`, alt: 'রিসার্চ মেথড বইয়ের সামনের কভার' },
  { id: 'back', label: 'পেছনের কভার', src: `${base}/gallery/back-cover.jpg`, alt: 'বইয়ের পেছনের কভার' },
  { id: 'spine', label: 'বইয়ের স্পাইন', src: `${base}/gallery/spine.jpg`, alt: 'বইয়ের মলাটের পাশের অংশ' },
  { id: 'inside', label: 'বইয়ের ভেতর', src: `${base}/gallery/interior.jpg`, alt: 'বইয়ের ভেতরের পাতা' },
];

// Use exactly five approved public sample pages. Replace with clean source scans when ready.
export const previewPages = Array.from({ length: 5 }, (_, i) => ({
  src: `${base}/preview/sample-${String(i + 1).padStart(2, '0')}.jpg`,
  label: `নমুনা পৃষ্ঠা ${i + 1}`,
}));

// Overview of verified subjects, not a fabricated full table of contents.
export const journey = [
  { number: '01', english: 'RESEARCH', title: 'গবেষণার ভিত্তি', detail: 'গবেষণার ধারণা, উদ্দেশ্য, গবেষণা প্রশ্ন, নকশা, পদ্ধতি ও তথ্য বিশ্লেষণের মৌলিক বিষয়।' },
  { number: '02', english: 'MANUSCRIPT', title: 'পাণ্ডুলিপি প্রস্তুতি', detail: 'গবেষণা প্রতিবেদন, একাডেমিক লেখা এবং একটি সুসংগঠিত পাণ্ডুলিপি তৈরির প্রক্রিয়া।' },
  { number: '03', english: 'PUBLICATION', title: 'প্রকাশনার পথ', detail: 'জার্নাল নির্বাচন, পিয়ার রিভিউ, প্রকাশনা নীতি ও গবেষণা প্রকাশের গুরুত্বপূর্ণ ধাপ।' },
];

export const highlightedContents = [
  'গবেষণার মৌলিক ধারণা',
  'গবেষণার বৈশিষ্ট্য',
  'গবেষণা বিষয় নির্বাচন',
  'গবেষণা প্রশ্ন ও উদ্দেশ্য',
  'গবেষণার নকশা ও নমুনা নির্বাচন',
  'গবেষণার নৈতিকতা',
  'পাণ্ডুলিপি প্রস্তুতি ও একাডেমিক লেখা',
  'জার্নাল নির্বাচন ও প্রকাশনা প্রক্রিয়া',
];
