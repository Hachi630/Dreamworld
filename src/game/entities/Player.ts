import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_SIZE, DEPTHS } from '../config/constants';

/**
 * Player entity - handles player movement and behavior
 */
export class Player extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private velocity: Phaser.Math.Vector2;
  private movementEnabled: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Create player sprite (using rectangle as placeholder)
    this.sprite = scene.add.rectangle(0, 0, PLAYER_SIZE, PLAYER_SIZE, 0x63b3ed);
    this.sprite.setStrokeStyle(2, 0x4299e1);
    this.add(this.sprite);

    // Set depth
    this.setDepth(DEPTHS.PLAYER);

    // Initialize velocity
    this.velocity = new Phaser.Math.Vector2(0, 0);

    // Setup input
    this.setupInput();

    // Add to scene
    scene.add.existing(this);

    // Add subtle idle animation
    scene.tweens.add({
      targets: this.sprite,
      scaleY: 1.05,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    console.log(`🎮 Player created at (${x}, ${y})`);
  }

  private setupInput(): void {
    // Setup cursor keys
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
  }

  /**
   * Enable or disable player movement
   */
  setMovementEnabled(enabled: boolean): void {
    this.movementEnabled = enabled;
    if (!enabled) {
      this.velocity.set(0, 0);
    }
  }

  /**
   * Update player position based on input
   */
  update(): void {
    if (!this.movementEnabled || !this.cursors) {
      return;
    }

    // Reset velocity
    this.velocity.set(0, 0);

    // Check input and set velocity
    if (this.cursors.left.isDown) {
      this.velocity.x = -1;
    } else if (this.cursors.right.isDown) {
      this.velocity.x = 1;
    }

    if (this.cursors.up.isDown) {
      this.velocity.y = -1;
    } else if (this.cursors.down.isDown) {
      this.velocity.y = 1;
    }

    // Normalize diagonal movement
    if (this.velocity.length() > 0) {
      this.velocity.normalize();
    }

    // Apply movement
    const delta = this.scene.game.loop.delta / 1000; // Convert to seconds
    this.x += this.velocity.x * PLAYER_SPEED * delta;
    this.y += this.velocity.y * PLAYER_SPEED * delta;

    // Update visual feedback based on movement
    if (this.velocity.length() > 0) {
      // Moving - slightly larger
      this.sprite.setScale(1.1, 1);
    } else {
      // Idle - normal scale (animation handles the subtle bounce)
      this.sprite.setScale(1, 1);
    }
  }

  /**
   * Constrain player position to bounds
   */
  constrainToBounds(width: number, height: number): void {
    const halfSize = PLAYER_SIZE / 2;
    this.x = Phaser.Math.Clamp(this.x, halfSize, width - halfSize);
    this.y = Phaser.Math.Clamp(this.y, halfSize, height - halfSize);
  }

  /**
   * Get player's current position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Set player position
   */
  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
}
