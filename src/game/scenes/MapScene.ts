import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../config/constants';
import { Player } from '../entities/Player';

/**
 * MapScene - Main gameplay scene with background, player, and interactions
 */
export class MapScene extends Phaser.Scene {
  private player?: Player;

  constructor() {
    super({ key: SCENE_KEYS.MAP });
  }

  create(): void {
    console.log('✓ MapScene started');

    this.createBackground();
    this.createPlayer();
    this.setupCamera();
    this.launchUIScene();

    // Add instructions
    this.showInstructions();
  }

  update(): void {
    // Update player
    if (this.player) {
      this.player.update();
      this.player.constrainToBounds(GAME_WIDTH, GAME_HEIGHT);
    }
  }

  private createBackground(): void {
    // Create placeholder background (hand-drawn background image would go here)
    // Using gradient rectangles for now
    const bg1 = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT / 3, 0x87ceeb);
    bg1.setOrigin(0, 0);
    bg1.setDepth(DEPTHS.BACKGROUND);

    const bg2 = this.add.rectangle(
      0,
      GAME_HEIGHT / 3,
      GAME_WIDTH,
      GAME_HEIGHT / 3,
      0x90e0ef
    );
    bg2.setOrigin(0, 0);
    bg2.setDepth(DEPTHS.BACKGROUND);

    const ground = this.add.rectangle(
      0,
      (GAME_HEIGHT * 2) / 3,
      GAME_WIDTH,
      GAME_HEIGHT / 3,
      0x98d8c8
    );
    ground.setOrigin(0, 0);
    ground.setDepth(DEPTHS.GROUND);

    // Add some decorative elements (trees, clouds, etc. would be actual images)
    this.addDecorativeElements();

    console.log('📐 Background created');
  }

  private addDecorativeElements(): void {
    // Add some simple "clouds"
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
      const y = Phaser.Math.Between(50, 200);
      const cloud = this.add.ellipse(x, y, 80, 40, 0xffffff, 0.6);
      cloud.setDepth(DEPTHS.BACKGROUND + 1);

      // Floating animation
      this.tweens.add({
        targets: cloud,
        x: x + 50,
        duration: Phaser.Math.Between(8000, 12000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Add some simple "trees"
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
      const y = GAME_HEIGHT - 150;

      // Tree trunk
      const trunk = this.add.rectangle(x, y, 20, 60, 0x8b4513);
      trunk.setDepth(DEPTHS.GROUND + 1);

      // Tree crown
      const crown = this.add.circle(x, y - 40, 40, 0x228b22, 0.8);
      crown.setDepth(DEPTHS.GROUND + 1);
    }
  }

  private createPlayer(): void {
    // Create player in the center of the screen
    const startX = GAME_WIDTH / 2;
    const startY = GAME_HEIGHT / 2;

    this.player = new Player(this, startX, startY);

    console.log('🎮 Player added to scene');
  }

  private setupCamera(): void {
    // For now, camera is static
    // In the future, this could follow the player or do cinematic movements
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private launchUIScene(): void {
    // Launch UI scene as overlay (runs in parallel)
    this.scene.launch(SCENE_KEYS.UI);
    console.log('📱 UI Scene launched');
  }

  private showInstructions(): void {
    // Add instruction text
    const instructions = this.add.text(
      GAME_WIDTH / 2,
      40,
      'Use Arrow Keys to Move',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
      }
    );
    instructions.setOrigin(0.5);
    instructions.setDepth(DEPTHS.UI_TEXT);
    instructions.setAlpha(0.8);

    // Fade out after a few seconds
    this.tweens.add({
      targets: instructions,
      alpha: 0,
      delay: 3000,
      duration: 1000,
      onComplete: () => {
        instructions.destroy();
      },
    });
  }

  /**
   * Get the player instance (useful for other systems)
   */
  getPlayer(): Player | undefined {
    return this.player;
  }
}
