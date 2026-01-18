import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * BootScene - Initial scene that loads minimal assets for the preloader
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // Create a simple loading bar using graphics
    this.createLoadingBar();
  }

  create(): void {
    console.log('✓ BootScene complete');
    // Transition to PreloadScene
    this.scene.start(SCENE_KEYS.PRELOAD);
  }

  private createLoadingBar(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Loading text
    const loadingText = this.add.text(centerX, centerY - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(
      centerX,
      centerY,
      400,
      30,
      COLORS.SECONDARY
    );
    progressBarBg.setStrokeStyle(2, COLORS.PRIMARY);

    // Progress bar fill
    const progressBar = this.add.rectangle(
      centerX - 198,
      centerY,
      0,
      26,
      COLORS.ACCENT
    );
    progressBar.setOrigin(0, 0.5);

    // Update progress bar as files load
    this.load.on('progress', (value: number) => {
      progressBar.width = 396 * value;
    });

    // Clean up loading graphics when complete
    this.load.on('complete', () => {
      loadingText.destroy();
      progressBarBg.destroy();
      progressBar.destroy();
    });
  }
}
