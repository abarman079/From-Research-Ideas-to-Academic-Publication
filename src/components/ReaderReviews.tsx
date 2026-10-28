"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Locale } from "@/i18n/copy";
import { getCopy } from "@/i18n/copy";
import { reviews } from "@/lib/reviews";

function Portrait({ path, name }: { path: string | null; name: string }) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .split(/[.\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="testimonial-avatar" aria-label={name}>
      {path && !imageError ? (
        <Image
          src={path}
          alt={name}
          fill
          sizes="(max-width: 640px) 96px, 140px"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="testimonial-rating" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));

        return (
          <span className="testimonial-star" key={index} aria-hidden="true">
            <Star
              size={20}
              strokeWidth={1.5}
              className="testimonial-star-outline"
            />
            <span
              className="testimonial-star-filled"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={20} strokeWidth={1.5} fill="currentColor" />
            </span>
          </span>
        );
      })}

      <span className="testimonial-score" aria-hidden="true">
        {rating.toFixed(1)}/5
      </span>
    </div>
  );
}

export default function ReaderReviews({ locale }: { locale: Locale }) {
  const t = getCopy(locale).reviews;

  const [index, setIndex] = useState(0);

  // Display only verified and approved reviews.
  const approvedReviews = reviews.filter((item) => item.approved);

  // Nothing is displayed until reviews are approved.
  if (approvedReviews.length === 0) {
    return null;
  }

  const safeIndex = index % approvedReviews.length;
  const review = approvedReviews[safeIndex];

  const move = (by: number) => {
    setIndex(
      (current) =>
        (current + by + approvedReviews.length) % approvedReviews.length,
    );
  };

  return (
    <section
      className="testimonials-section section"
      id="reviews"
      aria-labelledby="reviews-heading"
    >
      <div className="container">
        <div className="testimonials-intro">
          <div>
            <span className="kicker">{t.eyebrow}</span>

            <h2 id="reviews-heading">{t.title}</h2>
          </div>

          <p>{t.intro}</p>
        </div>

        <div
          className="testimonial-stage"
          aria-roledescription="carousel"
          aria-label={t.carouselLabel}
        >
          <div className="testimonial-portrait-wrap">
            <Portrait key={review.id} path={review.photo} name={review.name} />
          </div>

          <figure
            className="testimonial-quote-card"
            key={`${locale}-${review.id}`}
          >
            <blockquote className="testimonial-quote" lang={locale}>
              {review.quote[locale]}
            </blockquote>

            <figcaption className="testimonial-caption">
              <span className="testimonial-author">— {review.name}</span>

              <Stars
                rating={review.rating}
                label={
                  locale === "bn"
                    ? `৫-এর মধ্যে ${review.rating.toLocaleString("bn-BD")} তারকা`
                    : `${review.rating} out of 5 stars`
                }
              />
            </figcaption>
          </figure>
        </div>

        <div className="testimonials-controls">
          <div
            className="testimonials-pagination"
            role="group"
            aria-label={t.selectReview}
          >
            {approvedReviews.map((item, position) => (
              <button
                key={item.id}
                type="button"
                className={safeIndex === position ? "is-active" : ""}
                aria-label={`${t.reviewNumber} ${position + 1}: ${item.name}`}
                aria-pressed={safeIndex === position}
                onClick={() => setIndex(position)}
              >
                <span />
              </button>
            ))}
          </div>

          <div className="testimonials-arrows">
            <span className="testimonial-position" aria-live="polite">
              {String(safeIndex + 1).padStart(2, "0")}
              {" / "}
              {String(approvedReviews.length).padStart(2, "0")}
            </span>

            <button
              type="button"
              aria-label={t.previous}
              onClick={() => move(-1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <button type="button" aria-label={t.next} onClick={() => move(1)}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
