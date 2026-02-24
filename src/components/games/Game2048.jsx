import { useEffect, useRef } from "react";

const BOARD = 4;
const GAP   = 4;
const MARGIN = 10;

const TILE_COLORS_DARK = {
  0:    null,
  2:    "rgba(85,85,85,0.7)",
  4:    "rgba(105,105,105,0.8)",
  8:    "rgba(155,82,22,0.85)",
  16:   "rgba(185,92,16,0.9)",
  32:   "rgba(215,102,12,0.92)",
  64:   "rgba(240,112,6,0.95)",
  128:  "rgba(255,122,0,0.96)",
  256:  "rgba(255,138,0,0.97)",
  512:  "rgba(255,155,0,0.97)",
  1024: "rgba(255,172,0,0.98)",
  2048: "rgba(255,200,40,1.0)",
};
const TILE_COLORS_LIGHT = {
  0:    null,
  2:    "rgba(185,185,185,0.75)",
  4:    "rgba(165,165,165,0.85)",
  8:    "rgba(210,130,45,0.85)",
  16:   "rgba(228,138,32,0.9)",
  32:   "rgba(242,148,20,0.92)",
  64:   "rgba(255,158,10,0.95)",
  128:  "rgba(255,130,0,0.96)",
  256:  "rgba(255,145,0,0.97)",
  512:  "rgba(255,160,0,0.97)",
  1024: "rgba(255,175,0,0.98)",
  2048: "rgba(255,200,40,1.0)",
};

const emptyGrid = () => Array(BOARD).fill(null).map(() => Array(BOARD).fill(0));

