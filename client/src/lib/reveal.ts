import { useEffect } from "react";

/**
 * Fades in `[data-reveal]` blocks that start below the fold. Blocks already on screen are left alone,
 * so prerendered content never flashes. Skipped entirely when the visitor asks for less motion.
 */
export function useReveal(key: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
      (node) => node.getBoundingClientRect().top > window.innerHeight,
    );
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const node of nodes) {
      node.classList.add("reveal-pending");
      observer.observe(node);
    }
    return () => {
      observer.disconnect();
      for (const node of nodes) node.classList.remove("reveal-pending");
    };
  }, [key]);
}
