import { describe, it, expect, vi } from "vitest";
import {
  BOARD,
  emptyGrid,
  canMove,
  applyMoveWithTracking,
  addRandomTile,
  tilesToGrid,
} from "../game2048Logic.js";

// helper: build tile list from a simple grid array
const makeTiles = (rows) => {
  const tiles = [];
  let id = 1;
  rows.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) tiles.push({ id: id++, value: val, row: r, col: c, isNew: false });
    })
  );
  return tiles;
};

const idGen = () => {
  let n = 100;
  return () => n++;
};

// ── emptyGrid ─────────────────────────────────────────────────────────────────

describe("emptyGrid", () => {
  it("returns 4×4 grid of zeros", () => {
    const g = emptyGrid();
    expect(g).toHaveLength(BOARD);
    g.forEach(row => {
      expect(row).toHaveLength(BOARD);
      row.forEach(v => expect(v).toBe(0));
    });
  });
});

// ── canMove ───────────────────────────────────────────────────────────────────

describe("canMove", () => {
  it("returns true when there is an empty cell", () => {
    const g = emptyGrid();
    g[0][0] = 2;
    expect(canMove(g)).toBe(true);
  });

  it("returns true when adjacent cells have equal values", () => {
    // full board, no empty, but two adjacent cells match
    const g = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4],
      [8, 16, 32, 64],
    ];
    // last row has 64 at [3][3] and [1][3] has 256 — no adjacent match, but [3][0]=8 and [2][0]=512 differ
    // Actually this board has no matches — should return false
    expect(canMove(g)).toBe(false);
  });

  it("returns true when two horizontally adjacent cells match", () => {
    const g = [
      [2, 2, 4, 8],
      [16, 32, 64, 128],
      [256, 512, 1024, 2048],
      [4, 8, 16, 32],
    ];
    expect(canMove(g)).toBe(true);
  });

  it("returns true when two vertically adjacent cells match", () => {
    const g = [
      [2, 4, 8, 16],
      [2, 32, 64, 128],
      [4, 8, 16, 32],
      [8, 16, 32, 64],
    ];
    expect(canMove(g)).toBe(true);
  });

  it("returns false for a stuck full board", () => {
    // checkerboard of 2/4 — no adjacent matches, no empty
    const g = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(canMove(g)).toBe(false);
  });
});

// ── tilesToGrid ───────────────────────────────────────────────────────────────

describe("tilesToGrid", () => {
  it("maps tiles to correct grid positions", () => {
    const tiles = [
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 4, row: 1, col: 3 },
      { id: 3, value: 8, row: 3, col: 2 },
    ];
    const g = tilesToGrid(tiles);
    expect(g[0][0]).toBe(2);
    expect(g[1][3]).toBe(4);
    expect(g[3][2]).toBe(8);
    expect(g[0][1]).toBe(0);
  });
});

// ── applyMoveWithTracking ─────────────────────────────────────────────────────

