export const BOARD = 4;

export const emptyGrid = () =>
  Array(BOARD).fill(null).map(() => Array(BOARD).fill(0));

export const canMove = grid => {
  for (let r = 0; r < BOARD; r++) for (let c = 0; c < BOARD; c++) {
    if (!grid[r][c]) return true;
    if (c < BOARD-1 && grid[r][c] === grid[r][c+1]) return true;
    if (r < BOARD-1 && grid[r][c] === grid[r+1][c]) return true;
  }
  return false;
};

export const applyMoveWithTracking = (tiles, dir, nextId) => {
  let added = 0;
  let changed = false;
  const result = [];

  if (dir === 0 || dir === 1) { // left / right
    for (let r = 0; r < BOARD; r++) {
      const rowTiles = tiles
        .filter(t => t.row === r)
        .sort((a, b) => dir === 0 ? a.col - b.col : b.col - a.col);

      let writeCol = dir === 0 ? 0 : BOARD - 1;
      const delta = dir === 0 ? 1 : -1;
      let i = 0;
      while (i < rowTiles.length) {
        if (i+1 < rowTiles.length && rowTiles[i].value === rowTiles[i+1].value) {
          const val = rowTiles[i].value * 2;
          added += val;
          if (rowTiles[i].col !== writeCol) changed = true;
          if (rowTiles[i+1].col !== writeCol) changed = true;
          result.push({ id: nextId(), value: val, row: r, col: writeCol, isNew: true });
          i += 2;
        } else {
          const t = rowTiles[i];
          if (t.col !== writeCol) changed = true;
          result.push({ id: t.id, value: t.value, row: r, col: writeCol, isNew: false });
          i++;
        }
        writeCol += delta;
      }
    }
  } else { // up / down
    for (let c = 0; c < BOARD; c++) {
      const colTiles = tiles
        .filter(t => t.col === c)
        .sort((a, b) => dir === 2 ? a.row - b.row : b.row - a.row);

      let writeRow = dir === 2 ? 0 : BOARD - 1;
      const delta = dir === 2 ? 1 : -1;
      let i = 0;
      while (i < colTiles.length) {
        if (i+1 < colTiles.length && colTiles[i].value === colTiles[i+1].value) {
          const val = colTiles[i].value * 2;
          added += val;
          if (colTiles[i].row !== writeRow) changed = true;
          if (colTiles[i+1].row !== writeRow) changed = true;
          result.push({ id: nextId(), value: val, row: writeRow, col: c, isNew: true });
          i += 2;
        } else {
          const t = colTiles[i];
          if (t.row !== writeRow) changed = true;
          result.push({ id: t.id, value: t.value, row: writeRow, col: c, isNew: false });
          i++;
        }
        writeRow += delta;
      }
    }
  }

  return { newTiles: result, added, changed };
};

export const addRandomTile = (tiles, nextId) => {
  const occupied = new Set(tiles.map(t => `${t.row},${t.col}`));
  const empty = [];
  for (let r = 0; r < BOARD; r++)
    for (let c = 0; c < BOARD; c++)
      if (!occupied.has(`${r},${c}`)) empty.push([r, c]);
  if (!empty.length) return null;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  return { id: nextId(), value: Math.random() < 0.9 ? 2 : 4, row: r, col: c, isNew: true };
};

export const tilesToGrid = tiles => {
  const g = emptyGrid();
  for (const t of tiles) g[t.row][t.col] = t.value;
  return g;
};
