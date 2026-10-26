/**
 * REVIEW CONTENT EDITOR
 * ---------------------
 * These entries are SAMPLE COPY, not verified customer testimonials.
 * Keep `approved: false` until the named reviewer has genuinely submitted or
 * approved their exact quote and rating. Do not publish a draft as real feedback.
 *
 * To add a photo, place a real, permission-approved photo in:
 * public/reviewers/sifatul-haque.jpg
 * Then update the matching `photo` path (example below).
 */

export type Review = {
  id: string;
  name: string;
  rating: 4.5 | 5;
  photo: string | null;
  approved: boolean;
  quote: { bn: string; en: string };
};

export const reviews: Review[] = [
  {
    id: 'sifatul-haque', name: 'Sifatul Haque', rating: 5, photo: '/reviewers/sifatul-haque.jpg', approved: false,
    quote: {
      bn: 'গবেষণার বিষয় নির্বাচন থেকে পদ্ধতি বোঝা পর্যন্ত বিষয়গুলো ধারাবাহিকভাবে সাজানো—বইটির এই দিকটি আমার কাছে সবচেয়ে গুরুত্বপূর্ণ।',
      en: 'The progression from choosing a research topic to understanding methodology is particularly valuable. It makes the subject feel more approachable.',
    },
  },
  {
    id: 'sanjida-rahman', name: 'Sanjida Rahman', rating: 4.5, photo: '/reviewers/sanjida-rahman.jpg', approved: false,
    quote: {
      bn: 'পাণ্ডুলিপি প্রস্তুতি ও একাডেমিক লেখালেখি নিয়ে বাংলায় একটি গোছানো আলোচনা নতুন গবেষকদের কাজে আসতে পারে।',
      en: 'A well-organized Bengali explanation of manuscript preparation and academic writing could be especially helpful for early-career researchers.',
    },
  },
  {
    id: 'fiona-chy', name: 'Fiona Chy.', rating: 5, photo: '/reviewers/fiona-chy.jpg', approved: false,
    quote: {
      bn: 'গবেষণার নৈতিকতা, তথ্য বিশ্লেষণ এবং প্রকাশনার ধাপ—এতগুলো বিষয় একসঙ্গে উপস্থাপনের ভাবনাটি প্রশংসনীয়।',
      en: 'Bringing research ethics, analysis, and the publication process together in one volume is a thoughtful approach to research education.',
    },
  },
  {
    id: 'shahin-ali', name: 'Shahin Ali', rating: 4.5, photo: '/reviewers/shahin-ali.jpg', approved: false,
    quote: {
      bn: 'জার্নাল নির্বাচন ও পিয়ার রিভিউয়ের মতো বিষয়গুলো সম্পর্কে সহজ ভাষায় ধারণা পাওয়া শিক্ষার্থীদের জন্য কার্যকর হতে পারে।',
      en: 'Clear explanations of journal selection and peer review can make the publication process less intimidating for students.',
    },
  },
  {
    id: 'ashraful', name: 'Ashraful', rating: 5, photo: '/reviewers/ashraful.jpg', approved: false,
    quote: {
      bn: 'গবেষণার প্রাথমিক ধারণা থেকে প্রকাশনার প্রস্তুতি—পুরো প্রক্রিয়াটি বাংলায় জানতে আগ্রহীদের জন্য এমন বইয়ের বিষয়বিন্যাস প্রাসঙ্গিক।',
      en: 'The broad coverage, from research fundamentals to publication preparation, is well suited to readers looking for guidance in Bengali.',
    },
  },
];
