import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useTypewriter";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

// Same scroll landmarks as the reference: enter at viewport bottom, settle at
// the middle, then travel down inside the panel while it leaves the viewport.
export function useProfileMotion() {
  const panelRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const panel = panelRef.current;
    const card = cardRef.current;
    if (!panel || !card) return;

    let frame = 0;
    let previousTime = 0;
    let currentTop = panel.getBoundingClientRect().top;
    let focused = false;
    const mobile = window.matchMedia("(max-width: 640px)");

    const draw = (top: number) => {
      if (reducedMotion || focused) {
        card.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
        panel.style.setProperty("--profile-inset", "0%");
        panel.style.setProperty("--profile-paper", "230");
        return;
      }
      const viewport = window.innerHeight;
      const height = panel.offsetHeight;
      const small = mobile.matches;
      const rotationProgress = clamp(
        (viewport - top) / (small ? viewport : viewport + height),
      );
      const remaining = rotationProgress - 1;
      // A small overshoot, equivalent to the reference's back.out(1.2).
      const easedRotation = 1 + 2.2 * remaining ** 3 + 1.2 * remaining ** 2;
      const rotation = mix(small ? -45 : -75, 0, easedRotation);
      const settleTop = small ? viewport * 0.25 : (viewport - height) * 0.5;
      const arrival = clamp((viewport - top) / (viewport - settleTop));
      const departure = clamp((settleTop - top) / (height + settleTop));
      const travel =
        top >= settleTop
          ? mix(small ? -150 : -120, 0, arrival)
          : mix(0, small ? 80 : 100, departure);
      const reveal = clamp((viewport - top) / (viewport * 0.75));
      card.style.transform = `translate3d(0, ${travel.toFixed(3)}%, 0) rotate(${rotation.toFixed(3)}deg)`;
      panel.style.setProperty(
        "--profile-inset",
        `${small ? 0 : (15 * (1 - reveal)).toFixed(3)}%`,
      );
      panel.style.setProperty(
        "--profile-paper",
        mix(255, 230, reveal).toFixed(1),
      );
    };

    const tick = (time: number) => {
      const targetTop = panel.getBoundingClientRect().top;
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      const visible =
        targetTop < window.innerHeight + 100 &&
        targetTop > -panel.offsetHeight - 100;
      const amount =
        reducedMotion || !visible ? 1 : 1 - Math.exp(-elapsed / 65);
      currentTop += (targetTop - currentTop) * amount;
      if (Math.abs(targetTop - currentTop) < 0.15) currentTop = targetTop;
      draw(currentTop);
      frame = currentTop === targetTop ? 0 : requestAnimationFrame(tick);
      if (!frame) previousTime = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const focusIn = () => {
      focused = true;
      schedule();
    };
    const focusOut = (event: FocusEvent) => {
      if (!panel.contains(event.relatedTarget as Node | null)) {
        focused = false;
        schedule();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        panel.classList.toggle("is-motion-visible", entry.isIntersecting);
        schedule();
      },
      { rootMargin: "80px" },
    );
    const resize = new ResizeObserver(schedule);
    observer.observe(panel);
    resize.observe(panel);
    draw(currentTop);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    panel.addEventListener("focusin", focusIn);
    panel.addEventListener("focusout", focusOut);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      panel.removeEventListener("focusin", focusIn);
      panel.removeEventListener("focusout", focusOut);
      card.style.removeProperty("transform");
      panel.style.removeProperty("--profile-inset");
      panel.style.removeProperty("--profile-paper");
    };
  }, [reducedMotion]);

  return { panelRef, cardRef };
}
