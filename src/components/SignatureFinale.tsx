'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronUp, MoveUpRight } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { book, gallery } from '@/lib/book';
import { IOJH_LOGO_PATH, IOJH_WEBSITE_URL, ROKOMARI_BOOK_URL } from '@/lib/brand';
import styles from './SignatureFinale.module.css';



const copy = {
  en: {
    eyebrow: 'THE NEXT CHAPTER STARTS HERE',
    overline: 'A PRINTED GUIDE IN BENGALI',
    first: 'The next chapter',
    second: 'of your research',
    third: 'starts here.',
    lead: 'From defining a research question to preparing a manuscript and understanding publication, explore the process in one Bengali-language book.',
    iojh: 'Order from IOJH',
    rokomari: 'Buy on Rokomari',
    sample: 'Read the first 15 pages',
    register: 'Register your interest',
    registerNote: 'Free registration · not a pre-order',
    available: 'CHOOSE YOUR BOOKSTORE',
    bookCaption: 'The original printed edition',
    finalNote: 'The retailer confirms current price, availability and delivery terms.',
    finaleLabel: 'Order the printed research guide',
    brandLine: 'Research methods · Manuscript preparation · Publication',
    footerIntro: 'A Bengali-language guide from International Online Journal Hub.',
    exploreTitle: 'Explore the book',
    links: { top: 'The Book', inside: 'Inside the Book', author: 'Meet the Author', reviews: 'Reader Reviews', faq: 'Common Questions' },
    storesTitle: 'Get your copy',
    official: 'IOJH official store',
    retailer: 'Rokomari book listing',
    institution: 'Publisher website',
    printed: 'Bengali printed edition',
    backToTop: 'Back to top',
    rights: 'International Online Journal Hub',
    external: 'opens in a new tab',
  },
  bn: {
    eyebrow: 'গবেষণার পরবর্তী ধাপের প্রস্তুতি',
    overline: 'বাংলা ভাষায় মুদ্রিত গবেষণা-সহায়ক গ্রন্থ',
    first: 'গবেষণার পরের ধাপে',
    second: 'আরও প্রস্তুত হয়ে',
    third: 'এগিয়ে যান।',
    lead: 'গবেষণার প্রশ্ন নির্ধারণ থেকে পাণ্ডুলিপি প্রস্তুতি ও প্রকাশনার প্রক্রিয়া—গুরুত্বপূর্ণ ধাপগুলো বাংলায় জানুন একই বইয়ে।',
    iojh: 'IOJH থেকে অর্ডার করুন',
    rokomari: 'রকমারিতে কিনুন',
    sample: 'প্রথম ১৫ পৃষ্ঠা পড়ে দেখুন',
    register: 'আগ্রহ নিবন্ধন করুন',
    registerNote: 'বিনামূল্যে নিবন্ধন · প্রি-অর্ডার নয়',
    available: 'বিক্রেতা বেছে নিন',
    bookCaption: 'বইটির মূল মুদ্রিত সংস্করণ',
    finalNote: 'বর্তমান মূল্য, স্টক ও ডেলিভারি-সংক্রান্ত তথ্য বিক্রেতার পৃষ্ঠায় নিশ্চিত করুন।',
    finaleLabel: 'মুদ্রিত গবেষণা-সহায়ক বইটি অর্ডার করুন',
    brandLine: 'গবেষণা পদ্ধতি · পাণ্ডুলিপি প্রস্তুতি · প্রকাশনা',
    footerIntro: 'ইন্টারন্যাশনাল অনলাইন জার্নাল হাবের বাংলা গবেষণা-সহায়ক গ্রন্থ।',
    exploreTitle: 'বইটি দেখুন',
    links: { top: 'বই পরিচিতি', inside: 'বইয়ের বিষয়বস্তু', author: 'লেখক পরিচিতি', reviews: 'পাঠকের মতামত', faq: 'প্রশ্নোত্তর' },
    storesTitle: 'বইটি সংগ্রহ করুন',
    official: 'IOJH অফিসিয়াল স্টোর',
    retailer: 'রকমারিতে বইটি দেখুন',
    institution: 'প্রকাশকের ওয়েবসাইট',
    printed: 'বাংলা মুদ্রিত সংস্করণ',
    backToTop: 'উপরে ফিরে যান',
    rights: 'ইন্টারন্যাশনাল অনলাইন জার্নাল হাব',
    external: 'নতুন ট্যাবে খুলবে',
  },
} as const;

type Props = {
  locale: Locale;
  hasReviews: boolean;
  onPreview: (trigger: HTMLElement) => void;
};

/** The final purchase scene and footer share one visual system.
 * No additional navigation bar, no claims about sales or unverified reviews.
 */
