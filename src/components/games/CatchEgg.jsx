import { useEffect, useRef } from "react";

const H       = 260;
const BGRID   = 16;
const CSTEP   = 7;   // chicken dot spacing
const BSTEP   = 7;   // basket dot spacing
const EGG_R   = 4.5;
const BASKET_Y_OFFSET = 28;
const CATCH_HALF = 26; // catch zone half-width

// chicken: 6-dot blob
const CHICK = [[0,0],[1,0],[-1,0],[0,-1],[1,-1],[0,1]];
// basket: U-shape
const BASKET = [[-3,0],[-3,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,-1],[3,0]];

export const CatchEgg = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.height = H;
    let W = 0;

    const ro = new ResizeObserver(() => { W = canvas.width = canvas.offsetWidth; });
    ro.observe(canvas);
    W = canvas.width = canvas.offsetWidth;

    const state = { phase: "idle", score: 0, best: 0, lives: 3 };
    const chickens = [
      { x: 0, y: 38, vx: 1.1, timer: 90 },
      { x: 0, y: 38, vx: -1.3, timer: 130 },
    ];
    const eggs = [];
    let basket = { x: 0 };
    const keys = { left: false, right: false };
    let mouseX = -1, touchX = -1;

    const reset = () => {
      state.phase = "playing"; state.score = 0; state.lives = 3;
      eggs.length = 0;
      chickens[0].timer = 90; chickens[1].timer = 140;
    };

    const onKey = e => {
      if (e.key === "ArrowLeft"  || e.key === "a") { keys.left  = true; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d") { keys.right = true; e.preventDefault(); }
    };
    const onKeyUp = e => {
      if (e.key === "ArrowLeft"  || e.key === "a") keys.left  = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    };

    const getX = clientX => {
      const r = canvas.getBoundingClientRect();
      return (clientX - r.left) * (canvas.width / r.width);
    };

    canvas.addEventListener("mousemove", e => { mouseX = getX(e.clientX); });
    canvas.addEventListener("mouseleave", () => { mouseX = -1; });
    canvas.addEventListener("touchmove", e => { e.preventDefault(); touchX = getX(e.touches[0].clientX); }, {passive:false});
    canvas.addEventListener("touchend",  () => { touchX = -1; });
    canvas.addEventListener("click", () => {
      if (state.phase === "idle") reset();
      else if (state.phase === "dead") state.phase = "idle";
    });
    canvas.addEventListener("touchstart", e => {
      e.preventDefault();
      if (state.phase === "idle") reset();
      else if (state.phase === "dead") state.phase = "idle";
    }, {passive:false});
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup",   onKeyUp);

    const dark = () => document.documentElement.classList.contains("dark");
    const dot  = (x,y,r,c) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); };

    let raf;
    const tick = () => {
      if (!W) { raf = requestAnimationFrame(tick); return; }
      const dk = dark();

      ctx.fillStyle = dk ? "rgb(16,15,15)" : "rgb(245,245,245)";
      ctx.fillRect(0,0,W,H);

      const dim = dk ? "rgba(75,75,75,0.22)" : "rgba(150,150,150,0.28)";
      for (let x=BGRID; x<W; x+=BGRID) for (let y=BGRID; y<H; y+=BGRID) dot(x,y,1.2,dim);

      const BASKET_Y = H - BASKET_Y_OFFSET;

      if (state.phase === "idle") {
        chickens[0].x = W/3; chickens[1].x = 2*W/3;
        basket.x = W/2;
      }

      if (state.phase === "playing") {
        // move basket
        const margin = CATCH_HALF + 5;
        if (mouseX !== -1) {
          basket.x += (mouseX - basket.x) * 0.22;
        } else if (touchX !== -1) {
          basket.x += (touchX - basket.x) * 0.3;
        } else {
          if (keys.left)  basket.x = Math.max(margin, basket.x - 4);
          if (keys.right) basket.x = Math.min(W - margin, basket.x + 4);
        }
        basket.x = Math.max(margin, Math.min(W - margin, basket.x));

        // chickens
        chickens[0].x = Math.max(20, Math.min(W-20, Math.sin(Date.now()/2200) * (W*0.35) + W/3));
        chickens[1].x = Math.max(20, Math.min(W-20, Math.sin(Date.now()/1800 + 2) * (W*0.35) + 2*W/3));

        // egg timers
        for (const ch of chickens) {
          ch.timer--;
          if (ch.timer <= 0) {
            eggs.push({ x: ch.x, y: ch.y + 12, vy: 0.6 + Math.random()*0.8 });
            ch.timer = 70 + Math.random()*100;
          }
        }

        // move eggs + collision
        for (let i = eggs.length-1; i >= 0; i--) {
          const e = eggs[i];
          e.vy = Math.min(e.vy + 0.15, 4.5);
          e.y += e.vy;

          if (e.y >= BASKET_Y - 8) {
            const caught = Math.abs(e.x - basket.x) < CATCH_HALF;
            eggs.splice(i, 1);
            if (caught) {
              state.score++;
            } else {
              state.lives--;
              if (state.lives <= 0) {
                state.phase = "dead";
                if (state.score > state.best) state.best = state.score;
              }
            }
          }
        }
      }

      // draw chickens
      const cc = dk ? "rgba(200,195,185,0.75)" : "rgba(100,95,85,0.65)";
      for (const ch of chickens)
        for (const [dx,dy] of CHICK) dot(ch.x + dx*CSTEP, ch.y + dy*CSTEP, 2.2, cc);

      // draw eggs
      for (const e of eggs) dot(e.x, e.y, EGG_R, "rgba(255,130,0,0.9)");

      // draw basket
      const bc = "rgba(255,115,0,0.92)";
      for (const [dx,dy] of BASKET) dot(basket.x + dx*BSTEP, BASKET_Y + dy*BSTEP, 2.3, bc);

      // HUD
      ctx.font = "11px 'Source Code Pro', monospace";
      const tc = dk ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.35)";
      ctx.fillStyle = tc;

      if (state.phase === "idle") {
        ctx.textAlign = "center";
        ctx.fillText("[ click / tap to start ]", W/2, H/2 + 20);
      } else if (state.phase === "playing") {
        // score
        ctx.textAlign = "left";
        ctx.fillStyle = dk ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.48)";
        ctx.fillText(String(state.score).padStart(3,"0"), 10, 18);
        // lives
        ctx.textAlign = "right";
        ctx.fillText("♥".repeat(state.lives), W-10, 18);
      } else if (state.phase === "dead") {
        ctx.textAlign = "center";
        ctx.fillText(`score: ${state.score}  ·  best: ${state.best}`, W/2, H/2 - 5);
        ctx.fillText("[ click to retry ]", W/2, H/2 + 15);
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: `${H}px`, display: "block", borderRadius: "16px", cursor: "pointer" }}
      className="border border-black/10 dark:border-white/10"
    />
  );
};
