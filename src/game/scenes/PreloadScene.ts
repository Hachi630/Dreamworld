import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * PreloadScene - Loads all game assets
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  preload(): void {
    this.createLoadingScreen();
    this.loadAssets();
  }

  create(): void {
    console.log('✓ PreloadScene complete - All assets loaded');
    // Transition to TitleScene
    this.scene.start(SCENE_KEYS.TITLE);
  }

  private createLoadingScreen(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Title
    const title = this.add.text(centerX, centerY - 100, '梦 Dream World', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(centerX, centerY - 30, 'Loading Assets...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(
      centerX,
      centerY + 20,
      500,
      40,
      COLORS.SECONDARY
    );
    progressBarBg.setStrokeStyle(3, COLORS.PRIMARY);

    // Progress bar fill
    const progressBar = this.add.rectangle(
      centerX - 247,
      centerY + 20,
      0,
      34,
      COLORS.ACCENT
    );
    progressBar.setOrigin(0, 0.5);

    // Percentage text
    const percentText = this.add.text(centerX, centerY + 70, '0%', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    percentText.setOrigin(0.5);

    // Update progress
    this.load.on('progress', (value: number) => {
      progressBar.width = 494 * value;
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    // Clean up when complete
    this.load.on('complete', () => {
      title.destroy();
      loadingText.destroy();
      progressBarBg.destroy();
      progressBar.destroy();
      percentText.destroy();
    });
  }

  private loadAssets(): void {
    // Note: For now, we're not loading actual image files
    // In the future, load assets here:
    // this.load.image(ASSET_KEYS.BACKGROUNDS.TITLE, 'assets/images/backgrounds/title.png');
    // this.load.image(ASSET_KEYS.BACKGROUNDS.MAP, 'assets/images/backgrounds/map.png');
    // this.load.spritesheet(ASSET_KEYS.CHARACTERS.PLAYER, 'assets/images/characters/player.png', {
    //   frameWidth: 32,
    //   frameHeight: 32,
    // });

    console.log('📦 Asset loading configured (using placeholders for now)');
  }
}
