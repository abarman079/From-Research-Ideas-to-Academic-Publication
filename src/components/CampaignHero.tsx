'use client';

import Image from 'next/image';
import { useRef, useState, type TouchEvent } from 'react';
import { ArrowDownRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { book, gallery } from '@/lib/book';
import { IOJH_LOGO_PATH } from '@/lib/brand';
import styles from './CampaignHero.module.css';

type Props = {
  locale: Locale;
  photoIndex: number;
  onPhotoSelect: (index: number) => void;
  onPhotoMove: (direction: number) => void;
  onOpenGallery: (trigger: HTMLButtonElement) => void;
  onOpenReader: (trigger: HTMLButtonElement) => void;
  onLocaleChange: (locale: Locale) => void;
};

/**
 * Actual transparent image filenames provided by IOJH (keep originals in gallery).
 * The gallery `id` values come from src/lib/book.ts and are not filenames.
 */
const CUTOUT_FILENAME_BY_GALLERY_ID: Record<string, string> = {
  front: '01_front_cover_web_transparent.webp',
  back: '02_back_cover_web_transparent.webp',
  spine: '03_spine_web_transparent.webp',
  inside: '04_open_pages_web_transparent.webp',
};

const editorial = {
  en: {
    brand: 'An IOJH publication',
    lang: 'Website language',
    label: 'A Bengali-language guide for researchers',
    line1: 'Start with',
    line2: 'a question.',
    line3: 'Go further.',
    subheading: 'Research Method, Manuscript Preparation and Publication',
    body: 'From identifying a research problem and planning a study to preparing a manuscript and understanding journal publication—a practical guide written in Bengali.',
    order: 'Order the printed book',
    sample: 'Read 15 sample pages',
    register: 'Register',
    format: 'PRINTED EDITION  /  WRITTEN IN BENGALI',
    authored: 'BY KARIUL ISLAM',
    chapterTitle: 'THE THREE PARTS OF THE BOOK',
    topics: ['Research methods', 'Manuscript preparation', 'Scholarly publication'],
    scene: 'THE BOOK / IN DETAIL',
    caption: 'Explore the original printed edition',
    enlarge: 'Enlarge book photograph',
    imageUnavailable: 'Book image currently unavailable',
    labels: ['Front cover', 'Back cover', 'Spine', 'Inside pages'],
    previous: 'Previous photograph',
    next: 'Next photograph',
    samplePhoto: 'Read the free sample',
    intro: 'A closer look at the printed book',
    scroll: 'Discover what is inside',
  },
  bn: {
    brand: 'IOJH প্রকাশনা',
    lang: 'ওয়েবসাইটের ভাষা',
    label: 'গবেষকদের জন্য বাংলায় একটি ব্যবহারিক গ্রন্থ',
    line1: 'প্রশ্ন থেকে',
    line2: 'গবেষণার পথ।',
    line3: 'তারপর প্রকাশনা।',
    subheading: 'রিসার্চ মেথড, ম্যানুস্ক্রিপ্ট প্রিপারেশন এবং পাবলিকেশন',
    body: 'গবেষণা সমস্যা নির্ধারণ ও পরিকল্পনা থেকে পাণ্ডুলিপি প্রস্তুতি এবং জার্নালে প্রকাশনার প্রক্রিয়া—গুরুত্বপূর্ণ বিষয়গুলো একত্রে আলোচনা করা হয়েছে এই বাংলা বইয়ে।',
    order: 'মুদ্রিত বইটি অর্ডার করুন',
    sample: '১৫ পৃষ্ঠা পড়ে দেখুন',
    register: 'নিবন্ধন',
    format: 'মুদ্রিত সংস্করণ  /  বাংলা ভাষা',
    authored: 'লেখক: কারিউল ইসলাম',
    chapterTitle: 'বইয়ের তিনটি প্রধান অংশ',
    topics: ['গবেষণা পদ্ধতি', 'পাণ্ডুলিপি প্রস্তুতি', 'একাডেমিক প্রকাশনা'],
    scene: 'আসল বইয়ের ছবি',
    caption: 'মূল মুদ্রিত সংস্করণটি দেখুন',
    enlarge: 'বইয়ের ছবি বড় করে দেখুন',
    imageUnavailable: 'বইয়ের ছবিটি এই মুহূর্তে দেখা যাচ্ছে না',
    labels: ['সামনের কভার', 'পেছনের কভার', 'বইয়ের মলাট', 'ভেতরের পৃষ্ঠা'],
    previous: 'আগের ছবি',
    next: 'পরের ছবি',
    samplePhoto: 'বিনামূল্যে নমুনা পড়ুন',
    intro: 'মূল মুদ্রিত বইটি একনজরে',
    scroll: 'বইয়ের ভেতর দেখুন',
  },
} as const;

export default function CampaignHero({ locale, photoIndex, onPhotoSelect, onPhotoMove, onOpenGallery, onOpenReader, onLocaleChange }: Props) {
  const content = editorial[locale];
  const touchX = useRef<number | null>(null);
  const justSwiped = useRef(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const current = gallery[photoIndex];
  // Transparent cutouts affect only the hero. Enlarged gallery originals stay intact.
  const cutoutFile = CUTOUT_FILENAME_BY_GALLERY_ID[current.id];
  const cutoutSrc = `/books/research-method-manuscript-publication/hero-cutouts/${cutoutFile}`;
  const [missingCutouts, setMissingCutouts] = useState<string[]>([]);
  const useCutout = !missingCutouts.includes(cutoutSrc);
  const displaySrc = useCutout ? cutoutSrc : current.src;
  const photoFailed = failedImage === current.src;

  const startTouch = (event: TouchEvent<HTMLButtonElement>) => {
    touchX.current = event.touches[0]?.clientX ?? null;
    justSwiped.current = false;
  };
  const finishTouch = (event: TouchEvent<HTMLButtonElement>) => {
    if (touchX.current == null) return;
    const travel = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (Math.abs(travel) > 55) {
      justSwiped.current = true;
      onPhotoMove(travel < 0 ? 1 : -1);
    }
  };

  return (
    <section id="top" className={`${styles.campaign} ${locale === 'bn' ? styles.bengali : ''}`} aria-labelledby="iojh-campaign-title">
      <header className={styles.masthead} aria-label={content.brand}>
        <a className={styles.brand} href="#top" aria-label={content.brand}>
          {IOJH_LOGO_PATH ? (
            <Image src={IOJH_LOGO_PATH} alt="IOJH" width={150} height={68} className={styles.brandLogo} priority sizes="150px" />
          ) : <strong className={styles.brandFallback}>IOJH<span>.</span></strong>}
          <span className={styles.brandCaption}>{content.brand}</span>
        </a>
        <div className={styles.mastRight}>
          <span className={styles.editionTop}>{content.format}</span>
          <nav className={styles.registrationNav} aria-label={locale === 'bn' ? 'নিবন্ধন' : 'Registration'}>
            <a className={styles.registerNav} href={`/${locale}/register?source=nav`}>{content.register}<ArrowUpRight size={16} aria-hidden="true" /></a>
          </nav>
          <div className={styles.localeGroup} role="group" aria-label={content.lang}>
            <button type="button" lang="bn" aria-pressed={locale === 'bn'} className={locale === 'bn' ? styles.activeLocale : ''} onClick={() => onLocaleChange('bn')}>বাংলা</button>
            <button type="button" lang="en" aria-pressed={locale === 'en'} className={locale === 'en' ? styles.activeLocale : ''} onClick={() => onLocaleChange('en')}>EN</button>
          </div>
        </div>
      </header>

      <div className={styles.heroGrid}>
        <div className={styles.copySide}>
          <p className={`${styles.eyebrow} hero-enter`}><span className={styles.eyebrowDot} /> {content.label}</p>
          <h1 id="iojh-campaign-title" className={`${styles.headline} hero-enter`}>
            <span>{content.line1}</span>
            <span className={styles.headlineAccent}>{content.line2}</span>
            <span>{content.line3}</span>
          </h1>
          <div className={`${styles.copyInner} hero-enter`}>
            <p className={styles.bookTitle}>{content.subheading}</p>
            <p className={styles.description}>{content.body}</p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="#purchase" onClick={() => window.dispatchEvent(new Event('iojh:order-click'))}>{content.order}<ArrowUpRight aria-hidden="true" size={20} /></a>
              <button type="button" className={styles.secondaryButton} onClick={e => onOpenReader(e.currentTarget)}><BookOpen aria-hidden="true" size={19}/>{content.sample}</button>
            </div>
          </div>
          <div className={`${styles.signature} hero-enter`}>
            <span className={styles.signatureRule} />
            <span>{content.authored}</span>
          </div>
        </div>

        <div className={styles.visualSide} aria-label={content.scene}>
          <div className={styles.visualGlow} aria-hidden="true" />
          <div className={styles.ghostType} aria-hidden="true">IOJH<br/>BOOK</div>
          <div className={`${styles.visualTop} hero-enter`}><span>{content.scene}</span><span>{String(photoIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}</span></div>
          <div className={`${styles.photoFrame} hero-enter`}>
            <span className={styles.photoFrameCorner} aria-hidden="true" />
            <button
              type="button"
              className={`${styles.bookPhoto} ${current.id === 'inside' ? styles.wideBook : ''}`}
              onClick={event => { if (justSwiped.current) { justSwiped.current = false; return; } onOpenGallery(event.currentTarget); }}
              onTouchStart={startTouch}
              onTouchEnd={finishTouch}
              aria-label={content.enlarge}
              title={content.enlarge}
            >
              {photoFailed ? <span className={styles.imageFallback}>{content.imageUnavailable}</span> : (
                <Image
                  key={displaySrc}
                  src={displaySrc}
                  alt={content.labels[photoIndex]}
                  fill
                  priority={photoIndex === 0}
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 55vw, 600px"
                  className={`${styles.bookImage} ${useCutout ? styles.cutoutImage : ''}`}
                  onError={() => {
                    if (useCutout) setMissingCutouts((p) => p.includes(cutoutSrc) ? p : [...p, cutoutSrc]);
                    else setFailedImage(current.src);
                  }}
                />
              )}
            </button>
            <button type="button" className={styles.expand} aria-label={content.enlarge} onClick={e => onOpenGallery(e.currentTarget)}><Maximize2 size={16} aria-hidden="true" /></button>
            <span className={styles.editionStamp}>{content.intro}</span>
          </div>
          <div className={styles.galleryControl}>
            <div className={styles.gallerySelector} role="group" aria-label={content.caption}>
              {gallery.map((item, i) => (
                <button type="button" key={item.id} onClick={() => onPhotoSelect(i)} aria-pressed={i === photoIndex} aria-label={content.labels[i]} className={`${styles.galleryTab} ${i === photoIndex ? styles.galleryTabSelected : ''}`}>
                  <span>{String(i + 1).padStart(2, '0')}</span><span className={styles.galleryTabText}>{content.labels[i]}</span>
                </button>
              ))}
            </div>
            <div className={styles.galleryNav}>
              <button type="button" aria-label={content.previous} onClick={() => onPhotoMove(-1)}><ChevronLeft size={19}/></button>
              <button type="button" aria-label={content.next} onClick={() => onPhotoMove(1)}><ChevronRight size={19}/></button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chapterBand}>
        <p className={styles.chapterLabel}>{content.chapterTitle}</p>
        <ul className={styles.chapterList}>{content.topics.map((topic, i) => <li key={i}><span className={styles.chapterNumber}>0{i + 1}</span>{topic}</li>)}</ul>
        <a href="#inside" className={styles.exploreLink}>{content.scroll}<ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
