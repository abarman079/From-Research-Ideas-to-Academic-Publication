'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCopy, type Locale } from '@/i18n/copy';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check,
  ChevronLeft, ChevronRight, ExternalLink, Maximize2,
  Menu, X, ZoomIn, ZoomOut, RotateCcw,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { book, gallery, previewPages } from '@/lib/book';

type TopicFilter = 'all' | 'foundations' | 'practice' | 'publishing';
const TOPIC_GROUPS = [
  'foundations', 'foundations', 'foundations', 'foundations',
  'practice', 'practice', 'publishing', 'publishing',
] as const;

type PhotoProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  unavailableText: string;
};

function Photo({ src, alt, priority = false, className = '', sizes = '(max-width: 768px) 90vw, 50vw', unavailableText }: PhotoProps) {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => setUnavailable(false), [src]);

  if (unavailable) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <BookOpen aria-hidden="true" size={30} strokeWidth={1.35} />
        <span>{unavailableText}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setUnavailable(true)}
    />
  );
}

export default function BookLanding({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [readerZoom, setReaderZoom] = useState(1);
  const readerScrollport = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [journeyActive, setJourneyActive] = useState(0);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const lastTrigger = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Stage selection remains functional even when animation is reduced.
    const stageContext = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.journey-stage-card').forEach((el, index) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => setJourneyActive(index),
          onEnterBack: () => setJourneyActive(index),
        });
      });
    }, root);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 781px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('.hero-enter', {
          y: 19, opacity: 0, duration: 0.85,
          ease: 'power2.out', stagger: 0.075, clearProps: 'all',
        });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
          gsap.from(el, {
            y: 24, opacity: 0, duration: 0.72, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
        gsap.fromTo('.journey-progress', { scaleY: 0 }, {
          scaleY: 1, transformOrigin: 'top', ease: 'none',
          scrollTrigger: { trigger: '.journey-right', start: 'top 66%', end: 'bottom 56%', scrub: true },
        });
        gsap.to('.hero-cover-stage', {
          y: 18, ease: 'none',
          scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.7 },
        });
      }, root);
      return () => context.revert();
    });
    return () => { mm.revert(); stageContext.revert(); };
  }, []);

  useEffect(() => {
    const modalOpen = lightboxOpen || readerOpen;
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowRight') {
        if (readerOpen) { setPreviewIndex((i) => Math.min(previewPages.length - 1, i + 1)); setReaderZoom(1); }
        else setPhotoIndex((i) => (i + 1) % gallery.length);
      }
      if (event.key === 'ArrowLeft') {
        if (readerOpen) { setPreviewIndex((i) => Math.max(0, i - 1)); setReaderZoom(1); }
        else setPhotoIndex((i) => (i - 1 + gallery.length) % gallery.length);
      }
      if (event.key === 'Tab') {
        const dialog = closeButton.current?.closest('[role="dialog"]');
        const controls = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      lastTrigger.current?.focus();
    };
  }, [readerOpen, lightboxOpen]);

  const openReader = (trigger?: HTMLElement) => {
    lastTrigger.current = trigger ?? null;
    setPreviewIndex(0);
    setReaderZoom(1);
    setReaderOpen(true);
  };
  const openGallery = (trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setLightboxOpen(true);
  };
  const galleryMove = (direction: number) => setPhotoIndex((i) => (i + direction + gallery.length) % gallery.length);
  const goToPreview = (index: number) => {
    setPreviewIndex(Math.max(0, Math.min(previewPages.length - 1, index)));
    setReaderZoom(1);
    if (readerScrollport.current) {
      readerScrollport.current.scrollTop = 0;
      readerScrollport.current.scrollLeft = 0;
    }
  };
  const zoomPreview = (delta: number) => setReaderZoom((z) => Math.max(1, Math.min(2.5, Math.round((z + delta) * 10) / 10)));
  const closeModal = () => { setReaderOpen(false); setLightboxOpen(false); };
  const currentImage = gallery[photoIndex];
  const activeScene = t.journey.scenes[journeyActive];
  const visibleTopics = t.contents.topics
    .map((title, index) => ({ title, detail: t.contents.topicDetails[index], index, group: TOPIC_GROUPS[index] }))
    .filter((item) => topicFilter === 'all' || item.group === topicFilter);
  const jumpToStage = (index: number) => {
    setJourneyActive(index);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`research-stage-${index}`)?.scrollIntoView({
      behavior: reducedMotion ? 'instant' : 'smooth', block: 'center',
    });
  };

  // Keep a returning visitor's language preference, including visits to the root URL.
  useEffect(() => {
    document.cookie = `iojh-book-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = locale === 'bn' ? 'bn-BD' : 'en';
  }, [locale]);

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    let targetSection = 'top';
    const sections = document.querySelectorAll<HTMLElement>('main section[id]');
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top < Math.min(window.innerHeight * .40, 260)) {
        targetSection = section.id;
      }
    });
    document.cookie = `iojh-book-locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setNavOpen(false);
    router.push(`/${nextLocale}#${targetSection}`);
  };

  return (
    <div ref={root} className="site-wrap">
      <a className="skip-link" href="#main-content">{t.general.skip}</a>
      <header className="site-header">
        <div className="header-inner container">
          <a className="wordmark" href="#top" aria-label={t.nav.home} onClick={() => setNavOpen(false)}>
            <span className="wordmark-title">IOJH<span>.</span></span>
            <span className="wordmark-subtitle">{t.nav.subtitle}</span>
          </a>
          <nav className={`primary-nav${navOpen ? ' is-open' : ''}`} aria-label={t.nav.main}>
            <a href="#about" onClick={() => setNavOpen(false)}>{t.nav.about}</a>
            <a href="#journey" onClick={() => setNavOpen(false)}>{t.nav.journey}</a>
            <a href="#inside" onClick={() => setNavOpen(false)}>{t.nav.inside}</a>
            <a href="#preview" onClick={() => setNavOpen(false)}>{t.nav.preview}</a>
          </nav>
          <div className="header-actions">
            <div className="language-switch" role="group" aria-label={t.general.localeLabel}>
              <button type="button" aria-pressed={locale === 'bn'} lang="bn" className={locale === 'bn' ? 'active' : ''} onClick={() => switchLocale('bn')}>বাংলা</button>
              <span className="language-divider" aria-hidden="true" />
              <button type="button" aria-pressed={locale === 'en'} lang="en" className={locale === 'en' ? 'active' : ''} onClick={() => switchLocale('en')}>EN</button>
            </div>
            <a className="header-order" href={book.productUrl} target="_blank" rel="noopener noreferrer">
              {t.nav.order} <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button className="menu-toggle" type="button" aria-label={navOpen ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section id="top" className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-enter"><span className="eyebrow-rule" /> {t.hero.eyebrow} <span className="eyebrow-index">— 01</span></div>
              <p className="hero-pretitle hero-enter">{t.hero.pretitle}</p>
              <h1 className="hero-title hero-enter">{t.hero.title} <span>{t.hero.accent}</span></h1>
              <p className="hero-book-name hero-enter">{locale === 'bn' ? book.title : book.englishTitle}</p>
              <p className="hero-description hero-enter">{t.hero.description}</p>
              <div className="hero-buttons hero-enter">
                <a className="btn btn-dark" href={book.productUrl} target="_blank" rel="noopener noreferrer">{t.hero.order} <ArrowUpRight size={18} aria-hidden="true" /></a>
                <button className="btn btn-light" type="button" onClick={(e) => openReader(e.currentTarget)}><BookOpen size={18} aria-hidden="true" /> {t.hero.sample}</button>
              </div>
              <div className="hero-facts hero-enter" aria-label={t.hero.edition}>
                <div><strong>{t.hero.pageValue}</strong><span>{t.hero.pageLabel}</span></div>
                <div><strong>{t.hero.languageValue}</strong><span>{t.hero.languageLabel}</span></div>
                <div><strong>{t.hero.formatValue}</strong><span>{t.hero.formatLabel}</span></div>
              </div>
            </div>
            <div className="hero-product hero-enter">
              <div className="hero-backdrop" aria-hidden="true" />
              <div className="hero-cover-stage">
                <Photo src={gallery[0].src} alt={t.gallery.alts[0]} unavailableText={t.general.unavailable} priority sizes="(max-width: 780px) 95vw, 46vw" />
              </div>
              <div className="hero-product-bottom"><span>{t.hero.edition}</span><span>{t.hero.ribbon}</span></div>
              <div className="hero-edition-stamp" aria-hidden="true"><span>504</span><small>{t.hero.stamp}</small></div>
            </div>
          </div>
        </section>

        <div className="taxonomy-bar" aria-label={t.journey.intro}>
          <div className="container taxonomy-inner"><span>{t.taxonomy[0]}</span><i aria-hidden="true" /><span>{t.taxonomy[1]}</span><i aria-hidden="true" /><span>{t.taxonomy[2]}</span></div>
        </div>

        <section id="about" className="section gallery-section">
          <div className="container">
            <div className="section-topline reveal"><span className="kicker">{t.gallery.eyebrow}</span><span className="topline-aside">{t.gallery.aside}</span></div>
            <div className="section-heading reveal"><h2>{t.gallery.title} <em>{t.gallery.accent}</em></h2><p>{t.gallery.intro}</p></div>
            <div className="gallery-grid">
              <div className="gallery-main reveal">
                <div className="gallery-main-image image-swap" key={currentImage.src}><Photo src={currentImage.src} alt={t.gallery.alts[photoIndex]} unavailableText={t.general.unavailable} sizes="(max-width: 780px) 95vw, 55vw" /></div>
                <div className="gallery-stage-top"><span>{t.gallery.stage}</span><span>0{photoIndex + 1} <span className="muted-index">/ 0{gallery.length}</span></span></div>
                <div className="gallery-stage-bottom">
                  <span>{t.gallery.labels[photoIndex]}</span>
                  <button type="button" className="gallery-zoom" onClick={(e) => openGallery(e.currentTarget)} aria-label={t.gallery.zoom}><Maximize2 size={17} aria-hidden="true" /> {t.gallery.zoom}</button>
                </div>
              </div>
              <div className="gallery-detail reveal">
                <span className="micro-label">{t.gallery.explore}</span>
                <h3>{t.gallery.headline}<br /><em>{t.gallery.headlineAccent}</em></h3>
                <p>{t.gallery.description}</p>
                <div className="gallery-thumbnail-grid">
                  {gallery.map((item, index) => (
                    <button type="button" key={item.id} className={`gallery-thumb${index === photoIndex ? ' selected' : ''}`} onClick={() => setPhotoIndex(index)} aria-label={`${t.gallery.labels[index]}: ${t.gallery.view}`} aria-pressed={index === photoIndex}>
                      <span className="gallery-thumb-image"><Photo src={item.src} alt="" unavailableText={t.general.unavailable} sizes="160px" /></span>
                      <span className="gallery-thumb-title">{t.gallery.labels[index]}</span>
                    </button>
                  ))}
                </div>
                <div className="gallery-navigation"><span>{t.gallery.select}</span><div><button type="button" onClick={() => galleryMove(-1)} aria-label={t.general.previousPhoto}><ChevronLeft size={19} /></button><button type="button" onClick={() => galleryMove(1)} aria-label={t.general.nextPhoto}><ChevronRight size={19} /></button></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="section journey-section" aria-labelledby="journey-heading">
          <div className="container journey-grid">
            <div className="journey-left">
              <div className="journey-introduction reveal">
                <span className="kicker">{t.journey.eyebrow}</span>
                <h2 id="journey-heading">{t.journey.title}<br /><em>{t.journey.accent}</em></h2>
                <p>{t.journey.intro}</p>
              </div>
              <div className="journey-visual" data-stage={journeyActive} role="region" aria-label={activeScene.accessibleLabel}>
                <div className="journey-visual-top">
                  <span>{t.journey.visualLabel}</span>
                  <span>0{journeyActive + 1} / 03</span>
                </div>
                <div key={`${locale}-${journeyActive}`} className="journey-visual-scene">
                  <span className="journey-large-digit" aria-hidden="true">0{journeyActive + 1}</span>
                  <div className="journey-visual-content">
                    <span className="journey-scene-kicker">{activeScene.kicker}</span>
                    <h3>{activeScene.headline}</h3>
                    <p>{activeScene.description}</p>
                  </div>
                  <div className="journey-visual-milestones" aria-label={t.journey.milestoneLabel}>
                    {activeScene.milestones.map((word, index) => (
                      <span key={word}><b>0{index + 1}</b>{word}</span>
                    ))}
                  </div>
                </div>
                <div className="journey-stage-nav" role="group" aria-label={t.journey.stageNavigation}>
                  {t.journey.stagesShort.map((label, index) => (
                    <button
                      type="button" key={label}
                      className={journeyActive === index ? 'is-active' : ''}
                      aria-pressed={journeyActive === index}
                      aria-label={`${t.journey.jumpTo} ${label}`}
                      onClick={() => jumpToStage(index)}
                    ><span>0{index + 1}</span><span>{label}</span></button>
                  ))}
                </div>
              </div>
            </div>
            <div className="journey-right">
              <div className="journey-track" aria-hidden="true"><span className="journey-progress" /></div>
              {t.journey.steps.map((item, index) => (
                <article
                  className={`journey-stage-card${journeyActive === index ? ' is-current' : ''}`}
                  id={`research-stage-${index}`}
                  key={index}
                  aria-label={`${index + 1}. ${item.title}`}
                >
                  <span className="journey-card-kicker">0{index + 1} / {item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <div className="journey-card-footer"><span>{t.journey.stagesShort[index]}</span><span className="journey-card-rule" aria-hidden="true" /></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="inside" className="section contents-section" aria-labelledby="contents-heading">
          <div className="container">
            <div className="section-topline reveal"><span className="kicker">{t.contents.eyebrow}</span><span className="topline-aside">{t.contents.aside}</span></div>
            <div className="section-heading reveal"><h2 id="contents-heading">{t.contents.title} <em>{t.contents.accent}</em></h2><p>{t.contents.intro}</p></div>
            <div className="contents-explorer-header reveal">
              <div className="contents-volume" aria-label={`${book.pageCount} ${t.contents.volumeLabel}`}>
                <strong>504</strong><span>{t.contents.volumeLabel}</span>
              </div>
              <div className="contents-explorer-controls">
                <span className="micro-label">{t.contents.filterTitle}</span>
                <div className="contents-filters" role="group" aria-label={t.contents.filterTitle}>
                  {t.contents.filters.map((option) => (
                    <button type="button" key={option.key}
                      className={topicFilter === option.key ? 'is-active' : ''}
                      aria-pressed={topicFilter === option.key}
                      onClick={() => setTopicFilter(option.key)}>{option.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <p className="contents-result-count" aria-live="polite">
              {String(visibleTopics.length).padStart(2, '0')} / 08 — {t.contents.countLabel}
            </p>
            <div className={`theme-grid${topicFilter !== 'all' ? ' is-filtered' : ''}`} key={`${locale}-${topicFilter}`}>
              {visibleTopics.map((item) => (
                <article
                  className={`theme-card theme-card--${item.group}${[0, 5, 6, 7].includes(item.index) ? ' theme-featured' : ''}`}
                  key={item.index}
                >
                  <div className="theme-card-top"><span className="theme-card-index">{String(item.index + 1).padStart(2, '0')}</span><span className="theme-card-category">{t.contents.groupLabels[item.group]}</span></div>
                  <div className="theme-card-body"><h3>{item.title}</h3><p>{item.detail}</p></div>
                  <div className="theme-card-bottom" aria-hidden="true"><span className="theme-card-line" /><span>IOJH / 504</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="editorial-interlude" aria-label={t.interlude.sectionLabel}>
          <div className="container editorial-interlude-inner">
            <span className="interlude-kicker reveal">{t.interlude.kicker}</span>
            <div className="interlude-body reveal">
              <span className="interlude-ghost" aria-hidden="true">504</span>
              <h2>{t.interlude.title}<br /><em>{t.interlude.accent}</em></h2>
              <p>{t.interlude.description}</p>
            </div>
            <div className="interlude-foot"><span>IOJH / RESEARCH</span><span>{t.interlude.footnote}</span></div>
          </div>
        </aside>

        <section id="preview" className="section sample-section">
          <div className="container sample-grid">
            <div className="sample-copy reveal"><span className="kicker">{t.sample.eyebrow}</span><h2>{t.sample.title}<br /><em>{t.sample.accent}</em></h2><p>{t.sample.intro}</p>
              <button type="button" className="btn btn-dark" onClick={(e) => openReader(e.currentTarget)}><BookOpen size={18} aria-hidden="true" /> {t.sample.action} <ArrowRight size={17} aria-hidden="true" /></button>
              <div className="sample-assurance"><Check size={17} aria-hidden="true" /> {t.sample.assurance}</div>
              <p className="sample-edition-note">{t.sample.editionNote}</p>
            </div>
            <button type="button" className="sample-showcase reveal" onClick={(e) => openReader(e.currentTarget)} aria-label={t.sample.open}>
              <span className="sample-sheet"><Photo src={previewPages[0].src} alt={t.sample.photoAlt} unavailableText={t.general.unavailable} sizes="(max-width: 780px) 82vw, 35vw" /></span>
              <span className="sample-counter">01 / 05 — {t.sample.previewTag}</span>
              <span className="sample-open"><ZoomIn size={18} aria-hidden="true" /> {t.sample.open}</span>
            </button>
          </div>
        </section>

        <section id="details" className="section details-section"><div className="container">
          <div className="section-topline reveal"><span className="kicker">{t.details.eyebrow}</span><span className="topline-aside">{t.details.aside}</span></div>
          <div className="section-heading reveal"><h2>{t.details.title} <em>{t.details.accent}</em></h2></div>
          <div className="details-grid reveal">
            <div className="spec-list"><div><span>{t.details.name}</span><strong>{locale === 'bn' ? book.title : book.englishTitle}</strong></div><div><span>{t.details.author}</span><strong>{locale === 'bn' ? book.author : book.authorEnglish}</strong></div><div><span>{t.details.pages}</span><strong>{book.pageCount}</strong></div><div><span>{t.details.language}</span><strong>{t.details.languageValue}</strong></div><div><span>ISBN</span><strong>{book.isbn}</strong></div><div><span>{t.details.imprint}</span><strong>LANIENT COMMUNICATION</strong></div></div>
            <div className="order-panel">
              <span className="micro-label">{t.details.orderKicker}</span>
              <h3>{t.details.orderTitle}<br /> {t.details.orderAccent}</h3>
              <p>{t.details.orderInfo}</p>
              <div className="order-checklist" aria-label={t.details.purchaseHeading}>
                <h4>{t.details.purchaseHeading}</h4>
                <ol>{t.details.purchaseSteps.map((step, index) => <li key={index}><span>0{index + 1}</span><span>{step}</span></li>)}</ol>
              </div>
              <a className="btn btn-gold order-primary-action" href={book.productUrl} target="_blank" rel="noopener noreferrer">{t.details.orderButton} <ArrowUpRight size={17} /></a>
              <p className="order-external-note"><ExternalLink size={14} aria-hidden="true" />{t.details.checkoutNote}</p>
              <div className="order-footnotes"><span><BookOpen size={14} /> {t.details.printFootnote}</span><span><ExternalLink size={14} /> {t.details.listingFootnote}</span></div>
            </div>
          </div>
        </div></section>

        <section id="faq" className="section faq-section"><div className="container faq-grid"><div className="reveal"><span className="kicker">{t.faq.eyebrow}</span><h2>{t.faq.title} <em>{t.faq.accent}</em></h2><p>{t.faq.intro}</p></div>
          <div className="faq-list reveal">
            {t.faq.items.map((item, index) => <details key={index}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
          </div>
        </div></section>
      </main>

      <footer className="site-footer"><div className="container footer-main"><div><div className="footer-mark">IOJH<span>.</span></div><p>{t.footer.tagline}</p></div><a href={book.productUrl} target="_blank" rel="noopener noreferrer">{t.footer.view} <ArrowUpRight size={16}/></a></div><div className="container footer-meta"><span>© {new Date().getFullYear()} {t.footer.collection}</span><span>ISBN {book.isbn}</span></div></footer>

      {lightboxOpen && (
        <div className="modal-shade" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-panel photo-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-heading">
            <div className="modal-header"><div><span>{t.gallery.stage} / 0{photoIndex + 1}</span><h2 id="gallery-modal-heading">{t.gallery.labels[photoIndex]}</h2></div><button type="button" ref={closeButton} className="modal-close" onClick={closeModal} aria-label={t.general.closePhoto}><X /></button></div>
            <div className="modal-image"><Photo src={currentImage.src} alt={t.gallery.alts[photoIndex]} unavailableText={t.general.unavailable} sizes="90vw" /></div>
            <div className="modal-controls"><button type="button" onClick={() => galleryMove(-1)} aria-label={t.general.previousPhoto}><ChevronLeft size={19}/> {t.general.previousPhoto}</button><span>{photoIndex + 1} / {gallery.length}</span><button type="button" onClick={() => galleryMove(1)} aria-label={t.general.nextPhoto}>{t.general.nextPhoto} <ChevronRight size={19}/></button></div>
          </div>
        </div>
      )}
      {readerOpen && (
        <div className="modal-shade reader-shade" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-panel reader-modal reader-modal-v4" role="dialog" aria-modal="true" aria-labelledby="reader-modal-heading" aria-describedby="reader-modal-description">
            <div className="modal-header reader-modal-header">
              <div><span>{t.sample.readerKicker}</span><h2 id="reader-modal-heading">{t.sample.readerTitle}</h2><p id="reader-modal-description">{t.sample.readerDescription}</p></div>
              <button type="button" ref={closeButton} className="modal-close" onClick={closeModal} aria-label={t.general.closePreview}><X size={21} aria-hidden="true" /></button>
            </div>
            <div className="reader-utility-bar">
              <span className="reader-page-position" aria-live="polite">{t.sample.page} {previewIndex + 1} / {previewPages.length}</span>
              <div className="reader-zoom-tools" role="group" aria-label={t.sample.zoomTools}>
                <button type="button" onClick={() => zoomPreview(-0.25)} disabled={readerZoom <= 1} aria-label={t.sample.zoomOut} title={t.sample.zoomOut}><ZoomOut size={18} aria-hidden="true" /></button>
                <span aria-live="polite">{Math.round(readerZoom * 100)}%</span>
                <button type="button" onClick={() => zoomPreview(0.25)} disabled={readerZoom >= 2.5} aria-label={t.sample.zoomIn} title={t.sample.zoomIn}><ZoomIn size={18} aria-hidden="true" /></button>
                <button type="button" onClick={() => { setReaderZoom(1); if(readerScrollport.current){readerScrollport.current.scrollLeft=0; readerScrollport.current.scrollTop=0;} }} disabled={readerZoom === 1} aria-label={t.sample.resetZoom} title={t.sample.resetZoom}><RotateCcw size={16} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="reader-body">
              <div className="reader-reading-area">
                <div className="reader-scrollport" ref={readerScrollport} tabIndex={0} role="region" aria-label={t.sample.readerViewport}
                  onTouchStart={(event) => { startX.current = event.touches[0]?.clientX ?? null; }}
                  onTouchEnd={(event) => { const endX = event.changedTouches[0]?.clientX; if (readerZoom === 1 && startX.current !== null && typeof endX === 'number') { const movement = endX - startX.current; if(Math.abs(movement) > 75) goToPreview(previewIndex + (movement < 0 ? 1 : -1)); } startX.current = null; }}>
                  <div className="reader-zoom-sheet" style={{ width: `${readerZoom * 100}%`, height: `calc(var(--reader-base-height) * ${readerZoom})` }}>
                    <Photo src={previewPages[previewIndex].src} alt={`${t.sample.previewAlt} ${previewIndex + 1}`} unavailableText={t.general.unavailable} sizes="(max-width: 780px) 100vw, 1100px" />
                  </div>
                </div>
                <p className="reader-tip">{t.sample.readerTip}</p>
              </div>
              <aside className="reader-side" aria-label={t.sample.readerNavigation}>
                <div className="reader-side-heading"><span className="micro-label">{t.sample.previewTag}</span><p>{t.sample.originalLanguageNotice}</p></div>
                <div className="reader-thumbs" role="group" aria-label={t.sample.readerNavigation}>
                  {previewPages.map((item, index) => (
                    <button type="button" key={item.src} className={`reader-thumb${index === previewIndex ? ' is-selected' : ''}`}
                      aria-pressed={index === previewIndex} aria-label={`${t.sample.page} ${index + 1}`} onClick={() => goToPreview(index)}>
                      <span className="reader-thumb-image"><Photo src={item.src} alt="" unavailableText={t.general.unavailable} sizes="100px" /></span>
                      <span>{locale === 'bn' ? ['১','২','৩','৪','৫'][index] : index + 1}</span>
                    </button>
                  ))}
                </div>
                <div className="reader-conversion">
                  <span className="micro-label">{t.sample.readerPurchaseKicker}</span>
                  <p>{t.sample.readerPurchaseText}</p>
                  <a href={book.productUrl} target="_blank" rel="noopener noreferrer">{t.sample.readerOrder} <ArrowUpRight size={16} aria-hidden="true" /></a>
                </div>
              </aside>
            </div>
            <div className="modal-controls reader-modal-controls">
              <button type="button" disabled={previewIndex === 0} onClick={() => goToPreview(previewIndex - 1)}><ChevronLeft size={19} aria-hidden="true" /> {t.general.previousPage}</button>
              <span>{previewIndex + 1} / {previewPages.length}</span>
              <button type="button" disabled={previewIndex === previewPages.length - 1} onClick={() => goToPreview(previewIndex + 1)}>{t.general.nextPage} <ChevronRight size={19} aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
