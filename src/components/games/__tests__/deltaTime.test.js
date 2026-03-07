import { describe, it, expect } from "vitest";

// ── Delta-time accumulator (used in SnakeGame, FlappyBird, CatchEgg) ──────────
// The key invariant: at any refresh rate, the game advances the same amount
// over a given wall-clock duration.

const TICK_MS = 133; // snake tick interval

/**
 * Simulates the snake elapsed accumulator over totalMs at a given fps.
 * Returns how many game ticks fired.
 */
function simulateTicks(totalMs, fps) {
  const frameMs = 1000 / fps;
  let elapsed = 0;
  let ticks = 0;
  let t = 0;
  while (t < totalMs) {
    const dt = Math.min(frameMs, totalMs - t);
    elapsed += dt;
    while (elapsed >= TICK_MS) {
      elapsed -= TICK_MS;
      ticks++;
    }
    t += frameMs;
  }
  return ticks;
}

describe("delta-time tick accumulator (SnakeGame)", () => {
  it("fires the same number of ticks at 60fps and 144fps over 1 second", () => {
    const ticks60  = simulateTicks(1000, 60);
    const ticks144 = simulateTicks(1000, 144);
    // Both should produce ~7 ticks (1000 / 133 ≈ 7.5)
    expect(ticks60).toBe(ticks144);
  });

  it("fires the same number of ticks at 60fps and 240fps over 2 seconds", () => {
    expect(simulateTicks(2000, 60)).toBe(simulateTicks(2000, 240));
  });

  it("produces ~7 ticks per second", () => {
    const ticks = simulateTicks(1000, 60);
    expect(ticks).toBeGreaterThanOrEqual(7);
    expect(ticks).toBeLessThanOrEqual(8);
  });

  it("accumulated elapsed never exceeds TICK_MS after capping", () => {
    let elapsed = 0;
    const dt = 50; // capped max dt
    let overflows = 0;
    for (let i = 0; i < 100; i++) {
      elapsed += dt;
      while (elapsed >= TICK_MS) {
        elapsed -= TICK_MS;
        overflows++;
      }
      expect(elapsed).toBeLessThan(TICK_MS);
    }
    expect(overflows).toBeGreaterThan(0);
  });
});

// ── dt/DT60 scaling (FlappyBird, CatchEgg physics) ────────────────────────────
// At any frame rate, the total "physics work" done in 1 second must be equal.

const DT60 = 16.667;
const GRAVITY = 0.38; // px/frame at 60fps

/**
 * Simulates the bird falling from rest over totalMs at the given fps.
 * Returns final y velocity (in "px/frame" units, scaled by dt/DT60).
 */
function simulateFall(totalMs, fps) {
  const frameMs = 1000 / fps;
  let bvy = 0;
  let by = 0;
  let t = 0;
  while (t < totalMs) {
    const dt = Math.min(frameMs, totalMs - t);
    const scale = dt / DT60;
    bvy += GRAVITY * scale;
    by  += bvy    * scale;
    t   += frameMs;
  }
  return { bvy, by };
}

describe("dt-scaled physics (FlappyBird gravity)", () => {
  it("bird falls to approximately the same position at 60fps and 120fps", () => {
    const r60  = simulateFall(500, 60);
    const r120 = simulateFall(500, 120);
    // dt/DT60 is first-order integration — agree within 3% relative error
    const relError = Math.abs(r60.by - r120.by) / Math.abs(r60.by);
    expect(relError).toBeLessThan(0.03);
  });

  it("bird falls to approximately the same position at 60fps and 144fps", () => {
    const r60  = simulateFall(500, 60);
    const r144 = simulateFall(500, 144);
    const relError = Math.abs(r60.by - r144.by) / Math.abs(r60.by);
    expect(relError).toBeLessThan(0.03);
  });

  it("dt cap of 50ms prevents spiral on tab-hide resumption", () => {
    // A single 500ms dt (tab hidden) is capped to 50ms — physics shouldn't explode
    const cappedDt = Math.min(500, 50);
    const scale = cappedDt / DT60;
    let bvy = 0;
    bvy += GRAVITY * scale;
    // Should be far less than uncapped (500/16.667 * 0.38 = ~11.4)
    expect(bvy).toBeLessThan(2);
    expect(bvy).toBeGreaterThan(0);
  });
});

// ── Exponential lerp (CatchEgg basket) ────────────────────────────────────────

describe("exponential lerp (CatchEgg basket)", () => {
  const FACTOR = 0.22; // per-frame lerp factor

  function lerpPos(targetX, startX, totalMs, fps) {
    const frameMs = 1000 / fps;
    let x = startX;
    let t = 0;
    while (t < totalMs) {
      const dt = Math.min(frameMs, totalMs - t);
      const f = 1 - Math.pow(1 - FACTOR, dt / DT60);
      x += (targetX - x) * f;
      t += frameMs;
    }
    return x;
  }

  it("basket reaches approximately the same position at 60fps and 144fps", () => {
    const pos60  = lerpPos(300, 0, 300, 60);
    const pos144 = lerpPos(300, 0, 300, 144);
    const relError = Math.abs(pos60 - pos144) / Math.abs(pos60);
    expect(relError).toBeLessThan(0.02);
  });

  it("basket converges toward target over time", () => {
    const pos100 = lerpPos(300, 0, 100, 60);
    const pos300 = lerpPos(300, 0, 300, 60);
    expect(pos300).toBeGreaterThan(pos100);
    expect(pos300).toBeLessThan(300);
  });
});
