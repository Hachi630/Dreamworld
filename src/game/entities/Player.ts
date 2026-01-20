import Phaser from 'phaser';
import { TILE_SIZE, PLAYER_TILE_SIZE, PLAYER_MOVE_DURATION, DEPTHS } from '../config/constants';

/**
 * Player entity - handles grid-based tile movement
 */
export class Player extends Phaser.GameObjects.Container {
  private body: Phaser.GameObjects.Rectangle;
  private highlight: Phaser.GameObjects.Rectangle;
  private shadow: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private isMoving: boolean = false;
  private movementEnabled: boolean = true;
  private collisionLayer?: Phaser.Tilemaps.TilemapLayer;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    // Convert tile coordinates to pixel coordinates (centered in tile)
    const pixelX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const pixelY = tileY * TILE_SIZE + TILE_SIZE / 2;

    super(scene, pixelX, pixelY);

    // Create player sprite (pixel-art blocks)
    this.body = scene.add.rectangle(0, 0, PLAYER_TILE_SIZE, PLAYER_TILE_SIZE, 0x5bc0be);
    this.body.setStrokeStyle(1, 0x1b263b);

    this.highlight = scene.add.rectangle(-4, -4, 6, 6, 0xf7f3e3, 0.8);
    this.shadow = scene.add.rectangle(4, 4, 6, 6, 0x0b1220, 0.4);

    this.add([this.body, this.highlight, this.shadow]);

    this.setDepth(DEPTHS.PLAYER);
    this.setupInput();
    scene.add.existing(this);

    console.log(`Player created at tile (${tileX}, ${tileY})`);
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
  }

  /**
   * Set the collision layer for wall detection
   */
  setCollisionLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
    this.collisionLayer = layer;
  }

  /**
   * Enable or disable player movement
   */
  setMovementEnabled(enabled: boolean): void {
    this.movementEnabled = enabled;
  }

  /**
   * Update player - check for input and handle grid movement
   */
  update(): void {
    if (!this.movementEnabled || !this.cursors || this.isMoving) {
      return;
    }

    // Check arrow key presses (JustDown = single press, not held)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.tryMove(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.tryMove(1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.tryMove(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.tryMove(0, 1);
    }
  }

  /**
   * Try to move in a direction - checks collision first
   */
  private tryMove(deltaX: number, deltaY: number): void {
    // Calculate target tile position
    const currentTileX = Math.floor(this.x / TILE_SIZE);
    const currentTileY = Math.floor(this.y / TILE_SIZE);
    const targetTileX = currentTileX + deltaX;
    const targetTileY = currentTileY + deltaY;

    // Check collision
    if (this.collisionLayer) {
      const tile = this.collisionLayer.getTileAt(targetTileX, targetTileY);
      if (tile) {
        // Tile exists in collision layer - block movement
        console.log(`Collision at (${targetTileX}, ${targetTileY})`);
        return;
      }
    }

    // No collision - perform move
    this.moveToTile(targetTileX, targetTileY);
  }

  /**
   * Move to target tile with smooth tween animation
   */
  private moveToTile(tileX: number, tileY: number): void {
    this.isMoving = true;

    const targetX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const targetY = tileY * TILE_SIZE + TILE_SIZE / 2;

    // Tween to target position
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: PLAYER_MOVE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
      },
    });
  }

  /**
   * Get player's current tile position
   */
  getTilePosition(): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(this.x / TILE_SIZE),
      tileY: Math.floor(this.y / TILE_SIZE),
    };
  }

  /**
   * Get player's current pixel position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
