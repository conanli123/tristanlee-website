import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  horizontal: boolean;
};

export function useCarouselDrag(onSwipe: (direction: number) => void) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    const previous = gesture.current;
    gesture.current = null;
    setIsPressed(false);
    setIsDragging(false);
    const track = trackRef.current;
    track?.style.removeProperty("--drag-x");
    if (previous && track?.hasPointerCapture(previous.pointerId)) {
      track.releasePointerCapture(previous.pointerId);
    }
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) reset();
    };
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reset]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      gesture.current ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    suppressClick.current = false;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
    };
    setIsPressed(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (event.pointerType === "mouse" && event.buttons === 0) {
      reset();
      return;
    }
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      // Let vertical touch gestures scroll the page without changing projects.
      if (Math.abs(dy) >= Math.abs(dx)) {
        reset();
        return;
      }
      current.horizontal = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
    event.preventDefault();
    const width =
      event.currentTarget.querySelector<HTMLElement>(".is-active")
        ?.offsetWidth ?? 500;
    const travel = Math.max(-width * 0.8, Math.min(width * 0.8, dx));
    event.currentTarget.style.setProperty("--drag-x", `${travel}px`);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const width =
      event.currentTarget.querySelector<HTMLElement>(".is-active")
        ?.offsetWidth ?? 500;
    const threshold = Math.max(40, Math.min(80, width * 0.12));
    const shouldMove = current.horizontal && Math.abs(dx) >= threshold;
    reset();
    if (shouldMove) onSwipe(dx < 0 ? 1 : -1);
  };

  return {
    trackRef,
    isDragging,
    isPressed,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
        if (gesture.current?.pointerId === event.pointerId) reset();
      },
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
        // Ignore the image's implicit touch capture transferring to the track.
        if (
          event.target === event.currentTarget &&
          gesture.current?.pointerId === event.pointerId
        )
          reset();
      },
      onPointerLeave: () => {
        if (gesture.current && !gesture.current.horizontal) reset();
      },
      onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
      onDragStart: (event: MouseEvent<HTMLDivElement>) =>
        event.preventDefault(),
    },
  };
}
