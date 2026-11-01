'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Locale } from '@/i18n/copy';

/**
 * Phase 2.5 / progressive, editorial motion. Does not change layout or text.
 * - Works with existing Lenis autoRaf + ScrollTrigger.update subscription.
 * - No CSS pre-hidden states: content stays visible if JS is disabled.
 * - A single viewport reveal per element; transform is cleared for CSS hover.
 * - Never animates dialogs, flipbook sheets, or the Phase 1 hero.
 */
export default function EditorialMotion({ locale }: { locale: Locale }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = gsap.matchMedia();

    mq.add(
      {
        desktop: '(min-width: 781px)',
        mobile: '(max-width: 780px)',
        allow: '(prefers-reduced-motion: no-preference)',
      },
      (state) => {
        if (!state.conditions?.allow) return;
        const desktop = Boolean(state.conditions.desktop);
        const grid = document.querySelector<HTMLElement>('#inside');
        const author = document.querySelector<HTMLElement>('#details');
        const reviews = document.querySelector<HTMLElement>('#reviews');
        const faq = document.querySelector<HTMLElement>('#faq');
        const animations: gsap.core.Tween[] = [];
        const animatedElements = new Set<HTMLElement>();
        const cardAnimations = new Map<HTMLElement, gsap.core.Tween>();
        let observer: MutationObserver | undefined;
        let pending = 0;

        type RevealSettings = {
          x?: number;
          y?: number;
          duration?: number;
          delay?: number;
          start?: string;
          ease?: string;
          scale?: number;
        };

        const reveal = (element: Element | null | undefined, opts: RevealSettings = {}) => {
          if (!(element instanceof HTMLElement)) return;
          animatedElements.add(element);
          const duration = opts.duration ?? (desktop ? 0.88 : 0.56);
          const start = opts.start ?? (desktop ? 'top 90%' : 'top 94%');
          const tween = gsap.fromTo(
            element,
            {
              opacity: 0,
              x: desktop ? (opts.x ?? 0) : 0,
              y: opts.y ?? (desktop ? 32 : 18),
              scale: opts.scale ?? 1,
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration,
              delay: opts.delay ?? 0,
              ease: opts.ease ?? 'power3.out',
              clearProps: 'opacity,transform,visibility',
              scrollTrigger: { trigger: element, start, once: true },
              overwrite: 'auto',
            },
          );
          animations.push(tween);
        };

        // Chapter 1: title/copy, filtering controls, and chapter purchase invitation.
        if (grid) {
          const title = grid.querySelector<HTMLElement>('#contents-heading');
          const titleWrap = title?.parentElement;
          reveal(titleWrap?.querySelector('span'), { y: 14, duration: 0.65 });
          reveal(title, { y: desktop ? 52 : 18, duration: desktop ? 1.04 : 0.6, delay: 0.06 });
          reveal(titleWrap?.parentElement?.querySelector(':scope > p'), { y: 19, delay: 0.15 });
          reveal(grid.querySelector('[role="group"]'), { y: 15, delay: 0.1 });
          reveal(grid.querySelector('aside'), { y: desktop ? 44 : 20, duration: 0.85 });

          // The topic filters replace cards. Observe *only* the grid, not the modal.
          const cardGrid = grid.querySelector<HTMLElement>('[aria-haspopup="dialog"]')?.parentElement;
          const refreshCards = () => {
            pending = 0;
            if (!cardGrid) return;
            for (const [element, tween] of cardAnimations) {
              if (!element.isConnected || !cardGrid.contains(element)) {
                tween.kill();
                cardAnimations.delete(element);
              }
            }
            const cards = Array.from(cardGrid.querySelectorAll<HTMLElement>('button[aria-haspopup="dialog"]'));
            let added = false;
            cards.forEach((card, index) => {
              if (cardAnimations.has(card)) return;
              animatedElements.add(card);
              // Shallow, alternating movements feel designed rather than random.
              const direction = index % 2 === 0 ? -1 : 1;
              const tween = gsap.fromTo(
                card,
                { opacity: 0, x: desktop ? direction * 34 : 0, y: desktop ? 30 : 16, rotate: desktop ? direction * 0.65 : 0 },
                {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                  duration: desktop ? 0.85 : 0.54,
                  delay: desktop ? (index % 4) * 0.095 : 0,
                  ease: 'power3.out',
                  clearProps: 'opacity,transform,visibility',
                  scrollTrigger: { trigger: card, start: desktop ? 'top 93%' : 'top 96%', once: true },
                  overwrite: 'auto',
                },
              );
              cardAnimations.set(card, tween);
              added = true;
            });
            if (added) ScrollTrigger.refresh();
          };
          refreshCards();
          if (cardGrid) {
            observer = new MutationObserver(() => {
              if (pending) return;
              pending = window.requestAnimationFrame(refreshCards);
            });
            observer.observe(cardGrid, { childList: true });
          }
        }

        // Chapter 2: portrait, biography, academic background, edition and shops.
        if (author) {
          const authorHeading = author.querySelector<HTMLElement>('#author-section-title');
          reveal(authorHeading, { x: -26, y: 25, duration: 1.0 });
          reveal(author.querySelector('header p'), { x: 28, y: 12, delay: 0.14 });
          const article = author.querySelector<HTMLElement>('article');
          const portrait = article?.children.item(0);
          const bio = article?.children.item(1);
          reveal(portrait, { x: -52, y: 13, duration: 1.12 });
          reveal(bio?.querySelector('h3'), { x: 25, y: 22, duration: 0.9 });
          reveal(bio?.querySelector('p'), { x: 20, y: 15, delay: 0.08 });
          article?.querySelectorAll<HTMLElement>('dl > div').forEach((item, i) => {
            reveal(item, { y: 18, duration: 0.65, delay: Math.min(i, 5) * 0.055 });
          });
          reveal(author.querySelector('#spec-panel-title')?.closest('section'), { x: -38, y: 28 });
          reveal(author.querySelector('#purchase'), { x: 38, y: 28, delay: 0.12 });

          // Very small portrait drift, desktops only, without scaling or distortion.
          // Parallax is on the image *container*, after its reveal has completed.
          // Avoid touching next/image itself: its CSS hover zoom remains intact.
          const portraitImage = article?.querySelector<HTMLImageElement>('img');
          if (desktop && portraitImage?.parentElement) {
            const parallaxShell = portraitImage.parentElement;
            const parallax = gsap.fromTo(
              parallaxShell,
              { y: 6 },
              { y: -9, ease: 'none', scrollTrigger: { trigger: article, start: 'top bottom', end: 'bottom top', scrub: 1.1 }, overwrite: false },
            );
            animations.push(parallax);
          }
        }

        // Review section exists only when genuinely approved testimonials are available.
        if (reviews) {
          reveal(reviews.querySelector('h2'), { x: -28, y: 20, duration: 0.95 });
          reveal(reviews.querySelector('h2')?.parentElement?.parentElement?.querySelector(':scope > p'), { x: 27, y: 16 });
          // Do not animate the keyed quote/portrait: the carousel owns their transitions.
          reveal(reviews.querySelector('figure')?.parentElement, { y: 35, duration: 0.9 });
          reveal(reviews.querySelector('a[href="#purchase"]')?.closest('div'), { y: 15 });
        }

        // The existing FAQ can participate without changing native details controls.
        if (faq) {
          reveal(faq.querySelector('h2'), { x: -26, y: 22 });
          faq.querySelectorAll('details').forEach((item, i) => {
            reveal(item, { x: 0, y: desktop ? 19 : 10, delay: Math.min(i, 5) * 0.045, duration: 0.64 });
          });
        }

        return () => {
          observer?.disconnect();
          if (pending) window.cancelAnimationFrame(pending);
          animations.forEach(tween => { tween.scrollTrigger?.kill(); tween.kill(); });
          cardAnimations.forEach(tween => { tween.scrollTrigger?.kill(); tween.kill(); });
          // If the user enables Reduced Motion mid-scroll or switches language,
          // no element may remain partially transparent or translated.
          animatedElements.forEach(element => {
            if (element.isConnected) gsap.set(element, { clearProps: 'opacity,visibility,transform' });
          });
        };
      },
    );

    // Fonts and images affect scroll positions; refresh after they settle.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad, { once: true });
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    return () => {
      mq.revert();
      window.removeEventListener('load', onLoad);
    };
  }, [locale]);

  return null;
}
