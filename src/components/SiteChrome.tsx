'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronUp, Menu, X } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { book } from '@/lib/book';
import { IOJH_LOGO_PATH, IOJH_WEBSITE_URL, ROKOMARI_BOOK_URL } from '@/lib/brand';
import styles from './SiteChrome.module.css';

const labels = {
  en: {
    home: 'IOJH book collection — back to top',
    collection: 'An IOJH publication',
    nav: 'Main navigation',
    theBook: 'The Book',
    contents: 'Inside the Book',
    author: 'The Author',
    reviews: 'Reader Reviews',
    sample: 'Read a Sample',
    faq: 'Questions',
    order: 'Order the Book',
    language: 'Website language',
    open: 'Open menu',
    close: 'Close menu',
    footerBrand: 'Research, writing, and academic publication — a practical guide written in Bengali.',
    browse: 'Explore',
    buying: 'Your printed copy',
    buyingIntro: 'Choose the retailer that suits you. Prices, delivery charges and payment options are confirmed by each store.',
    options: 'Where to buy',
    officialStore: 'IOJH official store',
    rokomari: 'Rokomari',
    publisherSite: 'Publisher website',
    backTop: 'Back to top',
    rights: 'IOJH Book Collection',
    edition: 'Bengali printed edition',
  },
  bn: {
    home: 'IOJH বইয়ের পাতার শুরুতে যান',
    collection: 'IOJH প্রকাশনা',
    nav: 'প্রধান নেভিগেশন',
    theBook: 'বই পরিচিতি',
    contents: 'বইয়ের বিষয়বস্তু',
    author: 'লেখক পরিচিতি',
    reviews: 'পাঠকের মতামত',
    sample: 'নমুনা পড়ুন',
    faq: 'প্রশ্নোত্তর',
    order: 'বইটি অর্ডার করুন',
    language: 'ওয়েবসাইটের ভাষা',
    open: 'মেনু খুলুন',
    close: 'মেনু বন্ধ করুন',
    footerBrand: 'গবেষণা পদ্ধতি, পাণ্ডুলিপি লেখা ও একাডেমিক প্রকাশনা নিয়ে বাংলায় একটি ব্যবহারিক বই।',
    browse: 'বইটি দেখুন',
    buying: 'মুদ্রিত বই সংগ্রহ',
    buyingIntro: 'সুবিধামতো বিক্রেতা বেছে নিন। মূল্য, ডেলিভারি চার্জ ও পেমেন্টের তথ্য বিক্রেতার পৃষ্ঠায় দেখুন।',
    options: 'কোথায় কিনবেন',
    officialStore: 'IOJH অফিসিয়াল স্টোর',
    rokomari: 'রকমারি',
    publisherSite: 'প্রকাশকের ওয়েবসাইট',
    backTop: 'উপরে ফিরে যান',
    rights: 'IOJH বই সংগ্রহ',
    edition: 'বাংলা মুদ্রিত সংস্করণ',
  },
} as const;

