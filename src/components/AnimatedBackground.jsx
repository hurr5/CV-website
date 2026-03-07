import { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";

// ── Default: interactive dot grid ─────────────────────────────────────────────
const SPACING = 22, DOT_R = 1.4, INFLUENCE = 80, PUSH = 14, SPRING = 0.1, DAMP = 0.74;

function drawDefault(canvas, ctx, dots, mouse, isDark) {
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

// ── Brutalism: explosion factory ──────────────────────────────────────────────
export function spawnExplosion(x, y, GRID) {
  const cx = Math.floor(x / GRID) * GRID;
  const cy = Math.floor(y / GRID) * GRID;
  const particles = [];
  const COUNT = 48;
  for (let i = 0; i < COUNT; i++) {
    const isSpark = i < COUNT * 0.55;
    const angle   = Math.random() * Math.PI * 2;
    // rocket bias: heavier upward burst
    const speed   = isSpark ? (3 + Math.random() * 7) : (1.2 + Math.random() * 4);
    const vyBias  = isSpark ? -1.8 : -0.6;
    particles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed + vyBias,
      life:  1,
      decay: isSpark ? (0.025 + Math.random() * 0.02) : (0.012 + Math.random() * 0.012),
      size:  isSpark ? 0 : (2 + Math.random() * 3.5),
      isSpark,
    });
  }
  return { x, y, cx, cy, particles, flash: 1, ring: 0 };
}

