import { useEffect, useRef } from "react";

const H = 260;
const GRAVITY = 0.38;
const FLAP = -7;
const PIPE_SPEED = 2;
const PIPE_EVERY = 120;
const GAP = 90;
const BGRID = 16;
const PDOT = 14;
const BSTEP = 9;
const BX = 70;

// bird shape: 5 dots
const BIRD = [[0,0],[-1,0],[1,0],[0,-1],[1,-1]];

export const FlappyBird = ({ bare = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.height = H;
    let W = 0;

    const resize = () => { W = canvas.width = canvas.offsetWidth; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const s = { phase: "idle", by: H/2, bvy: 0, pipes: [], frame: 0, score: 0, best: 0 };

    const reset = () => Object.assign(s, { phase: "playing", by: H/2, bvy: FLAP, pipes: [], frame: 0, score: 0 });

    const flap = () => {
      if (s.phase === "idle")        reset();
      else if (s.phase === "playing") s.bvy = FLAP;
      else if (s.phase === "dead")    s.phase = "idle";
    };

    const inView = () => {
      const r = canvas.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    const onKey = (e) => { if (e.code === "Space" && inView()) { e.preventDefault(); flap(); } };
    const onTap  = (e) => { e.preventDefault(); flap(); };
    canvas.addEventListener("click",      onTap);
    canvas.addEventListener("touchstart", onTap, { passive: false });
    window.addEventListener("keydown",    onKey);

    const dark = () => document.documentElement.classList.contains("dark");

    const dot = (x, y, r, c) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = c; ctx.fill();
    };

    let raf;
    const tick = () => {
      const dk = dark();

      // bg
      ctx.fillStyle = dk ? "rgb(16,15,15)" : "rgb(245,245,245)";
      ctx.fillRect(0, 0, W, H);

      // bg grid dots
      const dim = dk ? "rgba(75,75,75,0.22)" : "rgba(150,150,150,0.28)";
      for (let x = BGRID; x < W; x += BGRID)
        for (let y = BGRID; y < H; y += BGRID)
          dot(x, y, 1.2, dim);

      // --- physics ---
      if (s.phase === "playing") {
        s.bvy += GRAVITY;
        s.by  += s.bvy;
        s.frame++;

        if (s.frame % PIPE_EVERY === 0)
          s.pipes.push({ x: W + 10, gy: 55 + Math.random() * (H - GAP - 110), ok: false });

        for (const p of s.pipes) p.x -= PIPE_SPEED;
        s.pipes = s.pipes.filter(p => p.x > -PDOT * 3);

        for (const p of s.pipes)
          if (!p.ok && p.x < BX) { p.ok = true; s.score++; }

        // collision
        const dead =
          s.by < BGRID || s.by > H - BGRID ||
          s.pipes.some(p => {
            const inX = BX + 7 > p.x && BX - 7 < p.x + PDOT + 2;
            const safe = s.by - 7 > p.gy && s.by + 7 < p.gy + GAP;
            return inX && !safe;
          });

        if (dead) {
          s.phase = "dead";
          if (s.score > s.best) s.best = s.score;
        }
      }

      // --- pipes ---
      const pc = dk ? "rgba(100,100,100,0.78)" : "rgba(115,115,115,0.72)";
      for (const p of s.pipes) {
        for (let y = PDOT; y < p.gy; y += PDOT) {
          dot(p.x,        y, 2, pc);
          dot(p.x + PDOT, y, 2, pc);
        }
        for (let y = p.gy + GAP; y < H; y += PDOT) {
          dot(p.x,        y, 2, pc);
          dot(p.x + PDOT, y, 2, pc);
        }
      }

      // --- bird ---
      const displayBy = s.phase === "idle"
        ? H/2 + Math.sin(Date.now()/600) * 8
        : s.by;
      const bc = s.phase === "dead" ? "rgba(255,55,0,0.92)" : "rgba(255,115,0,0.95)";
      for (const [dx, dy] of BIRD)
        dot(BX + dx * BSTEP, displayBy + dy * BSTEP, 2.4, bc);

      // --- hud ---
      ctx.font = "12px 'Source Code Pro', monospace";
      const tc = dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)";
      ctx.fillStyle = tc;

      if (s.phase === "idle") {
        ctx.textAlign = "center";
        ctx.fillText("[ space / click to start ]", W/2, H/2 + 42);
      } else if (s.phase === "playing") {
        ctx.textAlign = "right";
        ctx.fillStyle = dk ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
        ctx.fillText(String(s.score).padStart(3, "0"), W - 14, 22);
      } else if (s.phase === "dead") {
        ctx.textAlign = "center";
        ctx.fillText(`score: ${s.score}  ·  best: ${s.best}`, W/2, H/2 + 10);
        ctx.fillText("[ click / space to retry ]",             W/2, H/2 + 30);
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("click",      onTap);
      canvas.removeEventListener("touchstart", onTap);
    };
  }, []);

  return (
    <div className={bare ? "" : "mt-16 mb-10"}>
      {!bare && (
        <div className="text-xs text-black/25 dark:text-white/20 mb-2 select-none">
          {"// flappy_bird.exe"}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: `${H}px`, display: "block", borderRadius: "16px", cursor: "pointer" }}
        className="border border-black/10 dark:border-white/10"
      />
    </div>
  );
};
