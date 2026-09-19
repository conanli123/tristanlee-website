import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { site, works, skillTags, newsItems, workCategories } from "./data/site";
import type { Work } from "./data/site";
import { assetUrl } from "./data/assetUrl";
import { useReducedMotion } from "./hooks/useTypewriter";
import { useProfileMotion } from "./hooks/useProfileMotion";
import { useCarouselDrag } from "./hooks/useCarouselDrag";
import { useCarouselHover } from "./hooks/useCarouselHover";
import FlowerScene from "./components/FlowerScene";
import { LikeButton } from "./components/LikesProvider";
import DepthCarousel from "./components/DepthCarousel";

function Icon({
  name,
  className = "",
}: {
  name: "arrow" | "star" | "search" | "close" | "menu" | "plane" | "up";
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "arrow" ? (
        <path d="M4 16h23M18 6l10 10-10 10" />
      ) : name === "star" ? (
        <path d="m16 3 4 8.2 9 1.3-6.5 6.4 1.5 9L16 23.6 8 28l1.5-9.1L3 12.5l9-1.3Z" />
      ) : name === "search" ? (
        <>
          <circle cx="18" cy="13" r="9" />
          <path d="m11 20-8 9" />
        </>
      ) : name === "close" ? (
        <path d="m7 7 18 18M25 7 7 25" />
      ) : name === "menu" ? (
        <path d="M5 8h22M5 16h22M5 24h22" />
      ) : name === "up" ? (
        <path d="m7 21 9-10 9 10" />
      ) : (
        <>
          <path d="M3 12 29 3 20 29 13 20 3 12Z" />
          <path d="M13 20 29 3M13 20v9l5-5" />
        </>
      )}
    </svg>
  );
}
function Brand() {
  return (
    <span className="brand" aria-hidden="true">
      <span className="brand-language brand-zh" lang="zh-CN">
        <span className="brand-name">李天纯</span>
        <span className="brand-role">影视游戏渲染师</span>
      </span>
      <span className="brand-language brand-en" lang="en">
        <span className="brand-name">TristanLee</span>
        <span className="brand-role">Lighting Artist</span>
      </span>
    </span>
  );
}
const navigation = [
  { id: "home", en: "HOME", zh: "首页" },
  { id: "work", en: "WORK", zh: "作品" },
  { id: "profile", en: "PROFILE", zh: "关于我" },
  { id: "news", en: "NEWS", zh: "动态" },
  { id: "faq", en: "FAQ", zh: "合作说明" },
  { id: "contact", en: "CONTACT", zh: "联系" },
];
function OutlineHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={`outline-heading ${className}`}>{children}</h2>;
}
function WorkHeading() {
  return (
    <h2 className="outline-heading work-heading" aria-label="WORK" tabIndex={0}>
      {Array.from("WORK").map((letter, index) => (
        <span
          key={letter}
          className="work-letter"
          aria-hidden="true"
          data-letter={letter}
          style={{ "--letter-index": index } as CSSProperties}
        >
          {letter}
        </span>
      ))}
    </h2>
  );
}

