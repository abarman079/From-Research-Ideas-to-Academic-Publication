'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getCopy, type Locale } from '@/i18n/copy';
import { bookTopics, type BookTopic, type TopicGroup } from '@/lib/bookTopics';
import styles from './BookTopicsExplorer.module.css';

type Filter = 'all' | TopicGroup;

type PaletteStyle = CSSProperties & {
  '--topic-bg': string;
  '--topic-ink': string;
  '--topic-accent': string;
};

function number(value: number, locale: Locale) {
  const raw = String(value).padStart(2, '0');
  return locale === 'bn' ? raw.replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]) : raw;
}

export default function BookTopicsExplorer({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const isBn = locale === 'bn';
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const matching = bookTopics.filter(topic => filter === 'all' || topic.group === filter);
  const selectedTopic = bookTopics.find(topic => topic.id === selected) || null;
  const selectedPosition = selectedTopic ? matching.findIndex(topic => topic.id === selectedTopic.id) : -1;
  const labels = isBn
    ? {
        intro: 'গবেষণা পদ্ধতি, পাণ্ডুলিপি প্রস্তুতি ও প্রকাশনা—বইয়ের তিনটি অধ্যায়ের নির্বাচিত বিষয় দেখুন।',
        hint: 'কার্ডে মাউস রাখুন সংক্ষেপে জানতে; বিস্তারিত দেখতে ক্লিক করুন।',
        hoverHint: 'বিস্তারিত জানতে ক্লিক করুন',
        detail: 'বইয়ের আলোচ্য বিষয়',
        chapter: 'অধ্যায়',
        contents: 'এ অংশে রয়েছে',
        close: 'বিস্তারিত বন্ধ করুন',
        next: 'পরের বিষয়',
        prev: 'আগের বিষয়',
        dialogTitle: 'বিষয়ের বিস্তারিত',
        count: 'টি বিষয়',
      }
    : {
        intro: 'Explore selected subjects from the book’s three chapters on research methods, manuscript preparation and publication.',
        hint: 'Hover for a quick look. Click or tap a card to explore the topic.',
        hoverHint: 'Click for details',
        detail: 'Explore this subject',
        chapter: 'Chapter',
        contents: 'Covered in the book',
        close: 'Close topic details',
        next: 'Next topic',
        prev: 'Previous topic',
        dialogTitle: 'Topic details',
        count: 'topics',
      };

  useEffect(() => {
    if (!selectedTopic) return;
    const savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setSelected(null); }
      if (event.key === 'ArrowRight' && selectedPosition >= 0) {
        event.preventDefault();
        setSelected(matching[(selectedPosition + 1) % matching.length].id);
      }
      if (event.key === 'ArrowLeft' && selectedPosition >= 0) {
        event.preventDefault();
        setSelected(matching[(selectedPosition - 1 + matching.length) % matching.length].id);
      }
      if (event.key === 'Tab') {
        const dialog = closeRef.current?.closest('[role="dialog"]');
        const nodes = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!nodes?.length) return;
        if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
        if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0].focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = savedOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // `matching` is derived from the selected category, not an asynchronous source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, filter]);

  const open = (topic: BookTopic, from: HTMLElement) => {
    lastFocusRef.current = from;
    setSelected(topic.id);
  };
  const close = () => {
    setSelected(null);
    window.requestAnimationFrame(() => lastFocusRef.current?.focus());
  };
  const move = (delta: number) => {
    if (selectedPosition < 0 || !matching.length) return;
    const target = (selectedPosition + delta + matching.length) % matching.length;
    setSelected(matching[target].id);
  };
  const chooseFilter = (value: Filter) => { setFilter(value); setSelected(null); };

  return (
    <section id="inside" className={`section contents-section ${styles.section}`} aria-labelledby="contents-heading">
      <div className="container">
        <div className={styles.heading}>
          <div>
            <h2 id="contents-heading">{t.contents.title} <em>{t.contents.accent}</em></h2>
            <p className={styles.intro}>{labels.intro}</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <p className={styles.hint}>{labels.hint}</p>
          <div className={styles.filters} role="group" aria-label={t.contents.filterTitle}>
            {t.contents.filters.map(option => (
              <button
                key={option.key}
                type="button"
                className={filter === option.key ? styles.filterActive : styles.filter}
                aria-pressed={filter === option.key}
                onClick={() => chooseFilter(option.key as Filter)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">{matching.length} {labels.count}</p>
        <div className={styles.grid}>
          {matching.map((topic) => {
            const index = bookTopics.indexOf(topic);
            const content = topic[locale];
            const style: PaletteStyle = {
              '--topic-bg': topic.palette.background,
              '--topic-ink': topic.palette.ink,
              '--topic-accent': topic.palette.accent,
            };
            return (
              <button
                key={topic.id}
                type="button"
                className={styles.card}
                style={style}
                onClick={event => open(topic, event.currentTarget)}
                aria-haspopup="dialog"
                aria-label={`${content.title}. ${content.summary}. ${labels.detail}`}
              >
                <span className={styles.topline}>
                  <span className={styles.index}>{number(index + 1, locale)}</span>
                  <span className={styles.chapter}>{labels.chapter} {number(topic.chapter, locale)}</span>
                </span>
                <span className={styles.cardMain}>
                  <span className={styles.cardTitle}>{content.title}</span>
                  <span className={styles.summary}>{content.summary}</span>
                </span>
                <span className={styles.cardFoot}>
                  <span>{labels.detail}</span>
                  <ArrowUpRight size={19} strokeWidth={1.8} aria-hidden="true"/>
                </span>
                <span className={styles.hoverPanel} aria-hidden="true">
                  <span className={styles.hoverEyebrow}>{labels.contents}</span>
                  <span className={styles.hoverTitle}>{content.title}</span>
                  <span className={styles.hoverPoints}>
                    {content.includes.slice(0, 3).map(text => <span key={text}>{text}</span>)}
                  </span>
                  <span className={styles.hoverFoot}>{labels.hoverHint}<ArrowRight size={16}/></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTopic && (
        <div className={styles.shade} onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="iojh-topic-title" aria-label={labels.dialogTitle} style={{
            '--topic-bg': selectedTopic.palette.background,
            '--topic-ink': selectedTopic.palette.ink,
            '--topic-accent': selectedTopic.palette.accent,
          } as PaletteStyle}>
            <div className={styles.dialogTop}>
              <span>{labels.chapter} {number(selectedTopic.chapter, locale)} <span className={styles.dot}>·</span> {number(bookTopics.indexOf(selectedTopic) + 1, locale)} / {number(8, locale)}</span>
              <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={labels.close}><X size={22}/></button>
            </div>
            <div className={styles.dialogBody}>
              <div className={styles.dialogEditorial}>
                <p className={styles.dialogEyebrow}>{labels.detail}</p>
                <h3 id="iojh-topic-title">{selectedTopic[locale].title}</h3>
                <p className={styles.dialogLead}>{selectedTopic[locale].summary}</p>
                <p className={styles.dialogDescription}>{selectedTopic[locale].detail}</p>
              </div>
              <div className={styles.dialogContents}>
                <p className={styles.dialogEyebrow}>{labels.contents}</p>
                <ul>{selectedTopic[locale].includes.map((entry, i) => <li key={entry}><span>{number(i + 1, locale)}</span>{entry}</li>)}</ul>
              </div>
            </div>
            <div className={styles.dialogFooter}>
              <button type="button" onClick={() => move(-1)}><ChevronLeft size={18}/>{labels.prev}</button>
              <span>{number(selectedPosition + 1, locale)} / {number(matching.length, locale)}</span>
              <button type="button" onClick={() => move(1)}>{labels.next}<ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
