import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * TitleScene - Main menu / title screen
 */
export class TitleScene extends Phaser.Scene {
  private startButton?: Phaser.GameObjects.Rectangle;
  private startText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createStartButton();
    this.setupInput();

    console.log('✓ TitleScene ready');
  }

  private createBackground(): void {
    // Create a gradient-like background using rectangles
    const gradient1 = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT / 2, 0x1a1a2e);
    gradient1.setOrigin(0, 0);

    const gradient2 = this.add.rectangle(
      0,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT / 2,
      0x16213e
    );
    gradient2.setOrigin(0, 0);

    // Add some decorative stars/dots
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.circle(x, y, size, 0xffffff, 0.6);

      // Twinkling animation
      this.tweens.add({
        targets: star,
        alpha: { from: 0.6, to: 0.2 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createTitle(): void {
    const centerX = GAME_WIDTH / 2;

    // Main title with Chinese character
    const dreamChar = this.add.text(centerX, 200, '梦', {
      fontSize: '120px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    dreamChar.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(centerX, 320, 'Dream World', {
      fontSize: '48px',
      color: '#63b3ed',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    });
    subtitle.setOrigin(0.5);

    // Floating animation for title
    this.tweens.add({
      targets: [dreamChar, subtitle],
      y: '+=10',
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createStartButton(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2 + 150;

    // Button background
    this.startButton = this.add.rectangle(centerX, centerY, 200, 60, COLORS.ACCENT);
    this.startButton.setStrokeStyle(3, COLORS.PRIMARY);
    this.startButton.setInteractive({ useHandCursor: true });

    // Button text
    this.startText = this.add.text(centerX, centerY, 'Start', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    this.startText.setOrigin(0.5);

    // Hover effects
    this.startButton.on('pointerover', () => {
      this.startButton?.setFillStyle(0x4299e1);
      this.startText?.setScale(1.1);
    });

    this.startButton.on('pointerout', () => {
      this.startButton?.setFillStyle(COLORS.ACCENT);
      this.startText?.setScale(1);
    });

    // Click handler
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Press Enter hint
    const hint = this.add.text(centerX, centerY + 60, 'or press ENTER', {
      fontSize: '16px',
      color: '#a0aec0',
      fontFamily: 'Arial',
    });
    hint.setOrigin(0.5);

    // Pulsing animation for hint
    this.tweens.add({
      targets: hint,
      alpha: { from: 1, to: 0.3 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }

  private setupInput(): void {
    // Allow Enter key to start game
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame();
    });
  }

  private startGame(): void {
    // Flash effect
    this.cameras.main.flash(500, 255, 255, 255);

    // Start the map scene after flash
    this.time.delayedCall(500, () => {
      console.log('▶ Starting game...');
      this.scene.start(SCENE_KEYS.MAP);
    });
  }
}
