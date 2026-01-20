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
    console.log('BootScene complete');
    // Transition to PreloadScene
    this.scene.start(SCENE_KEYS.PRELOAD);
  }

  private createLoadingBar(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Loading text
    const loadingText = this.add.text(centerX, centerY - 40, 'Loading...', {
      fontSize: '12px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    loadingText.setOrigin(0.5);

    const barWidth = 220;
    const barHeight = 14;

    // Progress bar background
    const progressBarBg = this.add.rectangle(
      centerX,
      centerY,
      barWidth + 8,
      barHeight + 6,
      COLORS.SECONDARY
    );
    progressBarBg.setStrokeStyle(2, COLORS.PRIMARY);

    // Progress bar fill
    const progressBar = this.add.rectangle(
      centerX - barWidth / 2,
      centerY,
      0,
      barHeight,
      COLORS.ACCENT
    );
    progressBar.setOrigin(0, 0.5);

    // Update progress bar as files load
    this.load.on('progress', (value: number) => {
      progressBar.width = barWidth * value;
    });

    // Clean up loading graphics when complete
    this.load.on('complete', () => {
      loadingText.destroy();
      progressBarBg.destroy();
      progressBar.destroy();
    });
  }
}
