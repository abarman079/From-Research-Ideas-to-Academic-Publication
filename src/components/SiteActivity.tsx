'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import type { Locale } from '@/i18n/copy';

/**
 * Analytics is intentionally privacy-light: only event type, retailer, and
 * page language are sent. Never transmit names, phone numbers or book text.
 * Vercel custom events require a supported plan (typically Pro). Page views
 * are measured separately by <Analytics /> in the root layout.
 */
export default function SiteActivity({ locale }: { locale: Locale }) {
  useEffect(() => {
    // Hobby plan users should keep this unset. No custom events are sent unless
    // explicitly enabled after enabling custom events in Vercel's dashboard.
    if (process.env.NEXT_PUBLIC_IOJH_CUSTOM_EVENTS !== 'true') return;

    const safeTrack = (event: string, attributes: Record<string, string>) => {
      try {
        track(event, { language: locale, ...attributes });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('IOJH optional analytics unavailable:', error);
        }
      }
    };

    const onPreview = () => safeTrack('Book sample opened', { format: '15 JPG pages' });

    const onClick = (event: MouseEvent) => {
      const node = event.target;
      if (!(node instanceof Element)) return;
      const anchor = node.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute('href') || '';
      if (href === '#purchase' || href.endsWith('#purchase')) {
        safeTrack('Purchase options viewed', { source: 'landing page' });
        return;
      }

      try {
        const url = new URL(anchor.href);
        if (url.hostname === 'iojh.com.bd' || url.hostname === 'www.iojh.com.bd') {
          if (url.pathname.startsWith('/product/')) {
            safeTrack('Retailer selected', { retailer: 'IOJH' });
          }
        } else if (url.hostname === 'rokomari.com' || url.hostname === 'www.rokomari.com') {
          if (url.pathname.startsWith('/book/')) {
            safeTrack('Retailer selected', { retailer: 'Rokomari' });
          }
        }
      } catch { /* Ignore malformed or local-only href values. */ }
    };

    window.addEventListener('iojh:sample-open', onPreview);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('iojh:sample-open', onPreview);
      document.removeEventListener('click', onClick, true);
    };
  }, [locale]);

  return null;
}