describe("applyMoveWithTracking — left (dir 0)", () => {
  it("slides tiles to the left", () => {
    const tiles = makeTiles([
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, changed } = applyMoveWithTracking(tiles, 0, next);
    expect(changed).toBe(true);
    expect(newTiles).toHaveLength(1);
    expect(newTiles[0]).toMatchObject({ value: 2, row: 0, col: 0 });
  });

  it("does NOT change when already left-packed", () => {
    const tiles = makeTiles([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { changed } = applyMoveWithTracking(tiles, 0, next);
    expect(changed).toBe(false);
  });

  it("merges two equal tiles and adds score", () => {
    const tiles = makeTiles([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, added, changed } = applyMoveWithTracking(tiles, 0, next);
    expect(changed).toBe(true);
    expect(added).toBe(4);
    expect(newTiles).toHaveLength(1);
    expect(newTiles[0]).toMatchObject({ value: 4, col: 0, isNew: true });
  });

  it("does NOT double-merge in one move (2,2,2 → 4,2 not 4,skip,2)", () => {
    const tiles = makeTiles([
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, added } = applyMoveWithTracking(tiles, 0, next);
    // first pair merges → 4, third 2 slides
    expect(added).toBe(4);
    expect(newTiles).toHaveLength(2);
    const vals = newTiles.map(t => t.value).sort((a, b) => a - b);
    expect(vals).toEqual([2, 4]);
  });

  it("packs multiple rows independently", () => {
    const tiles = makeTiles([
      [0, 4, 0, 0],
      [0, 0, 8, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles } = applyMoveWithTracking(tiles, 0, next);
    const row0 = newTiles.find(t => t.row === 0);
    const row1 = newTiles.find(t => t.row === 1);
    expect(row0).toMatchObject({ value: 4, col: 0 });
    expect(row1).toMatchObject({ value: 8, col: 0 });
  });
});

describe("applyMoveWithTracking — right (dir 1)", () => {
  it("slides tiles to the right", () => {
    const tiles = makeTiles([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, changed } = applyMoveWithTracking(tiles, 1, next);
    expect(changed).toBe(true);
    expect(newTiles[0]).toMatchObject({ value: 2, col: 3 });
  });

  it("merges two equal tiles to rightmost position", () => {
    const tiles = makeTiles([
      [0, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, added } = applyMoveWithTracking(tiles, 1, next);
    expect(added).toBe(4);
    expect(newTiles[0]).toMatchObject({ value: 4, col: 3 });
  });
});

describe("applyMoveWithTracking — up (dir 2)", () => {
  it("slides tiles upward", () => {
    const tiles = makeTiles([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, changed } = applyMoveWithTracking(tiles, 2, next);
    expect(changed).toBe(true);
    expect(newTiles[0]).toMatchObject({ value: 2, row: 0, col: 0 });
  });

  it("merges vertically equal tiles upward", () => {
    const tiles = makeTiles([
      [4, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, added } = applyMoveWithTracking(tiles, 2, next);
    expect(added).toBe(8);
    expect(newTiles[0]).toMatchObject({ value: 8, row: 0, col: 0 });
  });
});

describe("applyMoveWithTracking — down (dir 3)", () => {
  it("slides tiles downward", () => {
    const tiles = makeTiles([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, changed } = applyMoveWithTracking(tiles, 3, next);
    expect(changed).toBe(true);
    expect(newTiles[0]).toMatchObject({ value: 2, row: 3, col: 0 });
  });

  it("merges vertically equal tiles downward", () => {
    const tiles = makeTiles([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [8, 0, 0, 0],
      [8, 0, 0, 0],
    ]);
    const next = idGen();
    const { newTiles, added } = applyMoveWithTracking(tiles, 3, next);
    expect(added).toBe(16);
    expect(newTiles[0]).toMatchObject({ value: 16, row: 3, col: 0 });
  });
});

// ── addRandomTile ─────────────────────────────────────────────────────────────

describe("addRandomTile", () => {
  it("places a tile in an empty cell", () => {
    const tiles = makeTiles([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = idGen();
    const t = addRandomTile(tiles, next);
    expect(t).not.toBeNull();
    expect([2, 4]).toContain(t.value);
    expect(t.row).toBeGreaterThanOrEqual(0);
    expect(t.col).toBeGreaterThanOrEqual(0);
    // must not overlap existing tile at (0,0)
    expect(t.row === 0 && t.col === 0).toBe(false);
  });

  it("returns null when board is full", () => {
    const tiles = [];
    let id = 1;
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        tiles.push({ id: id++, value: 2, row: r, col: c, isNew: false });
    const next = idGen();
    expect(addRandomTile(tiles, next)).toBeNull();
  });

  it("spawns value 2 with ~90% probability", () => {
    const mathRandom = vi.spyOn(Math, "random");
    mathRandom.mockReturnValue(0.5); // < 0.9 → value 2
    const tile = addRandomTile([], idGen());
    expect(tile.value).toBe(2);

    mathRandom.mockReturnValue(0.95); // >= 0.9 → value 4
    const tile2 = addRandomTile([], idGen());
    expect(tile2.value).toBe(4);

    mathRandom.mockRestore();
  });

  it("marks spawned tile as isNew: true", () => {
    const t = addRandomTile([], idGen());
    expect(t.isNew).toBe(true);
  });
});
