"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Adds `.is-in` to every `.reveal` element as it enters the viewport.
 * Mounted once in the root layout; the CSS does the animation.
 *
 * Re-scans on every route change and watches the DOM for elements added
 * later (client-side navigation, gated content appearing after login), so
 * nothing is left stuck at opacity 0.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = reduced
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                (e.target as HTMLElement).classList.add("is-in");
                io?.unobserve(e.target);
              }
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
        );

    // Anything already on screen is shown at once; the observer only handles
    // what is still below the fold. This keeps content visible even if the
    // observer is slow to fire (throttled tab, mid-navigation).
    const onScreen = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight * 1.1;
    };
    const attach = (root: ParentNode) => {
      const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
      if (root instanceof HTMLElement && root.classList.contains("reveal") && !root.classList.contains("is-in")) els.push(root);
      for (const el of els) {
        if (io && !onScreen(el)) io.observe(el);
        else el.classList.add("is-in");
      }
    };

    attach(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) attach(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, [pathname]);

  return null;
}
