import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Dither from "./Dither";
import Grainient from "./Grainient";

// ── Alternative: interactive dot grid (original default) ──────────────────────
const SPACING = 22, DOT_R = 1.4, INFLUENCE = 80, PUSH = 14, SPRING = 0.1, DAMP = 0.74;

function drawAlternative(canvas, ctx, dots, mouse, isDark) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of dots) {
    const dx = d.x - mouse.x, dy = d.y - mouse.y;
    const distSq = dx*dx + dy*dy;
    if (distSq < INFLUENCE*INFLUENCE) {
      const dist = Math.sqrt(distSq), force = (1 - dist/INFLUENCE)*PUSH;
      d.vx += (dx/dist)*force*0.28; d.vy += (dy/dist)*force*0.28;
    }
    d.vx += (d.ox - d.x)*SPRING; d.vy += (d.oy - d.y)*SPRING;
    d.vx *= DAMP; d.vy *= DAMP;
    d.x += d.vx; d.y += d.vy;

    const cdx = d.x - mouse.x, cdy = d.y - mouse.y;
    const t = Math.max(0, 1 - Math.sqrt(cdx*cdx+cdy*cdy)/INFLUENCE);
    let r, g, b, a;
    if (isDark) {
      r = Math.round(75  + t*(255-75)); g = Math.round(75+t*(105-75)); b = Math.round(75+t*(0-75)); a = 0.22+t*0.55;
    } else {
      r = Math.round(170 + t*(255-170)); g = Math.round(170+t*(110-170)); b = Math.round(170+t*(0-170)); a = 0.35+t*0.5;
    }
    ctx.beginPath(); ctx.arc(d.x, d.y, DOT_R, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`; ctx.fill();
  }
}

// ── Vintage: grain canvas builder ─────────────────────────────────────────────
function buildGrainCanvas(size = 256) {
  const gc = document.createElement("canvas");
  gc.width = size; gc.height = size;
  const gctx = gc.getContext("2d");
  const img = gctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.floor(Math.random() * 256);
    d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
  }
  gctx.putImageData(img, 0, 0);
  return gc;
}

// ── Vintage: parallax ornament data ───────────────────────────────────────────
const VINE_ORNAMENTS = [
  { xr: 0.065, yr: 0.13, ch: "❧", sz: 36, px: 0.14 },
  { xr: 0.935, yr: 0.21, ch: "✦", sz: 19, px: 0.09 },
  { xr: 0.11,  yr: 0.61, ch: "◆", sz: 15, px: 0.21 },
  { xr: 0.895, yr: 0.49, ch: "❦", sz: 28, px: 0.11 },
  { xr: 0.50,  yr: 0.91, ch: "⁕", sz: 22, px: 0.17 },
  { xr: 0.035, yr: 0.37, ch: "✦", sz: 13, px: 0.25 },
  { xr: 0.965, yr: 0.74, ch: "❧", sz: 23, px: 0.10 },
  { xr: 0.27,  yr: 0.04, ch: "◆", sz: 12, px: 0.07 },
  { xr: 0.73,  yr: 0.96, ch: "✦", sz: 16, px: 0.19 },
  { xr: 0.50,  yr: 0.50, ch: "✦", sz: 11, px: 0.13 },
];

// ── Vintage: grain + parallax ornaments + cursor ink trail + vignette ─────────
function drawVintage(canvas, ctx, time, trail, scrollY, isDark, grainCanvas) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (grainCanvas) {
    try {
      const pat = ctx.createPattern(grainCanvas, "repeat");
      if (pat) {
        const sx = Math.sin(time * 0.000022) * 44;
        const sy = Math.cos(time * 0.000017) * 36;
        pat.setTransform(new DOMMatrix().translateSelf(sx, sy));
        ctx.globalAlpha = isDark ? 0.036 : 0.048;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    } catch (_) {}
  }

  const oc = isDark ? "rgba(180,145,88," : "rgba(160,137,108,";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const o of VINE_ORNAMENTS) {
    const x = o.xr * W;
    const rawY = o.yr * H - scrollY * o.px;
    const y = ((rawY % H) + H) % H;
    ctx.font = `${o.sz}px serif`;
    ctx.fillStyle = oc + "0.088)";
    ctx.fillText(o.ch, x, y);
  }
  ctx.restore();

  const now = performance.now();
  ctx.save();
  for (let i = trail.length - 1; i >= 0; i--) {
    const pt = trail[i];
    const age = now - pt.t;
    if (age > 600) { trail.splice(0, i + 1); break; }
    const frac = age / 600;
    const alpha = (1 - frac) * (isDark ? 0.25 : 0.22);
    const r = 1.3 + frac * 0.8;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isDark
      ? `rgba(201,169,110,${alpha})`
      : `rgba(92,74,50,${alpha})`;
    ctx.fill();
  }
  ctx.restore();

  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.10, W / 2, H / 2, H * 0.84);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, isDark ? "rgba(8,4,2,0.52)" : "rgba(44,36,22,0.10)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

// ── Component ─────────────────────────────────────────────────────────────────

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const isGrainient = theme === "default";
  const isDither    = theme === "dither";
  const needsCanvas = !isGrainient && !isDither;

  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0, height = 0;
    let animId;
    let dots = [];
    let trail = [];
    let scrollY = 0;
    let grainCanvas = buildGrainCanvas();
    let mouse = { x: -9999, y: -9999 };
    let startTime = performance.now();

    const grainTimer = setInterval(() => {
      if (themeRef.current === "vintage") grainCanvas = buildGrainCanvas();
    }, 3000);

    const isDark = () => document.documentElement.classList.contains("dark");

    const buildGrid = () => {
      dots = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ ox: c*SPACING, oy: r*SPACING, x: c*SPACING, y: r*SPACING, vx: 0, vy: 0 });
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildGrid();
      ctx.clearRect(0, 0, width, height);
    };

    const onMouseMove = e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (themeRef.current === "vintage") {
        trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (trail.length > 120) trail.shift();
      }
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onScroll = () => { scrollY = window.scrollY; };

    const draw = () => {
      const t = themeRef.current;
      const time = performance.now() - startTime;
      const dk = isDark();

      if (t === "alternative") {
        drawAlternative(canvas, ctx, dots, mouse, dk);
      } else if (t === "vintage") {
        drawVintage(canvas, ctx, time, trail, scrollY, dk, grainCanvas);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(grainTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="animated-bg">
      {isGrainient && (
        <Grainient
          color1={isDark ? "#ff7c2a" : "#ff9a5c"}
          color2={isDark ? "#4a1500" : "#8a3200"}
          color3={isDark ? "#080300" : "#fdf0e8"}
          warpStrength={1.2}
          warpFrequency={4.5}
          warpSpeed={1.8}
          warpAmplitude={55}
          rotationAmount={420}
          grainAmount={isDark ? 0.08 : 0.06}
          grainScale={2.5}
          contrast={isDark ? 1.4 : 1.2}
          saturation={1.1}
          zoom={0.85}
          timeSpeed={0.2}
        />
      )}
      {isDither && (
        <Dither
          waveColor={[1.0, 0.4, 0.05]}
          waveSpeed={0.01}
          waveFrequency={3}
          waveAmplitude={0.4}
          colorNum={4}
          pixelSize={2}
          mouseRadius={0.3}
          enableMouseInteraction={true}
        />
      )}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: needsCanvas ? "block" : "none" }}
      />
    </div>
  );
};

export default AnimatedBackground;
