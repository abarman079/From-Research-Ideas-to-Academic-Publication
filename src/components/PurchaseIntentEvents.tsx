'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

/**
 * First-party, anonymous intent signals. These are NOT completed orders.
 * Custom Vercel events are OFF unless NEXT_PUBLIC_IOJH_CUSTOM_EVENTS=true.
 * Facebook Pixel and other third-party tracking are NOT installed here.
 */
export default function PurchaseIntentEvents() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>('a[href],button[data-iojh-action]');
      if (!element) return;
      let name: string | null = null;
      if (element.dataset.iojhAction === 'sample_open') name = 'sample_open';
      if (element instanceof HTMLAnchorElement) {
        const url = new URL(element.href, window.location.href);
        const host = url.hostname.toLowerCase();
        if ((host === 'iojh.com.bd' || host === 'www.iojh.com.bd') && url.pathname.startsWith('/product/')) {
          name = 'outbound_iojh_product';
        } else if ((host === 'rokomari.com' || host === 'www.rokomari.com') && url.pathname.startsWith('/book/')) {
          name = 'outbound_rokomari_product';
        } else if (url.origin === window.location.origin && url.hash === '#purchase') {
          name = 'purchase_options_view';
        }
      }
      if (!name) return;
      const locale = window.location.pathname.startsWith('/bn') ? 'bn' : 'en';
      const placement = element.dataset.iojhPlacement || 'other';
      window.dispatchEvent(new CustomEvent('iojh:purchase-intent', { detail: { name, locale, placement } }));
      if (process.env.NEXT_PUBLIC_IOJH_CUSTOM_EVENTS === 'true') {
        try { track(name, { locale, placement }); } catch { /* Analytics should never block navigation. */ }
      }
    }
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
