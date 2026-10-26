'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X, BookOpen } from 'lucide-react';
import type { Locale } from '@/i18n/copy';

type Sample = { src: string };
type FlipEngine = {
  flipNext: (corner: 'top' | 'bottom') => void;
  flipPrev: (corner: 'top' | 'bottom') => void;
  flip: (page: number, corner: 'top' | 'bottom') => void;
  turnToNextPage: () => void;
  turnToPrevPage: () => void;
  turnToPage: (page: number) => void;
  destroy: () => void;
};

type Props = {
  locale: Locale;
  pages: Sample[];
  productUrl: string;
  onClose: () => void;
};

export default function HeroFlipReader({ locale, pages, productUrl, onClose }: Props) {
  const isBangla = locale === 'bn';
  const mountHost = useRef<HTMLDivElement>(null);
  const engine = useRef<FlipEngine | null>(null);
  const modal = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const total = pages.length;

  const label = {
    eyebrow: isBangla ? 'IOJH / বিনামূল্যের বই প্রিভিউ' : 'IOJH / COMPLIMENTARY BOOK PREVIEW',
    title: isBangla ? 'বইয়ের পৃষ্ঠা উল্টে পড়ুন' : 'Turn the Pages. Explore the Book.',
    tip: isBangla ? 'পাতার কোণা ধরে টানুন, অথবা তীর চিহ্নে ক্লিক করুন।' : 'Drag a page corner or use the navigation arrows.',
    original: isBangla ? 'মূল বাংলা সংস্করণের নির্বাচিত নমুনা পৃষ্ঠা' : 'Selected pages from the original Bengali edition',
    loading: isBangla ? 'নমুনা পৃষ্ঠা প্রস্তুত হচ্ছে…' : 'Preparing the sample pages…',
    failed: isBangla ? 'পেজ-টার্ন প্রিভিউ লোড করা যায়নি। নিচের লিংক দিয়ে পৃষ্ঠা খুলুন।' : 'The page-turning preview could not load. Open an individual page below.',
    page: isBangla ? 'পৃষ্ঠা' : 'Page',
    close: isBangla ? 'রিডার বন্ধ করুন' : 'Close reader',
    previous: isBangla ? 'আগের পৃষ্ঠা' : 'Previous page',
    next: isBangla ? 'পরের পৃষ্ঠা' : 'Next page',
    originalPage: isBangla ? 'সম্পূর্ণ পৃষ্ঠা দেখুন' : 'View full-size page',
    order: isBangla ? 'মুদ্রিত বইটি অর্ডার করুন' : 'Order the Printed Book',
  };

  // Create the animation engine only after opening the reader, on the browser.
  // StPageFlip draws real page folds from the original sample JPGs; it does not retype any Bangla.
  useEffect(() => {
    let cancelled = false;
    let instance: FlipEngine | null = null;
    const host = mountHost.current;
    if (!host || pages.length === 0) { setLoading(false); setError(true); return; }

    const init = async () => {
      try {
        const { PageFlip } = await import('page-flip');
        if (cancelled || !mountHost.current) return;

        // A separate DOM mount lets the library clean itself up safely in React Strict Mode.
        const mount = document.createElement('div');
        mount.className = 'flip-library-mount';
        mount.style.width = '100%';
        mount.style.height = '100%';
        host.appendChild(mount);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const flip = new PageFlip(mount, {
          width: 440,
          height: 620,
          size: 'stretch',
          minWidth: 190,
          maxWidth: 490,
          minHeight: 270,
          maxHeight: 690,
          usePortrait: true,
          showCover: false,
          autoSize: false,
          drawShadow: true,
          maxShadowOpacity: 0.4,
          flippingTime: reducedMotion ? 80 : 850,
          mobileScrollSupport: false,
          swipeDistance: 35,
        });
        instance = flip;
        engine.current = flip;
        flip.on('flip', (e: { data: number | string }) => {
          if (!cancelled) setCurrent(Math.max(0, Math.min(total - 1, Number(e.data) || 0)));
        });
        flip.loadFromImages(pages.map((item) => item.src));
        if (!cancelled) { setLoading(false); setError(false); }
      } catch (err) {
        console.error('IOJH book preview could not load:', err);
        if (!cancelled) { setLoading(false); setError(true); }
      }
    };
    void init();

    return () => {
      cancelled = true;
      engine.current = null;
      try { instance?.destroy(); } catch { /* Some versions remove the mount themselves. */ }
      if (host) host.replaceChildren();
    };
    // pages is a stable module-level array from src/lib/book.ts.
  }, [pages, total]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) engine.current?.turnToNextPage(); else engine.current?.flipNext('bottom'); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) engine.current?.turnToPrevPage(); else engine.current?.flipPrev('bottom'); }
      if (e.key === 'Home') { e.preventDefault(); engine.current?.turnToPage(0); }
      if (e.key === 'End') { e.preventDefault(); engine.current?.turnToPage(total - 1); }
      if (e.key === 'Tab') {
        const controls = modal.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [total]);

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nextPage = () => {
    if (current >= total - 1) return;
    if (reduced()) engine.current?.turnToNextPage();
    else engine.current?.flipNext('bottom');
  };
  const previousPage = () => {
    if (current <= 0) return;
    if (reduced()) engine.current?.turnToPrevPage();
    else engine.current?.flipPrev('bottom');
  };
  const jumpTo = (page: number) => {
    if (reduced()) engine.current?.turnToPage(page);
    else engine.current?.flip(page, 'bottom');
  };

  return (
    <div className="flip-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flip-modal" ref={modal} role="dialog" aria-modal="true" aria-labelledby="flip-reader-title" aria-describedby="flip-reader-tip">
        <header className="flip-header">
          <div>
            <p>{label.eyebrow}</p>
            <h2 id="flip-reader-title">{label.title}</h2>
          </div>
          <button type="button" ref={closeButton} className="flip-close" onClick={onClose} aria-label={label.close}><X size={21} aria-hidden="true"/></button>
        </header>

        <div className="flip-subheader">
          <span id="flip-reader-tip">{label.tip}</span>
          <span className="flip-page-count" role="status" aria-live="polite">{label.page} {current + 1} / {total}</span>
        </div>

        <div className="flip-desk">
          <div className="flip-stage">
            <div className="flip-mount-host" ref={mountHost} role="group" aria-label={label.original} />
          </div>
          {loading && <div className="flip-wait" role="status"><BookOpen size={20} aria-hidden="true"/> {label.loading}</div>}
          {error && <div className="flip-wait"><div className="flip-warning">{label.failed}</div></div>}
          <button type="button" className="flip-previous" onClick={previousPage} disabled={loading || error || current <= 0} aria-label={label.previous}><ChevronLeft size={24}/></button>
          <button type="button" className="flip-next" onClick={nextPage} disabled={loading || error || current >= total - 1} aria-label={label.next}><ChevronRight size={24}/></button>
        </div>

        <footer className="flip-footer">
          <div className="flip-thumbs" aria-label={label.original}>
            {pages.map((page, index) => (
              <button key={page.src} type="button" className="flip-thumb" onClick={() => jumpTo(index)} disabled={loading || error} aria-current={current === index ? 'page' : undefined} aria-label={`${label.page} ${index + 1}`}>
                {/* Native image is appropriate here: thumbnails are static preview JPGs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="flip-footer-actions">
            <a className="flip-text-link" href={pages[current]?.src} target="_blank" rel="noopener noreferrer">{label.originalPage} <ArrowUpRight size={15} /></a>
            <a className="flip-order" href={productUrl} target="_blank" rel="noopener noreferrer">{label.order} <ArrowUpRight size={15}/></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
