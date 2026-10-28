import { ArrowUpRight, BookOpen, Plus } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { faqContent } from '@/lib/faqContent';
import styles from './BookFAQ.module.css';

/** Native details/summary: keyboard accessible, no JS needed for expansion. */
export default function BookFAQ({ locale }: { locale: Locale }) {
  const content = faqContent[locale];

  return (
    <section id="faq" className={styles.section} aria-labelledby="iojh-faq-heading">
      <div className={styles.layout}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h2 id="iojh-faq-heading" className={styles.heading}>
            {content.heading} <em>{content.headingAccent}</em>
          </h2>
          <p className={styles.description}>{content.introduction}</p>

          <div className={styles.guide}>
            <BookOpen size={23} strokeWidth={1.5} aria-hidden="true" />
            <h3>{content.noteTitle}</h3>
            <p>{content.noteBody}</p>
            <div className={styles.links}>
              <a href="#inside">
                {content.exploreLink} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href="#purchase">
                {content.orderLink} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.list} aria-label={content.questionsLabel}>
          {content.entries.map((entry, index) => (
            <details
              name="iojh-faq-accordion"
              className={styles.item}
              key={index}
              defaultOpen={index === 0}
            >
              <summary className={styles.question}>
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.questionText}>{entry.question}</span>
                <span className={styles.plus} aria-hidden="true">
                  <Plus size={19} strokeWidth={1.8} />
                </span>
              </summary>
              <div className={styles.answer}>
                <p>{entry.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