// ── Brutalism: bold grid + crosshair ──────────────────────────────────────────
function drawBrutalism(canvas, ctx, mouse, time, explosions, isDark) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const GRID = 60;

  const lineColor  = isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.07)";
  const accentH    = isDark ? "rgba(255,30,0,0.07)"     : "rgba(200,0,0,0.06)";
  const crossColor = isDark ? "rgba(255,30,0,0.14)"     : "rgba(180,0,0,0.12)";
  const cellAccent = isDark ? "rgba(255,30,0,0.38)"     : "rgba(180,0,0,0.35)";

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += GRID) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += GRID) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const barY1 = (Math.sin(time * 0.0004) * 0.3 + 0.25) * H;
  const barY2 = (Math.sin(time * 0.0003 + 1.5) * 0.3 + 0.72) * H;
  ctx.fillStyle = accentH;
  ctx.fillRect(0, barY1, W, 2);
  ctx.fillRect(0, barY2, W, 2);

  if (mouse.x > 0 && mouse.x < W) {
    ctx.strokeStyle = crossColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(mouse.x, 0); ctx.lineTo(mouse.x, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, mouse.y); ctx.lineTo(W, mouse.y); ctx.stroke();
    ctx.setLineDash([]);

    const cx = Math.floor(mouse.x / GRID) * GRID;
    const cy = Math.floor(mouse.y / GRID) * GRID;
    ctx.strokeStyle = cellAccent;
    ctx.lineWidth = 2;
    const S = 14;
    // Each corner faces inward: ┌ ┐ └ ┘
    const corners = [
      [cx,        cy,       +S, +S], // ┌ top-left
      [cx+GRID,   cy,       -S, +S], // ┐ top-right
      [cx,        cy+GRID,  +S, -S], // └ bottom-left
      [cx+GRID,   cy+GRID,  -S, -S], // ┘ bottom-right
    ];
    corners.forEach(([px, py, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(px, py+dy); ctx.lineTo(px, py); ctx.lineTo(px+dx, py); ctx.stroke();
    });
  }

  // Diagonal accent lines
  const diagColor = isDark ? "rgba(255,30,0,0.035)" : "rgba(160,0,0,0.04)";
  ctx.strokeStyle = diagColor;
  ctx.lineWidth = 1;
  const off = (time * 0.015) % (GRID * 2);
  for (let i = -H; i < W + H; i += GRID * 2) {
    ctx.beginPath(); ctx.moveTo(i + off, 0); ctx.lineTo(i + off + H, H); ctx.stroke();
  }

  // ── explosions ─────────────────────────────────────────────────────────────
  ctx.save();
  for (let e = explosions.length - 1; e >= 0; e--) {
    const exp = explosions[e];

    // cell flash
    if (exp.flash > 0) {
      exp.flash = Math.max(0, exp.flash - 0.09);
      ctx.fillStyle = `rgba(255,80,0,${exp.flash * 0.45})`;
      ctx.fillRect(exp.cx, exp.cy, GRID, GRID);
    }

    // expanding shockwave ring
    exp.ring += 3.2;
    const ringAlpha = Math.max(0, 0.7 - exp.ring / 120);
    if (ringAlpha > 0) {
      ctx.strokeStyle = `rgba(255,120,0,${ringAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.ring, 0, Math.PI * 2);
      ctx.stroke();
    }

    // particles
    for (let i = exp.particles.length - 1; i >= 0; i--) {
      const p = exp.particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.09;   // gravity
      p.vx *= 0.975;  // air drag
      p.life -= p.decay;
      if (p.life <= 0) { exp.particles.splice(i, 1); continue; }

      // colour: white → yellow → orange → red
      const hue   = p.life > 0.65 ? 55 : p.life > 0.35 ? 22 : 4;
      const light = Math.round(45 + p.life * 40);
      const alpha = p.life;

      if (p.isSpark) {
        const tailX = p.x - p.vx * 4;
        const tailY = p.y - p.vy * 4;
        ctx.strokeStyle = `hsla(${hue},100%,${light}%,${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else {
        ctx.fillStyle = `hsla(${hue},100%,${light}%,${alpha})`;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }

    // remove finished explosion
    if (exp.particles.length === 0 && exp.flash <= 0 && exp.ring >= 120) {
      explosions.splice(e, 1);
    }
  }
  ctx.restore();
}

// ── Futurism: ripple factory ───────────────────────────────────────────────────
export function spawnRipple(x, y) {
  // speed=6 px/frame, decay=0.002 → life reaches 0 at ~500 frames (radius ~3000px)
  // stagger rings so they are well-separated visually
  return [
    { x, y, radius: 0,    speed: 6, life: 1, decay: 0.002 },
    { x, y, radius: -60,  speed: 6, life: 1, decay: 0.002 },
    { x, y, radius: -120, speed: 6, life: 1, decay: 0.002 },
  ];
}

// ── Futurism: hex grid + neon particles ───────────────────────────────────────
function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function drawFuturism(canvas, ctx, mouse, time, particles, ripples, isDark) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const R = 36, HW = R * Math.sqrt(3), HH = R * 1.5;
  // Dark: cyan glow. Light: blue glow.
  const hexR = isDark ? 0   : 0;
  const hexG = isDark ? 210 : 60;
  const hexB = isDark ? 255 : 220;

  for (let row = -1; row < Math.ceil(H/HH) + 1; row++) {
    for (let col = -1; col < Math.ceil(W/HW) + 1; col++) {
      const cx = col * HW + (row % 2) * HW * 0.5;
      const cy = row * HH;
      const pts = hexPoints(cx, cy, R - 1);

      const dx = cx - mouse.x, dy = cy - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const glow = Math.max(0, 1 - dist / 180);

      // ripple contribution: each active ring lights up hexes on its circumference
      let rippleGlow = 0;
      for (const rp of ripples) {
        if (rp.radius < 0) continue;
        const rdx = cx - rp.x, rdy = cy - rp.y;
        const rdist = Math.sqrt(rdx*rdx + rdy*rdy);
        const delta = Math.abs(rdist - rp.radius);
        // sqrt(life) keeps the wave bright all the way to the canvas edges
        rippleGlow = Math.max(rippleGlow, Math.max(0, 1 - delta / 62) * Math.sqrt(rp.life));
      }

      const totalGlow = Math.min(1, glow + rippleGlow);
      const alpha = isDark ? (0.04 + totalGlow * 0.22) : (0.06 + totalGlow * 0.20);

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${hexR},${hexG},${hexB},${alpha})`;
      ctx.lineWidth = totalGlow > 0.3 ? 1.5 : 0.7;
      ctx.stroke();

      if (totalGlow > 0.35) {
        ctx.fillStyle = `rgba(${hexR},${hexG},${hexB},${totalGlow * (isDark ? 0.06 : 0.045)})`;
        ctx.fill();
      }
    }
  }

  // Scanlines (only dark)
  if (isDark) {
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, y, W, 1);
    }
  }

  // Particles
  const pR = isDark ? 0 : 0, pG = isDark ? 220 : 80, pB = isDark ? 255 : 200;
  for (const p of particles) {
    p.y += p.vy * 0.016;
    p.x += Math.sin(time * 0.001 + p.phase) * 0.3;
    if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
    const a = isDark
      ? 0.28 + Math.sin(time * 0.002 + p.phase) * 0.18
      : 0.18 + Math.sin(time * 0.002 + p.phase) * 0.12;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${pR},${pG},${pB},${a})`; ctx.fill();
  }

  // Advance & prune ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    rp.radius += rp.speed;
    rp.life   -= rp.decay;
    if (rp.life <= 0) ripples.splice(i, 1);
  }
}

// ── Retro: warm halftone dots ─────────────────────────────────────────────────
function drawRetro(canvas, ctx, mouse, time, isDark) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const STEP = 20;
  for (let x = STEP/2; x < W; x += STEP) {
    for (let y = STEP/2; y < H; y += STEP) {
      const dx = x - mouse.x, dy = y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const wave = Math.sin(time * 0.0007 + x*0.035 + y*0.028) * 0.5 + 0.5;
      const proximity = Math.max(0, 1 - dist / 150);
      const r = 1.1 + wave * 1.5 + proximity * 2.8;

      let h, s, l, a;
      if (isDark) {
        // warm amber/gold tones on dark espresso
        h = 34 + wave * 18 + proximity * 12;
        s = 65; l = 58;
        a = 0.10 + wave * 0.12 + proximity * 0.30;
      } else {
        // warm sienna/terracotta on parchment
        h = 28 + wave * 22 + proximity * 16;
        s = 55; l = 45;
        a = 0.08 + wave * 0.09 + proximity * 0.28;
      }

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${h},${s}%,${l}%,${a})`; ctx.fill();
    }
  }

  // Subtle horizontal bands (magazine print artifact)
  const bandColor = isDark ? "rgba(200,130,20,0.012)" : "rgba(120,60,10,0.014)";
  for (let i = 0; i < 5; i++) {
    const yPos = ((time * 0.008 + i * H / 5)) % H;
    ctx.fillStyle = bandColor;
    ctx.fillRect(0, yPos, W, H / 5);
  }
}

// ── Terminal: cursor shimmer ───────────────────────────────────────────────────
const CHARS = "アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
const TERM_FS = 14;
const TERM_RADIUS = 190;

function drawTerminal(canvas, ctx, mouse, time, isDark) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (mouse.x < 0 || mouse.x > W) return; // cursor outside — nothing

  ctx.font = `${TERM_FS}px "VT323", monospace`;

  const cols = Math.floor(W / TERM_FS);
  const rows = Math.floor(H / TERM_FS);
  const cRow = Math.round(mouse.y / TERM_FS);
  const cCol = Math.round(mouse.x / TERM_FS);
  const span = Math.ceil(TERM_RADIUS / TERM_FS) + 1;

  for (let ci = Math.max(0, cCol - span); ci <= Math.min(cols - 1, cCol + span); ci++) {
    for (let ri = Math.max(0, cRow - span); ri <= Math.min(rows - 1, cRow + span); ri++) {
      const px = ci * TERM_FS;
      const py = ri * TERM_FS;
      const dx = px + TERM_FS * 0.5 - mouse.x;
      const dy = py + TERM_FS * 0.5 - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / TERM_RADIUS);
      if (prox < 0.02) continue;

      // shimmer: char changes each frame per-cell via time + noise
      const seed = ci * 137.508 + ri * 53.23;
      const charIdx = Math.floor((time * 0.012 + seed) % CHARS.length);
      const char = CHARS[(Math.abs(Math.floor(charIdx)) % CHARS.length)];

      // smooth fade-in / pulse
      const pulse = 0.75 + 0.25 * Math.sin(time * 0.004 + seed);
      const alpha = prox * pulse * (isDark ? 0.82 : 0.65);

      ctx.fillStyle = isDark
        ? `rgba(100,255,120,${alpha})`
        : `rgba(18,72,24,${alpha})`;
      ctx.fillText(char, px, py + TERM_FS);
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const GRID = 60;
    let width = 0, height = 0;
    let animId;
    let dots = [];
    let particles = [];
    let explosions = [];
    let ripples = [];
    let mouse = { x: -9999, y: -9999 };
    let startTime = performance.now();

    const isDark = () => document.documentElement.classList.contains("dark");

    const buildGrid = () => {
      dots = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ ox: c*SPACING, oy: r*SPACING, x: c*SPACING, y: r*SPACING, vx: 0, vy: 0 });
    };

    const buildParticles = () => {
      particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vy: 0.4 + Math.random() * 0.8,
        r: 0.8 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildGrid();
      buildParticles();
      ctx.clearRect(0, 0, width, height);
    };

    const onMouseMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onClick = e => {
      if (themeRef.current === "brutalism") {
        explosions.push(spawnExplosion(e.clientX, e.clientY, GRID));
      } else if (themeRef.current === "futurism") {
        ripples.push(...spawnRipple(e.clientX, e.clientY));
      }
    };

    const draw = () => {
      const t = themeRef.current;
      const time = performance.now() - startTime;
      const dk = isDark();

      if (t === "default") {
        drawDefault(canvas, ctx, dots, mouse, dk);
      } else if (t === "brutalism") {
        drawBrutalism(canvas, ctx, mouse, time, explosions, dk);
      } else if (t === "futurism") {
        drawFuturism(canvas, ctx, mouse, time, particles, ripples, dk);
      } else if (t === "retro") {
        drawRetro(canvas, ctx, mouse, time, dk);
      } else if (t === "terminal") {
        drawTerminal(canvas, ctx, mouse, time, dk);
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="animated-bg">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
};

export default AnimatedBackground;
