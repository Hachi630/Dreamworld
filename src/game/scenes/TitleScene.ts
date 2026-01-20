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

    console.log('TitleScene ready');
  }

  private createBackground(): void {
    const sky = this.add.graphics();
    const colors = [0x0f1b2b, 0x132238, 0x1b304a, 0x23405c];
    const pixel = 6;

    // Dithered pixel sky
    for (let y = 0; y < GAME_HEIGHT; y += pixel) {
      const band = Math.floor((y / GAME_HEIGHT) * colors.length);
      for (let x = 0; x < GAME_WIDTH; x += pixel) {
        const noise = Phaser.Math.Between(-1, 1);
        const index = Phaser.Math.Clamp(band + noise, 0, colors.length - 1);
        sky.fillStyle(colors[index], 1);
        sky.fillRect(x, y, pixel, pixel);
      }
    }

    // Horizon band
    sky.fillStyle(0x1b263b, 1);
    sky.fillRect(0, GAME_HEIGHT - 56, GAME_WIDTH, 56);
    sky.fillStyle(0x2b3a55, 1);
    for (let x = 0; x < GAME_WIDTH; x += 8) {
      sky.fillRect(x, GAME_HEIGHT - 56, 4, 4);
    }

    // Pixel stars
    for (let i = 0; i < 70; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH - 2);
      const y = Phaser.Math.Between(0, GAME_HEIGHT - 80);
      const size = Phaser.Math.Between(1, 2);
      const star = this.add.rectangle(x, y, size, size, 0xf7f3e3, 0.9);

      this.tweens.add({
        targets: star,
        alpha: { from: 0.9, to: 0.4 },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createTitle(): void {
    const centerX = GAME_WIDTH / 2;

    // Main title
    const dreamChar = this.add.text(centerX, 70, '梦', {
      fontSize: '32px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      fontStyle: 'bold',
    });
    dreamChar.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(centerX, 120, 'Dream World', {
      fontSize: '16px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    subtitle.setOrigin(0.5);

    // Floating animation for title
    this.tweens.add({
      targets: [dreamChar, subtitle],
      y: '+=4',
      duration: 1800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createStartButton(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2 + 42;

    const shadow = this.add.rectangle(centerX + 2, centerY + 2, 108, 30, 0x0b1220);
    shadow.setOrigin(0.5);

    // Button background (pixel-styled)
    this.startButton = this.add.rectangle(centerX, centerY, 108, 30, COLORS.PRIMARY);
    this.startButton.setStrokeStyle(2, COLORS.ACCENT);
    this.startButton.setInteractive({ useHandCursor: true });

    // Button text
    this.startText = this.add.text(centerX, centerY, 'Start', {
      fontSize: '12px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    this.startText.setOrigin(0.5);

    // Hover effects
    this.startButton.on('pointerover', () => {
      this.startButton?.setFillStyle(COLORS.ACCENT);
      this.startText?.setTint(0x1b263b);
    });

    this.startButton.on('pointerout', () => {
      this.startButton?.setFillStyle(COLORS.PRIMARY);
      this.startText?.clearTint();
    });

    // Click handler
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Press Enter hint
    const hint = this.add.text(centerX, centerY + 28, 'PRESS ENTER', {
      fontSize: '8px',
      color: '#9fb3c8',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    hint.setOrigin(0.5);

    // Pulsing animation for hint
    this.tweens.add({
      targets: hint,
      alpha: { from: 1, to: 0.4 },
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
      console.log('Starting game...');
      this.scene.start(SCENE_KEYS.MAP);
    });
  }
}
