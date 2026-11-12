'use client';

import { ArrowUpRight, BookOpenText } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import styles from './LeadRegistration.module.css';

const copy = {
  en: {
    eyebrow: 'MORE THAN THE FINAL PAGE',
    intro: 'For the curious researcher',
    title: 'Your next question deserves a next step.',
    description: 'Interested in the book? Register your details and let IOJH help you find the information you need before choosing your printed copy.',
    cta: 'Register your interest',
    disclaimer: 'Free registration. No purchase commitment.',
  },
  bn: {
    eyebrow: 'বইয়ের শেষ পৃষ্ঠার পরেও',
    intro: 'গবেষণায় আগ্রহীদের জন্য',
    title: 'আপনার পরবর্তী প্রশ্নের জন্য আরও একধাপ এগিয়ে যান।',
    description: 'বইটি সম্পর্কে আগ্রহী? আপনার তথ্য নিবন্ধন করুন। মুদ্রিত বই সংগ্রহের আগে প্রয়োজনীয় তথ্য জানাতে IOJH যোগাযোগ করতে পারবে।',
    cta: 'আগ্রহ নিবন্ধন করুন',
    disclaimer: 'বিনামূল্যে নিবন্ধন। কেনার কোনো বাধ্যবাধকতা নেই।',
  },
} as const;

export default function LeadRegistrationSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section id="book-registration" className={`${styles.editorialBand} ${locale === 'bn' ? styles.bn : ''}`} aria-labelledby="book-registration-heading">
      <div className={styles.editorialInner}>
        <div className={`${styles.editorialArt} reveal`} aria-hidden="true">
          <div className={styles.artCircle}><BookOpenText size={67} strokeWidth={0.8} /></div>
          <span className={styles.artLeft}>IOJH / RESEARCH LIBRARY</span>
          <span className={styles.artNumber}>01<span>/</span>∞</span>
        </div>
        <div className={`${styles.editorialCopy} reveal`}>
          <span className={styles.micro}>{t.eyebrow}</span>
          <p className={styles.editorialIntro}>{t.intro}</p>
          <h2 id="book-registration-heading">{t.title}</h2>
          <p className={styles.editorialDescription}>{t.description}</p>
          <a className={styles.editorialCTA} href={`/${locale}/register?source=feature`}>{t.cta}<ArrowUpRight size={19} aria-hidden="true" /></a>
          <p className={styles.editorialAside}>{t.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
