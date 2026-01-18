import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { MapScene } from './scenes/MapScene';
import { UIScene } from './scenes/UIScene';

/**
 * Main game application class
 * Initializes Phaser with all scenes
 */
export class GameApp {
  private game: Phaser.Game;

  constructor() {
    // Add all scenes to the config
    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      scene: [BootScene, PreloadScene, TitleScene, MapScene, UIScene],
    };

    // Create the game instance
    this.game = new Phaser.Game(config);

    // Log game initialization
    console.log('🎮 Dream World initialized');
    console.log(`📐 Resolution: ${config.width}x${config.height}`);
  }

  /**
   * Get the Phaser game instance
   */
  getGame(): Phaser.Game {
    return this.game;
  }

  /**
   * Destroy the game instance
   */
  destroy(): void {
    this.game.destroy(true);
    console.log('🎮 Dream World destroyed');
  }
}
