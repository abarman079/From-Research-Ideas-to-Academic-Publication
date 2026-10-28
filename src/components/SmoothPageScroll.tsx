'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

/** Gentle wheel/anchor scrolling on desktop. Touch remains native. */
export default function SmoothPageScroll({ paused }: { paused: boolean }) {
  const scroller = useRef<Lenis | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    let cancelled = false;
    let instance: Lenis | null = null;

    const init = async () => {
      if (!media.matches || instance || cancelled) return;
      const { default: LenisClass } = await import('lenis');
      if (cancelled || !media.matches) return;
      instance = new LenisClass({
        autoRaf: true,
        anchors: { offset: -88 },
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) => Boolean(node.closest('[role="dialog"], [data-lenis-prevent]')),
      });
      scroller.current = instance;
      instance.on('scroll', ScrollTrigger.update);
      if (pausedRef.current) instance.stop();
    };
    const handleChange = () => {
      if (media.matches) void init();
      else {
        instance?.destroy();
        instance = null;
        scroller.current = null;
      }
    };
    void init();
    media.addEventListener('change', handleChange);
    return () => {
      cancelled = true;
      media.removeEventListener('change', handleChange);
      instance?.destroy();
      scroller.current = null;
    };
  }, []);

  useEffect(() => {
    if (paused) scroller.current?.stop();
    else scroller.current?.start();
  }, [paused]);

  return null;
}
