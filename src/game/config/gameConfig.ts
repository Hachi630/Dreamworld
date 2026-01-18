import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

/**
 * Main Phaser game configuration
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a202c',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false, // Set to true for development debugging
    },
  },
  render: {
    pixelArt: false, // Set to true if using pixel art
    antialias: true,
    antialiasGL: true,
  },
  audio: {
    disableWebAudio: false,
  },
};
