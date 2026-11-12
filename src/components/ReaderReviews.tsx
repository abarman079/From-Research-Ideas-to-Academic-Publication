"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import type { Locale } from "@/i18n/copy";
import { reviews, type Review } from "@/lib/reviews";
import styles from "./ReaderReviews.module.css";

type Props = { locale: Locale; onPreview?: (trigger: HTMLElement) => void };

const copy = {
  en: {
    kicker: "READER PERSPECTIVES",
    headingStart: "A book is better",
    headingEnd: "with its readers.",
    intro:
      "Discover what readers have to say about this Bengali-language guide to research and academic publishing.",
    
    pendingBody:
      "Confirmed reader comments will appear here once available. In the meantime, explore the first 15 pages and judge the content for yourself.",
    sample: "Read the first 15 pages",
    order: "Order the printed book",
    reviewer: "Reader review",
    previous: "Previous review",
    next: "Next review",
    select: "Select a reviewer",
    picture: "Portrait of",
  },
  bn: {
    kicker: "পাঠকের অভিমত",
    headingStart: "পাঠকের সঙ্গে",
    headingEnd: "বইয়ের পরিচয়।",
    intro:
      "গবেষণা ও একাডেমিক প্রকাশনা নিয়ে বাংলা ভাষায় লেখা এই বইটি সম্পর্কে পাঠকদের মতামত জানুন।",
    
    pendingEyebrow: "পাঠকের মতামত সংগ্রহ চলছে",
    pendingHeading: "আগে বইয়ের কিছু পৃষ্ঠা পড়ে দেখুন।",
    pendingBody:
      "যাচাই করা পাঠক-মতামত পাওয়া গেলে এখানে প্রকাশ করা হবে। তার আগে প্রথম ১৫ পৃষ্ঠা পড়ে বইটির বিষয়বস্তু নিজেই দেখে নিন।",
    sample: "প্রথম ১৫ পৃষ্ঠা পড়ুন",
    order: "মুদ্রিত বইটি অর্ডার করুন",
    reviewer: "পাঠকের মতামত",
    previous: "আগের মতামত",
    next: "পরের মতামত",
    select: "পাঠক নির্বাচন করুন",
    picture: "পাঠকের ছবি:",
  },
} as const;

function Portrait({
  review,
  small = false,
  locale,
}: {
  review: Review;
  small?: boolean;
  locale: Locale;
}) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const t = copy[locale];
  return (
    <span className={`${styles.portrait} ${small ? styles.smallPortrait : ""}`}>
      {review.photo && failedPhoto !== review.photo ? (
        <Image
          src={review.photo}
          alt={`${t.picture} ${review.name}`}
          fill
          sizes={small ? "64px" : "(max-width: 760px) 136px, 236px"}
          className={styles.portraitImage}
          onError={() => setFailedPhoto(review.photo)}
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {review.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>
      )}
    </span>
  );
}

function Rating({ value, locale }: { value: number; locale: Locale }) {
  const label =
    locale === "bn"
      ? `৫-এর মধ্যে ${value.toLocaleString("bn-BD", { minimumFractionDigits: 1 })} তারকা`
      : `${value.toFixed(1)} out of 5 stars`;
  return (
    <span className={styles.rating} role="img" aria-label={label}>
      <span className={styles.stars} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span className={styles.star} key={i}>
            <Star size={18} strokeWidth={1.5} />
            <span
              className={styles.starFill}
              style={{ width: `${Math.max(0, Math.min(1, value - i)) * 100}%` }}
            >
              <Star size={18} fill="currentColor" strokeWidth={1.5} />
            </span>
          </span>
        ))}
      </span>
      <strong>
        {value.toLocaleString(locale === "bn" ? "bn-BD" : "en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}{" "}
        / 5
      </strong>
    </span>
  );
}

export default function ReaderReviews({ locale, onPreview }: Props) {
  const t = copy[locale];
  const published = reviews.filter(
    (review) =>
      review.approved && review.quote.bn.trim() && review.quote.en.trim(),
  );
  // Local-only preview: shows existing sample data with an unmistakable draft warning.
  // Production never renders an unapproved quote, star rating, name or photograph as a testimonial.
  const localDraft =
    process.env.NODE_ENV === "development" && published.length === 0;
  const entries = published.length ? published : localDraft ? reviews : [];
  const [active, setActive] = useState(0);
  const selected = entries.length ? entries[active % entries.length] : null;
  const move = (delta: number) =>
    setActive((index) => (index + delta + entries.length) % entries.length);
  const select = (index: number) => setActive(index);
  const count = (num: number) =>
    locale === "bn" ? num.toLocaleString("bn-BD") : String(num);

  return (
    <section
      className={styles.section}
      id="reviews"
      aria-labelledby="iojh-reviews-heading"
    >
      <span className={styles.backgroundWord} aria-hidden="true">
        READERS
      </span>
      <div className={styles.container}>
        <div className={styles.introRow}>
          <div>
            <span className={styles.kicker}>{t.kicker}</span>
            <h2 id="iojh-reviews-heading" className={styles.title}>
              {t.headingStart}
              <br />
              <em>{t.headingEnd}</em>
            </h2>
          </div>
          <p className={styles.intro}>{t.intro}</p>
        </div>

        {selected ? (
          <>
            
            <div className={styles.featured}>
              <div className={styles.portraitPanel}>
                <Portrait review={selected} locale={locale} />
                <span className={styles.counter}>
                  {count((active % entries.length) + 1)} /{" "}
                  {count(entries.length)}
                </span>
              </div>
              <figure
                className={styles.reviewCard}
                key={`${locale}-${selected.id}`}
              >
                <span className={styles.quoteMark} aria-hidden="true">
                  “
                </span>
                <blockquote lang={locale}>{selected.quote[locale]}</blockquote>
                <figcaption className={styles.credit}>
                  <div>
                    <strong>{selected.name}</strong>
                    <span>{t.reviewer}</span>
                  </div>
                  <Rating value={selected.rating} locale={locale} />
                </figcaption>
              </figure>
            </div>
            <div className={styles.selectionRow}>
              <div className={styles.people} role="group" aria-label={t.select}>
                {entries.map((review, i) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => select(i)}
                    className={`${styles.personButton} ${i === active % entries.length ? styles.selectedPerson : ""}`}
                    aria-label={`${review.name} — ${t.reviewer} ${count(i + 1)}`}
                    aria-pressed={i === active % entries.length}
                  >
                    <Portrait review={review} small locale={locale} />
                    <span>{review.name}</span>
                  </button>
                ))}
              </div>
              <div className={styles.controls}>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label={t.previous}
                  disabled={entries.length < 2}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label={t.next}
                  disabled={entries.length < 2}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.pending}>
            <div className={styles.pendingArt} aria-hidden="true">
              <span>“</span>
              <span className={styles.paperLine} />
              <span className={styles.paperLine} />
              <span className={styles.paperLine} />
            </div>
            <div className={styles.pendingCopy}>
              <span className={styles.pendingEyebrow}>{t.kicker}</span>
              <h3>{t.headingStart} {t.headingEnd}</h3>
              <p>{t.pendingBody}</p>
              <button
                type="button"
                className={styles.sampleButton}
                onClick={(event) => onPreview?.(event.currentTarget)}
              >
                <BookOpen size={18} />
                {t.sample}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        <div className={styles.ctaRow}>
          <span>
            {locale === "bn"
              ? "গবেষণা পদ্ধতি থেকে প্রকাশনা পর্যন্ত—একই বইয়ে।"
              : "From research methods to publication, in one Bengali-language book."}
          </span>
          <a href="#purchase">
            {t.order}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