function PublisherMark({ light = false }: { light?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoPath = IOJH_LOGO_PATH;
  useEffect(() => setImageFailed(false), [logoPath]);
  if (logoPath && !imageFailed) {
    return (
      <Image
        src={logoPath}
        alt="IOJH"
        width={188}
        height={66}
        unoptimized
        priority={!light}
        onError={() => setImageFailed(true)}
        className={styles.brandImage}
      />
    );
  }
  return <span className={light ? styles.fallbackLight : styles.fallbackDark} aria-label="IOJH">IOJH<span className={styles.brandDot}>.</span></span>;
}

interface HeaderProps {
  locale: Locale;
  hasReviews: boolean;
  navOpen: boolean;
  onNavOpenChange: (value: boolean) => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onPreview: (trigger: HTMLElement) => void;
  onLocaleChange: (locale: Locale) => void;
}

export function SiteHeader({
  locale,
  hasReviews,
  navOpen,
  onNavOpenChange,
  menuButtonRef,
  onPreview,
  onLocaleChange,
}: HeaderProps) {
  const t = labels[locale];
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navOpen) return;
    const handleClick = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) onNavOpenChange(false);
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [navOpen, onNavOpenChange]);

  const hideMenu = () => onNavOpenChange(false);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <a href="#top" onClick={hideMenu} className={styles.brandLink} aria-label={t.home}>
          <PublisherMark />
          <span className={styles.brandDescriptor}>{t.collection}</span>
        </a>

        <nav id="iojh-main-navigation" className={`${styles.mainNav} ${navOpen ? styles.mainNavOpen : ''}`} aria-label={t.nav}>
          <a href="#top" onClick={hideMenu}>{t.theBook}</a>
          <a href="#inside" onClick={hideMenu}>{t.contents}</a>
          <a href="#details" onClick={hideMenu}>{t.author}</a>
          {hasReviews ? <a href="#reviews" onClick={hideMenu}>{t.reviews}</a> : null}
          <button type="button" onClick={event => { const restoreFocus = navOpen && menuButtonRef.current ? menuButtonRef.current : event.currentTarget; hideMenu(); onPreview(restoreFocus); }}>
            {t.sample} <BookOpen size={15} aria-hidden="true" />
          </button>
          <a className={styles.mobileOrder} href="#purchase" onClick={hideMenu}>
            {t.order}<ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>

        <div className={styles.headerActions}>
          <div role="group" aria-label={t.language} className={styles.langControl}>
            <button type="button" lang="bn" aria-pressed={locale === 'bn'} className={locale === 'bn' ? styles.selected : ''} onClick={() => onLocaleChange('bn')}>বাংলা</button>
            <button type="button" lang="en" aria-pressed={locale === 'en'} className={locale === 'en' ? styles.selected : ''} onClick={() => onLocaleChange('en')}>EN</button>
          </div>
          <a href="#purchase" className={styles.headerOrder} onClick={hideMenu}>
            <span>{t.order}</span> <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <button
            ref={menuButtonRef}
            className={styles.menuToggle}
            type="button"
            aria-label={navOpen ? t.close : t.open}
            aria-expanded={navOpen}
            aria-controls="iojh-main-navigation"
            onClick={() => onNavOpenChange(!navOpen)}
          >{navOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}</button>
        </div>
      </div>
    </header>
  );
}

interface FooterProps {
  locale: Locale;
  hasReviews: boolean;
  onPreview: (trigger: HTMLElement) => void;
}

export function SiteFooter({ locale, hasReviews, onPreview }: FooterProps) {
  const t = labels[locale];
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerMain}`}>
        <div className={styles.footerAbout}>
          <a href="#top" className={styles.footerBrand} aria-label={t.home}>
            <span className={styles.footerLogoPlate}><PublisherMark light /></span>
            <span className={styles.footerBrandName}>International Online Journal Hub</span>
          </a>
          <p>{t.footerBrand}</p>
          <span className={styles.editionLabel}>{t.edition}</span>
        </div>

        <nav className={styles.footerExplore} aria-label={t.browse}>
          <h2>{t.browse}</h2>
          <a href="#top">{t.theBook}</a>
          <a href="#inside">{t.contents}</a>
          <a href="#details">{t.author}</a>
          {hasReviews ? <a href="#reviews">{t.reviews}</a> : null}
          <a href="#faq">{t.faq}</a>
          <button type="button" onClick={e => onPreview(e.currentTarget)}>{t.sample}<ArrowUpRight size={15} aria-hidden="true" /></button>
        </nav>

        <div className={styles.footerPurchase}>
          <span className={styles.purchaseEyebrow}>{t.edition}</span>
          <h2>{t.buying}</h2>
          <p>{t.buyingIntro}</p>
          <a href="#purchase" className={styles.footerCTA}>{t.options} <ArrowRight size={18} aria-hidden="true" /></a>
          <div className={styles.storeLinks}>
            <a href={book.productUrl} target="_blank" rel="noopener noreferrer">{t.officialStore}<ArrowUpRight size={14} aria-hidden="true" /></a>
            <a href={ROKOMARI_BOOK_URL} target="_blank" rel="noopener noreferrer">{t.rokomari}<ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </div>

      <div className={`container ${styles.footerBottom}`}>
        <span>© {new Date().getFullYear()} {t.rights}</span>
        <span>ISBN {book.isbn}</span>
        <a href={IOJH_WEBSITE_URL} target="_blank" rel="noopener noreferrer">{t.publisherSite}<ArrowUpRight size={13} aria-hidden="true" /></a>
        <a href="#top" className={styles.backToTop}>{t.backTop}<ChevronUp size={16} aria-hidden="true" /></a>
      </div>
    </footer>
  );
}
