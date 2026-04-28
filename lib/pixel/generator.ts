/**
 * Procedural pixel art character generator.
 *
 * Given a deterministic seed string, always produces the same unique 16x16 sprite.
 * Algorithm:
 * 1. Hash seed → seeded LCG random number generator
 * 2. Generate left half of a 10x12 body grid (body/outline/empty)
 * 3. Mirror to right half → symmetric character
 * 4. Place on a 16x16 canvas with padding
 * 5. Derive a 4-color palette from the seed (body, outline, accent, eyes)
 * 6. Output as flat RGBA Uint8ClampedArray (suitable for ImageData or PIXI.Texture)
 */

// --- Seeded LCG RNG ---
function createRng(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  // LCG parameters (Numerical Recipes)
  let s = h >>> 0
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0
    return s / 0xffffffff
  }
}

// --- Palette generation ---
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255)
  }
  return [f(0), f(8), f(4)]
}

function seedToPalette(rng: () => number): {
  body: [number, number, number]
  outline: [number, number, number]
  accent: [number, number, number]
  eyes: [number, number, number]
  bg: [number, number, number, number]
} {
  const hue = rng() * 360
  const saturation = 0.5 + rng() * 0.4     // 0.5–0.9
  const lightness = 0.55 + rng() * 0.2     // 0.55–0.75

  const body = hslToRgb(hue, saturation, lightness)
  const outline = hslToRgb(hue, saturation * 0.8, lightness * 0.4)
  const accent = hslToRgb((hue + 120 + rng() * 60) % 360, 0.7, 0.6)
  const eyes = [20, 20, 20] as [number, number, number]

  return { body, outline, accent, eyes, bg: [0, 0, 0, 0] }
}

// --- Grid generation ---
// We generate the left half (8 cols) of a 16-row grid
// Cell types: 0=empty, 1=body, 2=outline, 3=accent, 4=eyes
const GRID_ROWS = 16
const GRID_COLS = 8  // left half only; will be mirrored

function generateHalfGrid(rng: () => number, stage: number): number[][] {
  const grid: number[][] = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0))

  // Define rough body shape by stage
  // Stage 0 (egg): round, no limbs
  // Stage 1 (baby): small rounded body, stubby limbs
  // Stage 2 (teen): taller, ears/spikes
  // Stage 3 (adult): full character with accessories

  if (stage === 0) {
    // Egg — simple oval in center
    const eggRows = [[4,5,5,4],[5,6,6,5],[5,6,6,5],[5,6,6,5],[5,6,6,5],[4,5,5,4]]
    for (let r = 5; r < 11; r++) {
      for (let c = 2; c < 6; c++) {
        grid[r][c] = 1
      }
    }
    grid[7][3] = 4 // eye
    grid[7][4] = 4
  } else {
    // Body core
    const bodyTop = stage === 1 ? 7 : stage === 2 ? 5 : 4
    const bodyBottom = stage === 1 ? 13 : stage === 2 ? 13 : 14
    const bodyLeft = stage === 1 ? 2 : stage === 2 ? 1 : 1
    const bodyRight = stage === 1 ? 6 : stage === 2 ? 6 : 7

    for (let r = bodyTop; r <= bodyBottom; r++) {
      for (let c = bodyLeft; c < bodyRight; c++) {
        grid[r][c] = 1
      }
    }

    // Head
    const headTop = stage === 1 ? 4 : stage === 2 ? 2 : 1
    const headBottom = bodyTop - 1
    const headLeft = stage === 1 ? 2 : 1
    const headRight = stage === 1 ? 6 : 7

    for (let r = headTop; r <= headBottom; r++) {
      for (let c = headLeft; c < headRight; c++) {
        grid[r][c] = 1
      }
    }

    // Eyes (single eye on left side, will be mirrored)
    const eyeRow = headTop + Math.floor((headBottom - headTop) * 0.5)
    grid[eyeRow][headLeft + 1] = 4

    // Accent detail (randomly placed)
    const accentRow = headTop + 1
    if (accentRow < headBottom && rng() > 0.4) {
      grid[accentRow][headLeft] = 3  // ear/spike
    }

    // Legs/stub
    if (stage >= 1) {
      grid[bodyBottom + 1] = [...grid[bodyBottom + 1]]
      if (bodyBottom + 1 < GRID_ROWS) {
        grid[bodyBottom + 1][2] = 1
        grid[bodyBottom + 1][4] = 1
      }
    }

    // Accessories for adult stage
    if (stage === 3 && rng() > 0.5) {
      // Hat
      for (let c = 2; c < 6; c++) grid[headTop - 1] && (grid[headTop - 1][c] = 3)
      grid[headTop - 2] && ([3, 4, 5].forEach(c => grid[headTop - 2][c] = 3))
    }
  }

  return grid
}

