"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Disable browser's default scroll restoration which forces previous scroll offset on mobile
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      const main = document.querySelector("main");
      if (main) {
        main.scrollTop = 0;
      }
    };

    // Immediate execution
    resetScroll();

    // Secondary execution on next animation frame and after DOM hydration/layout
    const rId = requestAnimationFrame(() => {
      resetScroll();
      const timer1 = setTimeout(resetScroll, 30);
      const timer2 = setTimeout(resetScroll, 100);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    });

    return () => cancelAnimationFrame(rId);
  }, [pathname, searchParams]);

  return null;
}