export default function SignatureFinale({ locale, hasReviews, onPreview }: Props) {
  const t = copy[locale];
  const scene = useRef<HTMLElement | null>(null);
  const bn = locale === 'bn';

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const items = Array.from(element.querySelectorAll<HTMLElement>('[data-finale-reveal]'));
      const tween = gsap.fromTo(
        items,
        { autoAlpha: 0, y: 42 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.11,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: { trigger: element, start: 'top 73%', once: true },
        },
      );
      return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(items, { clearProps: 'all' }); };
    });
    return () => media.revert();
  }, [locale]);

  return (
    <>
      <section
        id="finale"
        ref={scene}
        aria-label={t.finaleLabel}
        className={`${styles.finale} ${bn ? styles.bengali : ''}`}
      >
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.ambientOne} aria-hidden="true" />
        <div className={styles.ambientTwo} aria-hidden="true" />
        <div className={styles.finaleInner}>
          <div className={styles.story}>
            <div data-finale-reveal className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {t.eyebrow}
            </div>
            <p data-finale-reveal className={styles.overline}>{t.overline}</p>
            <h2 className={styles.title}>
              <span data-finale-reveal>{t.first}</span>
              <em data-finale-reveal>{t.second}</em>
              <span data-finale-reveal>{t.third}</span>
            </h2>
            <p data-finale-reveal className={styles.lead}>{t.lead}</p>
            <div data-finale-reveal className={styles.buyArea}>
              <div className={styles.buyLabel}>{t.available}</div>
              <div className={styles.purchaseLinks}>
                <a
                  className={styles.primaryBuy}
                  href={book.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-iojh-placement="finale"
                  aria-label={`${t.iojh} (${t.external})`}
                >
                  {t.iojh} <ArrowUpRight size={20} aria-hidden="true" />
                </a>
                <a
                  className={styles.secondaryBuy}
                  href={ROKOMARI_BOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-iojh-placement="finale"
                  aria-label={`${t.rokomari} (${t.external})`}
                >
                  {t.rokomari} <MoveUpRight size={19} aria-hidden="true" />
                </a>
              </div>
              <button
                type="button"
                className={styles.sampleLink}
                data-iojh-action="sample_open"
                data-iojh-placement="finale"
                onClick={event => onPreview(event.currentTarget)}
              >
                <BookOpen size={18} aria-hidden="true" /> {t.sample}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <div className={styles.registerLeadRow}>
                <a href={`/${locale}/register?source=finale`} className={styles.registerLeadLink}>{t.register} <ArrowRight size={17} aria-hidden="true" /></a>
                <span>{t.registerNote}</span>
              </div>
            </div>
            <p data-finale-reveal className={styles.retailerNote}>{t.finalNote}</p>
          </div>

          <div className={styles.visual} aria-label={t.bookCaption}>
            <div className={styles.visualWord} aria-hidden="true">IOJH</div>
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.backBook} data-finale-reveal>
              <Image src={gallery[1].src} alt="" width={640} height={820} sizes="(max-width: 720px) 42vw, 22vw" />
            </div>
            <div className={styles.frontBook} data-finale-reveal>
              <Image src={gallery[0].src} alt={bn ? 'বইটির প্রচ্ছদ' : 'Original printed book cover'} width={720} height={940} sizes="(max-width: 720px) 63vw, 30vw" />
            </div>
            <span className={styles.bookCaption}>{t.bookCaption}</span>
            <span className={styles.editionSeal} aria-hidden="true">IOJH<br />BOOK</span>
          </div>
        </div>
      </section>

      <footer className={styles.footer} aria-label={bn ? 'IOJH ওয়েবসাইটের শেষাংশ' : 'IOJH website footer'}>
        <div className={styles.footerInner}>
          <div className={styles.footerPrimary}>
            <div className={styles.identity}>
              <a className={styles.logoPlate} href="#top" aria-label="IOJH — back to top">
                {IOJH_LOGO_PATH ? (
                  <Image src={IOJH_LOGO_PATH} alt="IOJH" width={196} height={88} sizes="196px" className={styles.brandImage} />
                ) : <span className={styles.fallbackMark}>IOJH</span>}
              </a>
              <p className={styles.brandLabel}>INTERNATIONAL ONLINE JOURNAL HUB</p>
              <p className={styles.footerIntro}>{t.footerIntro}</p>
            </div>
            <div className={styles.footerNavColumns}>
              <nav className={styles.footerNav} aria-label={t.exploreTitle}>
                <h3>{t.exploreTitle}</h3>
                <a href="#top">{t.links.top}</a>
                <a href="#inside">{t.links.inside}</a>
                <a href="#details">{t.links.author}</a>
                {hasReviews && <a href="#reviews">{t.links.reviews}</a>}
                <a href="#faq">{t.links.faq}</a>
              </nav>
              <div className={styles.footerStores}>
                <h3>{t.storesTitle}</h3>
                <a href={book.productUrl} target="_blank" rel="noopener noreferrer" data-iojh-placement="footer">
                  {t.official} <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a href={ROKOMARI_BOOK_URL} target="_blank" rel="noopener noreferrer" data-iojh-placement="footer">
                  {t.retailer} <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a href={IOJH_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                  {t.institution} <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
          <div className={styles.typographicBrand} aria-hidden="true">IOJH<span>.</span></div>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} {t.rights}</span>
            <span>{t.printed} <span aria-hidden="true">·</span> ISBN {book.isbn}</span>
            <a href="#top">{t.backToTop} <ChevronUp size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </footer>
    </>
  );
}