// --- Mirror and composite into full 16x16 grid ---
function mirrorGrid(half: number[][]): number[][] {
  return half.map(row => {
    const mirrored = [...row, ...[...row].reverse()]
    return mirrored.slice(0, 16)
  })
}

// --- Render to RGBA flat array ---
function renderToRGBA(grid: number[][], palette: ReturnType<typeof seedToPalette>): Uint8ClampedArray {
  const size = GRID_ROWS * GRID_ROWS * 4
  const buffer = new ArrayBuffer(size)
  const data = new Uint8ClampedArray(buffer)

  const colorMap: Record<number, [number, number, number, number]> = {
    0: [0, 0, 0, 0],
    1: [...palette.body, 255],
    2: [...palette.outline, 255],
    3: [...palette.accent, 255],
    4: [...palette.eyes, 255],
  }

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_ROWS; c++) {
      const cell = grid[r]?.[c] ?? 0
      const color = colorMap[cell] ?? [0, 0, 0, 0]
      const idx = (r * GRID_ROWS + c) * 4
      data[idx] = color[0]
      data[idx + 1] = color[1]
      data[idx + 2] = color[2]
      data[idx + 3] = color[3]
    }
  }

  return data
}

// --- Public API ---

export interface SpriteData {
  pixels: Uint8ClampedArray  // 16x16 RGBA flat array
  width: number
  height: number
  palette: {
    body: [number, number, number]
    outline: [number, number, number]
    accent: [number, number, number]
  }
}

export function generateSprite(seed: string, evolutionStage: number = 0): SpriteData {
  const rng = createRng(seed)
  const palette = seedToPalette(rng)
  const half = generateHalfGrid(rng, evolutionStage)
  const full = mirrorGrid(half)
  const pixels = renderToRGBA(full, palette)

  return {
    pixels,
    width: 16,
    height: 16,
    palette: {
      body: palette.body,
      outline: palette.outline,
      accent: palette.accent,
    },
  }
}

/**
 * Renders the sprite onto an HTMLCanvasElement at the given scale.
 * Call this in browser contexts only.
 */
export function renderSpriteToCanvas(
  canvas: HTMLCanvasElement,
  seed: string,
  evolutionStage: number = 0,
  scale: number = 4
): void {
  const sprite = generateSprite(seed, evolutionStage)
  const size = sprite.width

  // Offscreen canvas for the raw 16x16 data
  const offscreen = document.createElement('canvas')
  offscreen.width = size
  offscreen.height = size
  const ctx = offscreen.getContext('2d')!
  // TS5.x: Uint8ClampedArray<ArrayBufferLike> is not directly assignable to ImageDataArray
  // We use a plain ArrayBuffer-backed typed array to satisfy the constraint
  const clampedData = new Uint8ClampedArray(sprite.pixels.buffer as ArrayBuffer)
  ctx.putImageData(new ImageData(clampedData, size, size), 0, 0)

  // Scale up with nearest-neighbor (crisp pixels)
  canvas.width = size * scale
  canvas.height = size * scale
  const outCtx = canvas.getContext('2d')!
  outCtx.imageSmoothingEnabled = false
  outCtx.drawImage(offscreen, 0, 0, size * scale, size * scale)
}
