'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check,
  ChevronLeft, ChevronRight, ExternalLink, Maximize2,
  Menu, X, ZoomIn,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { book, gallery, highlightedContents, journey, previewPages } from '@/lib/book';

type PhotoProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

function Photo({ src, alt, priority = false, className = '', sizes = '(max-width: 768px) 90vw, 50vw' }: PhotoProps) {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => setUnavailable(false), [src]);

  if (unavailable) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <BookOpen aria-hidden="true" size={30} strokeWidth={1.35} />
        <span>ছবিটি সাময়িকভাবে অনুপলব্ধ</span>
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

export default function BookLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
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
          scrollTrigger: { trigger: '.journey-section', start: 'top 72%', end: 'bottom 65%', scrub: true },
        });
      }, root);
      return () => context.revert();
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    const modalOpen = lightboxOpen || readerOpen;
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setLightboxOpen(false); setReaderOpen(false); }
      if (event.key === 'ArrowRight') {
        if (readerOpen) setPreviewIndex((i) => Math.min(previewPages.length - 1, i + 1));
        else setPhotoIndex((i) => (i + 1) % gallery.length);
      }
      if (event.key === 'ArrowLeft') {
        if (readerOpen) setPreviewIndex((i) => Math.max(0, i - 1));
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
    setReaderOpen(true);
  };
  const openGallery = (trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setLightboxOpen(true);
  };
  const galleryMove = (direction: number) => setPhotoIndex((i) => (i + direction + gallery.length) % gallery.length);
  const closeModal = () => { setReaderOpen(false); setLightboxOpen(false); };
  const currentImage = gallery[photoIndex];

  return (
    <div ref={root} className="site-wrap">
      <a className="skip-link" href="#main-content">মূল কনটেন্টে যান</a>
      <header className="site-header">
        <div className="header-inner container">
          <a className="wordmark" href="#top" aria-label="IOJH book collection home" onClick={() => setNavOpen(false)}>
            <span className="wordmark-title">IOJH<span>.</span></span>
            <span className="wordmark-subtitle">BOOK COLLECTION</span>
          </a>
          <nav className={`primary-nav${navOpen ? ' is-open' : ''}`} aria-label="প্রধান নেভিগেশন">
            <a href="#about" onClick={() => setNavOpen(false)}>বই পরিচিতি</a>
            <a href="#journey" onClick={() => setNavOpen(false)}>গবেষণার পথ</a>
            <a href="#inside" onClick={() => setNavOpen(false)}>বইয়ের ভেতরে</a>
            <a href="#preview" onClick={() => setNavOpen(false)}>নমুনা পড়ুন</a>
          </nav>
          <div className="header-actions">
            <a className="header-order" href={book.productUrl} target="_blank" rel="noopener noreferrer">
              অর্ডার করুন <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button className="menu-toggle" type="button" aria-label={navOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section id="top" className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-enter"><span className="eyebrow-rule" /> IOJH BOOK COLLECTION <span className="eyebrow-index">— 01</span></div>
              <p className="hero-pretitle hero-enter">বাংলায় গবেষণা ও একাডেমিক প্রকাশনার সহায়ক গ্রন্থ</p>
              <h1 className="hero-title hero-enter">গবেষণার ধারণা থেকে <span>প্রকাশনা পর্যন্ত।</span></h1>
              <p className="hero-book-name hero-enter">{book.title}</p>
              <p className="hero-description hero-enter">গবেষণার প্রথম প্রশ্ন থেকে পাণ্ডুলিপি প্রস্তুতি ও জার্নাল প্রকাশনার বিভিন্ন ধাপ—একটি বাংলাভাষার বইয়ে।</p>
              <div className="hero-buttons hero-enter">
                <a className="btn btn-dark" href={book.productUrl} target="_blank" rel="noopener noreferrer">বইটি অর্ডার করুন <ArrowUpRight size={18} aria-hidden="true" /></a>
                <button className="btn btn-light" type="button" onClick={(e) => openReader(e.currentTarget)}><BookOpen size={18} aria-hidden="true" /> ৫ পৃষ্ঠা পড়ে দেখুন</button>
              </div>
              <div className="hero-facts hero-enter" aria-label="বইয়ের সংক্ষিপ্ত তথ্য">
                <div><strong>৫০৪</strong><span>পৃষ্ঠা</span></div>
                <div><strong>বাংলা</strong><span>বইয়ের ভাষা</span></div>
                <div><strong>মুদ্রিত</strong><span>সংস্করণ</span></div>
              </div>
            </div>
            <div className="hero-product hero-enter">
              <div className="hero-backdrop" aria-hidden="true" />
              <div className="hero-cover-stage">
                <Photo src={gallery[0].src} alt={gallery[0].alt} priority sizes="(max-width: 780px) 95vw, 46vw" />
              </div>
              <div className="hero-product-bottom"><span>THE PRINTED EDITION</span><span>RESEARCH · WRITING · PUBLICATION</span></div>
              <div className="hero-edition-stamp" aria-hidden="true"><span>504</span><small>PAGES</small></div>
            </div>
          </div>
        </section>

        <div className="taxonomy-bar" aria-label="বইয়ের প্রধান বিষয়">
          <div className="container taxonomy-inner"><span>RESEARCH METHODS</span><i aria-hidden="true" /><span>MANUSCRIPT PREPARATION</span><i aria-hidden="true" /><span>ACADEMIC PUBLICATION</span></div>
        </div>

        <section id="about" className="section gallery-section">
          <div className="container">
            <div className="section-topline reveal"><span className="kicker">01 / THE PHYSICAL BOOK</span><span className="topline-aside">THE ORIGINAL PRINTED EDITION</span></div>
            <div className="section-heading reveal"><h2>বইটিকে <em>কাছ থেকে দেখুন।</em></h2><p>সামনের ও পেছনের কভার, বইয়ের মেরুদণ্ড এবং ভেতরের পৃষ্ঠা—মূল বইয়ের ছবি থেকে দেখুন।</p></div>
            <div className="gallery-grid">
              <div className="gallery-main reveal">
                <div className="gallery-main-image"><Photo src={currentImage.src} alt={currentImage.alt} sizes="(max-width: 780px) 95vw, 55vw" /></div>
                <div className="gallery-stage-top"><span>IOJH / BOOK VIEW</span><span>0{photoIndex + 1} <span className="muted-index">/ 0{gallery.length}</span></span></div>
                <div className="gallery-stage-bottom">
                  <span>{currentImage.label}</span>
                  <button type="button" className="gallery-zoom" onClick={(e) => openGallery(e.currentTarget)} aria-label="বইয়ের ছবি বড় করে দেখুন"><Maximize2 size={17} aria-hidden="true" /> বড় করে দেখুন</button>
                </div>
              </div>
              <div className="gallery-detail reveal">
                <span className="micro-label">EXPLORE THE DETAILS</span>
                <h3>একটি বাস্তব বই,<br /><em>যত্নে তৈরি প্রতিটি পাতা।</em></h3>
                <p>বইয়ের কভার, বাইন্ডিং ও মুদ্রিত পাতার গঠন দেখুন। ছবিগুলোতে দেখানো তথ্য ও মুদ্রিত লেখা মূল বইয়ের অংশ।</p>
                <div className="gallery-thumbnail-grid">
                  {gallery.map((item, index) => (
                    <button type="button" key={item.id} className={`gallery-thumb${index === photoIndex ? ' selected' : ''}`} onClick={() => setPhotoIndex(index)} aria-label={`${item.label} দেখুন`} aria-pressed={index === photoIndex}>
                      <span className="gallery-thumb-image"><Photo src={item.src} alt="" sizes="160px" /></span>
                      <span className="gallery-thumb-title">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="gallery-navigation"><span>SELECT A VIEW</span><div><button type="button" onClick={() => galleryMove(-1)} aria-label="আগের ছবি"><ChevronLeft size={19} /></button><button type="button" onClick={() => galleryMove(1)} aria-label="পরের ছবি"><ChevronRight size={19} /></button></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="section journey-section">
          <div className="container journey-grid">
            <div className="journey-left reveal"><span className="kicker">02 / THE RESEARCH JOURNEY</span><h2>ভাবনা থেকে<br /><em>প্রকাশনার পথে।</em></h2><p>গবেষণার পরিকল্পনা, পাণ্ডুলিপি প্রস্তুতি ও প্রকাশনা সম্পর্কে পর্যায়ক্রমিক ধারণা।</p>
              <div className="journey-diagram" aria-label="গবেষণা, পাণ্ডুলিপি এবং প্রকাশনা — তিন ধাপ">
                <div className="diagram-small">A PRACTICAL RESEARCH JOURNEY</div>
                <div className="diagram-symbols"><span>01<small>IDEA</small></span><span className="diagram-connector" /><span>02<small>WRITE</small></span><span className="diagram-connector" /><span>03<small>PUBLISH</small></span></div>
                <div className="diagram-note">FROM QUESTION TO PUBLICATION</div>
              </div>
            </div>
            <div className="journey-right"><div className="journey-track" aria-hidden="true"><span className="journey-progress" /></div>
              {journey.map((item) => <article className="journey-item reveal" key={item.number}><span className="journey-id">{item.number} / {item.english}</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}
            </div>
          </div>
        </section>

        <section id="inside" className="section contents-section"><div className="container">
          <div className="section-topline reveal"><span className="kicker">03 / INSIDE 504 PAGES</span><span className="topline-aside">SELECTED RESEARCH THEMES</span></div>
          <div className="section-heading reveal"><h2>বইয়ের ভেতরে <em>যা থাকছে।</em></h2><p>বইয়ের আলোচ্য বিষয়ের নির্বাচিত একটি পরিচিতি—এটি সম্পূর্ণ সূচিপত্র নয়।</p></div>
          <div className="theme-grid">{highlightedContents.map((item, index) => (
            <article className={`theme-card reveal${index === 0 || index === 5 ? ' theme-featured' : ''}`} key={item}><span className="theme-card-index">{String(index + 1).padStart(2, '0')}</span><h3>{item}</h3><span className="theme-card-line" aria-hidden="true" /></article>
          ))}</div>
        </div></section>

        <section id="preview" className="section sample-section">
          <div className="container sample-grid">
            <div className="sample-copy reveal"><span className="kicker">04 / READ BEFORE YOU BUY</span><h2>কেনার আগে<br /><em>নিজেই পড়ে দেখুন।</em></h2><p>মূল বইয়ের পাঁচটি নমুনা পৃষ্ঠা পড়ুন—কোনো লগইন বা পেমেন্ট প্রয়োজন নেই।</p>
              <button type="button" className="btn btn-dark" onClick={(e) => openReader(e.currentTarget)}><BookOpen size={18} aria-hidden="true" /> পাঁচ পৃষ্ঠা পড়ুন <ArrowRight size={17} aria-hidden="true" /></button>
              <div className="sample-assurance"><Check size={17} aria-hidden="true" /> আসল বইয়ের পৃষ্ঠা · বিনামূল্যে</div>
            </div>
            <button type="button" className="sample-showcase reveal" onClick={(e) => openReader(e.currentTarget)} aria-label="পাঁচটি বইয়ের নমুনা পৃষ্ঠা খুলুন">
              <span className="sample-sheet"><Photo src={previewPages[0].src} alt="অধ্যায় ১-এর মূল নমুনা পৃষ্ঠা" sizes="(max-width: 780px) 82vw, 35vw" /></span>
              <span className="sample-counter">01 / 05 — FREE PREVIEW</span>
              <span className="sample-open"><ZoomIn size={18} aria-hidden="true" /> নমুনা খুলুন</span>
            </button>
          </div>
        </section>

        <section id="details" className="section details-section"><div className="container">
          <div className="section-topline reveal"><span className="kicker">05 / BOOK DETAILS</span><span className="topline-aside">AUTHOR · FORMAT · ISBN</span></div>
          <div className="section-heading reveal"><h2>এক নজরে <em>গ্রন্থ পরিচিতি।</em></h2></div>
          <div className="details-grid reveal">
            <div className="spec-list"><div><span>বইয়ের নাম</span><strong>{book.title}</strong></div><div><span>লেখক</span><strong>{book.author}</strong></div><div><span>পৃষ্ঠা</span><strong>{book.pageCount}</strong></div><div><span>ভাষা / সংস্করণ</span><strong>বাংলা / মুদ্রিত</strong></div><div><span>ISBN</span><strong>{book.isbn}</strong></div><div><span>মূল মুদ্রণ তথ্য</span><strong>LANIENT COMMUNICATION</strong></div></div>
            <div className="order-panel"><span className="micro-label">GET YOUR PRINTED COPY</span><h3>আপনার গবেষণার<br /> যাত্রায় বইটি পাশে থাকুক।</h3><p>IOJH-এর অফিসিয়াল পণ্য পৃষ্ঠায় বর্তমান মূল্য, ডেলিভারি চার্জ ও অর্ডারের নিয়ম দেখে নিন।</p><a className="btn btn-gold" href={book.productUrl} target="_blank" rel="noopener noreferrer">IOJH থেকে অর্ডার করুন <ArrowUpRight size={17} /></a><div className="order-footnotes"><span><BookOpen size={14} /> Physical book</span><span><ExternalLink size={14} /> Official IOJH listing</span></div></div>
          </div>
        </div></section>

        <section id="faq" className="section faq-section"><div className="container faq-grid"><div className="reveal"><span className="kicker">06 / INFORMATION</span><h2>আপনার <em>জিজ্ঞাসা।</em></h2><p>অর্ডারের আগে জরুরি কিছু তথ্য।</p></div>
          <div className="faq-list reveal">
            <details><summary>এটি কি মুদ্রিত বই?</summary><p>হ্যাঁ। এটি একটি মুদ্রিত বাংলা বই।</p></details>
            <details><summary>আমি কি কেনার আগে কিছু পৃষ্ঠা পড়তে পারব?</summary><p>হ্যাঁ। এখানে পাঁচটি নির্বাচিত নমুনা পৃষ্ঠা বিনামূল্যে দেখা যাবে।</p></details>
            <details><summary>বইটি কি ইংরেজিতে লেখা?</summary><p>না। মূল বইটি বাংলায় লেখা; কিছু ইংরেজি গবেষণা-পরিভাষা ব্যবহার করা হয়েছে।</p></details>
            <details><summary>মূল্য ও ডেলিভারি সম্পর্কে কোথায় জানব?</summary><p>অফিসিয়াল IOJH পণ্য পৃষ্ঠায় বর্তমান মূল্য, ডেলিভারি এবং অর্ডারের তথ্য যাচাই করুন।</p></details>
          </div>
        </div></section>
      </main>

      <footer className="site-footer"><div className="container footer-main"><div><div className="footer-mark">IOJH<span>.</span></div><p>Research · Knowledge · Publication</p></div><a href={book.productUrl} target="_blank" rel="noopener noreferrer">VIEW BOOK ON IOJH <ArrowUpRight size={16}/></a></div><div className="container footer-meta"><span>© {new Date().getFullYear()} IOJH · Book collection</span><span>ISBN {book.isbn}</span></div></footer>

      {lightboxOpen && (
        <div className="modal-shade" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-panel photo-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-heading">
            <div className="modal-header"><div><span>BOOK PHOTO / 0{photoIndex + 1}</span><h2 id="gallery-modal-heading">{currentImage.label}</h2></div><button type="button" ref={closeButton} className="modal-close" onClick={closeModal} aria-label="ছবি বন্ধ করুন"><X /></button></div>
            <div className="modal-image"><Photo src={currentImage.src} alt={currentImage.alt} sizes="90vw" /></div>
            <div className="modal-controls"><button type="button" onClick={() => galleryMove(-1)} aria-label="আগের ছবি"><ChevronLeft size={19}/> আগের ছবি</button><span>{photoIndex + 1} / {gallery.length}</span><button type="button" onClick={() => galleryMove(1)} aria-label="পরের ছবি">পরের ছবি <ChevronRight size={19}/></button></div>
          </div>
        </div>
      )}
      {readerOpen && (
        <div className="modal-shade" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-panel reader-modal" role="dialog" aria-modal="true" aria-labelledby="reader-modal-heading">
            <div className="modal-header"><div><span>IOJH / FIVE FREE PAGES</span><h2 id="reader-modal-heading">বইয়ের নমুনা পৃষ্ঠা</h2></div><button type="button" ref={closeButton} className="modal-close" onClick={closeModal} aria-label="নমুনা বন্ধ করুন"><X /></button></div>
            <div className="reader-page"><Photo src={previewPages[previewIndex].src} alt={previewPages[previewIndex].label} sizes="(max-width: 780px) 96vw, 800px" /></div>
            <div className="modal-controls"><button type="button" disabled={previewIndex === 0} onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}><ChevronLeft size={19}/> আগের পৃষ্ঠা</button><span>পৃষ্ঠা {previewIndex + 1} / {previewPages.length}</span><button type="button" disabled={previewIndex === previewPages.length - 1} onClick={() => setPreviewIndex((i) => Math.min(previewPages.length - 1, i + 1))}>পরের পৃষ্ঠা <ChevronRight size={19}/></button></div>
          </div>
        </div>
      )}
    </div>
  );
}
