import { useEffect, useRef } from "react";

const COLS = 20, ROWS = 20, CELL = 13;
const TICK = 8;
const rand = n => Math.floor(Math.random() * n);

export const SnakeGame = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;

    const g = {
      phase: "idle", score: 0, best: 0, frame: 0,
      body: [{x:10,y:10},{x:9,y:10},{x:8,y:10}],
      dir: {x:1,y:0}, next: {x:1,y:0},
      food: {x:15,y:10},
    };

    const spawnFood = () => {
      let f;
      do { f = {x:rand(COLS), y:rand(ROWS)}; }
      while (g.body.some(b => b.x===f.x && b.y===f.y));
      g.food = f;
    };

    const restart = () => {
      g.phase="playing"; g.score=0; g.frame=0;
      g.body=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
      g.dir={x:1,y:0}; g.next={x:1,y:0};
      spawnFood();
    };

    const hover = { in: false };
    canvas.addEventListener("mouseenter", () => hover.in = true);
    canvas.addEventListener("mouseleave", () => hover.in = false);

    const setDir = nd => {
      if (nd.x !== -g.dir.x || nd.y !== -g.dir.y) g.next = nd;
    };

    const onKey = e => {
      if (!hover.in) return;
      const map = {
        ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
        ArrowUp:{x:0,y:-1},   ArrowDown:{x:0,y:1},
        a:{x:-1,y:0}, d:{x:1,y:0}, w:{x:0,y:-1}, s:{x:0,y:1},
      };
      const nd = map[e.key];
      if (!nd) return;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (g.phase === "idle") { restart(); return; }
      if (g.phase === "dead") { g.phase = "idle"; return; }
      setDir(nd);
    };

    let ts = null;
    const onTouchStart = e => {
      e.preventDefault();
      ts = {x: e.touches[0].clientX, y: e.touches[0].clientY};
      if (g.phase === "idle") restart();
      else if (g.phase === "dead") g.phase = "idle";
    };
    const onTouchEnd = e => {
      if (!ts) return;
      const dx = e.changedTouches[0].clientX - ts.x;
      const dy = e.changedTouches[0].clientY - ts.y;
      ts = null;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
      if (g.phase !== "playing") return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? {x:1,y:0} : {x:-1,y:0});
      else                              setDir(dy > 0 ? {x:0,y:1} : {x:0,y:-1});
    };

    const onClick = () => {
      if (g.phase === "idle") restart();
      else if (g.phase === "dead") g.phase = "idle";
    };

    canvas.addEventListener("click",      onClick);
    canvas.addEventListener("touchstart", onTouchStart, {passive:false});
    canvas.addEventListener("touchend",   onTouchEnd,   {passive:false});
    window.addEventListener("keydown",    onKey);

    const dark = () => document.documentElement.classList.contains("dark");
    const dot  = (x,y,r,c) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); };

    let raf;
    const draw = () => {
      const dk = dark();
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = dk ? "rgb(16,15,15)" : "rgb(245,245,245)";
      ctx.fillRect(0,0,W,H);

      const dim = dk ? "rgba(75,75,75,0.22)" : "rgba(150,150,150,0.28)";
      for (let x=CELL/2; x<W; x+=CELL) for (let y=CELL/2; y<H; y+=CELL) dot(x,y,1.1,dim);

      if (g.phase === "playing") {
        g.frame++;
        if (g.frame % TICK === 0) {
          g.dir = g.next;
          const h = g.body[0];
          const nx = h.x+g.dir.x, ny = h.y+g.dir.y;
          if (nx<0||nx>=COLS||ny<0||ny>=ROWS||g.body.some(b=>b.x===nx&&b.y===ny)) {
            g.phase="dead"; if(g.score>g.best) g.best=g.score;
          } else {
            g.body.unshift({x:nx,y:ny});
            if (nx===g.food.x && ny===g.food.y) { g.score++; spawnFood(); }
            else g.body.pop();
          }
        }
      }

      if (g.phase !== "idle") {
        dot(g.food.x*CELL+CELL/2, g.food.y*CELL+CELL/2, 4, "rgba(255,145,0,0.95)");
        for (let i=0; i<g.body.length; i++) {
          const {x,y} = g.body[i];
          const t = 1 - i/g.body.length;
          const a = 0.45 + t*0.55;
          dot(x*CELL+CELL/2, y*CELL+CELL/2, i===0 ? 4.5 : 3.5,
            g.phase==="dead" ? `rgba(255,55,0,${a*0.7})` : `rgba(255,115,0,${a})`);
        }
      } else {
        const fy = H/2 + Math.sin(Date.now()/600)*6;
        for (let i=0; i<5; i++)
          dot(W/2 - i*CELL + CELL*2, fy, i===0 ? 4.5 : 3.5, `rgba(255,115,0,${1-i*0.17})`);
      }

      ctx.font = "11px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      const tc = dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)";
      ctx.fillStyle = tc;
      if (g.phase==="idle") {
        ctx.fillText("[ arrows / wasd / swipe ]", W/2, H/2+38);
      } else if (g.phase==="playing") {
        ctx.textAlign="right"; ctx.fillStyle=dk?"rgba(255,255,255,0.55)":"rgba(0,0,0,0.45)";
        ctx.fillText(String(g.score).padStart(3,"0"), W-6, 15);
      } else {
        ctx.fillText(`score: ${g.score}  ·  best: ${g.best}`, W/2, H/2-5);
        ctx.fillText("[ click / arrows to retry ]", W/2, H/2+15);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("click",      onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "auto", display: "block", borderRadius: "16px", cursor: "pointer" }}
      className="border border-black/10 dark:border-white/10"
    />
  );
};
