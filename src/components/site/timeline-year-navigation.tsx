"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import home from "./home.module.css";
import styles from "@/app/(site)/stories/timeline.module.css";

function yearFromHash() {
  return window.location.hash.match(/^#year-([1-9]\d{3})$/)?.[1];
}

export function TimelineYearNavigation({ years, initialYear }: { years: string[]; initialYear?: string }) {
  const [activeYear, setActiveYear] = useState<string | undefined>(initialYear || years[0]);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const hashYear = yearFromHash();
    const hashTarget = hashYear && document.getElementById(`year-${hashYear}`);
    const target = hashTarget || (initialYear && document.getElementById(`year-${initialYear}`));

    // The server can stream chapters after the browser first resolves the fragment.
    if (target) target.scrollIntoView({ behavior: "instant" });
  }, [initialYear]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline-year]"));
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const footer = document.querySelector("footer");
    const readingLine = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) + 8;

    function syncYear() {
      const atPageEnd = window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
      const chapter = atPageEnd
        ? sections.at(-1)
        : sections.find((section) => section.getBoundingClientRect().bottom >= readingLine);
      setActiveYear(chapter?.dataset.timelineYear);
    }

    const observer = new IntersectionObserver(syncYear, { rootMargin: `-${readingLine}px 0px 0px` });
    sections.forEach((section) => observer.observe(section));

    // A short final chapter may never reach the reading line.
    const endObserver = new IntersectionObserver(syncYear, { threshold: 1 });
    if (footer) endObserver.observe(footer);

    return () => {
      observer.disconnect();
      endObserver.disconnect();
    };
  }, [years, initialYear]);

  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector('[aria-current="location"]');
    if (!list || !link) return;

    const bounds = list.getBoundingClientRect();
    const current = link.getBoundingClientRect();
    if (current.left < bounds.left || current.right > bounds.right) {
      list.scrollLeft += (current.left + current.right - bounds.left - bounds.right) / 2;
    }
  }, [activeYear]);

  function jumpToYear(event: MouseEvent<HTMLAnchorElement>, year: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(`year-${year}`);
    if (!section) return;

    event.preventDefault();
    document.getElementById(`heading-${year}`)?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
    window.history.replaceState(window.history.state, "", `#year-${year}`);
    setActiveYear(year);
  }

  if (!years.length) return null;

  return (
    <nav className={styles.yearNav} aria-label="按年份浏览故事">
      <ul className={`${home.container} ${styles.yearList}`} ref={listRef}>
        {[...years].reverse().map((year) => (
          <li key={year}>
            <a
              href={`#year-${year}`}
              aria-current={activeYear === year ? "location" : undefined}
              onClick={(event) => jumpToYear(event, year)}
            >
              {year}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
