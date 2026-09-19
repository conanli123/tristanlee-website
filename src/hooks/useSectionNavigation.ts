import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

const homeSections = ["home", "work", "profile", "news", "contact"] as const;
type HomeSection = (typeof homeSections)[number];

function isHomeSection(value: string | null): value is HomeSection {
  return homeSections.some((section) => section === value);
}

function readSection(query: string): HomeSection {
  const value = new URLSearchParams(query).get("section");
  return isHomeSection(value) ? value : "home";
}

function activationLine() {
  return (
    (document.querySelector(".site-header")?.getBoundingClientRect().bottom ??
      0) + 24
  );
}

function sectionScrollTop(section: HomeSection) {
  if (section === "home") return 0;
  const element = document.querySelector<HTMLElement>(
    `[data-home-section="${section}"]`,
  );
  if (!element) return null;
  const top = element.getBoundingClientRect().top + window.scrollY;
  return Math.max(
    0,
    Math.min(
      top - activationLine(),
      document.documentElement.scrollHeight - window.innerHeight,
    ),
  );
}

/** The homepage's header and menu navigate the same sections observed on scroll. */
export function useSectionNavigation(route: string, query: string) {
  const isHome = route === "home" || route === "";
  const requestedSection = readSection(query);
  const [activeSection, setActiveSection] =
    useState<HomeSection>(requestedSection);
  const pendingClick = useRef<HomeSection | null>(null);
  const scrollTarget = useRef<HomeSection | null>(null);
  const targetTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const updateScrollSpy = useRef<() => void>(() => {});

  const scrollToSection = useCallback(
    (section: HomeSection, smooth: boolean) => {
      const top = sectionScrollTop(section);
      if (top === null) return;
      clearTimeout(targetTimeout.current);
      scrollTarget.current = section;
      setActiveSection(section);
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({
        top,
        behavior: smooth && !reduced ? "smooth" : "instant",
      });
      // Browsers without scrollend still release the target after scrolling.
      targetTimeout.current = setTimeout(() => {
        scrollTarget.current = null;
        updateScrollSpy.current();
      }, 1600);
    },
    [],
  );

  useEffect(() => {
    if (!isHome) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (scrollTarget.current) {
        const target = sectionScrollTop(scrollTarget.current);
        if (target !== null && Math.abs(window.scrollY - target) > 3) return;
        scrollTarget.current = null;
        clearTimeout(targetTimeout.current);
      }
      let current: HomeSection = "home";
      const line = activationLine() + 3;
      document
        .querySelectorAll<HTMLElement>("[data-home-section]")
        .forEach((element) => {
          const section = element.dataset.homeSection ?? null;
          if (
            isHomeSection(section) &&
            element.getBoundingClientRect().top <= line
          ) {
            current = section;
          }
        });
      setActiveSection(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const interrupt = () => {
      clearTimeout(targetTimeout.current);
      scrollTarget.current = null;
      schedule();
    };
    const interruptKey = (event: KeyboardEvent) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      ) {
        interrupt();
      }
    };
    const resize = new ResizeObserver(schedule);
    const main = document.querySelector("main");
    if (main) resize.observe(main);
    const header = document.querySelector(".site-header");
    if (header) resize.observe(header);
    updateScrollSpy.current = schedule;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", interruptKey);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(targetTimeout.current);
      scrollTarget.current = null;
      updateScrollSpy.current = () => {};
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interruptKey);
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;
    const smooth = pendingClick.current === requestedSection;
    pendingClick.current = null;
    // Run after React has restored the homepage, including on Back or refresh.
    const frame = requestAnimationFrame(() => {
      scrollToSection(requestedSection, smooth);
    });
    return () => cancelAnimationFrame(frame);
  }, [isHome, requestedSection, scrollToSection]);

  const hrefFor = (id: string) =>
    isHome && isHomeSection(id) && id !== "home"
      ? `#/home?section=${id}`
      : `#/${id}`;

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    // Leave opening in a new tab and browser modifier shortcuts untouched.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !isHome ||
      !isHomeSection(id)
    ) {
      return;
    }
    event.preventDefault();
    const hash = hrefFor(id);
    if (window.location.hash === hash || requestedSection === id) {
      pendingClick.current = null;
      scrollToSection(id, true);
      if (window.location.hash !== hash) window.location.hash = hash;
    } else {
      pendingClick.current = id;
      window.location.hash = hash;
    }
  };

  return {
    isHome,
    activePage: isHome ? activeSection : route.split("/")[0],
    hrefFor,
    navigate,
  };
}
