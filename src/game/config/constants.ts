/**
 * Global game constants
 */

// Game dimensions
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Player constants
export const PLAYER_SPEED = 200; // pixels per second
export const PLAYER_SIZE = 32;

// Scene keys
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  MAP: 'MapScene',
  UI: 'UIScene',
} as const;

// Asset keys
export const ASSET_KEYS = {
  BACKGROUNDS: {
    TITLE: 'bg-title',
    MAP: 'bg-map',
  },
  CHARACTERS: {
    PLAYER: 'player',
  },
  UI: {
    FRAME: 'ui-frame',
  },
} as const;

// Input keys
export const INPUT_KEYS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  INTERACT: 'E',
  CANCEL: 'ESC',
} as const;

// Colors
export const COLORS = {
  PRIMARY: 0x4a5568,
  SECONDARY: 0x2d3748,
  ACCENT: 0x63b3ed,
  TEXT: 0xffffff,
  BACKGROUND: 0x1a202c,
} as const;

// Layer depths
export const DEPTHS = {
  BACKGROUND: 0,
  GROUND: 10,
  PLAYER: 20,
  NPC: 20,
  EFFECTS: 30,
  UI_BACKGROUND: 100,
  UI_TEXT: 110,
  UI_OVERLAY: 120,
} as const;
