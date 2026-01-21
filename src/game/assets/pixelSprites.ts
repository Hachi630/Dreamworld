import Phaser from 'phaser';
import { MONSTER_DATABASE } from '../data/MonsterDatabase';
import { ElementType } from '../types/MonsterTypes';

type RGB = { r: number; g: number; b: number };

const clamp255 = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));

const hexToRgb = (hex: number): RGB => ({
  r: (hex >> 16) & 0xff,
  g: (hex >> 8) & 0xff,
  b: hex & 0xff,
});

const rgbToCss = (rgb: RGB): string => `rgb(${clamp255(rgb.r)},${clamp255(rgb.g)},${clamp255(rgb.b)})`;

const mix = (a: RGB, b: RGB, t: number): RGB => ({
  r: a.r + (b.r - a.r) * t,
  g: a.g + (b.g - a.g) * t,
  b: a.b + (b.b - a.b) * t,
});

const lighten = (rgb: RGB, t: number): RGB => mix(rgb, { r: 255, g: 255, b: 255 }, t);
const darken = (rgb: RGB, t: number): RGB => mix(rgb, { r: 0, g: 0, b: 0 }, t);

const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const TYPE_COLORS: Record<string, number> = {
  [ElementType.FIRE]: 0xff6b35,
  [ElementType.WATER]: 0x4fc3f7,
  [ElementType.GRASS]: 0x66bb6a,
  [ElementType.ELECTRIC]: 0xffeb3b,
  [ElementType.GROUND]: 0xa1887f,
  [ElementType.NORMAL]: 0x9e9e9e,
};

const drawPixel = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

const drawOutline = (
  ctx: CanvasRenderingContext2D,
  mask: boolean[][],
  outline: string
): void => {
  const h = mask.length;
  const w = mask[0]?.length ?? 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y]?.[x]) continue;
      const near =
        (mask[y]?.[x - 1] ?? false) ||
        (mask[y]?.[x + 1] ?? false) ||
        (mask[y - 1]?.[x] ?? false) ||
        (mask[y + 1]?.[x] ?? false);
      if (near) drawPixel(ctx, x, y, outline);
    }
  }
};

export const ensurePlayerTextures = (scene: Phaser.Scene): void => {
  const size = 16;

  const make = (key: string, draw: (ctx: CanvasRenderingContext2D) => void) => {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, size, size);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    draw(ctx);
    canvas.refresh();
  };

  const outline = '#0b1220';
  const skin = '#f1c27d';
  const hair = '#3d2b1f';
  const shirt = '#5bc0be';
  const pants = '#2b3a55';
  const boots = '#1b263b';
  const highlight = '#f7f3e3';

  make('player-front', (ctx) => {
    // Head
    for (let y = 2; y <= 5; y++) for (let x = 6; x <= 9; x++) drawPixel(ctx, x, y, skin);
    // Hair
    for (let x = 6; x <= 9; x++) drawPixel(ctx, x, 2, hair);
    drawPixel(ctx, 6, 3, hair);
    drawPixel(ctx, 9, 3, hair);
    // Eyes
    drawPixel(ctx, 7, 4, outline);
    drawPixel(ctx, 8, 4, outline);
    // Body
    for (let y = 6; y <= 10; y++) for (let x = 5; x <= 10; x++) drawPixel(ctx, x, y, shirt);
    // Arms
    drawPixel(ctx, 4, 7, shirt);
    drawPixel(ctx, 11, 7, shirt);
    // Legs
    for (let y = 11; y <= 13; y++) {
      drawPixel(ctx, 6, y, pants);
      drawPixel(ctx, 9, y, pants);
      drawPixel(ctx, 7, y, pants);
      drawPixel(ctx, 8, y, pants);
    }
    // Boots
    drawPixel(ctx, 6, 14, boots);
    drawPixel(ctx, 7, 14, boots);
    drawPixel(ctx, 8, 14, boots);
    drawPixel(ctx, 9, 14, boots);
    // Highlight
    drawPixel(ctx, 6, 7, highlight);

    const mask = Array.from({ length: size }, (_, y) =>
      Array.from(
        { length: size },
        (_, x) => (ctx.getImageData(x, y, 1, 1).data[3] ?? 0) > 0
      )
    );
    drawOutline(ctx, mask, outline);
  });

  make('player-back', (ctx) => {
    // Head + hair
    for (let y = 2; y <= 5; y++) for (let x = 6; x <= 9; x++) drawPixel(ctx, x, y, skin);
    for (let y = 2; y <= 4; y++) for (let x = 6; x <= 9; x++) drawPixel(ctx, x, y, hair);
    // Body
    for (let y = 6; y <= 10; y++) for (let x = 5; x <= 10; x++) drawPixel(ctx, x, y, shirt);
    // Backpack stripe
    for (let y = 7; y <= 9; y++) drawPixel(ctx, 7, y, highlight);
    for (let y = 7; y <= 9; y++) drawPixel(ctx, 8, y, highlight);
    // Legs + boots
    for (let y = 11; y <= 13; y++) for (let x = 6; x <= 9; x++) drawPixel(ctx, x, y, pants);
    for (let x = 6; x <= 9; x++) drawPixel(ctx, x, 14, boots);

    const mask = Array.from({ length: size }, (_, y) =>
      Array.from(
        { length: size },
        (_, x) => (ctx.getImageData(x, y, 1, 1).data[3] ?? 0) > 0
      )
    );
    drawOutline(ctx, mask, outline);
  });

  make('player-side', (ctx) => {
    // Head
    for (let y = 2; y <= 5; y++) for (let x = 7; x <= 10; x++) drawPixel(ctx, x, y, skin);
    // Hair cap
    for (let x = 7; x <= 10; x++) drawPixel(ctx, x, 2, hair);
    drawPixel(ctx, 7, 3, hair);
    // Eye
    drawPixel(ctx, 9, 4, outline);
    // Body
    for (let y = 6; y <= 10; y++) for (let x = 6; x <= 11; x++) drawPixel(ctx, x, y, shirt);
    // Legs
    for (let y = 11; y <= 13; y++) for (let x = 7; x <= 10; x++) drawPixel(ctx, x, y, pants);
    for (let x = 7; x <= 10; x++) drawPixel(ctx, x, 14, boots);
    drawPixel(ctx, 8, 7, highlight);

    const mask = Array.from({ length: size }, (_, y) =>
      Array.from(
        { length: size },
        (_, x) => (ctx.getImageData(x, y, 1, 1).data[3] ?? 0) > 0
      )
    );
    drawOutline(ctx, mask, outline);
  });
};

