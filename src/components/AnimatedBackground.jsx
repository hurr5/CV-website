import { useEffect, useRef } from "react";

const SPACING = 22;
const DOT_RADIUS = 1.4;
const INFLUENCE = 80;
const PUSH_STRENGTH = 14;
const SPRING = 0.1;
const DAMPING = 0.74;

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dots = [];
    let mouse = { x: -9999, y: -9999 };
    let animId;

    const isDark = () => document.documentElement.classList.contains("dark");

    const buildGrid = () => {
      dots = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ ox: c * SPACING, oy: r * SPACING, x: c * SPACING, y: r * SPACING, vx: 0, vy: 0 });
        }
      }
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildGrid();
    };

    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = isDark();

      for (const dot of dots) {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < INFLUENCE * INFLUENCE) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / INFLUENCE) * PUSH_STRENGTH;
          dot.vx += (dx / dist) * force * 0.28;
          dot.vy += (dy / dist) * force * 0.28;
        }

        dot.vx += (dot.ox - dot.x) * SPRING;
        dot.vy += (dot.oy - dot.y) * SPRING;
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Color: lerp from base gray → orange near cursor
        const cdx = dot.x - mouse.x;
        const cdy = dot.y - mouse.y;
        const curDist = Math.sqrt(cdx * cdx + cdy * cdy);
        const t = Math.max(0, 1 - curDist / INFLUENCE);

        let r, g, b, a;
        if (dark) {
          r = Math.round(75  + t * (255 - 75));
          g = Math.round(75  + t * (105 - 75));
          b = Math.round(75  + t * (0   - 75));
          a = 0.22 + t * 0.55;
        } else {
          r = Math.round(170 + t * (255 - 170));
          g = Math.round(170 + t * (110 - 170));
          b = Math.round(170 + t * (0   - 170));
          a = 0.35 + t * 0.5;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="animated-bg">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
};

export default AnimatedBackground;
