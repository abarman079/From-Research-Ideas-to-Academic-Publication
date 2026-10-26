/**
 * Edit the photo path after placing an approved portrait in /public/authors/.
 * Example: export const AUTHOR_PHOTO_PATH: string | null = '/authors/md-kariul-islam.jpg';
 * `null` shows a typographic portrait placeholder without a broken image.
 *
 * Biographical details are supplied by IOJH and should be checked with the author
 * before publication. "PhD coursework" does NOT mean a completed PhD degree.
 */
export const AUTHOR_PHOTO_PATH: string | null = '/authors/md-kariul-islam.png';
export const ROKOMARI_PRODUCT_URL =
  'https://www.rokomari.com/book/553278/research-method-manu-preparation-and-publication';

const bn = {
  sectionLabel: '০৪ / গ্রন্থ ও লেখক',
  title: 'গ্রন্থটির পেছনে', accent: 'যিনি আছেন',
  introduction: 'লেখকের পরিচয়, প্রাসঙ্গিক একাডেমিক ও পেশাগত অভিজ্ঞতা এবং মুদ্রিত বইটির তথ্য একসঙ্গে জানুন।',
  photoAlt: 'গ্রন্থের লেখক মো. কারিউল ইসলাম',
  portraitCaption: 'লেখক পরিচিতি',
  authorLabel: 'লেখক সম্পর্কে',
  name: 'Md. Kariul Islam',
  role: 'প্রতিষ্ঠাতা ও প্রধান নির্বাহী কর্মকর্তা, International Online Journal Hub (IOJH)',
  bio: 'গবেষণা, জনস্বাস্থ্য ও একাডেমিক প্রকাশনার সঙ্গে সম্পৃক্ত কাজ ও অধ্যয়নের অভিজ্ঞতা রয়েছে মো. কারিউল ইসলামের। গবেষণার প্রাথমিক ধারণা থেকে পাণ্ডুলিপি প্রস্তুতি ও প্রকাশনার বিষয়গুলো বাংলা ভাষায় উপস্থাপন করাই এই গ্রন্থের মূল উদ্দেশ্য।',
  background: 'একাডেমিক ও পেশাগত পরিচিতি',
  credentials: [
    { label: 'পিএইচডি কোর্সওয়ার্ক', detail: 'Aalborg University, Denmark' },
    { label: 'ALAF', detail: 'Griffith University, Australia' },
    { label: 'INED', detail: 'Paris, France' },
    { label: 'MPH (Epidemiology)', detail: 'জনস্বাস্থ্য বিষয়ে প্রশিক্ষণ ও অধ্যয়ন' },
    { label: 'সহ-প্রধান সম্পাদক', detail: 'SSB Global Journal of Medical Science' },
    { label: 'প্রাক্তন ফেলো · ২০০১–২০১৫', detail: 'icddr,b' },
  ],
  bookEyebrow: 'মুদ্রিত সংস্করণ',
  bookTitle: 'বইয়ের তথ্য',
  bookData: {
    title: 'গ্রন্থের নাম', pages: 'মোট পৃষ্ঠা', language: 'ভাষা ও ধরন', isbn: 'ISBN', imprint: 'প্রকাশনা-তথ্য',
    formatValue: 'বাংলা · মুদ্রিত বই',
  },
  buyEyebrow: 'আপনার কপি সংগ্রহ করুন',
  buyTitle: 'বইটি কোথা থেকে কিনবেন?',
  buyIntro: 'আপনার সুবিধামতো IOJH-এর অফিসিয়াল স্টোর অথবা রকমারি থেকে অর্ডার করুন।',
  iojhLabel: 'IOJH অফিসিয়াল স্টোর',
  rokomariLabel: 'রকমারি থেকে কিনুন',
  retailerNote: 'বর্তমান মূল্য, স্টক, ডেলিভারি চার্জ ও পেমেন্টের শর্ত সংশ্লিষ্ট বিক্রেতার পৃষ্ঠায় নিশ্চিত করুন।',
  newTab: '(নতুন ট্যাবে খুলবে)',
};

const en = {
  sectionLabel: '04 / THE BOOK & ITS AUTHOR',
  title: 'Meet the Mind', accent: 'Behind the Book',
  introduction: 'Explore the author’s background, the printed edition, and the available ways to order your copy.',
  photoAlt: 'Md. Kariul Islam, author of Research Method, Manuscript Preparation and Publication',
  portraitCaption: 'ABOUT THE AUTHOR',
  authorLabel: 'ABOUT THE AUTHOR',
  name: 'Md. Kariul Islam',
  role: 'Founder & CEO, International Online Journal Hub (IOJH)',
  bio: 'Md. Kariul Islam’s academic and professional background includes work in research, public health, and scholarly publishing. This Bengali-language book brings together research fundamentals, manuscript preparation, and the publication process in a single reference volume.',
  background: 'Academic & Professional Background',
  credentials: [
    { label: 'PhD Coursework', detail: 'Aalborg University, Denmark' },
    { label: 'ALAF', detail: 'Griffith University, Australia' },
    { label: 'INED', detail: 'Paris, France' },
    { label: 'MPH (Epidemiology)', detail: 'Public health study and training' },
    { label: 'Co-Editor-in-Chief', detail: 'SSB Global Journal of Medical Science' },
    { label: 'Former Fellow · 2001–2015', detail: 'icddr,b' },
  ],
  bookEyebrow: 'PRINTED EDITION',
  bookTitle: 'Book Specifications',
  bookData: {
    title: 'Title', pages: 'Pages', language: 'Language & Format', isbn: 'ISBN', imprint: 'Original Imprint',
    formatValue: 'Bengali · Printed edition',
  },
  buyEyebrow: 'GET YOUR COPY',
  buyTitle: 'Choose Where to Order',
  buyIntro: 'Order directly from the official IOJH store or through Rokomari, whichever works best for you.',
  iojhLabel: 'Buy from IOJH',
  rokomariLabel: 'Buy on Rokomari',
  retailerNote: 'Please verify the current price, availability, shipping charges, and payment terms on your chosen retailer’s website.',
  newTab: '(opens in a new tab)',
};
export const authorCopy = { bn, en } as const;
