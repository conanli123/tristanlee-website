import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { mediaTiles, newsItems, site, skillTags, works } from './data/site'
import type { Work } from './data/site'
import { assetUrl } from './data/assetUrl'
import { useReducedMotion } from './hooks/useTypewriter'
import { useVideoScrub } from './hooks/useVideoScrub'

/* ---------- 图标 ---------- */

function Arrow({ className = '' }: { className?: string }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>
}
function ArrowLeft({ className = '' }: { className?: string }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12H5M11 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>
}
function Asterisk({ className = '' }: { className?: string }) {
  return <svg className={className} width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M7.3 32.7 32.7 7.3" stroke="currentColor" strokeWidth="5" strokeLinecap="square" /></svg>
}
function CopyIcon({ copied = false }: { copied?: boolean }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">{copied ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /> : <><rect x="8" y="8" width="12" height="12" stroke="currentColor" strokeWidth="2" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2" /></>}</svg>
}

/* ---------- 品牌与导航 ---------- */

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'is-compact' : ''}`}>
      <span className="brand-en">{site.titleEn}</span>
      <span className="brand-name"><b>TRISTANLEE</b><i>{site.chineseName}</i></span>
    </span>
  )
}

const navItems = [
  { id: 'work', label: 'WORK', zh: '作品' },
  { id: 'profile', label: 'PROFILE', zh: '关于' },
  { id: 'news', label: 'NEWS', zh: '动态' },
  { id: 'contact', label: 'CONTACT', zh: '联系' },
]

/* ---------- 首屏轮播 ---------- */

const slides = works.filter(work => work.kind !== 'game')

function HeroSlide({ work, active }: { work: Work; active: boolean }) {
  if (work.kind === 'video') {
    return <div className="slide" aria-hidden={!active}><video src={assetUrl(site.video)} poster={assetUrl(work.image)} muted loop playsInline autoPlay={active} /></div>
  }
  return <div className="slide" aria-hidden={!active}><img src={assetUrl(work.image)} alt="" loading={active ? 'eager' : 'lazy'} draggable={false} /></div>
}

/* ---------- 游戏原型（可玩） ---------- */

function LightCatchGame() {
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(15)
  const [target, setTarget] = useState({ x: 52, y: 46 })
  const move = () => setTarget({ x: 10 + Math.random() * 80, y: 16 + Math.random() * 68 })
  const start = () => { setScore(0); setTime(15); setState('playing'); move() }
  useEffect(() => {
    if (state !== 'playing') return
    const timer = window.setInterval(() => setTime(value => {
      if (value <= 1) { window.clearInterval(timer); setState('done'); return 0 }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [state])
  return <div className="game-box">
    <div className="game-hud"><span>SCORE <b>{String(score).padStart(2, '0')}</b></span><span>TIME <b>{String(time).padStart(2, '0')}</b></span></div>
    <div className="game-stage">
      <div className="game-grid" aria-hidden="true" />
      {state === 'playing' && <button type="button" className="light-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} aria-label="捕捉光点" onClick={() => { setScore(v => v + 1); move() }}><span /></button>}
      {state !== 'playing' && <div className="game-intro"><Asterisk /><h4>{state === 'done' ? `捕捉到 ${score} 个光点` : '光点捕捉'}</h4><p>{state === 'done' ? '再来一次，试试打破自己的记录。' : '15 秒内，点击尽可能多的移动光点。'}</p><button type="button" onClick={start}>{state === 'done' ? '重新开始' : '开始游戏'} <Arrow /></button></div>}
    </div>
  </div>
}

/* ---------- 作品详情弹窗 ---------- */

type Panel = { id: string } | null

function DetailDialog({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const work = panel ? works.find(item => item.id === panel.id) : null
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (panel && !dialog.open) dialog.showModal()
    if (!panel && dialog.open) dialog.close()
  }, [panel])
  return <dialog ref={ref} className="detail-dialog" aria-labelledby="detail-title" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <button type="button" className="dialog-close" onClick={onClose} aria-label="关闭详情"><span /><span /></button>
    {work && <div className="dialog-inner">
      <div className="dialog-media">
        {work.kind === 'video'
          ? <video src={assetUrl(site.video)} poster={assetUrl(work.image)} controls muted playsInline>你的浏览器不支持视频播放。</video>
          : <img src={assetUrl(work.image)} alt={`${work.title} ${work.titleEn}`} />}
        <span className="dialog-tag">{work.category} ｜ {work.year}</span>
      </div>
      <div className="dialog-copy">
        <p className="dialog-en">{work.titleEn}</p>
        <h2 id="detail-title">{work.title}</h2>
        <p className="dialog-desc">{work.description}</p>
        {work.kind === 'game' && work.id === 'light-catch' && <LightCatchGame />}
        {work.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        {work.credit && <p className="dialog-credit">{work.credit}</p>}
        <a className="dialog-mail" href={`mailto:${site.email}`}>合作 / 讨论此作品 <Arrow /></a>
      </div>
    </div>}
  </dialog>
}

/* ---------- 滚动显现 ---------- */

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { element.classList.add('is-visible'); observer.disconnect() } }, { threshold: 0.08 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>
}

/* ---------- 主组件 ---------- */

export default function App() {
  const reducedMotion = useReducedMotion()
  const [slide, setSlide] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [filter, setFilter] = useState('全部')
  const [panel, setPanel] = useState<Panel>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('work')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const menuRef = useRef<HTMLDialogElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { videoRef, ready, failed, progress, seekTo } = useVideoScrub(reducedMotion, menuOpen || Boolean(panel))

  const goSlide = useCallback((next: number) => {
    setSlide((next + slides.length) % slides.length)
  }, [])

  // 自动轮播
  useEffect(() => {
    if (reducedMotion || heroPaused) return
    const timer = window.setTimeout(() => setSlide(v => (v + 1) % slides.length), 6000)
    return () => window.clearTimeout(timer)
  }, [slide, heroPaused, reducedMotion])

  // 键盘左右切换
  useEffect(() => {
    if (reducedMotion) return
    const onKey = (event: KeyboardEvent) => {
      if (menuOpen || panel) return
      if (event.key === 'ArrowRight') goSlide(slide + 1)
      if (event.key === 'ArrowLeft') goSlide(slide - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goSlide, slide, menuOpen, panel, reducedMotion])

  // 高亮当前区块
  useEffect(() => {
    const sections = document.querySelectorAll('main > section[id]')
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id) }), { rootMargin: '-30% 0px -55% 0px' })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // 弹窗 / 菜单时锁滚动
  useEffect(() => { document.body.style.overflow = menuOpen || panel ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [menuOpen, panel])
  useEffect(() => {
    const dialog = menuRef.current
    if (menuOpen && !dialog?.open) dialog?.showModal()
    if (!menuOpen && dialog?.open) dialog.close()
    const query = window.matchMedia('(min-width: 1181px)')
    const handleResize = () => { if (query.matches) setMenuOpen(false) }
    query.addEventListener('change', handleResize)
    return () => query.removeEventListener('change', handleResize)
  }, [menuOpen])

  async function copyEmail() {
    clearTimeout(copyTimer.current)
    try { await navigator.clipboard.writeText(site.email); setCopied(true); setToast('邮箱已复制，期待收到你的消息。') }
    catch { setToast(`复制未成功，请手动复制：${site.email}`) }
    copyTimer.current = setTimeout(() => { setCopied(false); setToast('') }, 3500)
  }

  const filterGroups: Record<string, string> = { '图片作品': 'image', '动态影像': 'motion', '游戏原型': 'game' }
  const visibleWorks = filter === '全部' ? works : works.filter(work => work.group === filterGroups[filter])
  const counts: Record<string, number> = {
    '全部': works.length,
    '图片作品': works.filter(work => work.group === 'image').length,
    '动态影像': works.filter(work => work.group === 'motion').length,
    '游戏原型': works.filter(work => work.group === 'game').length,
  }
  const activeWork = slides[slide]

  return <>
    <a className="skip-link" href="#work">跳到作品展示</a>

    {/* 顶栏 */}
    <header className={`site-header ${menuOpen ? 'is-open' : ''}`}>
      <a className="logo" href="#home" aria-label={`${site.chineseName} ${site.name}，返回首页`}><Brand /></a>
      <p className="header-tagline">{site.title} · 专注光影、材质、色彩与最终画面</p>
      <nav className="desktop-nav" aria-label="主导航">{navItems.map(item => <a key={item.id} className={activeSection === item.id ? 'active' : ''} href={`#${item.id}`}><b>{item.label}</b><i>{item.zh}</i></a>)}</nav>
      <button type="button" className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} aria-label="打开导航菜单" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
    </header>

    {/* 手机菜单 */}
    <dialog ref={menuRef} id="mobile-menu" className="mobile-menu" aria-label="导航菜单" onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)}>
      <div className="mobile-menu-top"><a className="logo" href="#home" onClick={() => setMenuOpen(false)}><Brand compact /></a><button type="button" className="menu-toggle is-open" aria-label="关闭导航菜单" onClick={() => setMenuOpen(false)}><span /><span /><span /></button></div>
      <nav aria-label="手机主导航">{navItems.map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><span className="menu-number">0{index + 1}</span>{item.label}<i>{item.zh}</i><Arrow /></a>)}</nav>
      <p className="menu-footer">{site.titleEn} — {site.title}</p>
    </dialog>

    <main>
      {/* 首屏 */}
      <section className="hero" id="home" aria-label="首屏展示">
        <div className="hero-decor" aria-hidden="true">
          <Asterisk className="spin-slow star-a" />
          <span className="circle-b" />
          <span className="line-h line-h1" />
          <span className="line-h line-h2" />
        </div>

        <div className="hero-intro">
          <p className="eyebrow"><span className="dot" /> {site.titleEn} <i>{site.title}</i></p>
          <h1>让每一帧，<br />都拥有自己的<span className="hl">情绪。</span></h1>
          <p className="hero-copy">{site.heroIntro}</p>
          <p className="hero-copy-en">{site.heroIntroEn}</p>
        </div>

        <div
          className="hero-stage"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className="slides" aria-live="polite">
            {slides.map((work, index) => (
              <div key={work.id} className={`slide-wrap ${index === slide ? 'is-active' : ''}`}>
                <HeroSlide work={work} active={index === slide} />
              </div>
            ))}
          </div>
          <span className="stage-corner tl" aria-hidden="true" /><span className="stage-corner br" aria-hidden="true" />
          {activeWork.kind === 'video' && <button type="button" className="video-hint" onClick={() => setPanel({ id: 'character-study' })}>▶ PLAY FILM</button>}
        </div>

        <div className="hero-foot">
          <p className="slide-caption">
            <span className="slide-meta">{activeWork.category} {activeWork.categoryEn} ｜ {activeWork.year}</span>
            <span className="slide-title">{activeWork.title}<i>{activeWork.titleEn}</i></span>
          </p>
          <div className="hero-ctrl">
            <button type="button" className="ctrl-btn" onClick={() => goSlide(slide - 1)} aria-label="上一个作品"><ArrowLeft /></button>
            <span className="hero-count">{String(slide + 1).padStart(2, '0')} <i>/ {String(slides.length).padStart(2, '0')}</i></span>
            <button type="button" className="ctrl-btn" onClick={() => goSlide(slide + 1)} aria-label="下一个作品"><Arrow /></button>
          </div>
        </div>

        <a className="scroll-hint" href="#work"><span>SCROLL</span><i>↓</i></a>
      </section>

      {/* 跑马灯 */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(row => <span key={row}>{Array.from({ length: 3 }).map((_, i) => <b key={i}>{site.titleEn} ★ {site.title} ★ LIGHT · COLOR · FINAL FRAME ★ 光影 · 材质 · 色彩 · 叙事 ★</b>)}</span>)}
        </div>
      </div>

      {/* 作品 */}
      <section id="work" className="work-section" aria-labelledby="work-heading">
        <Reveal>
          <header className="section-head">
            <div><p className="kicker">01 / WORKS <i>作品</i></p><h2 id="work-heading">WORKS<span className="head-zh">作品</span></h2></div>
            <p className="head-note">图片静帧 · 动态影像 · 游戏原型<br />IMAGES · MOTION · GAME DEMOS</p>
          </header>
          <div className="filters" role="group" aria-label="按作品类型筛选">
            {Object.keys(counts).map(category => (
              <button type="button" key={category} aria-pressed={filter === category} className={filter === category ? 'selected' : ''} onClick={() => setFilter(category)}>
                {category} <i>({counts[category]})</i>
              </button>
            ))}
          </div>
          <div className="work-grid">
            {visibleWorks.map(work => (
              <button type="button" key={work.id} className="work-card" onClick={() => setPanel({ id: work.id })} aria-label={`查看${work.title}`}>
                <span className="work-thumb">
                  {work.kind === 'video'
                    ? <video src={assetUrl(site.video)} poster={assetUrl(work.image)} muted loop playsInline preload="none" />
                    : <img src={assetUrl(work.image)} alt={`${work.title} ${work.titleEn}`} loading="lazy" />}
                  <span className="thumb-arrow"><Arrow /></span>
                  {work.kind === 'game' && <span className="thumb-tag">PLAY</span>}
                </span>
                <span className="work-meta"><b>{work.category} {work.categoryEn} ｜ {work.year}</b><i>{work.index}</i></span>
                <span className="work-title"><b>{work.title}</b><i>{work.titleEn}</i></span>
              </button>
            ))}
          </div>
          <p className="work-note">部分展示图为风格参考素材 · 个人原创作品陆续更新 / SOME IMAGES ARE STYLE REFERENCES — ORIGINAL WORKS COMING SOON</p>
        </Reveal>
      </section>

      {/* 关于 */}
      <section id="profile" className="profile-section" aria-labelledby="profile-heading">
        <Reveal className="profile-grid">
          <div className="profile-visual">
            <div className="video-frame">
              <video ref={videoRef} className={ready ? 'is-ready' : ''} src={assetUrl(site.video)} muted playsInline preload="auto" disablePictureInPicture tabIndex={-1} poster={assetUrl('media/char-01.jpg')} />
              <div className="frame-meta"><span>CHARACTER STUDY</span><Asterisk className="spin-slow" /></div>
            </div>
            <div className="scrub-row">
              <span className="scrub-icon" aria-hidden="true">↔</span>
              <label htmlFor="video-scrub">{failed ? '静态画面 · 同样值得探索' : reducedMotion ? '拖动滑块，探索角色' : '移动鼠标，看看另一帧'}</label>
              <input id="video-scrub" aria-label="调整角色视频画面" type="range" min="0" max="100" value={Math.round(progress * 100)} disabled={failed || !ready} onChange={event => seekTo.current(Number(event.target.value) / 100)} style={{ '--progress': `${progress * 100}%` } as CSSProperties} />
            </div>
          </div>
          <div className="profile-copy">
            <p className="kicker">02 / PROFILE <i>关于</i></p>
            <p className="profile-en">ARTIST · NO.001 — {site.titleEn}</p>
            <h2 id="profile-heading">HELLO,<br />WORLD<span className="head-zh">你好</span></h2>
            <p className="profile-lead">{site.profileLead}</p>
            <p className="profile-body">{site.profileBody}</p>
            <ul className="skill-tags">{skillTags.map(tag => <li key={tag.en}><span>{tag.zh}</span><i>{tag.en}</i></li>)}</ul>
            <a className="text-link" href="#contact">一起创造点什么 <i>LET'S CREATE</i> <Arrow /></a>
          </div>
        </Reveal>
      </section>

      {/* 动态 */}
      <section id="news" className="news-section" aria-labelledby="news-heading">
        <Reveal>
          <header className="section-head">
            <div><p className="kicker">03 / NEWS <i>动态</i></p><h2 id="news-heading">NEWS<span className="head-zh">动态</span></h2></div>
            <p className="head-note">最近更新<br />RECENT UPDATES</p>
          </header>
          <div className="news-list">
            {newsItems.map(item => (
              <a key={item.date} className="news-row" href="#contact" onClick={event => event.preventDefault()}>
                <span className="news-date">{item.date}</span>
                <span className="news-title"><b>{item.title}</b><i>{item.en}</i></span>
                <span className="news-arrow"><Arrow /></span>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 图集 */}
      <section id="media" className="media-section" aria-labelledby="media-heading">
        <Reveal>
          <header className="section-head">
            <div><p className="kicker">04 / MEDIA <i>图集</i></p><h2 id="media-heading">MEDIA<span className="head-zh">图集</span></h2></div>
            <p className="head-note">更多作品，敬请期待<br />MORE WORKS COMING SOON</p>
          </header>
          <div className="media-grid">
            {mediaTiles.map((image, index) => (
              <a key={`${image}-${index}`} className="media-tile" href="#work" onClick={event => { event.preventDefault(); setFilter('全部') }}>
                <img src={assetUrl(image)} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 联系 */}
      <section id="contact" className="contact-section" aria-labelledby="contact-heading">
        <Reveal>
          <p className="kicker">05 / CONTACT <i>联系</i></p>
          <h2 id="contact-heading">一起创作<span className="hl">点什么。</span></h2>
          <p className="contact-intro">制作委托、项目合作与交流，请从这里联系我们。<br /><i>FOR COMMISSIONS &amp; COLLABORATIONS, PLEASE GET IN TOUCH.</i></p>
          <div className="contact-actions">
            <a className="email-block" href={`mailto:${site.email}`}>{site.email}<Arrow /></a>
            <button type="button" className="copy-btn" onClick={copyEmail}><CopyIcon copied={copied} />{copied ? '已复制' : '复制邮箱'}</button>
          </div>
          <footer className="site-footer">
            <span className="footer-brand"><Brand compact /></span>
            <span className="footer-copy">© {new Date().getFullYear()} {site.chineseName} {site.name} — {site.title}</span>
            <a className="back-top" href="#home">BACK TO TOP <span>↑</span></a>
          </footer>
        </Reveal>
      </section>
    </main>

    <DetailDialog panel={panel} onClose={() => setPanel(null)} />
    <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite"><span>✓</span>{toast}</div>
  </>
}
