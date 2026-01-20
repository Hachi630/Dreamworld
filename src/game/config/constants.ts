/**
 * Global game constants
 */

// Game dimensions (pixel-art RPG resolution)
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

// Tile constants
export const TILE_SIZE = 16; // Standard pixel-art tile size
export const PLAYER_TILE_SIZE = 16; // Player sprite size in pixels

// Player movement
export const PLAYER_MOVE_DURATION = 200; // Milliseconds per tile move
export const PLAYER_SPEED = 200; // Deprecated - kept for compatibility
export const PLAYER_SIZE = 32; // Deprecated - kept for compatibility

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
  MAPS: {
    TEST_MAP: 'test-map',
  },
  TILESETS: {
    TEST_TILESET: 'test-tileset',
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
  PRIMARY: 0x2b3a55,
  SECONDARY: 0x1b263b,
  ACCENT: 0xffd166,
  TEXT: 0xf7f3e3,
  BACKGROUND: 0x0f1b2b,
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
