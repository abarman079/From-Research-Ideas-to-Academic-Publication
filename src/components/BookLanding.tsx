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
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { book, gallery, previewPages, PREVIEW_PDF_URL } from "@/lib/book";
import HeroFlipReader from "@/components/HeroFlipReader";
import CampaignHero from "@/components/CampaignHero";
import SmoothPageScroll from '@/components/SmoothPageScroll';
import '@/app/hero-smooth-scroll.css';
import "@/app/campaign-type.css";
import ReaderReviews from "@/components/ReaderReviews";
import AuthorAndPurchase from "@/components/AuthorAndPurchase";
import { SiteFooter } from "@/components/SiteChrome";
import BookTopicsExplorer from "@/components/BookTopicsExplorer";
import BookFAQ from '@/components/BookFAQ';
import SiteActivity from '@/components/SiteActivity';
import { reviews } from "@/lib/reviews";

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
          // Product photography stays anchored while the page scrolls.
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
    window.dispatchEvent(new Event('iojh:sample-open'));
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
      <SmoothPageScroll paused={readerOpen || lightboxOpen} />
      <SiteActivity locale={locale} />
      <a className="skip-link" href="#main-content">
        {t.general.skip}
      </a>
      <main id="main-content">
        <CampaignHero
          locale={locale}
          photoIndex={photoIndex}
          onPhotoSelect={setPhotoIndex}
          onPhotoMove={galleryMove}
          onOpenGallery={openGallery}
          onOpenReader={openReader}
          onLocaleChange={switchLocale}
        />

        <BookTopicsExplorer locale={locale} onPreview={(trigger) => openReader(trigger)} />

        {hasApprovedReviews && <ReaderReviews locale={locale} />}

        <AuthorAndPurchase locale={locale} />

        <BookFAQ locale={locale} />
      </main>

      <SiteFooter locale={locale} hasReviews={hasApprovedReviews} onPreview={(trigger) => openReader(trigger)} />

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
