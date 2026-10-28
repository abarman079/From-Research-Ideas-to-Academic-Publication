"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCopy, type Locale } from "@/i18n/copy";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Menu,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { book, gallery, previewPages, PREVIEW_PDF_URL } from "@/lib/book";
import HeroFlipReader from "@/components/HeroFlipReader";
import ReaderReviews from "@/components/ReaderReviews";
import AuthorAndPurchase from "@/components/AuthorAndPurchase";
import { reviews } from "@/lib/reviews";

type TopicFilter = "all" | "foundations" | "practice" | "publishing";
const TOPIC_GROUPS = [
  "foundations",
  "foundations",
  "practice",
  "practice",
  "practice",
  "publishing",
  "publishing",
  "publishing",
] as const;

type PhotoProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  unavailableText: string;
};

function Photo({
  src,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 90vw, 50vw",
  unavailableText,
}: PhotoProps) {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => setUnavailable(false), [src]);

  if (unavailable) {
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={alt}
      >
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
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const lastTrigger = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const galleryTouchX = useRef<number | null>(null);
  const ignoreSwipedPhotoClick = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 781px) and (prefers-reduced-motion: no-preference)",
      () => {
        const context = gsap.context(() => {
          gsap.from(".hero-enter", {
            y: 19,
            opacity: 0,
            duration: 0.85,
            ease: "power2.out",
            stagger: 0.075,
            clearProps: "all",
          });
          gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
            gsap.from(el, {
              y: 24,
              opacity: 0,
              duration: 0.72,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });
          gsap.to(".hero-gallery-media", {
            y: 10,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero-section",
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          });
        }, root);
        return () => context.revert();
      },
    );
    return () => {
      mm.revert();
    };
  }, []);

  // Mobile navigation can be dismissed with Escape without losing keyboard focus.
  useEffect(() => {
    if (!navOpen) return;
    const dismissMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        mobileMenuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", dismissMenu);
    return () => window.removeEventListener("keydown", dismissMenu);
  }, [navOpen]);

  // The image-enlargement dialog and the flipbook manage focus independently.
  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight")
        setPhotoIndex((i) => (i + 1) % gallery.length);
      if (event.key === "ArrowLeft")
        setPhotoIndex((i) => (i - 1 + gallery.length) % gallery.length);
      if (event.key === "Tab") {
        const dialog = closeButton.current?.closest('[role="dialog"]');
        const controls = dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href]",
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      lastTrigger.current?.focus();
    };
  }, [lightboxOpen]);

  const openReader = (trigger?: HTMLElement) => {
    lastTrigger.current = trigger ?? null;
    setNavOpen(false);
    setReaderOpen(true);
  };
  const openGallery = (trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setLightboxOpen(true);
  };
  const galleryMove = (direction: number) =>
    setPhotoIndex((i) => (i + direction + gallery.length) % gallery.length);
  const onGalleryTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    galleryTouchX.current = event.touches[0]?.clientX ?? null;
    ignoreSwipedPhotoClick.current = false;
  };
  const onGalleryTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    if (galleryTouchX.current === null) return;
    const end = event.changedTouches[0]?.clientX ?? galleryTouchX.current;
    const distance = end - galleryTouchX.current;
    galleryTouchX.current = null;
    if (Math.abs(distance) > 55) {
      ignoreSwipedPhotoClick.current = true;
      galleryMove(distance < 0 ? 1 : -1);
    }
  };
  const closeModal = () => setLightboxOpen(false);
  const closeReader = () => {
    setReaderOpen(false);
    // Return keyboard focus to the triggering control after the dialog closes.
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  };
  const sampleButtonText =
    locale === "bn"
      ? `${String(PREVIEW_PDF_URL ? 15 : previewPages.length).replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)])} পৃষ্ঠা পড়ুন`
      : `Read ${PREVIEW_PDF_URL ? 15 : previewPages.length} Pages`;
  const hasApprovedReviews = reviews.some((item) => item.approved);
  const currentImage = gallery[photoIndex];
  const visibleTopics = t.contents.topics
    .map((title, index) => ({
      title,
      detail: t.contents.topicDetails[index],
      index,
      group: TOPIC_GROUPS[index],
    }))
    .filter((item) => topicFilter === "all" || item.group === topicFilter);
  // Keep a returning visitor's language preference, including visits to the root URL.
  useEffect(() => {
    document.cookie = `iojh-book-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = locale === "bn" ? "bn-BD" : "en";
  }, [locale]);

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    let targetSection = "top";
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    sections.forEach((section) => {
      if (
        section.getBoundingClientRect().top <
        Math.min(window.innerHeight * 0.4, 260)
      ) {
        targetSection = section.id;
      }
    });
    document.cookie = `iojh-book-locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setNavOpen(false);
    router.push(`/${nextLocale}#${targetSection}`);
  };

  return (
    <div ref={root} className="site-wrap">
      <a className="skip-link" href="#main-content">
        {t.general.skip}
      </a>
      <header className="site-header">
        <div className="header-inner container">
          <a
            className="wordmark"
            href="#top"
            aria-label={t.nav.home}
            onClick={() => setNavOpen(false)}
          >
            <span className="wordmark-title">
              IOJH<span>.</span>
            </span>
          </a>
          <nav
            id="primary-navigation"
            className={`primary-nav${navOpen ? " is-open" : ""}`}
            aria-label={t.nav.main}
          >
            <a href="#top" onClick={() => setNavOpen(false)}>
              {t.nav.about}
            </a>
            <a href="#inside" onClick={() => setNavOpen(false)}>
              {t.nav.inside}
            </a>
            {hasApprovedReviews && (
              <a href="#reviews" onClick={() => setNavOpen(false)}>
                {t.nav.reviews}
              </a>
            )}
            <a href="#details" onClick={() => setNavOpen(false)}>
              {locale === "bn" ? "লেখক পরিচিতি" : "About the Author"}
            </a>
            <button
              className="nav-reader-button"
              type="button"
              onClick={(event) => openReader(event.currentTarget)}
            >
              {t.nav.preview}
            </button>
          </nav>
          <div className="header-actions">
            <div
              className="language-switch"
              role="group"
              aria-label={t.general.localeLabel}
            >
              <button
                type="button"
                aria-pressed={locale === "bn"}
                lang="bn"
                className={locale === "bn" ? "active" : ""}
                onClick={() => switchLocale("bn")}
              >
                বাংলা
              </button>
              <span className="language-divider" aria-hidden="true" />
              <button
                type="button"
                aria-pressed={locale === "en"}
                lang="en"
                className={locale === "en" ? "active" : ""}
                onClick={() => switchLocale("en")}
              >
                EN
              </button>
            </div>
            <a
              className="header-order"
              href="#purchase"
              onClick={() => setNavOpen(false)}
            >
              {t.nav.order} <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button
              ref={mobileMenuButton}
              className="menu-toggle"
              type="button"
              aria-label={navOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={navOpen}
              aria-controls="primary-navigation"
              onClick={() => setNavOpen(!navOpen)}
            >
              {navOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section id="top" className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-enter">
                <span className="eyebrow-rule" /> {t.hero.eyebrow}{" "}
                <span className="eyebrow-index">— 01</span>
              </div>
              <p className="hero-pretitle hero-enter">{t.hero.pretitle}</p>
              <h1 className="hero-title hero-enter">
                {t.hero.title} <span>{t.hero.accent}</span>
              </h1>
              <p className="hero-book-name hero-enter">
                {locale === "bn" ? book.title : book.englishTitle}
              </p>
              <p className="hero-description hero-enter">
                {t.hero.description}
              </p>
              <div className="hero-buttons hero-enter">
                <a className="btn btn-dark" href="#purchase">
                  {t.hero.order} <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <button
                  className="btn btn-light"
                  type="button"
                  onClick={(e) => openReader(e.currentTarget)}
                >
                  <BookOpen size={18} aria-hidden="true" /> {sampleButtonText}
                </button>
              </div>
              <div
                className="hero-facts hero-enter"
                aria-label={t.hero.edition}
              >
                <div>
                  <strong>{t.hero.languageValue}</strong>
                  <span>{t.hero.languageLabel}</span>
                </div>
                <div>
                  <strong>{t.hero.formatValue}</strong>
                  <span>{t.hero.formatLabel}</span>
                </div>
              </div>
            </div>
            <div
              className="hero-product hero-enter"
              id="about"
              aria-label={t.gallery.stage}
            >
              <div className="hero-showcase">
                <div className="hero-showcase-heading">
                  <div>
                    <span className="hero-showcase-eyebrow">
                      {t.gallery.stage}
                    </span>
                    <p>{t.gallery.mediaIntro}</p>
                  </div>
                  <span className="hero-showcase-index" aria-live="polite">
                    {String(photoIndex + 1).padStart(2, "0")}{" "}
                    <span>/ {String(gallery.length).padStart(2, "0")}</span>
                  </span>
                </div>

                <div className="hero-gallery-media">
                  <button
                    key={currentImage.src}
                    type="button"
                    className="hero-gallery-main image-swap"
                    onClick={(event) => {
                      if (ignoreSwipedPhotoClick.current) {
                        ignoreSwipedPhotoClick.current = false;
                        return;
                      }
                      openGallery(event.currentTarget);
                    }}
                    onTouchStart={onGalleryTouchStart}
                    onTouchEnd={onGalleryTouchEnd}
                    aria-label={t.gallery.zoom}
                    title={t.gallery.zoom}
                  >
                    <Photo
                      src={currentImage.src}
                      alt={t.gallery.alts[photoIndex]}
                      unavailableText={t.general.unavailable}
                      priority={photoIndex === 0}
                      sizes="(max-width: 780px) 94vw, 44vw"
                    />
                  </button>
                  <button
                    className="hero-image-enlarge"
                    type="button"
                    aria-label={t.gallery.zoom}
                    title={t.gallery.zoom}
                    onClick={(event) => openGallery(event.currentTarget)}
                  >
                    <Maximize2 size={17} aria-hidden="true" />
                  </button>
                  <div className="hero-gallery-caption">
                    <span>{t.gallery.labels[photoIndex]}</span>
                    <button
                      type="button"
                      onClick={(event) => openReader(event.currentTarget)}
                    >
                      <BookOpen size={16} aria-hidden="true" />{" "}
                      {t.gallery.readAction}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="hero-gallery-bottom">
                  <div
                    className="hero-gallery-thumbnails"
                    role="group"
                    aria-label={t.gallery.select}
                  >
                    {gallery.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`hero-gallery-thumb${photoIndex === index ? " is-current" : ""}`}
                        onClick={() => setPhotoIndex(index)}
                        aria-pressed={photoIndex === index}
                        aria-label={`${t.gallery.view}: ${t.gallery.labels[index]}`}
                      >
                        <span className="hero-gallery-thumb-photo">
                          <Photo
                            src={item.src}
                            alt=""
                            unavailableText={t.general.unavailable}
                            sizes="120px"
                          />
                        </span>
                        <span className="hero-gallery-thumb-name">
                          {t.gallery.labels[index]}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="hero-gallery-arrows">
                    <button
                      type="button"
                      aria-label={t.general.previousPhoto}
                      onClick={() => galleryMove(-1)}
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={t.general.nextPhoto}
                      onClick={() => galleryMove(1)}
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="inside"
          className="section contents-section"
          aria-labelledby="contents-heading"
        >
          <div className="container">
            <div className="section-heading reveal">
              <h2 id="contents-heading">
                {t.contents.title} <em>{t.contents.accent}</em>
              </h2>
              <p>{t.contents.intro}</p>
            </div>
            <div className="contents-explorer-header reveal">
              <p className="contents-editorial-note">
                {locale === "bn"
                  ? "বইটি তিনটি মূল বিষয়ে সাজানো: গবেষণা পদ্ধতি, পাণ্ডুলিপি প্রস্তুতি ও প্রকাশনা। নিচে কয়েকটি আলোচ্য বিষয় দেওয়া হলো।"
                  : "The book covers research methods, manuscript preparation and publication. Here are a few of the topics included."}
              </p>
              <div className="contents-explorer-controls">
                <span className="micro-label">{t.contents.filterTitle}</span>
                <div
                  className="contents-filters"
                  role="group"
                  aria-label={t.contents.filterTitle}
                >
                  {t.contents.filters.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      className={topicFilter === option.key ? "is-active" : ""}
                      aria-pressed={topicFilter === option.key}
                      onClick={() => setTopicFilter(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              {visibleTopics.length} {t.contents.countLabel}
            </p>
            <div
              className={`theme-grid${topicFilter !== "all" ? " is-filtered" : ""}`}
              key={`${locale}-${topicFilter}`}
            >
              {visibleTopics.map((item) => (
                <article
                  className={`theme-card theme-card--${item.group}${[0, 5, 6, 7].includes(item.index) ? " theme-featured" : ""}`}
                  key={item.index}
                >
                  <div className="theme-card-top">
                    <span className="theme-card-index">
                      {String(item.index + 1).padStart(2, "0")}
                    </span>
                    <span className="theme-card-category">
                      {t.contents.groupLabels[item.group]}
                    </span>
                  </div>
                  <div className="theme-card-body">
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {hasApprovedReviews && <ReaderReviews locale={locale} />}

        <AuthorAndPurchase locale={locale} />

        <section id="faq" className="section faq-section">
          <div className="container faq-grid">
            <div className="reveal">
              <h2>
                {t.faq.title} <em>{t.faq.accent}</em>
              </h2>
              <p>{t.faq.intro}</p>
            </div>
            <div className="faq-list reveal">
              {t.faq.items.map((item, index) => (
                <details key={index}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-identity">
            <div className="footer-mark">
              IOJH<span>.</span>
            </div>
            <p>{t.footer.tagline}</p>
          </div>
          <nav
            className="footer-nav"
            aria-label={
              locale === "bn" ? "ফুটার নেভিগেশন" : "Footer navigation"
            }
          >
            <a href="#top">{locale === "bn" ? "বই পরিচিতি" : "The Book"}</a>
            <a href="#inside">
              {locale === "bn" ? "বইয়ের বিষয়বস্তু" : "Inside the Book"}
            </a>
            <a href="#details">
              {locale === "bn" ? "লেখক পরিচিতি" : "About the Author"}
            </a>
            <a href="#purchase">
              {locale === "bn" ? "কোথায় কিনবেন" : "Where to Buy"}
            </a>
          </nav>
          <a className="footer-buy-link" href="#purchase">
            {locale === "bn" ? "বইটি সংগ্রহ করুন" : "Find Your Copy"}{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="container footer-meta">
          <span>
            © {new Date().getFullYear()} {t.footer.collection}
          </span>
          <span>ISBN {book.isbn}</span>
        </div>
      </footer>

      {lightboxOpen && (
        <div
          className="modal-shade"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="modal-panel photo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-heading"
          >
            <div className="modal-header">
              <div>
                <span>
                  {t.gallery.stage} / 0{photoIndex + 1}
                </span>
                <h2 id="gallery-modal-heading">
                  {t.gallery.labels[photoIndex]}
                </h2>
              </div>
              <button
                type="button"
                ref={closeButton}
                className="modal-close"
                onClick={closeModal}
                aria-label={t.general.closePhoto}
              >
                <X />
              </button>
            </div>
            <div className="modal-image">
              <Photo
                src={currentImage.src}
                alt={t.gallery.alts[photoIndex]}
                unavailableText={t.general.unavailable}
                sizes="90vw"
              />
            </div>
            <div className="modal-controls">
              <button
                type="button"
                onClick={() => galleryMove(-1)}
                aria-label={t.general.previousPhoto}
              >
                <ChevronLeft size={19} /> {t.general.previousPhoto}
              </button>
              <span>
                {photoIndex + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={() => galleryMove(1)}
                aria-label={t.general.nextPhoto}
              >
                {t.general.nextPhoto} <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </div>
      )}
      {readerOpen && (
        <HeroFlipReader
          locale={locale}
          pages={previewPages}
          pdfUrl={PREVIEW_PDF_URL}
          productUrl={book.productUrl}
          onClose={closeReader}
          onChooseStore={() => {
            setReaderOpen(false);
            window.requestAnimationFrame(() =>
              window.requestAnimationFrame(() => {
                const target = document.getElementById("purchase");
                target?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "auto"
                    : "smooth",
                  block: "start",
                });
                target?.focus({ preventScroll: true });
              }),
            );
          }}
        />
      )}
    </div>
  );
}
