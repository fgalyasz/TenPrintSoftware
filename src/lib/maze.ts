export type MazeSegment = { x1: number; y1: number; x2: number; y2: number };

export type MazeOptions = {
  columns: number;
  rows: number;
  cell: number;
  seed: number;
  inset?: number;
};

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildMaze(options: MazeOptions): MazeSegment[] {
  const { columns, rows, cell, seed, inset = 0 } = options;
  const random = createRandom(seed);
  const segments: MazeSegment[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = column * cell + inset;
      const top = row * cell + inset;
      const right = left + cell - inset * 2;
      const bottom = top + cell - inset * 2;
      const forward = random() < 0.5;
      segments.push(
        forward
          ? { x1: left, y1: bottom, x2: right, y2: top }
          : { x1: left, y1: top, x2: right, y2: bottom },
      );
    }
  }
  return segments;
}

export function toPathData(segments: MazeSegment[]): string {
  return segments
    .map(({ x1, y1, x2, y2 }) => `M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}`)
    .join("");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function mazePath(options: MazeOptions): string {
  return toPathData(buildMaze(options));
}
