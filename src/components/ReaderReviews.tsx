'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { getCopy } from '@/i18n/copy';
import { reviews } from '@/lib/reviews';
import styles from './ReaderReviews.module.css';

function ReviewerPortrait({ path, name }: { path: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={styles.portrait}>
      {path && !broken ? (
        <Image src={path} alt={name} fill sizes="(max-width: 650px) 102px, 170px" className={styles.portraitPhoto} onError={() => setBroken(true)} />
      ) : (
        <span className={styles.initials} aria-hidden="true">{name.split(/\s+/).map(x => x[0]).slice(0,2).join('')}</span>
      )}
    </div>
  );
}

function Rating({ rating, locale }: { rating: number; locale: Locale }) {
  return (
    <div className={styles.rating} role="img" aria-label={locale === 'bn' ? `৫-এর মধ্যে ${rating.toLocaleString('bn-BD')} তারকা` : `${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span className={styles.star} key={i} aria-hidden="true">
          <Star size={19} strokeWidth={1.7} />
          <span style={{ width: `${Math.max(0, Math.min(1, rating - i)) * 100}%` }}><Star size={19} fill="currentColor" strokeWidth={1.7}/></span>
        </span>
      ))}
      <strong>{locale === 'bn' ? rating.toLocaleString('bn-BD', { minimumFractionDigits: 1 }) : rating.toFixed(1)} / 5</strong>
    </div>
  );
}

export default function ReaderReviews({ locale }: { locale: Locale }) {
  // IMPORTANT: sample reviews must never be published as genuine endorsements.
  const verified = reviews.filter(review => review.approved);
  const [active, setActive] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const changingRef = useRef(false);

  // Exit and entrance are sequenced instead of instantly swapping DOM nodes.
  useEffect(() => {
    if (!changingRef.current) return;
    const nodes = storyRef.current?.querySelectorAll<HTMLElement>('[data-review-panel]');
    if (!nodes?.length) { changingRef.current = false; return; }
    gsap.fromTo(nodes,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.54, stagger: 0.075, ease: 'power3.out', clearProps: 'opacity,transform', onComplete: () => { changingRef.current = false; } },
    );
  }, [active]);

  useEffect(() => () => {
    if (storyRef.current) gsap.killTweensOf(storyRef.current.querySelectorAll('[data-review-panel]'));
  }, []);

  const t = getCopy(locale).reviews;
  const isBn = locale === 'bn';
  if (verified.length === 0) return null;
  const index = active % verified.length;
  const review = verified[index];
  const changeTo = (target: number) => {
    if (target === index || changingRef.current || verified.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(target);
      return;
    }
    const panels = storyRef.current?.querySelectorAll<HTMLElement>('[data-review-panel]');
    if (!panels?.length) { setActive(target); return; }
    changingRef.current = true;
    gsap.to(panels, {
      opacity: 0, y: -10, duration: 0.2, stagger: 0.04,
      ease: 'power2.in', overwrite: 'auto', onComplete: () => setActive(target),
    });
  };
  const move = (delta: number) => changeTo((index + delta + verified.length) % verified.length);
  return (
    <section className={styles.section} id="reviews" aria-labelledby="reader-voices-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <span className={styles.kicker}>{isBn ? 'পাঠকের মতামত / অনুমোদিত অভিমত' : 'READER VOICES / VERIFIED TESTIMONIALS'}</span>
            <h2 id="reader-voices-title">{isBn ? 'পাঠকের' : 'Words from'} <em>{isBn ? 'কথায়' : 'our readers.'}</em></h2>
          </div>
          <p>{t.intro}</p>
        </div>
        <div className={styles.story} ref={storyRef}>
          <div className={styles.portraitWrap} data-review-panel><ReviewerPortrait key={review.id} path={review.photo} name={review.name} /><span className={styles.count}>0{index + 1} / 0{verified.length}</span></div>
          <figure className={styles.quote} key={`${locale}-${review.id}`} data-review-panel>
            <span className={styles.quoteGlyph} aria-hidden="true">“</span>
            <blockquote lang={locale}>{review.quote[locale]}</blockquote>
            <figcaption>
              <div className={styles.person}><span className={styles.name}>{review.name}</span><span className={styles.readerLabel}>{isBn ? 'অনুমোদিত পাঠক-মতামত' : 'Approved reader review'}</span></div>
              <Rating rating={review.rating} locale={locale}/>
            </figcaption>
          </figure>
        </div>
        <div className={styles.controls}>
          <div className={styles.dots} role="group" aria-label={t.selectReview}>
            {verified.map((item,i)=><button key={item.id} type="button" onClick={()=>changeTo(i)} className={i===index?styles.dotActive:styles.dot} aria-label={`${t.reviewNumber} ${i+1}: ${item.name}`} aria-pressed={i===index}/>) }
          </div>
          <div className={styles.arrows}>
            <button type="button" onClick={()=>move(-1)} aria-label={t.previous}><ChevronLeft size={20}/></button>
            <button type="button" onClick={()=>move(1)} aria-label={t.next}><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className={styles.endNote}>
          <span>{isBn ? 'আপনার গবেষণার জন্য একটি বাংলা সহায়ক গ্রন্থ' : 'A Bengali reference for your research journey'}</span>
          <a href="#purchase">{isBn ? 'আপনার কপিটি অর্ডার করুন' : 'Order your printed copy'}<ArrowUpRight size={19} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
