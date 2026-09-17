import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent } from "react";

export function useCarouselHover(
  active: number,
  select: (index: number) => void,
  disabled: boolean,
  reducedMotion: boolean,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const candidate = useRef<number | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const lastActive = useRef(active);
  const lockedUntil = useRef(0);

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    candidate.current = null;
  }, []);

  useEffect(() => {
    cancel();
    if (lastActive.current !== active) {
      // Moving cards can pass beneath a stationary pointer; only a fresh mouse
      // movement after the transition should select another project.
      lockedUntil.current = performance.now() + (reducedMotion ? 0 : 350);
      lastActive.current = active;
    }
  }, [active, disabled, reducedMotion, cancel]);

  useEffect(() => {
    window.addEventListener("blur", cancel);
    const visibility = () => {
      if (document.hidden) cancel();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancel();
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [cancel]);

  const onPointerMove = (
    event: PointerEvent<HTMLAnchorElement>,
    index: number,
  ) => {
    if (event.pointerType !== "mouse" || event.buttons !== 0 || disabled) {
      cancel();
      return;
    }
    const previous = pointer.current;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (previous?.x === event.clientX && previous.y === event.clientY) return;
    if (index === active || performance.now() < lockedUntil.current) {
      cancel();
      return;
    }
    if (candidate.current === index) return;
    cancel();
    candidate.current = index;
    const link = event.currentTarget;
    timer.current = setTimeout(() => {
      cancel();
      if (link.matches(":hover") && !document.hidden) select(index);
    }, 50);
  };

  return { onPointerMove, cancel };
}