export const ensureMonsterTextures = (scene: Phaser.Scene): void => {
  const size = 16;

  const ensure = (key: string, draw: (ctx: CanvasRenderingContext2D) => void) => {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, size, size);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    draw(ctx);
    canvas.refresh();
  };

  const drawMonster = (baseKey: string, type: string, variant: 'front' | 'back') => {
    const seed = hashString(`${baseKey}:${variant}`);
    const rand = mulberry32(seed);

    const baseHex = TYPE_COLORS[type] ?? TYPE_COLORS[ElementType.NORMAL] ?? 0x9e9e9e;
    const base = hexToRgb(baseHex);
    const shade = darken(base, 0.35);
    const hi = lighten(base, 0.35);
    const outline = '#0b1220';

    const baseCss = rgbToCss(base);
    const shadeCss = rgbToCss(shade);
    const hiCss = rgbToCss(hi);

    return (ctx: CanvasRenderingContext2D) => {
      // Build a symmetric silhouette mask.
      const mask: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
      const cx = 7;
      const top = 3 + Math.floor(rand() * 2);
      const bottom = 14;

      for (let y = top; y <= bottom; y++) {
        const t = (y - top) / (bottom - top);
        const belly = Math.sin(t * Math.PI);
        const wobble = (rand() - 0.5) * 1.2;
        const half = Math.max(2, Math.min(6, Math.round(2.5 + belly * 4 + wobble)));
        for (let dx = 0; dx <= half; dx++) {
          const x1 = cx - dx;
          const x2 = cx + dx;
          if (x1 >= 0) mask[y]![x1] = true;
          if (x2 < size) mask[y]![x2] = true;
        }
      }

      // Add "ears/horns" at the top for distinct silhouettes.
      const earHeight = 1 + Math.floor(rand() * 2);
      const earDx = 2 + Math.floor(rand() * 2);
      for (let e = 0; e < earHeight; e++) {
        const yy = top - 1 - e;
        if (yy < 0) continue;
        mask[yy]![cx - earDx] = true;
        mask[yy]![cx + earDx] = true;
      }

      // Fill
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (!mask[y]?.[x]) continue;
          const edgeLight = x > cx ? hiCss : shadeCss;
          drawPixel(ctx, x, y, edgeLight);
          // inner base
          if (mask[y]?.[x - 1] && mask[y]?.[x + 1]) drawPixel(ctx, x, y, baseCss);
        }
      }

      // Type accents
      const accent = rgbToCss(lighten(base, 0.5));
      if (type === ElementType.FIRE) {
        drawPixel(ctx, cx, top - 1, accent);
        drawPixel(ctx, cx, top - 2, accent);
      } else if (type === ElementType.WATER) {
        drawPixel(ctx, cx + 4, top + 4, accent);
        drawPixel(ctx, cx + 5, top + 5, accent);
      } else if (type === ElementType.GRASS) {
        drawPixel(ctx, cx, top - 1, accent);
        drawPixel(ctx, cx - 1, top, accent);
        drawPixel(ctx, cx + 1, top, accent);
      } else if (type === ElementType.ELECTRIC) {
        drawPixel(ctx, cx + 3, top + 2, accent);
        drawPixel(ctx, cx + 4, top + 3, accent);
        drawPixel(ctx, cx + 3, top + 4, accent);
      } else if (type === ElementType.GROUND) {
        drawPixel(ctx, cx - 2, bottom - 1, shadeCss);
        drawPixel(ctx, cx + 2, bottom - 2, shadeCss);
      }

      // Face / back details
      if (variant === 'front') {
        const eyeY = top + 4 + Math.floor(rand() * 2);
        drawPixel(ctx, cx - 2, eyeY, '#f7f3e3');
        drawPixel(ctx, cx + 2, eyeY, '#f7f3e3');
        drawPixel(ctx, cx - 2, eyeY, outline);
        drawPixel(ctx, cx + 2, eyeY, outline);
        drawPixel(ctx, cx - 1, eyeY + 1, outline);
        drawPixel(ctx, cx + 1, eyeY + 1, outline);
      } else {
        for (let y = top + 3; y <= top + 6; y++) {
          drawPixel(ctx, cx, y, hiCss);
        }
      }

      drawOutline(ctx, mask, outline);
    };
  };

  Object.values(MONSTER_DATABASE).forEach((species) => {
    const type = species.types[0] ?? ElementType.NORMAL;
    ensure(species.spriteKey, drawMonster(species.spriteKey, type, 'front'));
    ensure(`${species.spriteKey}-back`, drawMonster(species.spriteKey, type, 'back'));
  });
};