function WorkTypeIcon({ kind }: { kind: Work["kind"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "video" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m10 9 5 3-5 3ZM7 5v14M17 5v14M3 10h4M3 14h4M17 10h4M17 14h4" />
        </>
      ) : kind === "game" ? (
        <>
          <path d="M8 7h8c3 0 4 2 5 7s-1 6-3 3l-2-2H8l-2 2c-2 3-4 2-3-3s2-7 5-7Z" />
          <path d="M7 10v4M5 12h4M15 11h.1M18 13h.1" />
        </>
      ) : (
        <>
          <path d="m4 17-1 4 4-1L20 7l-3-3ZM14 7l3 3M3 21l4-1-3-3" />
        </>
      )}
    </svg>
  );
}
function LineLink({
  href,
  children,
  zh,
  className = "",
}: {
  href: string;
  children: ReactNode;
  zh: string;
  className?: string;
}) {
  return (
    <a href={href} className={`line-link ${className}`}>
      <span className="link-words">
        <span>{children}</span>
        <span aria-hidden="true">{zh}</span>
      </span>
      <Icon name="arrow" />
    </a>
  );
}
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
function Portrait({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="130"
        cy="130"
        r="127"
        fill="#eee9e2"
        stroke="#151515"
        strokeWidth="2"
      />
      <path
        d="M37 261c10-50 47-74 94-74 48 0 84 28 94 74"
        fill="#80958b"
        stroke="#151515"
        strokeWidth="3"
      />
      <path
        d="M103 159v39c15 19 42 18 57-1v-42"
        fill="#e5b99b"
        stroke="#151515"
        strokeWidth="3"
      />
      <path
        d="M87 83c-13 11-11 30-9 54 2 37 20 55 50 55 36 0 55-34 53-77-1-29-23-48-49-48Z"
        fill="#edc5a8"
        stroke="#151515"
        strokeWidth="3"
      />
      <path
        d="M77 129c-10-2-13-16-11-26 1-10 5-10 5-21 0-26 16-52 41-46 17-21 36-12 44-6 16-3 34 18 35 40 2 14-5 25-10 37l-9 19-3-37c-10-3-19-9-24-18-4 12-18 18-31 19l-2-11c-7 11-15 16-26 17Z"
        fill="#222"
        stroke="#151515"
        strokeWidth="3"
      />
      <path
        d="m126 127-5 17h10M117 162c9 5 17 4 24-2"
        stroke="#151515"
        strokeWidth="3"
      />
      <g stroke="#151515" strokeWidth="3">
        <rect x="87" y="109" width="33" height="24" rx="9" />
        <rect x="137" y="109" width="33" height="24" rx="9" />
        <path d="M120 118h17M80 114l7 3M170 117l10-5" />
      </g>
      <circle cx="106" cy="120" r="3" fill="#151515" />
      <circle cx="152" cy="120" r="3" fill="#151515" />
      <path
        d="m93 207 17 31 20-20 22 20 18-32M130 220v40"
        stroke="#151515"
        strokeWidth="3"
      />
      <circle cx="138" cy="244" r="2" fill="#151515" />
    </svg>
  );
}
function Hero() {
  const featured = works.slice(0, 8);
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const slideLinks = useRef<(HTMLAnchorElement | null)[]>([]);
  const reduced = useReducedMotion();
  const selectSlide = (next: number) => {
    const keepFocus = slideLinks.current.includes(
      document.activeElement as HTMLAnchorElement,
    );
    setActive(next);
    if (keepFocus)
      requestAnimationFrame(() =>
        slideLinks.current[next]?.focus({ preventScroll: true }),
      );
  };
  const move = (direction: number) =>
    selectSlide((active + direction + featured.length) % featured.length);
  const drag = useCarouselDrag(move);
  const hover = useCarouselHover(active, selectSlide, drag.isPressed, reduced);
  const paused = userPaused || hovered || focusWithin || drag.isPressed;
  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(
      () => setActive((value) => (value + 1) % featured.length),
      5500,
    );
    return () => window.clearInterval(id);
  }, [paused, reduced, featured.length]);
  return (
    <section
      className="hero"
      aria-label="精选作品轮播"
      aria-roledescription="轮播"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          move(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div
        ref={drag.trackRef}
        className={`hero-slides ${drag.isDragging ? "is-dragging" : ""}`}
        onPointerDownCapture={hover.cancel}
        {...drag.handlers}
      >
        {featured.map((work, index) => {
          let offset = (index - active + featured.length) % featured.length;
          if (offset > Math.floor(featured.length / 2))
            offset -= featured.length;
          return (
            <a
              ref={(element) => {
                slideLinks.current[index] = element;
              }}
              href={`#/work/${work.id}`}
              key={work.id}
              className={`hero-slide ${offset === 0 ? "is-active" : ""}`}
              style={{ "--offset": offset } as CSSProperties}
              tabIndex={offset === 0 ? 0 : -1}
              aria-hidden={offset !== 0}
              draggable={false}
              onPointerMove={(event) => hover.onPointerMove(event, index)}
              onPointerLeave={hover.cancel}
            >
              <img
                src={assetUrl(work.image)}
                alt={
                  work.imageAlt ??
                  `${work.title}${work.isPlaceholder ? " — 占位项目视觉" : ""}`
                }
                style={{ objectPosition: work.imagePosition }}
                fetchPriority={index === 0 ? "high" : "auto"}
                draggable={false}
              />
              <span className="hero-hover">
                <span>{work.category}</span>
                <strong>{work.title}</strong>
                <span>{work.titleEn}</span>
                <span className="hero-view">
                  VIEW PROJECT <Icon name="arrow" />
                </span>
              </span>
            </a>
          );
        })}
      </div>
      <div className="hero-controls">
        <button
          className="carousel-arrow previous"
          onClick={() => move(-1)}
          aria-label="上一个精选作品"
        >
          <Icon name="arrow" />
          <span>PREV</span>
        </button>
        <div className="hero-caption" aria-live="off">
          <span>{featured[active].title}</span>
          <span className="hero-pagination">
            <span className="hero-dots">
              {featured.map((work, index) => (
                <button
                  key={work.id}
                  aria-label={`切换至${work.title}`}
                  aria-pressed={active === index}
                  className={active === index ? "active" : ""}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </span>
            <button
              className="autoplay-toggle"
              aria-label={userPaused ? "播放轮播" : "暂停轮播"}
              aria-pressed={userPaused}
              onClick={() => setUserPaused((value) => !value)}
            >
              {userPaused ? "▷" : "Ⅱ"}
            </button>
          </span>
        </div>
        <button
          className="carousel-arrow"
          onClick={() => move(1)}
          aria-label="下一个精选作品"
        >
          <span>NEXT</span>
          <Icon name="arrow" />
        </button>
      </div>
    </section>
  );
}
function WorkCard({
  work,
  favorite,
  toggle,
}: {
  work: Work;
  favorite: boolean;
  toggle: (id: string) => void;
}) {
  return (
    <article className="work-card">
      <a
        href={`#/work/${work.id}`}
        className="work-image"
        aria-label={`查看${work.title}`}
      >
        <img
          src={assetUrl(work.image)}
          alt={work.imageAlt ?? work.title}
          style={{ objectPosition: work.imagePosition }}
          loading="lazy"
        />
        {work.index === "01" && <span className="new-badge">NEW</span>}
        {work.group !== "lighting" && (
          <span className="work-type-badge">
            <WorkTypeIcon kind={work.kind} />
            <span>
              {work.kind === "video"
                ? "FILM"
                : work.kind === "game"
                  ? "GAME"
                  : "ART"}
            </span>
          </span>
        )}
        <span className="work-image-overlay">
          {work.kind === "video"
            ? "VIEW FILM"
            : work.kind === "game"
              ? "VIEW GAME"
              : "VIEW WORK"}{" "}
          <Icon name="arrow" />
        </span>
      </a>
      <div className="work-meta">
        <span>{work.category}</span>
        <time>{work.year}</time>
        <div className="work-actions">
          <LikeButton id={work.id} title={work.title} />
          <button
            className={`favorite-button ${favorite ? "selected" : ""}`}
            aria-label={`${favorite ? "取消收藏" : "收藏"}${work.title}`}
            aria-pressed={favorite}
            onClick={() => toggle(work.id)}
          >
            <Icon name="star" />
          </button>
        </div>
      </div>
      <a href={`#/work/${work.id}`} className="work-title">
        {work.title}
        <span>{work.titleEn}</span>
      </a>
    </article>
  );
}
function Works({
  favorites,
  toggle,
  savedOnly = false,
  full = false,
  selectedCategory,
  onCategoryChange,
}: {
  favorites: string[];
  toggle: (id: string) => void;
  savedOnly?: boolean;
  full?: boolean;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}) {
  const [localCategory, setCategory] = useState("all");
  const category = selectedCategory ?? localCategory;
  const worksRef = useRef<HTMLDivElement>(null);
  const toggleSaved = (id: string) => {
    const buttons = Array.from(
      worksRef.current?.querySelectorAll<HTMLButtonElement>(
        ".work-meta .favorite-button",
      ) ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    toggle(id);
    if (savedOnly && index >= 0)
      requestAnimationFrame(() => {
        const remaining = Array.from(
          worksRef.current?.querySelectorAll<HTMLButtonElement>(
            ".work-meta .favorite-button",
          ) ?? [],
        );
        const next =
          remaining[Math.min(index, remaining.length - 1)] ??
          worksRef.current?.querySelector<HTMLAnchorElement>(".empty-state a");
        next?.focus({ preventScroll: true });
      });
  };
  const categories = workCategories;
  const base = savedOnly
    ? works.filter((work) => favorites.includes(work.id))
    : works;
  const visible = base.filter(
    (work) => category === "all" || work.group === category,
  );
  const showLightingCarousel = full && !savedOnly && category === "lighting";
  return (
    <section
      className={`section work-section ${full ? "page-section" : ""}`}
      id="work"
    >
      <Reveal>
        <div className="section-heading-row">
          {savedOnly ? (
            <OutlineHeading>FAVORITES</OutlineHeading>
          ) : (
            <WorkHeading />
          )}
          <span className="section-label">
            {savedOnly ? "我的收藏" : "光影之间，构筑想象。"}
          </span>
        </div>
        <div className="work-filters" aria-label="作品分类">
          {categories.map((item) => (
            <button
              key={item.id}
              className={category === item.id ? "active" : ""}
              aria-pressed={category === item.id}
              onClick={() =>
                onCategoryChange
                  ? onCategoryChange(item.id)
                  : setCategory(item.id)
              }
              title={item.zh}
            >
              {item.en}{" "}
              <small>
                (
                {
                  base.filter(
                    (work) => item.id === "all" || work.group === item.id,
                  ).length
                }
                )
              </small>
            </button>
          ))}
        </div>
        <p className="work-category-caption" aria-live="polite">
          {categories.find((item) => item.id === category)?.description}
        </p>
        {showLightingCarousel ? (
          <LightingShowcase favorites={favorites} toggle={toggle} />
        ) : (
          <div ref={worksRef}>
            <div className="work-grid">
              {visible.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  favorite={favorites.includes(work.id)}
                  toggle={toggleSaved}
                />
              ))}
            </div>
            {!visible.length && (
              <div className="empty-state">
                <Icon name="star" />
                <h3>
                  {savedOnly
                    ? "把喜欢的画面，留在这里。"
                    : "这个分类暂时没有作品。"}
                </h3>
                <p>点击作品旁的星标，即可收藏。</p>
                <LineLink href="#/work?category=all" zh="浏览全部作品">
                  EXPLORE WORK
                </LineLink>
              </div>
            )}
          </div>
        )}
        {visible.some((work) => work.isPlaceholder) && (
          <p className="placeholder-note">{site.workNotice}</p>
        )}
        {!full && (
          <LineLink
            href="#/work?category=all"
            zh="浏览全部作品"
            className="center-link"
          >
            VIEW ALL
          </LineLink>
        )}
      </Reveal>
    </section>
  );
}
const lightingWorks = works.filter((work) => work.group === "lighting");
const lightingSlides = lightingWorks.map((work) => ({
  image: assetUrl(work.image),
  alt: work.imageAlt ?? work.title,
  label: work.title,
  position: work.imagePosition,
}));

function LightingShowcase({
  favorites,
  toggle,
}: {
  favorites: string[];
  toggle: (id: string) => void;
}) {
  const [active, setActive] = useState(0);
  const work = lightingWorks[active];
  if (!work) return null;
  const favorite = favorites.includes(work.id);
  return (
    <div className="lighting-depth-feature">
      <DepthCarousel
        items={lightingSlides}
        cardWidth={720}
        cardHeight={(720 * 320) / 420}
        spread={180}
        autoplay
        onChange={setActive}
        onSelect={(index) => {
          window.location.hash = `#/work/${lightingWorks[index].id}`;
        }}
      />
      <div className="lighting-depth-caption">
        <div>
          <a className="work-title" href={`#/work/${work.id}`}>
            {work.title}
            <span>{work.titleEn}</span>
          </a>
          <p>
            {work.category} / <time>{work.year}</time>
          </p>
        </div>
        <div className="work-actions">
          <LikeButton id={work.id} title={work.title} />
          <button
            className={`favorite-button ${favorite ? "selected" : ""}`}
            aria-label={`${favorite ? "取消收藏" : "收藏"}${work.title}`}
            aria-pressed={favorite}
            onClick={() => toggle(work.id)}
          >
            <Icon name="star" />
          </button>
        </div>
      </div>
    </div>
  );
}
function ProfileCard() {
  const { panelRef, cardRef } = useProfileMotion();
  return (
    <section
      className="profile-band"
      ref={panelRef}
      aria-label="李天纯的个人名片"
    >
      <div className="profile-stack" ref={cardRef}>
        <a href="#/profile" className="profile-card">
          <Portrait className="profile-portrait" />
          <div className="profile-card-copy">
            <OutlineHeading>PROFILE</OutlineHeading>
            <div className="profile-name">
              <span>Rendering artist</span>
              <b>TristanLee</b>
            </div>
            <p>
              HELLO WORLD,
              <br />
              I’m TristanLee, a rendering & compositing artist in the games
              industry. I shape light, color and atmosphere into stories.
            </p>
            <p className="profile-card-zh">
              你好，我是李天纯。用光影构筑世界，让画面拥有情绪。
            </p>
            <span className="line-link">
              <span>View More</span>
              <Icon name="arrow" />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
function News({ full = false }: { full?: boolean }) {
  return (
    <section className={`section news-section ${full ? "page-section" : ""}`}>
      <Reveal>
        <div className="section-heading-row">
          <OutlineHeading>NEWS</OutlineHeading>
          <span className="section-label">近况与创作记录</span>
        </div>
        <div className="news-list">
          {newsItems.slice(0, full ? undefined : 2).map((item, index) => (
            <a className="news-row" href={`#/news/${index}`} key={item.title}>
              <span className="news-thumbnail">
                <img
                  src={assetUrl(works[(index * 3) % works.length].image)}
                  alt=""
                  loading="lazy"
                />
              </span>
              <time>{item.date}</time>
              <span className="news-title">
                {item.title}
                <small>{item.en}</small>
              </span>
              <Icon name="arrow" />
            </a>
          ))}
        </div>
        {!full && (
          <LineLink href="#/news" zh="查看全部动态" className="right-link">
            VIEW ALL NEWS
          </LineLink>
        )}
      </Reveal>
    </section>
  );
}
function Journal() {
  return (
    <section className="journal">
      <div className="section-heading-row">
        <OutlineHeading>Visual Notes</OutlineHeading>
        <span className="section-label">灵感札记 / 图像实验</span>
      </div>
      <div className="journal-strip">
        {works.slice(5, 11).map((work) => (
          <a key={work.id} href={`#/work/${work.id}`} aria-label={work.title}>
            <img
              src={assetUrl(work.image)}
              alt={work.imageAlt ?? work.title}
              style={{ objectPosition: work.imagePosition }}
              loading="lazy"
            />
            <Icon name="arrow" />
          </a>
        ))}
      </div>
      <LineLink href="#/work" zh="走进我的视觉世界" className="right-link">
        Explore @TristanLee
      </LineLink>
    </section>
  );
}
function Contact({ full = false }: { full?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setMessage("邮箱已复制。");
    } catch {
      setMessage(`请手动复制：${site.email}`);
    }
  };
  return (
    <section className={`contact-section ${full ? "contact-page" : ""}`}>
      <OutlineHeading>CONTACT</OutlineHeading>
      <p>
        关于游戏影像、渲染合成与创意合作，
        <br />
        欢迎来聊聊你的想法。
      </p>
      <a
        className="contact-orbit"
        href={`mailto:${site.email}`}
        aria-label={`发送邮件至 ${site.email}`}
      >
        <span className="orbit-lines" />
        <span className="plane-circle">
          <Icon name="plane" />
        </span>
        <span className="orbit-caption">LET’S MAKE SOMETHING GREAT</span>
      </a>
      <a className="contact-email" href={`mailto:${site.email}`}>
        {site.email}
        <Icon name="arrow" />
      </a>
      {full && (
        <>
          <button className="copy-email" onClick={copy}>
            {copied ? "✓ 已复制邮箱" : "复制邮箱地址"}
          </button>
          <p className="copy-feedback" role="status">
            {message}
          </p>
          <div className="contact-brief">
            <h3>一封邮件，就可以开始。</h3>
            <p>
              可以告诉我项目的类型、视觉方向、制作范围和预计时间。附上参考画面，会让我们更快进入同一个世界。
            </p>
          </div>
        </>
      )}
      <LineLink href="#/faq" zh="了解合作流程" className="center-link">
        ABOUT COMMISSIONS
      </LineLink>
    </section>
  );
}
const faqItems = [
  [
    "可以合作哪些类型的项目？",
    "游戏宣传影像、角色与场景灯光、静帧渲染、镜头合成、色彩与氛围开发。具体制作范围可以根据项目需求一起确定。",
  ],
  [
    "开始沟通前，需要准备什么？",
    "请准备项目简述、视觉参考、现有素材、交付规格和大致时间安排。需求尚未完全确定也可以先聊。",
  ],
  [
    "合作流程是怎样的？",
    "通常从需求沟通开始，确认制作范围与视觉方向，再进入测试、制作和反馈调整，最后交付确认后的文件。",
  ],
  [
    "怎样确认报价和项目周期？",
    "报价与周期取决于镜头数量、素材完整度、制作难度和交付要求。请通过邮箱发送需求，沟通后再确认。",
  ],
  [
    "可以在哪里查看项目的具体信息？",
    "点击作品封面可查看完整画面与项目简介。Lighting 分类已收录场景灯光作品，其他分类中标注的占位内容将陆续替换。",
  ],
];
function FAQ() {
  return (
    <section className="section page-section faq-page">
      <OutlineHeading>FAQ</OutlineHeading>
      <p className="page-intro">
        关于合作的一些问题。
        <br />
        <span>Good work begins with a good conversation.</span>
      </p>
      <div className="faq-list">
        {faqItems.map(([question, answer], index) => (
          <details key={question}>
            <summary>
              <small>0{index + 1}</small>
              <span>{question}</span>
              <b>+</b>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <LineLink href="#/contact" zh="聊聊你的项目" className="right-link">
        GET IN TOUCH
      </LineLink>
    </section>
  );
}
function ProfilePage() {
  return (
    <section className="section page-section profile-page">
      <OutlineHeading>PROFILE</OutlineHeading>
      <div className="profile-page-grid">
        <div className="portrait-panel">
          <Portrait />
          <span>HELLO, WORLD!</span>
          <small>人物插画为头像占位</small>
        </div>
        <div className="profile-biography">
          <span className="eyebrow">RENDERING & COMPOSITING ARTIST</span>
          <h1>
            李天纯<span>TristanLee</span>
          </h1>
          <h3>
            在光影之间，
            <br />
            寻找画面的情绪。
          </h3>
          <p>{site.profileLead}</p>
          <p>{site.profileBody}</p>
          <p className="profile-english">
            I work at the intersection of light, color and storytelling. This is
            a space for rendering, compositing and visual exploration in games.
          </p>
          <div className="skills">
            {skillTags.map((tag) => (
              <div key={tag.en}>
                <b>{tag.zh}</b>
                <span>{tag.en}</span>
              </div>
            ))}
          </div>
          <LineLink href="#/contact" zh="联系我">
            SAY HELLO
          </LineLink>
        </div>
      </div>
    </section>
  );
}
function WorkDetail({
  work,
  favorite,
  toggle,
}: {
  work: Work;
  favorite: boolean;
  toggle: (id: string) => void;
}) {
  const next = works[(works.indexOf(work) + 1) % works.length];
  return (
    <section className="section page-section work-detail">
      <a href={`#/work?category=${work.group}`} className="breadcrumb">
        WORK / {work.titleEn}
      </a>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">
            {work.category} / {work.year}
          </p>
          <h1>{work.title}</h1>
          <p>{work.titleEn}</p>
        </div>
        <div className="detail-actions">
          <LikeButton id={work.id} title={work.title} />
          <button
            className={`detail-save favorite-button ${favorite ? "selected" : ""}`}
            onClick={() => toggle(work.id)}
            aria-pressed={favorite}
          >
            <Icon name="star" />
            <span>{favorite ? "已收藏" : "收藏作品"}</span>
          </button>
        </div>
      </div>
      <div
        className={`detail-hero ${work.kind !== "image" ? "is-screen" : ""} ${!work.isPlaceholder && work.kind === "image" ? "is-artwork" : ""}`}
      >
        {work.kind === "video" && work.videoSrc ? (
          <video
            controls
            playsInline
            preload="metadata"
            poster={assetUrl(work.image)}
            src={
              /^https?:\/\//.test(work.videoSrc)
                ? work.videoSrc
                : assetUrl(work.videoSrc)
            }
            aria-label={work.title}
          />
        ) : (
          <>
            <img
              src={assetUrl(work.image)}
              alt={
                work.imageAlt ??
                `${work.title}${work.isPlaceholder ? "占位项目视觉" : ""}`
              }
            />
            {work.isPlaceholder && (
              <span>PLACEHOLDER PROJECT / {work.index}</span>
            )}
          </>
        )}
      </div>
      {((work.kind === "video" && !work.videoSrc) ||
        (work.kind === "game" && !work.demoUrl)) && (
        <div className="detail-media-status">
          <WorkTypeIcon kind={work.kind} />
          <div>
            <strong>
              {work.kind === "video"
                ? "MINI THEATER / 影片待补充"
                : "GAME DEMOS / 试玩待开放"}
            </strong>
            <p>
              {work.kind === "video"
                ? "这里将展示完整短片与镜头合成过程，当前为视频案例占位。"
                : "这里将展示游戏演示、操作说明与试玩入口，当前为小游戏案例占位。"}
            </p>
          </div>
        </div>
      )}
      {work.kind === "game" && work.demoUrl && (
        <a
          className="demo-launch"
          href={work.demoUrl}
          target="_blank"
          rel="noreferrer"
        >
          <WorkTypeIcon kind="game" /> PLAY DEMO <Icon name="arrow" />
        </a>
      )}
      <div className="detail-body">
        <div>
          <h2>ABOUT THE PROJECT</h2>
          <p className="detail-lead">{work.description}</p>
          {work.details.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {work.credit && <p className="detail-credit">{work.credit}</p>}
        </div>
        <dl>
          <div>
            <dt>DISCIPLINE</dt>
            <dd>{work.categoryEn}</dd>
          </div>
          <div>
            <dt>ARTIST</dt>
            <dd>TristanLee 李天纯</dd>
          </div>
          <div>
            <dt>{work.isPlaceholder ? "STATUS" : "YEAR"}</dt>
            <dd>{work.isPlaceholder ? "占位项目 · 待替换" : work.year}</dd>
          </div>
        </dl>
      </div>
      <div className="detail-next">
        <LineLink href="#/work" zh="返回作品列表">
          ALL WORK
        </LineLink>
        <LineLink href={`#/work/${next.id}`} zh={next.title}>
          NEXT PROJECT
        </LineLink>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <>
      <FlowerScene />
      <footer className="site-footer">
        <div className="footer-identity">
          <span>Rendering & compositing artist</span>
          <b>李 天 纯</b>
          <span className="footer-spark" aria-hidden="true">
            ✳
          </span>
        </div>
        <a href="#/" className="footer-brand" aria-label="TristanLee 返回首页">
          TRISTANLEE
        </a>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TRISTANLEE</span>
          <nav aria-label="页脚导航">
            {navigation.map((item) => (
              <a key={item.id} href={`#/${item.id}`}>
                {item.en}
              </a>
            ))}
          </nav>
          <a href="#/privacy">Privacy Policy</a>
          <button
            className="back-top"
            aria-label="返回页面顶部"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Icon name="up" />
          </button>
        </div>
      </footer>
    </>
  );
}
type Overlay = "menu" | "search" | null;
export default function App() {
  const [rawRoute, setRoute] = useState(
    () => window.location.hash.replace(/^#\/?/, "") || "home",
  );
  const [route, routeQuery = ""] = rawRoute.split("?");
  const categoryParam = new URLSearchParams(routeQuery).get("category");
  const workCategory = workCategories.some((item) => item.id === categoryParam)
    ? categoryParam!
    : "lighting";
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem("tristanlee-favorites") || "[]",
      );
      return Array.isArray(value)
        ? value.filter(
            (id): id is string =>
              typeof id === "string" && works.some((work) => work.id === id),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const navigate = () => {
      setRoute(window.location.hash.replace(/^#\/?/, "") || "home");
      setOverlay(null);
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() =>
        mainRef.current?.focus({ preventScroll: true }),
      );
    };
    window.addEventListener("hashchange", navigate);
    return () => {
      window.removeEventListener("hashchange", navigate);
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("tristanlee-favorites", JSON.stringify(favorites));
    } catch {
      /* Private browsing may deny storage. */
    }
  }, [favorites]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (overlay && dialog && !dialog.open) dialog.showModal();
    if (!overlay && dialog?.open) dialog.close();
    document.body.style.overflow = overlay ? "hidden" : "";
    if (overlay === "search") searchRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlay]);
  const toggle = (id: string) => {
    const exists = favorites.includes(id);
    setFavorites((value) =>
      exists ? value.filter((item) => item !== id) : [...value, id],
    );
    setToast(exists ? "已取消收藏" : "已加入收藏");
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2000);
  };
  const selectedWork = route.startsWith("work/")
    ? works.find((work) => work.id === route.slice(5))
    : undefined;
  const newsIndex = Number(route.split("/")[1]);
  const article =
    route.startsWith("news/") && Number.isInteger(newsIndex)
      ? newsItems[newsIndex]
      : undefined;
  const searchResults = query.trim()
    ? works.filter((work) => {
        const category = workCategories.find((item) => item.id === work.group);
        return `${work.title} ${work.titleEn} ${work.category} ${work.categoryEn} ${work.description} ${category?.en} ${category?.zh}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      })
    : works.slice(0, 4);
  const page = route.split("/")[0];
  useEffect(() => {
    const label =
      selectedWork?.title ||
      navigation.find((item) => item.id === page)?.zh ||
      (page === "favorites" ? "收藏" : "作品集");
    document.title = `${label} | 李天纯 TristanLee — 游戏渲染合成师`;
  }, [page, selectedWork]);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        跳到主要内容
      </a>
      <header className="site-header">
        <a
          href="#/"
          className="header-logo"
          aria-label="李天纯 · 影视游戏渲染师 / TristanLee · Lighting Artist — 首页"
        >
          <Brand />
        </a>
        <p className="header-intro">
          <span lang="zh-CN">灯光渲染艺术家，用光、色彩与想象创作</span>
          <span lang="en">
            Rendering &amp; Compositing Artist, creating with light, color and
            imagination.
          </span>
        </p>
        <nav className="desktop-nav" aria-label="主导航">
          {navigation.map((item) => (
            <a
              href={`#/${item.id}`}
              key={item.id}
              className={page === item.id ? "active" : ""}
              aria-current={page === item.id ? "page" : undefined}
            >
              <span>{item.en}</span>
              <span>{item.zh}</span>
            </a>
          ))}
          <a
            href="#/favorites"
            className="nav-icon"
            aria-label={`收藏作品，共${favorites.length}个`}
          >
            <Icon name="star" />
            {favorites.length > 0 && <small>{favorites.length}</small>}
          </a>
          <button
            className="nav-icon"
            aria-label="搜索作品"
            onClick={() => setOverlay("search")}
          >
            <Icon name="search" />
          </button>
        </nav>
      </header>
      <main id="main-content" ref={mainRef} tabIndex={-1} key={route}>
        {page === "home" || route === "" ? (
          <>
            <Hero />
            <Works favorites={favorites} toggle={toggle} />
            <ProfileCard />
            <News />
            <Journal />
            <Contact />
          </>
        ) : selectedWork ? (
          <>
            <WorkDetail
              work={selectedWork}
              favorite={favorites.includes(selectedWork.id)}
              toggle={toggle}
            />
            <Contact />
          </>
        ) : route === "work" ? (
          <>
            <Works
              favorites={favorites}
              toggle={toggle}
              full
              selectedCategory={workCategory}
              onCategoryChange={(category) => {
                window.location.hash = `#/work?category=${category}`;
              }}
            />
            <Contact />
          </>
        ) : route === "favorites" ? (
          <Works favorites={favorites} toggle={toggle} savedOnly full />
        ) : route === "profile" ? (
          <>
            <ProfilePage />
            <Contact />
          </>
        ) : route === "news" ? (
          <>
            <News full />
            <Contact />
          </>
        ) : article ? (
          <section className="section page-section article-page">
            <a href="#/news" className="breadcrumb">
              NEWS / JOURNAL
            </a>
            <time>{article.date}</time>
            <h1>{article.title}</h1>
            <p className="article-subtitle">{article.en}</p>
            <img
              src={assetUrl(works[(newsIndex * 3) % works.length].image)}
              alt="作品集动态封面"
            />
            <p>{article.body}</p>
            <LineLink href="#/news" zh="返回动态列表">
              ALL NEWS
            </LineLink>
          </section>
        ) : route === "faq" ? (
          <FAQ />
        ) : route === "contact" ? (
          <Contact full />
        ) : route === "privacy" ? (
          <section className="section page-section privacy-page">
            <OutlineHeading>PRIVACY</OutlineHeading>
            <h1>隐私说明</h1>
            <p>
              本作品集没有账户系统。收藏记录仅保存在当前浏览器的本地存储中，你可以通过取消收藏或清除站点数据删除。
            </p>
            <p>
              点赞使用匿名浏览器 Cookie
              识别你的点赞状态，并将匿名标识与作品编号保存在 Cloudflare
              数据库中。作品点赞总数向所有访客公开；你可以再次点击红心取消点赞。清除浏览器站点数据会移除本机匿名标识，但不会自动撤销已提交的点赞。
            </p>
            <p>
              联系邮箱链接会打开你自己的邮件应用。只有主动发送邮件后，收件人才会收到你提供的信息。
            </p>
            <p>
              页面字体由 Google Fonts
              提供，加载字体时浏览器会连接该服务。所有作品图片均随网站本地提供。
            </p>
            <LineLink href="#/" zh="返回首页">
              BACK HOME
            </LineLink>
          </section>
        ) : (
          <section className="section page-section empty-state">
            <OutlineHeading>404</OutlineHeading>
            <h1>这个画面暂时不在这里。</h1>
            <LineLink href="#/" zh="返回首页">
              BACK HOME
            </LineLink>
          </section>
        )}
      </main>
      <Footer />
      <button
        className="floating-search"
        aria-label="搜索作品"
        onClick={() => setOverlay("search")}
      >
        <span>SEARCH</span>
        <Icon name="search" />
      </button>
      <div className="mobile-toolbar">
        <button aria-label="搜索作品" onClick={() => setOverlay("search")}>
          <Icon name="search" />
        </button>
        <button onClick={() => setOverlay("menu")} aria-haspopup="dialog">
          <Icon name="menu" /> MENU
        </button>
      </div>
      <dialog
        ref={dialogRef}
        className={`site-dialog ${overlay === "search" ? "search-dialog" : "menu-dialog"}`}
        aria-label={overlay === "search" ? "搜索作品" : "导航菜单"}
        onCancel={() => setOverlay(null)}
        onClose={() => setOverlay(null)}
      >
        <div className="overlay-header">
          <a
            href="#/"
            aria-label="李天纯 · 影视游戏渲染师 / TristanLee · Lighting Artist — 返回首页"
            onClick={() => setOverlay(null)}
          >
            <Brand />
          </a>
          <button
            className="overlay-close"
            aria-label="关闭弹窗"
            onClick={() => setOverlay(null)}
          >
            <Icon name="close" />
            <span>CLOSE</span>
          </button>
        </div>
        {overlay === "menu" ? (
          <div className="menu-content">
            <nav aria-label="菜单导航">
              {navigation.map((item, i) => (
                <a
                  href={`#/${item.id}`}
                  key={item.id}
                  onClick={() => setOverlay(null)}
                >
                  <small>0{i + 1}</small>
                  <b>{item.en}</b>
                  <span>{item.zh}</span>
                  <Icon name="arrow" />
                </a>
              ))}
              <a href="#/favorites" onClick={() => setOverlay(null)}>
                <small>{String(navigation.length + 1).padStart(2, "0")}</small>
                <b>FAVORITES</b>
                <span>收藏 ({favorites.length})</span>
                <Icon name="star" />
              </a>
            </nav>
            <p>
              LIGHT. COLOR. IMAGINATION.
              <br />
              <span>李天纯 / TristanLee</span>
            </p>
          </div>
        ) : (
          <div className="search-content">
            <OutlineHeading>SEARCH WORK</OutlineHeading>
            <p>寻找一种光，一种色彩，一个画面。</p>
            <label className="search-input">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索作品、风格或关键词…"
                aria-label="搜索作品关键词"
              />
              <Icon name="search" />
            </label>
            <div className="search-results-header">
              {query.trim()
                ? `${searchResults.length} RESULTS / 搜索结果`
                : "EXPLORE / 看看这些画面"}
            </div>
            <div className="search-results">
              {searchResults.map((work) => (
                <a
                  key={work.id}
                  href={`#/work/${work.id}`}
                  onClick={() => setOverlay(null)}
                >
                  <img
                    src={assetUrl(work.image)}
                    alt=""
                    style={{ objectPosition: work.imagePosition }}
                  />
                  <span>
                    <b>{work.title}</b>
                    <small>{work.titleEn}</small>
                  </span>
                  <Icon name="arrow" />
                </a>
              ))}
            </div>
            {searchResults.length === 0 && (
              <p className="no-results">
                暂时没有匹配的作品，试试「灯光」「游戏」「合成」或「插画」。
              </p>
            )}
          </div>
        )}
      </dialog>
      <div className={`toast ${toast ? "show" : ""}`} role="status">
        <Icon name="star" />
        {toast}
      </div>
    </>
  );
}
