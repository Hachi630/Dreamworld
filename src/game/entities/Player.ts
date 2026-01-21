import Phaser from 'phaser';
import { TILE_SIZE, PLAYER_MOVE_DURATION, DEPTHS } from '../config/constants';

/**
 * Player entity - handles grid-based tile movement
 */
export class Player extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Image;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private isMoving: boolean = false;
  private movementEnabled: boolean = true;
  private collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  private facingRight: boolean = true; // 用于侧面图片翻转

  // 移动完成回调
  public onMoveComplete?: (tileX: number, tileY: number) => void;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    // Convert tile coordinates to pixel coordinates (centered in tile)
    const pixelX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const pixelY = tileY * TILE_SIZE + TILE_SIZE / 2;

    super(scene, pixelX, pixelY);

    // 使用图片创建玩家精灵
    this.sprite = scene.add.image(0, 0, 'player-front');
    // 16x16 pixel sprite scaled to fit 32x32 tiles
    this.sprite.setScale(2);

    this.add([this.sprite]);

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
    // 根据方向切换角色图片
    this.updateSpriteDirection(deltaX, deltaY);

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
   * 根据移动方向更新角色图片
   */
  private updateSpriteDirection(deltaX: number, deltaY: number): void {
    if (deltaY < 0) {
      // 向上 - 显示背面
      this.sprite.setTexture('player-back');
      this.sprite.setFlipX(false);
    } else if (deltaY > 0) {
      // 向下 - 显示正面
      this.sprite.setTexture('player-front');
      this.sprite.setFlipX(false);
    } else if (deltaX !== 0) {
      // 左右 - 显示侧面
      this.sprite.setTexture('player-side');
      // 向左时翻转图片
      this.facingRight = deltaX > 0;
      this.sprite.setFlipX(!this.facingRight);
    }
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
        // 触发移动完成回调
        this.onMoveComplete?.(tileX, tileY);
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
