"use client";

import { useEffect, useRef } from "react";

interface UseAutoScrollOptions {
  enabled?: boolean;
  offset?: number;
  behavior?: ScrollBehavior;
  delay?: number;
  highlight?: boolean;
}

export function useAutoScroll<T extends HTMLElement = HTMLElement>(
  isActive: boolean,
  options: UseAutoScrollOptions = {}
) {
  const elementRef = useRef<T>(null);
  const {
    enabled = true,
    offset = 100,
    behavior = "smooth",
    delay = 100,
    highlight = true,
  } = options;

  useEffect(() => {
    if (!enabled || !isActive || elementRef.current == null) return;

    const timeoutId = setTimeout(() => {
      const element = elementRef.current;
      if (element == null) return;

      // Use scrollIntoView as the primary method - it's more reliable
      try {
        element.scrollIntoView({
          behavior,
          block: "center",
          inline: "nearest",
        });
      } catch {
        // Fallback to window scrolling
        try {
          const elementRect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset;
          const targetScrollTop = scrollTop + elementRect.top - offset;

          window.scrollTo({
            top: targetScrollTop,
            behavior,
          });
        } catch {
          // Silent fallback - if all scrolling methods fail, just continue
        }
      }

      // Add highlight effect
      if (highlight) {
        element.classList.add("scroll-highlight");
        setTimeout(() => {
          element.classList.remove("scroll-highlight");
        }, 2000);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isActive, enabled, offset, behavior, delay, highlight]);

  return elementRef;
}
