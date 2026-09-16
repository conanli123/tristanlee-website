import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { projects, site } from './data/site'
import { useReducedMotion, useTypewriter } from './hooks/useTypewriter'
import { useVideoScrub } from './hooks/useVideoScrub'

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={diagonal ? 'arrow-diagonal' : ''}><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function CopyIcon({ copied = false }: { copied?: boolean }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">{copied ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : <><rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.5" /></>}</svg>
}

function Asterisk({ className = '' }: { className?: string }) {
  return <svg className={className} width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M7.3 32.7 32.7 7.3" stroke="currentColor" strokeWidth="4.5" /></svg>
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-lockup ${compact ? 'compact' : ''}`}><span className="brand-names"><b>{site.chineseName}</b><span>{site.name}</span></span><Asterisk /></span>
}

const navItems = [
  { label: '首页', id: 'home' },
  { label: '作品', id: 'work' },
  { label: '小剧场', id: 'theater' },
  { label: '游戏demo', id: 'demos' },
  { label: '领域展开', id: 'about' },
]

const theaterItems = [
  { number: '01', title: '角色印象短片', subtitle: 'CHARACTER STUDY', poster: 'art/kena.jpg', note: '角色灯光 / 表情 / 质感' },
  { number: '02', title: '氛围与空间', subtitle: 'LIGHT & SPACE', poster: 'art/elden-ring.jpg', note: '环境照明 / 空间雾 / 调色' },
  { number: '03', title: '风格化镜头', subtitle: 'STYLIZED FRAME', poster: 'art/wuthering-waves.jpg', note: '风格探索 / 合成 / 镜头节奏' },
]

type Panel = { id: string } | null

function DetailDialog({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const project = panel ? projects.find(item => item.id === panel.id) : null
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (panel && !dialog.open) dialog.showModal()
    if (!panel && dialog.open) dialog.close()
  }, [panel])
  return <dialog ref={ref} className="detail-dialog" aria-labelledby="detail-title" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="dialog-inner">
      <button type="button" className="dialog-close" onClick={onClose} aria-label="关闭详情"><span /><span /></button>
      {project && <><img className="dialog-image" src={`${import.meta.env.BASE_URL}${project.image}`} alt={`${project.subtitle}视觉参考`} /><div className="dialog-copy"><p className="eyebrow muted">IMAGE WORK / {project.number} <span>临时参考素材 · 非个人作品</span></p><h2 id="detail-title">{project.subtitle}</h2><p className="dialog-subtitle">{project.name}</p><div className="tag-list">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="image-credit">{project.credit}</p>{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-link">查看素材来源 <Arrow diagonal /></a>}</div></>}
    </div>
  </dialog>
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { element.classList.add('is-visible'); observer.disconnect() } }, { threshold: 0.08 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

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
  return <div className="playable-demo">
    <div className="demo-hud"><span>SCORE <b>{String(score).padStart(2, '0')}</b></span><span>TIME <b>{String(time).padStart(2, '0')}</b></span></div>
    <div className="demo-stage" aria-label="光点捕捉小游戏区域">
      <div className="demo-grid" aria-hidden="true" />
      {state === 'playing' && <button type="button" className="light-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} aria-label="捕捉光点" onClick={() => { setScore(value => value + 1); move() }}><span /></button>}
      {state !== 'playing' && <div className="demo-intro"><Asterisk /><h3>{state === 'done' ? `捕捉到 ${score} 个光点` : '光点捕捉'}</h3><p>{state === 'done' ? '再来一次，试试打破自己的记录。' : '15 秒内，点击尽可能多的移动光点。'}</p><button type="button" onClick={start}>{state === 'done' ? '重新开始' : '开始游戏'} <Arrow /></button></div>}
    </div>
  </div>
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [filter, setFilter] = useState('全部')
  const [activeSection, setActiveSection] = useState('home')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const [buttonsReady, setButtonsReady] = useState(false)
  const menuRef = useRef<HTMLDialogElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { displayed, done } = useTypewriter(site.introduction, 38, 600, reducedMotion)
  const { videoRef, ready, failed, progress, seekTo } = useVideoScrub(reducedMotion, menuOpen || Boolean(panel))

  useEffect(() => { const timer = setTimeout(() => setButtonsReady(true), 400); return () => { clearTimeout(timer); clearTimeout(copyTimer.current) } }, [])
  useEffect(() => {
    const sections = document.querySelectorAll('main > section[id]')
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id) }), { rootMargin: '-20% 0px -60% 0px' })
    sections.forEach(section => observer.observe(section)); return () => observer.disconnect()
  }, [])
  useEffect(() => { document.body.style.overflow = menuOpen || panel ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [menuOpen, panel])
  useEffect(() => {
    const dialog = menuRef.current
    if (menuOpen && !dialog?.open) dialog?.showModal()
    if (!menuOpen && dialog?.open) dialog.close()
    const query = window.matchMedia('(min-width: 1181px)')
    const handleResize = () => { if (query.matches) setMenuOpen(false) }
    query.addEventListener('change', handleResize); return () => query.removeEventListener('change', handleResize)
  }, [menuOpen])

  async function copyEmail() {
    clearTimeout(copyTimer.current)
    try { await navigator.clipboard.writeText(site.email); setCopied(true); setToast('邮箱已复制，期待收到你的消息。') }
    catch { setToast(`复制未成功，请手动复制：${site.email}`) }
    copyTimer.current = setTimeout(() => { setCopied(false); setToast('') }, 3500)
  }

  const visibleProjects = projects.filter(project => filter === '全部' || project.category === filter)
  const onLight = ['work', 'theater', 'about'].includes(activeSection)

  return <>
    <a className="skip-link" href="#work">跳到作品展示</a>
    <div className="hero-background" aria-hidden="true"><div className="background-fallback"><Asterisk className="fallback-star" /></div><video ref={videoRef} className={`hero-video ${ready ? 'is-ready' : ''}`} src={site.video} muted playsInline preload="auto" disablePictureInPicture tabIndex={-1} /><div className="video-shade" /><div className="grain" /></div>

    <header className={`site-header ${onLight ? 'on-light' : ''} ${activeSection !== 'home' ? 'is-scrolled' : ''}`}>
      <a className="logo brand-logo" href="#home" aria-label={`${site.chineseName} ${site.name}，返回首页`}><Brand /></a>
      <nav className="desktop-nav portfolio-nav" aria-label="主导航">{navItems.map(item => <a key={item.id} className={activeSection === item.id ? 'active' : ''} href={`#${item.id}`}>{item.label}</a>)}</nav>
      <a className="nav-contact" href="#contact">一起创造点什么 <Arrow diagonal /></a>
      <button type="button" className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} aria-label="打开导航菜单" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
    </header>

    <dialog ref={menuRef} id="mobile-menu" className="mobile-menu" aria-label="导航菜单" onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)}><div className="mobile-menu-top"><a className="logo" href="#home" onClick={() => setMenuOpen(false)}><Brand compact /></a><button type="button" className="menu-toggle is-open" aria-label="关闭导航菜单" onClick={() => setMenuOpen(false)}><span /><span /><span /></button></div><nav aria-label="手机主导航">{[...navItems, { label: '联系方式', id: 'contact' }].map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><span className="menu-number">0{index + 1}</span>{item.label}<Arrow diagonal /></a>)}</nav><p className="menu-footer">RENDERING · COMPOSITING · MOTION</p></dialog>

    <main>
      <section className="hero" id="home" aria-labelledby="hero-heading">
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="status-dot" /> RENDERING & COMPOSITING ARTIST <span className="eyebrow-line" /></div>
          <div className="blurred-intro" aria-hidden="true">渲染合成师<br />专注光影、材质、色彩与最终画面。</div>
          <h1 id="hero-heading">让每一帧，<br />都拥有<span className="playable-word">自己的情绪<svg viewBox="0 0 390 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12C100 3 253 3 382 7M67 16C182 9 300 9 375 12" /></svg></span><span className="title-period">。</span></h1>
          <p className="typewriter" aria-label={site.introduction}><span aria-hidden="true">{displayed}{!done && <span className="typing-cursor" />}</span></p>
          <div className={`hero-actions ${buttonsReady ? 'is-visible' : ''}`}><a href="#work" className="pill pill-primary">查看图片作品 <span className="pill-icon" aria-hidden="true" /></a><a href="#theater" className="pill">进入小剧场</a><a href="#demos" className="pill">试玩游戏 demo</a><a href="#about" className="pill">领域展开</a></div>
        </div>
        <div className="character-label" aria-hidden="true"><span className="tiny-cross">+</span><span>LIGHT. COLOR.<br />FINAL FRAME.</span><span className="character-index">( 01 / ∞ )</span></div>
        <div className="hero-footer"><a className="scroll-link" href="#work"><span className="scroll-circle">↓</span><span>往下探索<small>SCROLL TO DISCOVER</small></span></a><div className="scrub-control"><span className="scrub-icon" aria-hidden="true">↔</span><label htmlFor="video-scrub">{failed ? '静态画面 · 同样值得探索' : reducedMotion ? '拖动滑块，探索角色' : '移动鼠标，看看另一帧'}</label><input id="video-scrub" aria-label="调整背景视频画面" type="range" min="0" max="100" value={Math.round(progress * 100)} disabled={failed || !ready} onChange={event => seekTo.current(Number(event.target.value) / 100)} style={{ '--progress': `${progress * 100}%` } as CSSProperties} /></div><span className="hero-signature">CRAFTING THE FINAL FRAME <Asterisk /></span></div>
      </section>

      <section id="work" className="work-section light-section" aria-labelledby="work-heading"><Reveal><div className="section-kicker"><span>01 / IMAGE WORKS</span><span>光影、材质与画面的完成度。</span></div><div className="section-heading-row"><h2 id="work-heading">一些图片类的<span className="serif-word">作品。</span></h2><span className="work-count">( 03 )</span></div><div className="work-toolbar"><p>当前使用风格参考图占位，之后可直接替换为个人静帧作品。</p><div className="filters" role="group" aria-label="按作品风格筛选">{['全部', '二次元', '魂系写实', '动画电影感'].map(category => <button type="button" key={category} aria-pressed={filter === category} className={filter === category ? 'selected' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div></div><div className="project-grid">{visibleProjects.map(project => <button type="button" key={project.id} className="project-card" onClick={() => setPanel({ id: project.id })} aria-label={`查看${project.subtitle}视觉参考`}><div className="project-art" style={{ backgroundColor: project.color }}><img src={`${import.meta.env.BASE_URL}${project.image}`} alt={`${project.subtitle}，${project.category}风格参考`} loading="lazy" width="1920" height="1080" /><div className="art-shade" /><span className="art-category">{project.category}</span><span className="project-open"><Arrow diagonal /></span><div className="art-title"><small>IMAGE / {project.number}</small><span>{project.name}</span></div></div><div className="project-meta"><h3>{project.subtitle}</h3><span>VIEW FRAME ↗</span></div><p>{project.description}</p></button>)}</div><div className="reference-note"><span className="status-dot" /><p>当前图片为临时风格参考，非个人作品；更换素材的入口已集中在数据文件中。</p><span>PERSONAL WORKS COMING SOON</span></div></Reveal></section>

      <section id="theater" className="theater-section light-section" aria-labelledby="theater-heading"><Reveal><div className="section-kicker"><span>02 / MINI THEATER</span><span>镜头动起来，情绪才完整。</span></div><div className="section-heading-row"><h2 id="theater-heading">欢迎来到<span className="serif-word">小剧场。</span></h2><span className="work-count">( 03 )</span></div><p className="section-intro">这里用于影片、动画、合成 Breakdown 和 Showreel。当前短片为临时占位，之后替换视频地址即可。</p><div className="theater-grid">{theaterItems.map(item => <article className="film-card" key={item.number}><div className="film-frame"><video controls muted playsInline preload="metadata" poster={`${import.meta.env.BASE_URL}${item.poster}`} src={site.video}>你的浏览器不支持视频播放。</video><span className="film-number">FILM / {item.number}</span></div><div className="film-meta"><div><h3>{item.title}</h3><p>{item.subtitle}</p></div><span>{item.note}</span></div></article>)}</div></Reveal></section>

      <section id="demos" className="demo-section" aria-labelledby="demo-heading"><Reveal><div className="section-kicker"><span>03 / GAME DEMOS</span><span>在实时画面里，试验另一种可能。</span></div><div className="demo-heading-row"><div><h2 id="demo-heading">一些可以<span className="contact-italic">动手玩</span>的实验。</h2><p>第一个 Demo 可以直接试玩；另外两个位置用于之后展示个人小游戏。</p></div><span>PLAY / TEST / ITERATE</span></div><div className="demo-layout"><LightCatchGame /><div className="demo-stack"><article className="prototype-card"><img src={`${import.meta.env.BASE_URL}art/wuthering-waves.jpg`} alt="色彩反应小游戏原型占位图" /><div><span>PROTOTYPE / 02</span><h3>色彩反应</h3><p>根据画面提示，在颜色切换前完成选择。</p><b>原型展示位</b></div></article><article className="prototype-card"><img src={`${import.meta.env.BASE_URL}art/elden-ring.jpg`} alt="空间探索小游戏原型占位图" /><div><span>PROTOTYPE / 03</span><h3>空间探索</h3><p>在光线与阴影中，找到通向下一帧的入口。</p><b>原型展示位</b></div></article></div></div></Reveal></section>

      <section id="about" className="about-section light-section" aria-labelledby="about-heading"><Reveal className="about-grid"><div className="about-visual"><div className="about-visual-top"><span>ARTIST PROFILE</span><span>NO. 001</span></div><div className="abstract-controller" aria-hidden="true"><div className="controller-orbit" /><div className="controller-body"><div className="dpad"><span /><span /></div><div className="controller-buttons"><i /><i /><i /><i /></div><div className="controller-center"><span /><span /></div><div className="controller-stick left" /><div className="controller-stick right" /></div><span className="floating-star star-one">✳</span><span className="floating-star star-two">✦</span><span className="controller-caption">LIGHT THE SCENE<br />COMPOSE THE STORY.</span></div><div className="about-visual-bottom"><span>ONE ARTIST<br /><b>MANY FRAMES</b></span><Asterisk /></div></div><div className="about-copy"><p className="eyebrow muted">04 / FIELD EXPANSION</p><h2 id="about-heading">领域展开，<br />把画面做到<span className="serif-word">最后一步。</span></h2><p className="about-lead">你好，我是李天纯，英文名 TristanLee。<br />一名关注最终画面质感与叙事氛围的渲染合成师。</p><p>我喜欢研究光如何塑造空间，色彩怎样带来情绪，以及不同图层如何在合成阶段成为一幅完整的画面。</p><p>这个网站用来整理静帧、影片和实时视觉实验。当前展示内容是结构与风格预览，后续会逐步替换为个人作品与制作 Breakdown。</p><div className="skill-tags"><span>灯光与渲染</span><span>镜头合成</span><span>色彩与氛围</span><span>3D 动画影像</span><span>实时视觉实验</span></div><a className="text-link" href="#contact">一起创造点什么 <Arrow diagonal /></a></div></Reveal></section>

      <section id="contact" className="contact-section" aria-labelledby="contact-heading"><Reveal><div className="section-kicker"><span>05 / CONTACT</span><span><span className="status-dot" /> OPEN TO VISUAL COLLABORATIONS</span></div><div className="contact-main"><div><p className="contact-intro">如果你有镜头、动画、游戏画面或新的想法，欢迎联系。</p><h2 id="contact-heading">一起创造<br />点<span className="contact-italic">什么。</span><Asterisk /></h2></div><div className="contact-actions"><a href={`mailto:${site.email}`} className="contact-round" aria-label={`给 ${site.email} 发送邮件`}><Arrow diagonal /></a><a className="contact-email" href={`mailto:${site.email}`}>{site.email}</a><button type="button" className="copy-link" onClick={copyEmail}><CopyIcon copied={copied} />{copied ? '邮箱已复制' : '复制邮箱'}</button></div></div><footer className="site-footer"><a href="#home" className="logo"><Brand compact /></a><span>© {new Date().getFullYear()} 李天纯 TristanLee · 渲染与合成。</span><a className="back-top" href="#home">返回首页 <span>↑</span></a></footer></Reveal></section>
    </main>
    <DetailDialog panel={panel} onClose={() => setPanel(null)} />
    <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite"><span>✓</span>{toast}</div>
  </>
}
