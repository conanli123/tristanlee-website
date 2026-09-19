import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import gsap from "gsap";
import "./depth-carousel.css";

export type DepthCarouselItem = {
  image: string;
  alt?: string;
  label?: string;
  position?: string;
};

type Props = {
  items: DepthCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  depth?: number;
  spread?: number;
  tilt?: number;
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  onChange?: (index: number) => void;
  onSelect?: (index: number) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const wrap = (value: number, count: number) =>
  ((value % count) + count) % count;

// Adapted from the React Bits DepthCarousel source supplied by the owner.
// GSAP animates one continuous position, keeping card transforms and selection in sync.
export default function DepthCarousel({
  items,
  cardWidth = 420,
  cardHeight = 320,
  radius = 19,
  depth = 230,
  spread = 120,
  tilt = 18,
  perspective = 1200,
  visibleCards = 4,
  falloff = 0.18,
  blur = 6,
  duration = 650,
  autoplay = true,
  autoplayDelay = 3200,
  onChange,
  onSelect,
}: Props) {
  const count = items.length;
  const identity = useMemo(
    () => items.map((item) => item.image).join("|"),
    [items],
  );
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const shades = useRef<(HTMLSpanElement | null)[]>([]);
  const position = useRef(0);
  const focus = useRef(0);
  const scale = useRef(1);
  const tween = useRef<gsap.core.Tween | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const interactionUntil = useRef(0);
  const suppressClick = useRef(false);
  const inView = useRef(false);
  const pointerInside = useRef(false);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    start: number;
    moved: boolean;
  } | null>(null);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  const layout = useCallback(
    (pos: number) => {
      if (!count) return;
      for (let index = 0; index < count; index++) {
        const card = cards.current[index];
        if (!card) continue;
        let distance = wrap(index - pos, count);
        if (distance > count / 2) distance -= count;
        const back = Math.max(0, distance);
        const visible = Math.abs(distance) <= visibleCards + 0.5;
        const opacity = visible
          ? distance < 0
            ? Math.max(0, 1 + distance)
            : 1
          : 0;
        const brightness = Math.max(0.15, 1 - back * falloff);
        const blurPx = Math.min(
          blur,
          (back / Math.max(1, visibleCards)) * blur,
        );
        // Do not project fully hidden cards in front of the perspective plane.
        const visualDistance = clamp(distance, -1, visibleCards + 1);
        card.style.transform = `translate(-50%, -50%) scale(${scale.current}) translateX(${spread * visualDistance}px) translateZ(${-depth * visualDistance}px) rotateY(${tilt * clamp(distance, 0, 1)}deg)`;
        card.style.opacity = String(opacity);
        card.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        card.style.filter = `brightness(${brightness}) blur(${blurPx}px)`;
        card.style.zIndex = String(Math.round(2000 - distance * 20));
        card.style.pointerEvents = visible && opacity > 0.05 ? "auto" : "none";
        if (shades.current[index])
          shades.current[index]!.style.opacity = String(
            clamp(back * falloff * 1.25, 0, 0.86),
          );
      }
    },
    [count, depth, spread, tilt, visibleCards, falloff, blur],
  );

  const setFocus = useCallback(
    (rawIndex: number, animate = true) => {
      if (!count) return;
      clearTimeout(wheelTimer.current);
      tween.current?.kill();
      const index = wrap(Math.round(rawIndex), count);
      let delta = wrap(index - position.current, count);
      if (delta > count / 2) delta -= count;
      const target = position.current + delta;
      focus.current = index;
      setActive(index);
      changeRef.current?.(index);
      if (!animate || reducedRef.current) {
        position.current = index;
        layout(index);
        tween.current = null;
        return;
      }
      const proxy = { value: position.current };
      tween.current = gsap.to(proxy, {
        value: target,
        duration: duration / 1000,
        ease: "power3.out",
        onUpdate: () => {
          position.current = proxy.value;
          layout(proxy.value);
        },
        onComplete: () => {
          position.current = index;
          layout(index);
          tween.current = null;
        },
      });
    },
    [count, duration, layout],
  );

  const manualFocus = useCallback(
    (index: number) => {
      interactionUntil.current = Date.now() + autoplayDelay;
      setFocus(index);
    },
    [autoplayDelay, setFocus],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const resize = new ResizeObserver(([entry]) => {
      scale.current = clamp(
        entry.contentRect.width / (cardWidth + spread * 2 + 120),
        0.3,
        1,
      );
      layout(position.current);
    });
    resize.observe(root);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView.current =
          entry.isIntersecting && entry.intersectionRatio >= 0.35;
      },
      { threshold: 0.35 },
    );
    intersection.observe(root);
    return () => {
      resize.disconnect();
      intersection.disconnect();
    };
  }, [cardWidth, spread, layout]);

  useEffect(() => {
    setFocus(0, false);
    return () => {
      tween.current?.kill();
      clearTimeout(wheelTimer.current);
    };
  }, [identity, setFocus]);

  useEffect(() => {
    if (reduced) setFocus(focus.current, false);
  }, [reduced, setFocus]);

  useEffect(() => {
    if (!autoplay || paused || reduced || count < 2) return;
    const timer = window.setInterval(() => {
      const root = rootRef.current;
      if (
        !root ||
        !inView.current ||
        document.hidden ||
        pointerInside.current ||
        root.contains(document.activeElement) ||
        drag.current ||
        Date.now() < interactionUntil.current
      )
        return;
      setFocus(focus.current + 1);
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplay, paused, reduced, count, autoplayDelay, setFocus]);

  useEffect(() => {
    const stage = rootRef.current;
    if (!stage || count < 2) return;
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        drag.current ||
        (event.target as Element).closest(
          ".depth-carousel__navigation, .depth-carousel__arrow",
        )
      )
        return;
      const raw =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!raw) return;
      event.preventDefault();
      tween.current?.kill();
      interactionUntil.current = Date.now() + autoplayDelay;
      const delta =
        event.deltaMode === 1
          ? raw * 24
          : event.deltaMode === 2
            ? raw * stage.clientHeight
            : raw;
      position.current += clamp(
        delta / (cardWidth * 0.9 * scale.current),
        -0.6,
        0.6,
      );
      layout(position.current);
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(
        () => setFocus(Math.round(position.current)),
        130,
      );
    };
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", wheel);
      clearTimeout(wheelTimer.current);
    };
  }, [count, cardWidth, layout, setFocus, autoplayDelay]);

  const endDrag = useCallback(
    (cancelled = false) => {
      const gesture = drag.current;
      if (!gesture) return;
      drag.current = null;
      setDragging(false);
      if (gesture.moved) {
        suppressClick.current = true;
        manualFocus(cancelled ? focus.current : Math.round(position.current));
      } else if (Math.abs(position.current - focus.current) > 0.001) {
        setFocus(focus.current);
      }
      if (rootRef.current?.hasPointerCapture(gesture.id))
        rootRef.current.releasePointerCapture(gesture.id);
    },
    [manualFocus, setFocus],
  );

  useEffect(() => {
    const release = () => endDrag();
    const cancel = () => endDrag(true);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [endDrag]);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      count < 2 ||
      (event.target as Element).closest(
        ".depth-carousel__navigation, .depth-carousel__arrow",
      ) ||
      !event.isPrimary ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey
    )
      return;
    suppressClick.current = false;
    clearTimeout(wheelTimer.current);
    tween.current?.kill();
    interactionUntil.current = Date.now() + autoplayDelay;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: position.current,
      moved: false,
    };
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        endDrag(true);
        return;
      }
      if (Math.abs(dx) <= 6) return;
      gesture.moved = true;
      rootRef.current?.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    position.current =
      gesture.start - dx / Math.max(cardWidth * 0.55 * scale.current, 40);
    layout(position.current);
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index =
      event.key === "ArrowLeft"
        ? focus.current - 1
        : event.key === "ArrowRight"
          ? focus.current + 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : undefined;
    if (index === undefined) return;
    event.preventDefault();
    suppressClick.current = false;
    manualFocus(index);
  };

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${dragging ? "is-dragging" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Lighting 作品翻页展示"
      tabIndex={0}
      style={{ "--dc-perspective": `${perspective}px` } as CSSProperties}
      onKeyDown={keyDown}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={() => endDrag()}
      onPointerCancel={() => endDrag(true)}
      onLostPointerCapture={(event) => {
        // Touch buttons initially capture the pointer; transferring it to the
        // carousel must not cancel the gesture when that child loses capture.
        if (event.target === event.currentTarget) endDrag(true);
      }}
      onMouseEnter={() => {
        pointerInside.current = true;
      }}
      onMouseLeave={() => {
        pointerInside.current = false;
      }}
    >
      <div className="depth-carousel__stage" ref={stageRef}>
        {items.map((item, index) => (
          <button
            key={index}
            ref={(element) => {
              cards.current[index] = element;
            }}
            type="button"
            className={`depth-carousel__card ${active === index ? "is-active" : ""}`}
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius: radius,
            }}
            aria-label={`${item.label || item.alt || `作品 ${index + 1}`}，${active === index ? "查看作品" : "移到前方"}`}
            aria-current={active === index ? "true" : undefined}
            tabIndex={active === index ? 0 : -1}
            onClick={(event) => {
              if (event.detail > 0 && suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              if (drag.current?.moved) return;
              if (
                index === focus.current &&
                Math.abs(position.current - index) < 0.01
              )
                onSelect?.(index);
              else manualFocus(index);
            }}
          >
            <img
              src={item.image}
              alt={item.alt || ""}
              style={{ objectPosition: item.position }}
              draggable={false}
            />
            <span
              className="depth-carousel__tint"
              ref={(element) => {
                shades.current[index] = element;
              }}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            title="上一件作品"
            aria-label="上一件 Lighting 作品"
            onClick={() => manualFocus(focus.current - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            title="下一件作品"
            aria-label="下一件 Lighting 作品"
            onClick={() => manualFocus(focus.current + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
      <div className="depth-carousel__navigation">
        <div
          className="depth-carousel__dots"
          role="group"
          aria-label="选择 Lighting 作品"
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`depth-carousel__dot ${active === index ? "is-active" : ""}`}
              aria-label={`查看第 ${index + 1} 件作品：${item.label || ""}`}
              title={item.label}
              aria-current={active === index ? "true" : undefined}
              onClick={() => manualFocus(index)}
            />
          ))}
        </div>
        {autoplay && !reduced && count > 1 && (
          <button
            type="button"
            className="depth-carousel__play"
            title={paused ? "开启自动播放" : "暂停自动播放"}
            aria-label={paused ? "开启自动播放" : "暂停自动播放"}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
