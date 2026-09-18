import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent,
  KeyboardEvent,
  WheelEvent,
} from "react";
import "./depth-carousel.css";

export type DepthCarouselItem =
  string | { image: string; alt?: string; label?: string };

export type DepthCarouselProps = {
  items: DepthCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: "left" | "right";
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  duration?: number;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem) => void;
  onSelect?: (index: number, item: DepthCarouselItem) => void;
  className?: string;
  label?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalise = (item: DepthCarouselItem) =>
  typeof item === "string" ? { image: item, alt: "" } : item;

/** A dependency-free depth stack inspired by React Bits' DepthCarousel. */
export default function DepthCarousel({
  items,
  cardWidth = 420,
  cardHeight = 320,
  radius = 19,
  depth = 230,
  spread = 120,
  tilt = 18,
  tiltDirection = "right",
  perspective = 1200,
  visibleCards = 4,
  falloff = 0.18,
  duration = 650,
  loop = true,
  autoplay = false,
  autoplayDelay = 4500,
  showControls = true,
  showIndicators = true,
  onChange,
  onSelect,
  className = "",
  label = "Lighting 作品翻页展示",
}: DepthCarouselProps) {
  const data = useMemo(
    () => (Array.isArray(items) ? items : []).map(normalise),
    [items],
  );
  const count = data.length;
  const [active, setActive] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    x: number;
    start: number;
    id: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const offsetRef = useRef(0);
  const activeRef = useRef(0);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (active >= count && count) {
      setActive(0);
      activeRef.current = 0;
    }
  }, [active, count]);

  const wrap = useCallback(
    (value: number) => {
      if (!count) return 0;
      if (!loop) return clamp(value, 0, count - 1);
      return ((value % count) + count) % count;
    },
    [count, loop],
  );

  const commit = useCallback(
    (raw: number, animate = true) => {
      if (!count) return;
      const next = wrap(Math.round(raw));
      const current = activeRef.current;
      let delta = next - current;
      if (loop && count > 1) {
        delta = ((delta % count) + count) % count;
        if (delta > count / 2) delta -= count;
      }
      // Pointer and wheel gestures can leave a fractional offset. Snap that
      // offset directly; button/dot navigation keeps an unwrapped integer so
      // looping from the last card to the first remains a short transition.
      const rounded = Math.round(raw);
      const settlingGesture = Math.abs(raw - rounded) > 0.001;
      const target = settlingGesture ? rounded : rounded + delta;
      offsetRef.current = target;
      setOffset(target);
      activeRef.current = next;
      if (next !== current) {
        setActive(next);
        onChange?.(next, data[next]);
      }
      if (!animate || reducedMotion) {
        requestAnimationFrame(() => {
          const normal = wrap(offsetRef.current);
          offsetRef.current = normal;
          setOffset(normal);
        });
      }
    },
    [count, data, loop, onChange, reducedMotion, wrap],
  );

  const navigate = useCallback(
    (step: number) => commit(activeRef.current + step),
    [commit],
  );

  useEffect(() => {
    if (!autoplay || reducedMotion || count < 2) return;
    const root = rootRef.current;
    let paused = false;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    const timer = window.setInterval(
      () => {
        if (!paused && !dragRef.current) navigate(1);
      },
      Math.max(1200, autoplayDelay),
    );
    root?.addEventListener("mouseenter", pause);
    root?.addEventListener("mouseleave", resume);
    root?.addEventListener("focusin", pause);
    root?.addEventListener("focusout", resume);
    return () => {
      window.clearInterval(timer);
      root?.removeEventListener("mouseenter", pause);
      root?.removeEventListener("mouseleave", resume);
      root?.removeEventListener("focusin", pause);
      root?.removeEventListener("focusout", resume);
    };
  }, [autoplay, autoplayDelay, count, navigate, reducedMotion]);

  useEffect(
    () => () => {
      if (snapTimer.current) clearTimeout(snapTimer.current);
    },
    [],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (count < 2) return;
    // Keep arrows and indicators clickable without the stage capturing their pointer.
    if (
      (event.target as HTMLElement).closest(
        ".depth-carousel__arrow, .depth-carousel__dots",
      )
    )
      return;
    // A deliberate new pointer gesture should always be allowed to select a card.
    suppressClickRef.current = false;
    snapTimer.current && clearTimeout(snapTimer.current);
    dragRef.current = {
      x: event.clientX,
      start: offsetRef.current,
      id: event.pointerId,
      moved: false,
    };
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 5) {
      if (!drag.moved) rootRef.current?.setPointerCapture(event.pointerId);
      drag.moved = true;
    }
    const stepPx = Math.max(cardWidth * 0.58, 90);
    const next = drag.start - dx / stepPx;
    offsetRef.current = next;
    setOffset(next);
  };
  const onPointerUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      commit(offsetRef.current);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      commit(0);
    } else if (event.key === "End") {
      event.preventDefault();
      commit(count - 1);
    }
  };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (count < 2 || (Math.abs(event.deltaY) < 2 && Math.abs(event.deltaX) < 2))
      return;
    event.preventDefault();
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    offsetRef.current += clamp(
      delta / Math.max(cardWidth * 1.1, 180),
      -0.55,
      0.55,
    );
    setOffset(offsetRef.current);
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => commit(offsetRef.current), 120);
  };

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${dragging ? "is-dragging" : ""} ${className}`.trim()}
      style={
        {
          "--dc-perspective": `${perspective}px`,
          "--dc-duration": `${reducedMotion ? 0 : duration}ms`,
        } as CSSProperties
      }
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage">
        {data.map((item, index) => {
          let distance = index - offset;
          if (loop && count > 1) {
            distance = ((distance % count) + count) % count;
            if (distance > count / 2) distance -= count;
          }
          const behind = Math.max(0, distance);
          const visible = Math.abs(distance) <= visibleCards + 0.5;
          const direction = tiltDirection === "left" ? -1 : 1;
          const opacity = visible
            ? distance < 0
              ? Math.max(0, 1 + distance)
              : 1
            : 0;
          const brightness = Math.max(0.15, 1 - behind * falloff);
          const transform = `translate(-50%, -50%) translateX(${(direction * spread * distance).toFixed(2)}px) translateZ(${(-depth * distance).toFixed(2)}px) rotateY(${(direction * tilt * clamp(distance, 0, 1)).toFixed(2)}deg)`;
          return (
            <button
              type="button"
              className={`depth-carousel__card ${active === index ? "is-active" : ""}`}
              key={`${item.image}-${index}`}
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: radius,
                transform,
                opacity,
                filter: `brightness(${brightness.toFixed(3)}) blur(${Math.min(6, behind * falloff * 2).toFixed(2)}px)`,
                zIndex: Math.round(2000 - distance * 20),
                pointerEvents: visible && opacity > 0.05 ? "auto" : "none",
              }}
              aria-label={item.alt || `第 ${index + 1} 件 Lighting 作品`}
              aria-current={active === index ? "true" : undefined}
              tabIndex={active === index ? 0 : -1}
              onClick={() => {
                if (!dragRef.current && !suppressClickRef.current) {
                  commit(index);
                  onSelect?.(index, data[index]);
                }
              }}
            >
              <img src={item.image} alt={item.alt || ""} draggable={false} />
              {item.label && (
                <span className="depth-carousel__label">{item.label}</span>
              )}
              <span className="depth-carousel__shade" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => navigate(-1)}
            aria-label="上一件 Lighting 作品"
          >
            ‹
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => navigate(1)}
            aria-label="下一件 Lighting 作品"
          >
            ›
          </button>
        </>
      )}
      {showIndicators && count > 1 && (
        <div
          className="depth-carousel__dots"
          role="tablist"
          aria-label="Lighting 作品"
        >
          {data.map((item, index) => (
            <button
              key={`${item.image}-dot`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`查看第 ${index + 1} 件作品`}
              className={active === index ? "is-active" : ""}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => commit(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
