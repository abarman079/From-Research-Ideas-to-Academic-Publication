import Image from 'next/image';
import { ArrowUpRight, BookOpenText, ExternalLink } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { book } from '@/lib/book';
import { AUTHOR_PHOTO_PATH, ROKOMARI_PRODUCT_URL, authorCopy } from '@/lib/author';
import styles from './AuthorAndPurchase.module.css';

/** Dedicated author / specifications / verified retailer links. */
export default function AuthorAndPurchase({ locale }: { locale: Locale }) {
  const c = authorCopy[locale];
  const specs = [
    { label: c.bookData.title, value: locale === 'bn' ? book.title : book.englishTitle, wide: true },
    { label: c.bookData.pages, value: locale === 'bn' ? '৫০৪' : String(book.pageCount) },
    { label: c.bookData.language, value: c.bookData.formatValue },
    { label: c.bookData.isbn, value: book.isbn },
    { label: c.bookData.imprint, value: 'LANIENT COMMUNICATION' },
  ];

  return (
    <section id="details" className={styles.section} aria-labelledby="author-section-title">
      <div className="container">
        <header className={styles.heading}>
          <p className={styles.eyebrow}>{c.sectionLabel}</p>
          <h2 id="author-section-title">{locale === 'bn' ? 'লেখক পরিচিতি' : 'About the Author'}</h2>
          <p className={styles.intro}>{c.introduction}</p>
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
            <p className={styles.bio}>{c.bio}</p>
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
            <div className={styles.smallLabel}><BookOpenText size={17} aria-hidden="true" /> {c.bookEyebrow}</div>
            <h3 id="spec-panel-title">{c.bookTitle}</h3>
            <dl className={styles.specGrid}>
              {specs.map((item) => (
                <div key={item.label} className={`${styles.specItem}${item.wide ? ` ${styles.specWide}` : ''}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="purchase" tabIndex={-1} className={styles.purchasePanel} aria-labelledby="purchase-panel-title">
            <span className={styles.buyEyebrow}>{c.buyEyebrow}</span>
            <h3 id="purchase-panel-title">{c.buyTitle}</h3>
            <p className={styles.buyIntro}>{c.buyIntro}</p>
            <div className={styles.purchaseActions}>
              <a href={book.productUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
                <span>{c.iojhLabel}</span><ArrowUpRight size={18} aria-hidden="true" />
                <span className={styles.screenReaderOnly}> {c.newTab}</span>
              </a>
              <a href={ROKOMARI_PRODUCT_URL} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                <span>{c.rokomariLabel}</span><ArrowUpRight size={18} aria-hidden="true" />
                <span className={styles.screenReaderOnly}> {c.newTab}</span>
              </a>
            </div>
            <p className={styles.retailerNote}><ExternalLink size={14} aria-hidden="true" /> {c.retailerNote}</p>
          </section>
        </div>
      </div>
    </section>
  );
}
