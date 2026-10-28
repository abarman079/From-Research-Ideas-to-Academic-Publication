/**
 * Reader-friendly descriptions based on the table of contents of the user's
 * final manuscript: Research Method, Manuscript Preparation and Publication
 * (23 October 2026), Chapter 1–3. These are summaries, NOT quotations.
 */
export type TopicGroup = 'foundations' | 'practice' | 'publishing';
export type BookTopic = {
  id: string;
  group: TopicGroup;
  chapter: 1 | 2 | 3;
  palette: { background: string; ink: string; accent: string };
  en: TopicContent;
  bn: TopicContent;
};
export type TopicContent = {
  title: string;
  summary: string;
  detail: string;
  includes: string[];
};

export const bookTopics: BookTopic[] = [
  {
    id: 'research-problem', group: 'foundations', chapter: 1,
    palette: { background: '#E9F1F5', ink: '#193B51', accent: '#4F7794' },
    en: {
      title: 'Research Problems and Questions',
      summary: 'Start with a clearly defined problem—not just a broad topic.',
      detail: 'The book explains how to move from an area of interest to a researchable problem. It considers why the question matters, how to establish the study’s rationale, and where to set its boundaries.',
      includes: ['Defining the research problem', 'Research rationale and contribution', 'Scope and delimitations of research'],
    },
    bn: {
      title: 'গবেষণা সমস্যা ও প্রশ্ন নির্ধারণ',
      summary: 'বড় একটি বিষয় থেকে সুনির্দিষ্ট গবেষণা সমস্যা চিহ্নিত করুন।',
      detail: 'গবেষণার বিষয় বেছে নেওয়ার পর আসল সমস্যা কী, সেটি কেন গুরুত্বপূর্ণ এবং গবেষণার পরিধি কোথায় সীমিত থাকবে—বইয়ে এসব বিষয় আলোচনা করা হয়েছে।',
      includes: ['গবেষণা সমস্যা নির্ধারণ', 'গবেষণার যৌক্তিকতা, গুরুত্ব ও অবদান', 'গবেষণার পরিধি ও সীমানা'],
    },
  },
  {
    id: 'literature-gap', group: 'foundations', chapter: 1,
    palette: { background: '#F5EDE5', ink: '#5A382A', accent: '#B47B5D' },
    en: {
      title: 'Literature Review and Research Gaps',
      summary: 'Read earlier studies with a clear purpose and find what remains unanswered.',
      detail: 'This part brings together literature searching, reviewing and synthesising previous findings. It also introduces conceptual frameworks and the process of identifying a meaningful research gap.',
      includes: ['Literature review and search strategy', 'Synthesis and conceptual framework', 'Identifying a research gap'],
    },
    bn: {
      title: 'সাহিত্য পর্যালোচনা ও রিসার্চ গ্যাপ',
      summary: 'আগের গবেষণা বিশ্লেষণ করে নতুন অনুসন্ধানের জায়গা খুঁজুন।',
      detail: 'পূর্ববর্তী গবেষণা কীভাবে খুঁজবেন, পর্যালোচনা করবেন ও একত্রে বিশ্লেষণ করবেন—এ অংশে তার দিকনির্দেশনা রয়েছে। পাশাপাশি ধারণাগত কাঠামো তৈরি ও গবেষণাগত শূন্যতা শনাক্ত করার আলোচনা আছে।',
      includes: ['গবেষণা সাহিত্য পর্যালোচনা ও অনুসন্ধান কৌশল', 'সংশ্লেষণ ও ধারণাগত কাঠামো তৈরি', 'গবেষণাগত শূন্যতা শনাক্তকরণ'],
    },
  },
  {
    id: 'design-sampling', group: 'practice', chapter: 1,
    palette: { background: '#E9F1EB', ink: '#244E3D', accent: '#578467' },
    en: {
      title: 'Research Design and Sampling',
      summary: 'Choose a method, study population and sample that fit your question.',
      detail: 'The research-methods chapter covers study design, research methods, population and sampling, sample size, and the implications of representativeness, generalisation and bias.',
      includes: ['Research design and methods', 'Population, sampling and sample size', 'Representativeness, generalisation and bias'],
    },
    bn: {
      title: 'গবেষণা নকশা ও নমুনায়ন',
      summary: 'গবেষণা প্রশ্ন অনুযায়ী নকশা, পদ্ধতি ও নমুনা নির্বাচন করুন।',
      detail: 'গবেষণা নকশা, উপযুক্ত পদ্ধতি নির্বাচন, সমগ্রক ও নমুনায়ন, নমুনার আকার এবং পক্ষপাতের প্রভাব—এই বিষয়গুলো বইয়ের প্রথম অধ্যায়ে রয়েছে।',
      includes: ['গবেষণা নকশা ও পদ্ধতির ধরন', 'সমগ্রক, নমুনায়ন ও নমুনার আকার', 'প্রতিনিধিত্বশীলতা, সাধারণীকরণ ও পক্ষপাত'],
    },
  },
  {
    id: 'data-analysis', group: 'practice', chapter: 1,
    palette: { background: '#EFEDF6', ink: '#45385D', accent: '#796E9A' },
    en: {
      title: 'Data Collection and Analysis',
      summary: 'Plan how evidence will be collected, organised and analysed.',
      detail: 'The book discusses practical data-collection tools, including questionnaires, interviews, focus groups, observation and field studies. It also addresses data management and planning the analysis.',
      includes: ['Questionnaires, interviews and focus groups', 'Observation and field studies', 'Data management and analysis planning'],
    },
    bn: {
      title: 'তথ্য সংগ্রহ ও বিশ্লেষণ',
      summary: 'তথ্য সংগ্রহের উপকরণ থেকে বিশ্লেষণের পরিকল্পনা পর্যন্ত।',
      detail: 'প্রশ্নমালা, সাক্ষাৎকার, ফোকাস গ্রুপ, পর্যবেক্ষণ ও ক্ষেত্রসমীক্ষার মতো উপায় নিয়ে আলোচনা রয়েছে। সংগৃহীত তথ্য ব্যবস্থাপনা ও বিশ্লেষণের পরিকল্পনাও এতে অন্তর্ভুক্ত।',
      includes: ['প্রশ্নমালা, সাক্ষাৎকার ও ফোকাস গ্রুপ', 'পর্যবেক্ষণ ও ক্ষেত্রসমীক্ষা', 'তথ্য ব্যবস্থাপনা ও বিশ্লেষণ পরিকল্পনা'],
    },
  },
  {
    id: 'ethics-quality', group: 'practice', chapter: 1,
    palette: { background: '#F5F0E2', ink: '#5C4824', accent: '#A58A4B' },
    en: {
      title: 'Research Ethics and Quality',
      summary: 'Understand the safeguards that make research more trustworthy.',
      detail: 'The methodology chapter addresses research ethics alongside validity, reliability, trustworthiness, data quality control and research limitations. Together, these topics help readers evaluate the quality of a study.',
      includes: ['Research ethics', 'Validity, reliability and trustworthiness', 'Data quality control and research limitations'],
    },
    bn: {
      title: 'গবেষণা নৈতিকতা ও গুণগত মান',
      summary: 'নৈতিকতা, নির্ভরযোগ্যতা ও তথ্যের মানের দিকে নজর দিন।',
      detail: 'গবেষণা নৈতিকতা, বৈধতা, নির্ভরযোগ্যতা, তথ্যের গুণগত মান নিয়ন্ত্রণ এবং গবেষণার সীমাবদ্ধতা—এসব বিষয় একসঙ্গে বিবেচনা করার প্রয়োজনীয়তা বইয়ে আলোচনা করা হয়েছে।',
      includes: ['গবেষণা নৈতিকতা', 'বৈধতা, নির্ভরযোগ্যতা ও বিশ্বাসযোগ্যতা', 'তথ্যের মান নিয়ন্ত্রণ ও গবেষণার সীমাবদ্ধতা'],
    },
  },
  {
    id: 'manuscript', group: 'publishing', chapter: 2,
    palette: { background: '#E9EFF8', ink: '#253E62', accent: '#6383B6' },
    en: {
      title: 'Writing a Research Manuscript',
      summary: 'Shape your research into a well-organised academic manuscript.',
      detail: 'The manuscript-preparation chapter walks through the structure of an academic paper, from the title, abstract and introduction to methods, results, discussion and conclusion. It also covers tables and figures.',
      includes: ['Title, abstract, keywords and introduction', 'Methods, results and discussion', 'Tables, figures and conclusion'],
    },
    bn: {
      title: 'গবেষণা পাণ্ডুলিপি প্রস্তুতি',
      summary: 'গবেষণার তথ্য ও যুক্তি সাজিয়ে পাণ্ডুলিপি তৈরি করুন।',
      detail: 'পাণ্ডুলিপির কাঠামো, শিরোনাম, সারসংক্ষেপ, ভূমিকা, পদ্ধতি, ফলাফল, আলোচনা ও উপসংহার লেখার বিষয়গুলো দ্বিতীয় অধ্যায়ে রয়েছে। সারণি ও চিত্রে তথ্য উপস্থাপনার আলোচনাও আছে।',
      includes: ['শিরোনাম, সারসংক্ষেপ, কী-শব্দ ও ভূমিকা', 'পদ্ধতি, ফলাফল ও আলোচনা লেখা', 'সারণি, চিত্র ও উপসংহার'],
    },
  },
  {
    id: 'citations', group: 'publishing', chapter: 2,
    palette: { background: '#F4EBED', ink: '#643B49', accent: '#A77688' },
    en: {
      title: 'Citations, References and Originality',
      summary: 'Use sources responsibly and develop clear academic writing.',
      detail: 'This part of manuscript preparation covers citations and reference management, academic language and argument, paraphrasing, originality and avoiding plagiarism.',
      includes: ['Citations and reference management', 'Academic language, arguments and flow', 'Paraphrasing, originality and avoiding plagiarism'],
    },
    bn: {
      title: 'উদ্ধৃতি, রেফারেন্স ও মৌলিকতা',
      summary: 'উৎসের সঠিক ব্যবহার ও মৌলিক একাডেমিক লেখায় গুরুত্ব দিন।',
      detail: 'উদ্ধৃতি ও রেফারেন্স ব্যবস্থাপনা, একাডেমিক ভাষা ও যুক্তির প্রবাহ, প্যারাফ্রেজিং, মৌলিকতা বজায় রাখা এবং প্লেজিয়ারিজম এড়ানোর বিষয় বইয়ে রয়েছে।',
      includes: ['উদ্ধৃতি ও রেফারেন্স ব্যবস্থাপনা', 'একাডেমিক ভাষা, যুক্তি ও লেখার প্রবাহ', 'প্যারাফ্রেজিং, মৌলিকতা ও প্লেজিয়ারিজম এড়ানো'],
    },
  },
  {
    id: 'journal-review', group: 'publishing', chapter: 3,
    palette: { background: '#E7F1F0', ink: '#24544E', accent: '#57958E' },
    en: {
      title: 'Journal Selection and Peer Review',
      summary: 'Understand the steps between submission and publication.',
      detail: 'The publication chapter covers choosing a journal, recognising predatory journals, preparing a submission, the peer-review process, responding to reviewers and checking final proofs.',
      includes: ['Journal selection and predatory journals', 'Submission and peer-review process', 'Reviewer responses and final proofing'],
    },
    bn: {
      title: 'জার্নাল নির্বাচন ও পিয়ার রিভিউ',
      summary: 'জার্নাল নির্বাচন থেকে রিভিউ ও প্রকাশনার শেষ ধাপ পর্যন্ত।',
      detail: 'জার্নাল বাছাই, প্রিডেটরি জার্নাল সম্পর্কে সতর্কতা, পাণ্ডুলিপি জমা, পিয়ার রিভিউ, রিভিউয়ারের মন্তব্যের জবাব এবং চূড়ান্ত প্রুফ পরীক্ষা—এসব বিষয় তৃতীয় অধ্যায়ে আলোচিত হয়েছে।',
      includes: ['জার্নাল নির্বাচন ও প্রিডেটরি জার্নাল', 'পাণ্ডুলিপি জমা ও পিয়ার রিভিউ প্রক্রিয়া', 'রিভিউয়ারের মন্তব্যের জবাব ও চূড়ান্ত প্রুফ'],
    },
  },
];
