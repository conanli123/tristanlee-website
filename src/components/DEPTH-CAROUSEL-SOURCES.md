# Depth Carousel

Based on the React Bits DepthCarousel component source supplied by the portfolio
owner on 2026-09-19, from https://www.reactbits.dev/components/depth-carousel.

The animation uses the source's continuous-position GSAP tween, perspective,
depth, tilt, brightness, blur and tint calculations. Parameters match the supplied
preview: 420 x 320, depth 230, spread 120, tilt 18, radius 19, perspective 1200,
falloff 0.18, blur 6 and duration 650 ms.

Local adaptations include TypeScript, Lucide controls, responsive scaling,
gesture click suppression, reduced motion, offscreen autoplay suspension,
pause/resume, and portfolio detail navigation. The site retains its existing
light appearance and uses the owner's local artwork instead of sample photos.
