/**
 * IOJH book FAQ content. The physical book remains Bengali in both languages.
 * Prices and delivery charges are intentionally not hardcoded.
 */
import type { Locale } from '@/i18n/copy';

type FAQEntry = { question: string; answer: string };
type FAQContent = {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  introduction: string;
  noteTitle: string;
  noteBody: string;
  exploreLink: string;
  orderLink: string;
  questionsLabel: string;
  entries: FAQEntry[];
};

export const faqContent: Record<Locale, FAQContent> = {
  en: {
    eyebrow: 'ABOUT THE BOOK & ORDERING',
    heading: 'A few things',
    headingAccent: 'worth knowing.',
    introduction:
      'A closer look at the book, who it is written for, and how to order a copy.',
    noteTitle: 'See what is inside before you decide.',
    noteBody:
      'Browse the main subjects or read 15 original pages free of charge. The printed book is written in Bengali.',
    exploreLink: 'Explore the subjects',
    orderLink: 'Where to buy',
    questionsLabel: 'Frequently asked questions',
    entries: [
      {
        question: 'What does the book cover?',
        answer:
          'The book follows three connected areas: research methods, manuscript preparation and academic publication. Topics include framing a research question, reviewing previous studies, identifying a research gap, selecting methods and samples, managing and analysing data, writing a manuscript, using references responsibly, and navigating journal submission and peer review.',
      },
      {
        question: 'Who would find this book useful?',
        answer:
          'It is intended as a Bengali-language guide for university students, thesis and dissertation writers, early-career researchers, and others who want a structured introduction to the research and publication process. Readers can move from the fundamentals to the parts most relevant to their work.',
      },
      {
        question: 'Can I read some pages before ordering?',
        answer:
          'Yes. The Read a Sample feature lets you browse 15 pages from the original Bengali book at no cost. You can turn the pages and zoom in on the text without creating an account. These pages are a preview, not a complete digital edition.',
      },
      {
        question: 'Is the printed book available in English?',
        answer:
          'The printed edition presented on this website is in Bengali. You can switch the website interface between English and Bangla to read the descriptions and ordering information, but this does not change the language of the book or the sample pages.',
      },
      {
        question: 'Where can I order a printed copy?',
        answer:
          'You can choose between the IOJH official store and the book’s listing on Rokomari. Both options are linked in the Where to Buy section. Select the retailer you prefer and complete your order on its website.',
      },
      {
        question: 'How do I check the price, delivery and payment options?',
        answer:
          'Please check the retailer’s product page and checkout before placing an order. The current price, availability, delivery charges, estimated delivery time and payment methods may depend on the store and delivery address. This landing page does not add separate charges or take payment.',
      },
    ],
  },
  bn: {
    eyebrow: 'বই ও অর্ডার সম্পর্কে',
    heading: 'কেনার আগে',
    headingAccent: 'যা জেনে নেবেন।',
    introduction:
      'বইটির বিষয়বস্তু, কাদের জন্য লেখা এবং কীভাবে সংগ্রহ করবেন—এসব প্রশ্নের সহজ উত্তর।',
    noteTitle: 'সিদ্ধান্ত নেওয়ার আগে বইটি একটু দেখে নিন।',
    noteBody:
      'বইয়ের আলোচ্য বিষয়গুলো দেখুন কিংবা মূল বাংলা বইয়ের ১৫টি পৃষ্ঠা বিনামূল্যে পড়ে নিন।',
    exploreLink: 'বইয়ের বিষয়গুলো দেখুন',
    orderLink: 'কোথায় কিনবেন',
    questionsLabel: 'বই সম্পর্কে সাধারণ প্রশ্ন',
    entries: [
      {
        question: 'বইটিতে কোন কোন বিষয় আলোচনা করা হয়েছে?',
        answer:
          'বইটি মূলত তিনটি অংশ নিয়ে সাজানো—গবেষণা পদ্ধতি, পাণ্ডুলিপি প্রস্তুতি এবং একাডেমিক প্রকাশনা। গবেষণা প্রশ্ন নির্ধারণ, পূর্ববর্তী গবেষণা পর্যালোচনা, রিসার্চ গ্যাপ চিহ্নিত করা, গবেষণা নকশা ও নমুনায়ন, তথ্য সংগ্রহ ও বিশ্লেষণ, পাণ্ডুলিপি লেখা, সঠিক উদ্ধৃতি ও রেফারেন্স ব্যবহার, জার্নালে জমা দেওয়া এবং পিয়ার রিভিউয়ের মতো বিষয় এখানে আলোচনা করা হয়েছে।',
      },
      {
        question: 'বইটি কাদের জন্য উপযোগী?',
        answer:
          'বিশ্ববিদ্যালয়ের শিক্ষার্থী, থিসিস বা অভিসন্দর্ভ প্রস্তুতকারী, নতুন গবেষক এবং গবেষণা ও প্রকাশনার প্রক্রিয়াটি গুছিয়ে বুঝতে আগ্রহী পাঠকদের জন্য বইটি উপযোগী। গবেষণার প্রাথমিক ধারণা থেকে শুরু করে নিজের কাজের সঙ্গে সম্পর্কিত বিষয়গুলো ধাপে ধাপে পড়া যাবে।',
      },
      {
        question: 'কেনার আগে কি কিছু পৃষ্ঠা পড়ে দেখতে পারব?',
        answer:
          'অবশ্যই। ‘নমুনা পড়ুন’ অপশন থেকে মূল বাংলা বইয়ের ১৫টি পৃষ্ঠা বিনামূল্যে পড়তে পারবেন। পৃষ্ঠা উল্টে দেখা ও লেখা বড় করে পড়ার ব্যবস্থা আছে; কোনো অ্যাকাউন্ট খোলার প্রয়োজন নেই। এটি বইয়ের নমুনা, সম্পূর্ণ ডিজিটাল সংস্করণ নয়।',
      },
      {
        question: 'বইটি কি ইংরেজিতেও পাওয়া যায়?',
        answer:
          'এই ওয়েবসাইটে দেখানো মুদ্রিত সংস্করণটি বাংলায় লেখা। ওয়েবসাইটের বিবরণ ও অর্ডার-সংক্রান্ত তথ্য বাংলা অথবা ইংরেজিতে দেখতে পারবেন। তবে ভাষা পরিবর্তন করলে বইয়ের মূল লেখা বা নমুনা পৃষ্ঠার ভাষা বদলাবে না।',
      },
      {
        question: 'মুদ্রিত বইটি কোথা থেকে অর্ডার করা যাবে?',
        answer:
          'বইটি IOJH-এর অফিসিয়াল স্টোর অথবা রকমারির বইয়ের পৃষ্ঠা থেকে অর্ডার করার সুযোগ আছে। নিচের ‘কোথায় কিনবেন’ অংশে দুইটি লিংক দেওয়া রয়েছে। আপনার সুবিধামতো বিক্রেতা বেছে নিয়ে তাদের ওয়েবসাইটে অর্ডার সম্পন্ন করতে পারবেন।',
      },
      {
        question: 'দাম, ডেলিভারি চার্জ ও পেমেন্ট পদ্ধতি কীভাবে জানব?',
        answer:
          'অর্ডার দেওয়ার আগে সংশ্লিষ্ট বিক্রেতার পণ্য পৃষ্ঠা ও চেকআউটে বর্তমান দাম, বইয়ের প্রাপ্যতা, ডেলিভারি চার্জ, সম্ভাব্য সময় এবং পেমেন্টের পদ্ধতি দেখে নিন। বিক্রেতা ও ডেলিভারির ঠিকানা অনুযায়ী এসব তথ্য পরিবর্তিত হতে পারে। এই ল্যান্ডিং পেজে আলাদা কোনো পেমেন্ট নেওয়া হয় না।',
      },
    ],
  },
};
