'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import styles from './HeroFlipReader.module.css';

type SamplePage = { src: string };
type Props = {
  locale: Locale;
  pages: SamplePage[];
  productUrl: string;
  onClose: () => void;
  onChooseStore?: () => void;
  /** Kept for compatibility with older BookLanding; never shown or used. */
  pdfUrl?: string | null;
};
type Direction = 'forward' | 'backward';
type Turn = { from: number; to: number; direction: Direction; single: boolean };
type Dimensions = { width: number; height: number };

const TURN_DURATION = 920;
const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
const ZOOM_INCREMENT = 25;
const MOBILE_MEDIA = '(max-width: 740px)';

/**
 * Physically laid out book spreads:
 *   [1|2] [3|4] ... [13|14] [15|blank].
 * On narrow screens readers can view every page individually.
 * React owns all page DOM; no third-party library removes React nodes.
 */
export default function HeroFlipReader({ locale, pages, productUrl, onClose, onChooseStore }: Props) {
  const bangla = locale === 'bn';
  const total = pages.length;
  const [pageIndex, setPageIndex] = useState(0);
  const [single, setSingle] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 900, height: 560 });
  // Fixed page geometry: image load events must never resize the book during a turn.
  // The sample JPGs are portrait pages with consistent proportions.
  const PAGE_ASPECT = 0.715;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeHandler = useRef(onClose);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const turnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { closeHandler.current = onClose; }, [onClose]);

  const copy = {
    eyebrow: bangla ? 'বইয়ের নির্বাচিত ১৫ পৃষ্ঠা' : '15 SAMPLE PAGES',
    heading: bangla ? 'বইয়ের নমুনা পড়ুন' : 'Read a Sample',
    instructions: bangla ? 'তীরচিহ্নে পৃষ্ঠা উল্টান। লেখা বড় করতে + চাপুন।' : 'Turn a page with the arrows. Zoom in to read the text.',
    page: bangla ? 'পৃষ্ঠা' : 'Page',
    pages: bangla ? 'পৃষ্ঠা' : 'Pages',
    close: bangla ? 'বন্ধ করুন' : 'Close reader',
    prev: bangla ? 'আগের পৃষ্ঠা' : 'Previous pages',
    next: bangla ? 'পরের পৃষ্ঠা' : 'Next pages',
    zoomIn: bangla ? 'বড় করে দেখুন' : 'Zoom in',
    zoomOut: bangla ? 'ছোট করে দেখুন' : 'Zoom out',
    fit: bangla ? 'পুরো বই দেখুন' : 'Fit book',
    jump: bangla ? 'পৃষ্ঠা বেছে নিন' : 'Choose a page',
    buy: bangla ? 'কোথায় কিনবেন' : 'Where to Buy',
    missing: bangla ? 'পৃষ্ঠা পাওয়া যায়নি' : 'Page image missing',
  };

  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;
    const measure = () => setDimensions({ width: root.clientWidth, height: root.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA);
    const update = () => {
      setSingle(media.matches);
      setTurn(null);
      if (!media.matches) setPageIndex(p => Math.floor(p / 2) * 2);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const existing = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = existing;
      previousFocus.current?.focus({ preventScroll: true });
    };
  }, []);

  const endTurn = useCallback(() => {
    if (!turn) return;
    setPageIndex(turn.to);
    setTurn(null);
  }, [turn]);

  useEffect(() => {
    if (!turn) return;
    if (turnTimeout.current) clearTimeout(turnTimeout.current);
    turnTimeout.current = setTimeout(endTurn, TURN_DURATION + 90);
    return () => { if (turnTimeout.current) clearTimeout(turnTimeout.current); };
  }, [turn, endTurn]);

  const navigate = useCallback((requested: number) => {
    if (turn || total < 1) return;
    const target = Math.max(0, Math.min(total - 1, requested));
    const normalized = single ? target : Math.floor(target / 2) * 2;
    const from = single ? pageIndex : Math.floor(pageIndex / 2) * 2;
    if (from === normalized) return;
    setZoom(100); // Turn at book-fit size; the reader may zoom in again afterwards.
    if (reduceMotion || Math.abs(normalized - from) > (single ? 1 : 2)) {
      // Direct thumbnail jumps don't animate across unrelated spreads.
      setPageIndex(normalized);
      return;
    }
    setTurn({ from, to: normalized, single, direction: normalized > from ? 'forward' : 'backward' });
  }, [single, pageIndex, turn, total, reduceMotion]);

  const currentStart = single ? pageIndex : Math.floor(pageIndex / 2) * 2;
  const lastStart = single ? total - 1 : Math.floor((total - 1) / 2) * 2;
  const previous = () => navigate(currentStart - (single ? 1 : 2));
  const next = () => navigate(currentStart + (single ? 1 : 2));

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === 'Escape') { event.preventDefault(); closeHandler.current(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(currentStart - (single ? 1 : 2)); }
      if (event.key === 'ArrowRight') { event.preventDefault(); navigate(currentStart + (single ? 1 : 2)); }
      if (event.key === 'Home') { event.preventDefault(); navigate(0); }
      if (event.key === 'End') { event.preventDefault(); navigate(total - 1); }
      if (event.key === 'Tab') {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [currentStart, single, total, navigate]);

  // Warm the image cache for the visible and next spreads to prevent white flashes.
  useEffect(() => {
    for (let i = Math.max(0, currentStart - 2); i < Math.min(total, currentStart + 4); i++) {
      const preloaded = new window.Image();
      preloaded.src = pages[i].src;
    }
  }, [currentStart, pages, total]);

  useEffect(() => {
    thumbRefs.current[currentStart]?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [currentStart]);

  const aspect = PAGE_ASPECT;
  const pageCount = single ? 1 : 2;
  const widthAvailable = Math.max(150, dimensions.width - 98);
  const heightAvailable = Math.max(130, dimensions.height - 36);
  const fitHeight = Math.min(heightAvailable, widthAvailable / (pageCount * aspect));
  const fitWidth = fitHeight * aspect * pageCount;
  const scaledHeight = Math.round(fitHeight * zoom / 100);
  const scaledWidth = Math.round(fitWidth * zoom / 100);
  const canvasWidth = Math.max(dimensions.width, scaledWidth + 48);
  const canvasHeight = Math.max(dimensions.height, scaledHeight + 36);
  const rightIndex = currentStart + 1;

  useEffect(() => {
    const scroll = viewportRef.current;
    if (!scroll) return;
    const id = requestAnimationFrame(() => {
      scroll.scrollTop = Math.max(0, (scroll.scrollHeight - scroll.clientHeight) / 2);
      scroll.scrollLeft = Math.max(0, (scroll.scrollWidth - scroll.clientWidth) / 2);
    });
    return () => cancelAnimationFrame(id);
  }, [zoom, currentStart, dimensions.width, dimensions.height, single]);

  function onGestureStart(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch' || zoom !== 100) return;
    gesture.current = { x: event.clientX, y: event.clientY };
  }
  function onGestureEnd(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || zoom !== 100) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.35) {
      navigate(currentStart + (dx < 0 ? 1 : -1) * (single ? 1 : 2));
    }
  }

  const effectiveTurn = turn && !reduceMotion ? turn : null;
  const baseLeft = effectiveTurn && !effectiveTurn.single
    ? (effectiveTurn.direction === 'forward' ? effectiveTurn.from : effectiveTurn.to)
    : currentStart;
  const baseRight = effectiveTurn && !effectiveTurn.single
    ? (effectiveTurn.direction === 'forward' ? effectiveTurn.to + 1 : effectiveTurn.from + 1)
    : rightIndex;
  const faceFrontIndex = effectiveTurn
    ? (effectiveTurn.single ? effectiveTurn.from : effectiveTurn.direction === 'forward' ? effectiveTurn.from + 1 : effectiveTurn.from)
    : -1;
  const faceBackIndex = effectiveTurn
    ? (effectiveTurn.single ? effectiveTurn.to : effectiveTurn.direction === 'forward' ? effectiveTurn.to : effectiveTurn.to + 1)
    : -1;
  const reportIndex = turn ? turn.to : currentStart;
  const visibleLast = single ? reportIndex : Math.min(total - 1, reportIndex + 1);
  const formattedCount = visibleLast > reportIndex
    ? `${reportIndex + 1}–${visibleLast + 1}` : `${reportIndex + 1}`;

  const renderImage = (index: number, label?: string) => {
    if (index < 0 || index >= total) return <div className={styles.blank} aria-hidden="true"/>;
    const url = pages[index].src;
    if (failedImages[index]) return <div className={styles.missing} role="alert">{copy.missing}: {index + 1}</div>;
    return (
      // Native img preserves the original JPG; it is not recompressed by Next/Image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={label ?? `${copy.page} ${index + 1}`} draggable={false}
        className={styles.pageImage}
        onError={() => setFailedImages(previous => ({ ...previous, [index]: true }))}
      />
    );
  };

  if (!total) return null;

  return (
    <div className={styles.backdrop} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="iojh-reader-title"
        aria-describedby="iojh-reader-description" ref={dialogRef}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{copy.eyebrow}</span>
            <h2 id="iojh-reader-title">{copy.heading}</h2>
          </div>
          <button className={styles.close} type="button" aria-label={copy.close} onClick={onClose} ref={closeRef}><X size={21}/></button>
        </header>

        <div className={styles.toolbar}>
          <p className={styles.instructions} id="iojh-reader-description">{copy.instructions}</p>
          <div className={styles.controls}>
            <div className={styles.zoomControls} role="group" aria-label={copy.zoomIn}>
              <button type="button" onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_INCREMENT))} disabled={zoom === MIN_ZOOM} aria-label={copy.zoomOut}><Minus size={16}/></button>
              <output>{zoom}%</output>
              <button type="button" onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_INCREMENT))} disabled={zoom === MAX_ZOOM} aria-label={copy.zoomIn}><Plus size={16}/></button>
              <button type="button" onClick={() => setZoom(100)} aria-label={copy.fit} title={copy.fit}><RotateCcw size={16}/></button>
            </div>
            <strong className={styles.counter} aria-live="polite">{copy.pages} {formattedCount} / {total}</strong>
          </div>
        </div>

        <div className={styles.stage}>
          <div className={styles.viewport} ref={viewportRef} style={{ touchAction: zoom > 100 ? 'auto' : 'pan-y' }}
            onPointerDown={onGestureStart} onPointerUp={onGestureEnd} onPointerCancel={() => { gesture.current = null; }}>
            <div className={styles.canvas} style={{ width: canvasWidth, height: canvasHeight }}>
              <div className={`${styles.book} ${single ? styles.singleBook : ''}`} style={{ width: scaledWidth, height: scaledHeight }}>
                {single ? (
                  <div className={`${styles.page} ${styles.singlePage}`}>{renderImage(effectiveTurn ? effectiveTurn.to : currentStart)}</div>
                ) : (
                  <>
                    <div className={`${styles.page} ${styles.leftPage}`}>{renderImage(baseLeft)}</div>
                    <div className={`${styles.page} ${styles.rightPage}`}>{renderImage(baseRight)}</div>
                    <div className={styles.spine} aria-hidden="true"/>
                  </>
                )}

                {effectiveTurn && (
                  <div key={`${effectiveTurn.from}-${effectiveTurn.to}-${effectiveTurn.single}`} className={`${styles.flippingLeaf} ${effectiveTurn.direction === 'forward' ? styles.forward : styles.backward} ${effectiveTurn.single ? styles.fullLeaf : ''}`}
                    onAnimationEnd={e => { if (e.target === e.currentTarget) endTurn(); }} aria-hidden="true">
                    <div className={styles.leafFlex}>
                      <div className={`${styles.leafFace} ${styles.leafFront}`}>{renderImage(faceFrontIndex, '')}<div className={styles.shine}/></div>
                      <div className={`${styles.leafFace} ${styles.leafBack}`}>{renderImage(faceBackIndex, '')}<div className={styles.shine}/></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label={copy.prev} onClick={previous}
            disabled={currentStart === 0 || !!turn}><ChevronLeft size={22}/></button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label={copy.next} onClick={next}
            disabled={currentStart >= lastStart || !!turn}><ChevronRight size={22}/></button>
        </div>

        <footer className={styles.footer}>
          <nav className={styles.thumbnails} aria-label={copy.jump}>
            {pages.map((page, index) => {
              const isActive = single ? index === currentStart : (index === currentStart || index === currentStart + 1);
              return (
                <button key={page.src} type="button" ref={node => { thumbRefs.current[index] = node; }}
                  className={`${styles.thumbnail} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined} aria-label={`${copy.page} ${index + 1}`}
                  onClick={() => navigate(index)} disabled={!!turn}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.src} alt="" loading="lazy" draggable={false}/>
                  <span>{index + 1}</span>
                </button>
              );
            })}
          </nav>
          {onChooseStore ? (
            <button type="button" className={styles.buy} onClick={onChooseStore}>{copy.buy}<ArrowUpRight size={15}/></button>
          ) : (
            <a className={styles.buy} href={productUrl} target="_blank" rel="noopener noreferrer">{copy.buy}<ArrowUpRight size={15}/></a>
          )}
        </footer>
      </section>
    </div>
  );
}
