import Image from 'next/image';
import { ArrowUpRight, BookOpenText, ExternalLink } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { book } from '@/lib/book';
import { AUTHOR_PHOTO_PATH, ROKOMARI_PRODUCT_URL, authorCopy } from '@/lib/author';
import styles from './AuthorAndPurchase.module.css';

/** Dedicated author / specifications / verified retailer links. */
export default function AuthorAndPurchase({ locale }: { locale: Locale }) {
  const c = authorCopy[locale];
  // This product panel intentionally does not repeat the book's page count.
  const edition = locale === 'bn'
    ? {
        title: 'বইয়ের পরিচিতি',
        intro: 'গবেষণা পদ্ধতি, পাণ্ডুলিপি প্রস্তুতি ও একাডেমিক প্রকাশনা নিয়ে বাংলায় লেখা একটি মুদ্রিত গ্রন্থ।',
        language: 'ভাষা', languageValue: 'বাংলা',
        format: 'সংস্করণ', formatValue: 'মুদ্রিত বই',
        contentsTitle: 'বইয়ের তিনটি প্রধান বিষয়',
        subjects: ['গবেষণা পদ্ধতি', 'পাণ্ডুলিপি প্রস্তুতি', 'প্রকাশনা'],
        whereTitle: 'বইটি কোথায় কিনবেন',
        whereIntro: 'আপনার সুবিধামতো বিক্রেতা বেছে নিন। প্রতিটি লিংক সরাসরি বইটির বিক্রয় পৃষ্ঠায় নিয়ে যাবে।',
        official: 'প্রকাশকের অফিসিয়াল স্টোর',
        retailer: 'অনলাইন বইয়ের দোকান',
        iojhAction: 'IOJH থেকে অর্ডার করুন',
        rokomariAction: 'রকমারিতে বইটি দেখুন',
      }
    : {
        title: 'About This Edition',
        intro: 'A Bengali-language printed reference covering research methods, manuscript preparation and scholarly publication.',
        language: 'Language', languageValue: 'Bengali',
        format: 'Format', formatValue: 'Printed book',
        contentsTitle: 'Three principal areas',
        subjects: ['Research methods', 'Manuscript preparation', 'Publication'],
        whereTitle: 'Where to Buy',
        whereIntro: 'Choose the retailer that suits you. Both links take you directly to a listing for this book.',
        official: 'Publisher’s official store',
        retailer: 'Online book retailer',
        iojhAction: 'Order from IOJH',
        rokomariAction: 'View on Rokomari',
      };

  return (
    <section id="details" className={styles.section} aria-labelledby="author-section-title">
      <div className="container">
        <header className={styles.heading}>
          
          <h2 id="author-section-title">{locale === 'bn' ? 'লেখক সম্পর্কে' : 'About the Author'}</h2>
          <p className={styles.intro}>{locale === 'bn' ? 'মো. কারিউল ইসলামের পরিচয়, তাঁর কাজ এবং বইটির প্রকাশনা-তথ্য।' : 'Meet Md. Kariul Islam, the author of this Bengali-language research book.'}</p>
        </header>

        <article className={styles.authorCard} aria-labelledby="author-name">
          <div className={styles.portraitPanel}>
            {AUTHOR_PHOTO_PATH ? (
              <div className={styles.portraitImageWrap}>
                <Image src={AUTHOR_PHOTO_PATH} alt={c.photoAlt} fill sizes="(max-width: 800px) 92vw, 34vw" className={styles.portraitImage} />
              </div>
            ) : (
              <div className={styles.portraitPlaceholder} role="img" aria-label={c.photoAlt}>
                <span className={styles.monogram} aria-hidden="true">KI</span>
                <span className={styles.placeholderName}>Md. Kariul Islam</span>
              </div>
            )}
            <p className={styles.portraitCaption}>{c.portraitCaption}</p>
          </div>

          <div className={styles.authorText}>
            <span className={styles.label}>{c.authorLabel}</span>
            <h3 id="author-name">{c.name}</h3>
            <p className={styles.role}>{c.role}</p>
            <p className={styles.bio}>{locale === 'bn' ? 'গবেষণা, জনস্বাস্থ্য ও একাডেমিক প্রকাশনায় কাজ করার অভিজ্ঞতা থেকে তিনি বইটি লিখেছেন। এখানে গবেষণার পদ্ধতি, পাণ্ডুলিপি প্রস্তুতি এবং প্রকাশনার বিভিন্ন বিষয় বাংলায় ব্যাখ্যা করা হয়েছে।' : 'Drawing on his work in research, public health and academic publishing, Md. Kariul Islam brings research methods, manuscript preparation and the publication process together in one Bengali-language book.'}</p>
            <h4 className={styles.backgroundTitle}>{c.background}</h4>
            <dl className={styles.credentialGrid}>
              {c.credentials.map((entry) => (
                <div className={styles.credential} key={`${entry.label}-${entry.detail}`}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>

        <div className={styles.infoGrid}>
          <section className={styles.specPanel} aria-labelledby="spec-panel-title">
            <div className={styles.smallLabel}>
              <BookOpenText size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{c.bookEyebrow}</span>
            </div>
            <h3 id="spec-panel-title">{edition.title}</h3>
            <p className={styles.editionIntro}>{edition.intro}</p>

            <div className={styles.bookIdentity}>
              <span className={styles.fieldLabel}>{c.bookData.title}</span>
              <p className={styles.bookName} lang={locale === 'bn' ? 'bn' : 'en'}>
                {locale === 'bn' ? book.title : book.englishTitle}
              </p>
            </div>

            <dl className={styles.factsGrid}>
              <div className={styles.fact}>
                <dt>{edition.language}</dt>
                <dd>{edition.languageValue}</dd>
              </div>
              <div className={styles.fact}>
                <dt>{edition.format}</dt>
                <dd>{edition.formatValue}</dd>
              </div>
              <div className={styles.fact}>
                <dt>{c.bookData.isbn}</dt>
                <dd className={styles.isbn}>{book.isbn}</dd>
              </div>
              <div className={styles.fact}>
                <dt>{c.bookData.imprint}</dt>
                <dd>LANIENT COMMUNICATION</dd>
              </div>
            </dl>

            <div className={styles.subjectsBlock}>
              <p>{edition.contentsTitle}</p>
              <ul className={styles.subjectList}>
                {edition.subjects.map((subject) => <li key={subject}>{subject}</li>)}
              </ul>
            </div>
          </section>

          <section id="purchase" tabIndex={-1} className={styles.purchasePanel} aria-labelledby="purchase-panel-title">
            <span className={styles.buyEyebrow}>{c.buyEyebrow}</span>
            <h3 id="purchase-panel-title">{edition.whereTitle}</h3>
            <p className={styles.buyIntro}>{edition.whereIntro}</p>

            <div className={styles.storeList}>
              <a href={book.productUrl} target="_blank" rel="noopener noreferrer" className={`${styles.storeLink} ${styles.iojhLink}`}>
                <span className={styles.storeText}>
                  <span className={styles.storeType}>{edition.official}</span>
                  <strong>{edition.iojhAction}</strong>
                </span>
                <span className={styles.storeArrow} aria-hidden="true"><ArrowUpRight size={22} strokeWidth={1.8} /></span>
                <span className={styles.screenReaderOnly}> {c.newTab}</span>
              </a>
              <a href={ROKOMARI_PRODUCT_URL} target="_blank" rel="noopener noreferrer" className={`${styles.storeLink} ${styles.rokomariLink}`}>
                <span className={styles.storeText}>
                  <span className={styles.storeType}>{edition.retailer}</span>
                  <strong>{edition.rokomariAction}</strong>
                </span>
                <span className={styles.storeArrow} aria-hidden="true"><ArrowUpRight size={22} strokeWidth={1.8} /></span>
                <span className={styles.screenReaderOnly}> {c.newTab}</span>
              </a>
            </div>

            <p className={styles.retailerNote}>
              <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>{c.retailerNote}</span>
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
