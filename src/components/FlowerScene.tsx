import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../data/assetUrl";
import { useReducedMotion } from "../hooks/useTypewriter";
import "./flower-scene.css";

// The reference uses individually layered SVGs, with phase-shifted 4.5 s sways.
// Keep that motion local and dependency-free rather than loading its site scripts.
function sway(time: number, duration: number, delay = 0) {
  const phase = (Math.max(0, time - delay) % (duration * 2)) / duration;
  const progress = phase <= 1 ? phase : 2 - phase;
  const eased =
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return -1 + eased * 2;
}

function FlowerLayer({ name }: { name: string }) {
  return (
    <div className={name}>
      <img
        src={assetUrl(`animations/flowers/${name}.svg`)}
        alt=""
        decoding="async"
        draggable="false"
      />
    </div>
  );
}

export default function FlowerScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    () => !document.hidden,
  );
  const [lookingLeft, setLookingLeft] = useState(false);
  const reducedMotion = useReducedMotion();
  const running = ready && inView && documentVisible && !reducedMotion;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        preload.disconnect();
      },
      { rootMargin: "350px" },
    );
    const visibility = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    });
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    preload.observe(scene);
    visibility.observe(scene);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      preload.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (reducedMotion) {
      scene.style.setProperty("--progress", "0");
      scene.style.setProperty("--progress_02", "0");
      scene.style.setProperty("--progress_03", "0");
      scene.style.setProperty("--progress-half", "0");
      return;
    }
    if (!running) return;

    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      const time = elapsedRef.current;
      scene.style.setProperty(
        "--bouquet-sway-rotate",
        `${7 + sway(time, 6) * 3}deg`,
      );
      scene.style.setProperty("--progress", sway(time, 4.5).toFixed(5));
      scene.style.setProperty(
        "--progress_02",
        sway(time, 4.5, 0.45).toFixed(5),
      );
      scene.style.setProperty("--progress_03", sway(time, 4.5, 0.9).toFixed(5));
      scene.style.setProperty("--progress-half", sway(time, 2.25).toFixed(5));
      scene.style.setProperty("--grid-progress", ((time / 15) % 1).toFixed(5));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reducedMotion]);

  return (
    <div
      className={`flower-scene${lookingLeft ? " is-looking-left" : ""}`}
      ref={sceneRef}
      data-running={running}
      aria-hidden="true"
    >
      <div className="flower-scene__grid" />
      {ready && (
        <div className="flower-scene__inner">
          <div className="bouquet">
            <FlowerLayer name="bottle" />
            <FlowerLayer name="flower-parts-07" />
            <FlowerLayer name="flower-parts-06" />
            <FlowerLayer name="flower-parts-05" />
            <FlowerLayer name="flower-parts-04" />
            <FlowerLayer name="flower-parts-03" />
            <FlowerLayer name="flower-parts-02" />
            <FlowerLayer name="flower-parts-08" />
            <FlowerLayer name="flower-parts-02" />
            <FlowerLayer name="flower-parts-01" />
            <FlowerLayer name="flower-neck" />
            <div className="flower-face">
              <svg viewBox="0 0 121.57 109.4">
                <path
                  className="petal"
                  fill="#fff0b6"
                  stroke="#8cc163"
                  strokeWidth="2.83"
                  d="M59.15 95.54a20 20 0 0 1-.87 3.03 12.88 12.88 0 0 1-24.4-8.22q.34-1.12.75-2.33a42 42 0 0 1-5.36 3.75 12.84 12.84 0 0 1-16.51-2.99l-.14-.18a12.83 12.83 0 0 1 1.71-17.56c2.68-2.34 4.78-3.97 4.78-3.97a52 52 0 0 1-5.36.37A12.1 12.1 0 0 1 1.42 55.26v-.25A12.1 12.1 0 0 1 13.8 43.25q2.54.06 5.66.26a55 55 0 0 1-6.59-5.48 11.46 11.46 0 0 1-.6-15.63 11.3 11.3 0 0 1 11.46-3.6 37 37 0 0 1 9.7 4.43l-1.68-2.54A11.81 11.81 0 1 1 51.77 8.16 28 28 0 0 1 55 15.93a29 29 0 0 1 2.5-7.94 11.36 11.36 0 0 1 21.66 5.3 45 45 0 0 1-.62 6.18c1.48-2.6 3.43-4.32 6.12-6.53a10.6 10.6 0 0 1 10.68-1.58l.7.3a10.6 10.6 0 0 1 5.25 14.15 43 43 0 0 1-3.34 5.97 33 33 0 0 1 6.87-2.48A10.7 10.7 0 0 1 117 35.39l.07.17a10.75 10.75 0 0 1-4.37 13.7 32 32 0 0 1-6.8 2.86q1.43 0 2.67.05a12.02 12.02 0 0 1 11.28 14.54l-.06.27a12 12 0 0 1-13.3 9.4 50 50 0 0 1-6.07-1.2 20 20 0 0 1 4.65 4.85 11.13 11.13 0 0 1-16.92 14.3 242 242 0 0 1-4.68-4.7q.46 1.37.81 2.66a12.52 12.52 0 0 1-23.95 7.24 55 55 0 0 1-1.18-4"
                ></path>
                <path
                  className="circle"
                  fill="#f7c9a6"
                  d="M84.39 55.94a23.97 23.97 0 1 1-23.97-23.97A23.97 23.97 0 0 1 84.4 55.94"
                ></path>
                <path
                  className="eyes"
                  fill="none"
                  stroke="#d39163"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.83"
                  d="M35.7 55.37c3.79-5.63 13.17-8.83 20.32-4.52 3.98 2.4 5.72 6.96 3.83 10.82s-5.6 5.65-9.24 4.72a6.27 6.27 0 0 1-4.04-8.6c1.25-3.34 4.1-6.6 10.1-8.35a29 29 0 0 1 7.12-1.18c3.1-.17 6.99-.23 10.47 1.57a6.2 6.2 0 0 1 2.88 8.57 6.26 6.26 0 0 1-7.74 3.21c-2.7-1.07-3.94-4.01-2.7-7.34.94-2.5 3.07-4.94 7.54-6.24a24 24 0 0 1 11.4-.15"
                ></path>
              </svg>
            </div>
            <div
              className="girl girl-01"
              onPointerEnter={() => setLookingLeft(true)}
              onPointerLeave={() => setLookingLeft(false)}
            >
              <img
                src={assetUrl("animations/flowers/girl_01.svg")}
                alt=""
                decoding="async"
                draggable="false"
              />
              <svg className="girl-head" viewBox="0 0 16.01 19.166">
                <path
                  fill="#f9cc9b"
                  d="M15.617 8.288a3.02 3.02 0 0 0-3.342-1.429 2.8 2.8 0 0 0-.584.237 3.97 3.97 0 0 0-4.609-.582 3.4 3.4 0 0 0-.762.613 3.9 3.9 0 0 0-3.929 1.237 6.4 6.4 0 0 0-.61.876 2.9 2.9 0 0 0-.844.831c-1.057 1.564-.666 3.6.107 5.185a7.26 7.26 0 0 0 2.829 3 6.778 6.778 0 0 0 10.256-5.409c1.5-.987 2.462-2.856 1.488-4.559"
                ></path>
                <path
                  fill="#e27640"
                  d="M9.998.063a5.26 5.26 0 0 0-5.86 4.251A2.6 2.6 0 0 1 2.794 6.07 4.93 4.93 0 0 0 .806 7.825C-.225 9.392-.246 12.064.62 12.753a2.64 2.64 0 0 0 2.573.446 5 5 0 0 0 1.611-.891 1.52 1.52 0 0 1 .9-.313 5 5 0 0 0 4.265-2.02 1.6 1.6 0 0 1 .534-.53 5.16 5.16 0 0 0 2.569-3.111c.574-2.071.6-5.713-3.073-6.275"
                ></path>
                <path
                  className="eye"
                  fill="#845e4c"
                  d="M4.014 15.773v-.01a2 2 0 0 0-.022-.162.5.5 0 0 0-.04-.109.5.5 0 0 0-.052-.108c-.011-.016-.03-.025-.042-.041a1 1 0 0 0-.076-.1 1 1 0 0 0-.143-.115l-.008-.007h-.009l-.028-.017c-.028-.014-.048-.019-.071-.029l-.1-.044-.023-.008-.04-.009a2 2 0 0 0-.165-.022h-.057c-.053 0-.112.013-.164.022a.2.2 0 0 0-.046.012 2 2 0 0 0-.148.062l-.022.011-.017.011-.02.01a.73.73 0 0 0-.265.277 1 1 0 0 0-.061.144v.023c-.008.04-.017.115-.022.156v.11a2 2 0 0 0 .024.172l.006.021c.018.052.042.1.064.153a.3.3 0 0 0 .024.043l.023.03q.049.068.1.132a.2.2 0 0 0 .03.031q.062.051.126.1l.024.017.036.019a.8.8 0 0 0 .37.1h.018a1.4 1.4 0 0 0 .172-.023.2.2 0 0 0 .048-.014q.075-.029.154-.065l.021-.012a.7.7 0 0 0 .173-.142 1 1 0 0 0 .111-.146l.01-.019c.024-.051.046-.1.066-.157l.012-.038v-.02q.015-.085.023-.171v-.008c0-.013.005-.026.006-.038z"
                ></path>
                <path
                  className="eye"
                  fill="#845e4c"
                  d="M8.815 14.119q.002-.018-.007-.036l-.006-.018q-.028-.075-.064-.153a.8.8 0 0 0-.127-.175l-.026-.025a3 3 0 0 0-.128-.1l-.019-.011-.032-.016a1 1 0 0 0-.17-.069l-.038-.008a2 2 0 0 0-.186-.023h-.037a2 2 0 0 0-.166.023H7.79a1 1 0 0 0-.1.041 1 1 0 0 0-.1.046l-.016.011q-.064.046-.126.1l-.028.029a3 3 0 0 0-.1.128l-.012.017-.008.015q-.036.074-.065.153l-.012.036-.005.02a2 2 0 0 0-.023.17v.037c0 .03.008.063.011.091s.007.064.014.1l.012.035.008.019v.016c0 .011.006.022.009.033.018.047.041.1.063.147l.01.019a.4.4 0 0 0 .083.091q.001.01.012.021l.027.025.013.011s.007.01.013.013.011.005.016.009q.042.035.085.066l.019.012a1 1 0 0 0 .1.044 1 1 0 0 0 .1.041 2 2 0 0 0 .183.027h.043a1 1 0 0 0 .184-.022l.039-.008.018-.007q.075-.029.151-.063l.034-.019a.8.8 0 0 0 .168-.137 1 1 0 0 0 .109-.144l.008-.015q.035-.074.065-.152c0-.012.009-.023.012-.035a1 1 0 0 0 .027-.186v-.039a1.3 1.3 0 0 0-.023-.186"
                ></path>
                <path
                  fill="#9d7a65"
                  d="M6.364 17.648a.576.576 0 0 0 0-1.151.576.576 0 0 0 0 1.151"
                ></path>
              </svg>
              <span className="girl-greeting">HELLO!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