const addRandom = g => {
  const emp = [];
  for (let r=0; r<BOARD; r++) for (let c=0; c<BOARD; c++) if (!g[r][c]) emp.push([r,c]);
  if (!emp.length) return;
  const [r,c] = emp[Math.floor(Math.random()*emp.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
};

const slideRow = row => {
  const nums = row.filter(x => x);
  let score = 0;
  const out = [];
  let i = 0;
  while (i < nums.length) {
    if (i+1 < nums.length && nums[i] === nums[i+1]) {
      const v = nums[i]*2; out.push(v); score += v; i += 2;
    } else { out.push(nums[i++]); }
  }
  while (out.length < BOARD) out.push(0);
  return { out, score };
};

const applyMove = (grid, dir) => {
  const g = grid.map(r => [...r]);
  let score = 0, changed = false;

  const processRow = row => {
    const {out, score:s} = slideRow(row);
    score += s;
    if (out.some((v,i) => v !== row[i])) changed = true;
    return out;
  };

  if (dir === 0) { // left
    for (let r=0; r<BOARD; r++) g[r] = processRow(g[r]);
  } else if (dir === 1) { // right
    for (let r=0; r<BOARD; r++) {
      const {out, score:s} = slideRow([...g[r]].reverse());
      score += s; const rev = out.reverse();
      if (rev.some((v,i) => v !== g[r][i])) changed = true;
      g[r] = rev;
    }
  } else if (dir === 2) { // up
    for (let c=0; c<BOARD; c++) {
      const col = [g[0][c],g[1][c],g[2][c],g[3][c]];
      const {out, score:s} = slideRow(col);
      score += s; if (out.some((v,i) => v !== col[i])) changed = true;
      for (let r=0; r<BOARD; r++) g[r][c] = out[r];
    }
  } else { // down
    for (let c=0; c<BOARD; c++) {
      const col = [g[3][c],g[2][c],g[1][c],g[0][c]];
      const {out, score:s} = slideRow(col);
      score += s; const rev = out.reverse();
      if (rev.some((v,i) => v !== [g[0][c],g[1][c],g[2][c],g[3][c]][i])) changed = true;
      for (let r=0; r<BOARD; r++) g[r][c] = rev[r];
    }
  }
  return { grid: g, score, changed };
};

const canMove = grid => {
  for (let r=0; r<BOARD; r++) for (let c=0; c<BOARD; c++) {
    if (!grid[r][c]) return true;
    if (c<BOARD-1 && grid[r][c]===grid[r][c+1]) return true;
    if (r<BOARD-1 && grid[r][c]===grid[r+1][c]) return true;
  }
  return false;
};

export const Game2048 = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const SIZE = 260;
    canvas.width = canvas.height = SIZE;

    const CELL = Math.floor((SIZE - MARGIN*2 - GAP*(BOARD+1)) / BOARD); // 55
    const BOARD_W = BOARD*CELL + (BOARD+1)*GAP;
    const OX = (SIZE - BOARD_W) / 2;
    const OY = OX;

    const state = { phase: "idle", grid: emptyGrid(), score: 0, best: 0 };

    const startGame = () => {
      state.grid = emptyGrid();
      addRandom(state.grid); addRandom(state.grid);
      state.score = 0; state.phase = "playing";
    };

    const move = dir => {
      if (state.phase !== "playing") return;
      const {grid, score, changed} = applyMove(state.grid, dir);
      if (!changed) return;
      state.grid = grid;
      state.score += score;
      if (state.score > state.best) state.best = state.score;
      addRandom(state.grid);
      if (state.grid.flat().includes(2048)) state.phase = "won";
      else if (!canMove(state.grid)) state.phase = "dead";
    };

    const hover = { in: false };
    canvas.addEventListener("mouseenter", () => hover.in = true);
    canvas.addEventListener("mouseleave", () => hover.in = false);

    const onKey = e => {
      if (!hover.in) return;
      const map = {ArrowLeft:0, ArrowRight:1, ArrowUp:2, ArrowDown:3};
      const dir = map[e.key];
      if (dir === undefined) return;
      e.preventDefault();
      if (state.phase === "idle") { startGame(); return; }
      if (state.phase === "dead" || state.phase === "won") { state.phase = "idle"; return; }
      move(dir);
    };

    let ts = null;
    const onTouchStart = e => {
      e.preventDefault();
      ts = {x: e.touches[0].clientX, y: e.touches[0].clientY};
      if (state.phase === "idle") startGame();
      else if (state.phase === "dead" || state.phase === "won") state.phase = "idle";
    };
    const onTouchEnd = e => {
      if (!ts) return;
      const dx = e.changedTouches[0].clientX - ts.x;
      const dy = e.changedTouches[0].clientY - ts.y;
      ts = null;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (state.phase !== "playing") return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 0);
      else                             move(dy > 0 ? 3 : 2);
    };
    const onClick = () => {
      if (state.phase === "idle") startGame();
      else if (state.phase === "dead" || state.phase === "won") state.phase = "idle";
    };

    canvas.addEventListener("click",      onClick);
    canvas.addEventListener("touchstart", onTouchStart, {passive:false});
    canvas.addEventListener("touchend",   onTouchEnd,   {passive:false});
    window.addEventListener("keydown",    onKey);

    const dark = () => document.documentElement.classList.contains("dark");

    const drawTile = (x, y, val, dk) => {
      const colors = dk ? TILE_COLORS_DARK : TILE_COLORS_LIGHT;
      const bg = colors[val] || colors[2048];
      if (!bg) {
        ctx.fillStyle = dk ? "rgba(40,40,40,0.45)" : "rgba(200,200,200,0.4)";
        ctx.beginPath(); ctx.roundRect(x, y, CELL, CELL, 6); ctx.fill();
        ctx.beginPath(); ctx.arc(x+CELL/2, y+CELL/2, 1.5, 0, Math.PI*2);
        ctx.fillStyle = dk ? "rgba(80,80,80,0.4)" : "rgba(150,150,150,0.4)"; ctx.fill();
        return;
      }
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(x, y, CELL, CELL, 6); ctx.fill();
      const fs = val >= 1000 ? 11 : val >= 100 ? 13 : val >= 10 ? 15 : 17;
      ctx.fillStyle = val <= 8 ? (dk ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)") : "rgba(255,255,255,0.92)";
      ctx.font = `bold ${fs}px 'Source Code Pro', monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(val), x+CELL/2, y+CELL/2);
    };

    let raf;
    const draw = () => {
      const dk = dark();
      ctx.fillStyle = dk ? "rgb(16,15,15)" : "rgb(245,245,245)";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // bg dots
      const dim = dk ? "rgba(75,75,75,0.22)" : "rgba(150,150,150,0.28)";
      for (let x=10; x<SIZE; x+=14) for (let y=10; y<SIZE; y+=14) {
        ctx.beginPath(); ctx.arc(x,y,1.1,0,Math.PI*2);
        ctx.fillStyle=dim; ctx.fill();
      }

      // board bg
      ctx.fillStyle = dk ? "rgba(30,30,30,0.6)" : "rgba(210,210,210,0.45)";
      ctx.beginPath(); ctx.roundRect(OX-GAP, OY-GAP, BOARD_W+GAP*2, BOARD_W+GAP*2, 10); ctx.fill();

      // tiles
      for (let r=0; r<BOARD; r++) for (let c=0; c<BOARD; c++) {
        const x = OX + GAP + c*(CELL+GAP);
        const y = OY + GAP + r*(CELL+GAP);
        drawTile(x, y, state.grid[r]?.[c] ?? 0, dk);
      }

      ctx.font = "11px 'Source Code Pro', monospace";
      const tc = dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)";
      ctx.fillStyle = tc;
      if (state.phase === "idle") {
        ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillText("[ arrows / swipe to start ]", SIZE/2, SIZE - 10);
      } else {
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillStyle = dk ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
        ctx.fillText(`${state.score}`, 12, 18);
      }
      if (state.phase === "dead" || state.phase === "won") {
        ctx.fillStyle = dk ? "rgba(16,15,15,0.7)" : "rgba(245,245,245,0.7)";
        ctx.fillRect(0,0,SIZE,SIZE);
        ctx.fillStyle = dk ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)";
        ctx.font = "13px 'Source Code Pro', monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(state.phase === "won" ? "2048!" : "game over", SIZE/2, SIZE/2 - 12);
        ctx.fillText(`score: ${state.score}  ·  best: ${state.best}`, SIZE/2, SIZE/2 + 8);
        ctx.font = "11px 'Source Code Pro', monospace";
        ctx.fillStyle = tc;
        ctx.fillText("[ click to restart ]", SIZE/2, SIZE/2 + 30);
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
