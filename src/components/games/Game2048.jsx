import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BOARD, canMove, applyMoveWithTracking, addRandomTile, tilesToGrid,
} from "./game2048Logic.js";

// ── colors ────────────────────────────────────────────────────────────────────

const PALETTE_DARK = {
  2:    ["rgba(85,85,85,0.7)",    "rgba(255,255,255,0.55)"],
  4:    ["rgba(105,105,105,0.8)", "rgba(255,255,255,0.6)"],
  8:    ["rgba(155,82,22,0.85)",  "rgba(255,255,255,0.88)"],
  16:   ["rgba(185,92,16,0.9)",   "#fff"],
  32:   ["rgba(215,102,12,0.92)", "#fff"],
  64:   ["rgba(240,112,6,0.95)",  "#fff"],
  128:  ["rgba(255,122,0,0.96)",  "#fff"],
  256:  ["rgba(255,138,0,0.97)",  "#fff"],
  512:  ["rgba(255,155,0,0.97)",  "#fff"],
  1024: ["rgba(255,172,0,0.98)",  "#fff"],
  2048: ["rgba(255,200,40,1.0)",  "#fff"],
};
const PALETTE_LIGHT = {
  2:    ["rgba(185,185,185,0.75)", "rgba(0,0,0,0.55)"],
  4:    ["rgba(165,165,165,0.85)", "rgba(0,0,0,0.6)"],
  8:    ["rgba(210,130,45,0.85)",  "#fff"],
  16:   ["rgba(228,138,32,0.9)",   "#fff"],
  32:   ["rgba(242,148,20,0.92)",  "#fff"],
  64:   ["rgba(255,158,10,0.95)",  "#fff"],
  128:  ["rgba(255,130,0,0.96)",   "#fff"],
  256:  ["rgba(255,145,0,0.97)",   "#fff"],
  512:  ["rgba(255,160,0,0.97)",   "#fff"],
  1024: ["rgba(255,175,0,0.98)",   "#fff"],
  2048: ["rgba(255,200,40,1.0)",   "#fff"],
};

const tileFs = v => v >= 1000 ? "0.58rem" : v >= 100 ? "0.72rem" : v >= 10 ? "0.85rem" : "1rem";

// ── component ─────────────────────────────────────────────────────────────────

export const Game2048 = () => {
  const idRef = useRef(1);
  const nextId = useCallback(() => idRef.current++, []);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [phase, setPhase] = useState("idle");
  const [tiles, setTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [best, setBest]   = useState(0);
  const hoverRef = useRef(false);
  const phaseRef = useRef("idle");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const startGame = useCallback(() => {
    idRef.current = 1;
    const t1 = { id: idRef.current++, value: Math.random() < 0.9 ? 2 : 4, row: Math.floor(Math.random()*4), col: Math.floor(Math.random()*4), isNew: false };
    const t2 = addRandomTile([t1], () => idRef.current++);
    if (!t2) return;
    t2.isNew = false;
    setTiles([t1, t2]);
    setScore(0);
    setPhase("playing");
  }, []);

  const move = useCallback((dir) => {
    setTiles(prev => {
      const { newTiles, added, changed } = applyMoveWithTracking(prev, dir, () => idRef.current++);
      if (!changed) return prev;

      const spawned = addRandomTile(newTiles, () => idRef.current++);
      const final = spawned ? [...newTiles, spawned] : newTiles;

      if (added > 0) {
        setScore(s => {
          const ns = s + added;
          setBest(b => Math.max(b, ns));
          return ns;
        });
      }

      const grid = tilesToGrid(final);
      if (final.some(t => t.value === 2048)) {
        setTimeout(() => setPhase("won"), 50);
      } else if (!canMove(grid)) {
        setTimeout(() => setPhase("dead"), 50);
      }

      return final;
    });
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (!hoverRef.current) return;
      const map = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 };
      const dir = map[e.key];
      if (dir === undefined) return;
      e.preventDefault();
      const p = phaseRef.current;
      if (p === "idle") { startGame(); return; }
      if (p === "dead" || p === "won") { setPhase("idle"); return; }
      move(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, startGame]);

  const touchRef = useRef(null);

  const handleClick = () => {
    if (phase === "idle") startGame();
    else if (phase === "dead" || phase === "won") setPhase("idle");
  };

  const onTouchStart = e => {
    e.preventDefault();
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (phase === "idle") startGame();
    else if (phase === "dead" || phase === "won") setPhase("idle");
  };

  const onTouchEnd = e => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (phase !== "playing") return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 0) : (dy > 0 ? 3 : 2));
  };

  const pal = isDark ? PALETTE_DARK : PALETTE_LIGHT;
  const cellBg = isDark ? "rgba(40,40,40,0.45)" : "rgba(200,200,200,0.4)";
  const boardBg = isDark ? "rgba(30,30,30,0.6)" : "rgba(210,210,210,0.45)";

  return (
    <div
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {/* Score row — only occupies space while playing */}
      {phase !== "idle" && (
        <div style={{
          fontFamily: "'Source Code Pro', monospace",
          fontSize: "11px",
          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
          marginBottom: "6px",
        }}>
          {score}
        </div>
      )}

      {/* Board */}
      <div
        style={{ background: boardBg, borderRadius: "12px", padding: "6px", position: "relative" }}
        className="border border-black/10 dark:border-white/10"
      >
        {/* Grid: background cells + tile layer */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD}, 1fr)`,
          gap: "5px",
          aspectRatio: "1",
          position: "relative",
        }}>
          {/* Background empty cells */}
          {Array.from({ length: BOARD * BOARD }).map((_, i) => (
            <div
              key={`bg-${i}`}
              style={{ background: cellBg, borderRadius: "7px" }}
            />
          ))}

          {/* Animated tiles – explicitly placed in the same grid */}
          <AnimatePresence>
            {phase !== "idle" && tiles.map(tile => {
              const [bg, color] = pal[tile.value] || pal[2048];
              return (
                <motion.div
                  key={tile.id}
                  layout
                  initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.08 } }}
                  transition={{ duration: 0.12, ease: [0.2, 0, 0.2, 1] }}
                  style={{
                    gridRow: tile.row + 1,
                    gridColumn: tile.col + 1,
                    background: bg,
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Source Code Pro', monospace",
                    fontWeight: "bold",
                    fontSize: tileFs(tile.value),
                    color,
                    zIndex: 1,
                  }}
                >
                  {tile.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* State overlays */}
        {(phase === "dead" || phase === "won") && (
          <div style={{
            position: "absolute", inset: 0,
            background: isDark ? "rgba(16,15,15,0.75)" : "rgba(245,245,245,0.75)",
            borderRadius: "12px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "6px",
            fontFamily: "'Source Code Pro', monospace",
          }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>
              {phase === "won" ? "2048!" : "game over"}
            </div>
            <div style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}>
              {`score: ${score}  ·  best: ${best}`}
            </div>
            <div style={{ fontSize: "10px", color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)", marginTop: "4px" }}>
              [ click to restart ]
            </div>
          </div>
        )}

        {phase === "idle" && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Source Code Pro', monospace",
            fontSize: "11px",
            color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)",
          }}>
            [ arrows / swipe ]
          </div>
        )}
      </div>
    </div>
  );
};
