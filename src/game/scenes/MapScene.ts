import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS, ASSET_KEYS } from '../config/constants';
import { Player } from '../entities/Player';

/**
 * MapScene - Main gameplay scene with tilemap, player, and interactions
 */
export class MapScene extends Phaser.Scene {
  private player?: Player;
  private map?: Phaser.Tilemaps.Tilemap;
  private collisionLayer?: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: SCENE_KEYS.MAP });
  }

  create(): void {
    console.log('MapScene started');

    this.createTilemap();
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
    }
  }

  private createTilemap(): void {
    // Create tilemap from Tiled JSON
    this.map = this.make.tilemap({ key: ASSET_KEYS.MAPS.TEST_MAP });

    // Add tileset image to map
    const tileset = this.map.addTilesetImage('test-tileset', ASSET_KEYS.TILESETS.TEST_TILESET);

    if (!tileset) {
      console.error('Failed to load tileset');
      return;
    }

    // Create ground layer
    const groundLayer = this.map.createLayer('ground', tileset, 0, 0);
    groundLayer?.setDepth(DEPTHS.GROUND);

    // Create collision layer
    this.collisionLayer = this.map.createLayer('collision', tileset, 0, 0);

    if (this.collisionLayer) {
      this.collisionLayer.setDepth(DEPTHS.GROUND + 1);
      // Set all tiles in collision layer as colliding
      this.collisionLayer.setCollisionByExclusion([-1]);
    }

    console.log('Tilemap created');
  }

  private createPlayer(): void {
    // Create player at tile position (15, 8) - center-ish of 30x17 map
    this.player = new Player(this, 15, 8);

    // Pass collision layer reference to player
    if (this.collisionLayer) {
      this.player.setCollisionLayer(this.collisionLayer);
    }

    console.log('Player added to scene with grid movement');
  }

  private setupCamera(): void {
    // For now, camera is static
    // In the future, this could follow the player or do cinematic movements
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private launchUIScene(): void {
    // Launch UI scene as overlay (runs in parallel)
    this.scene.launch(SCENE_KEYS.UI);
    console.log('UI Scene launched');
  }

  private showInstructions(): void {
    // Add instruction text (smaller font for pixel-art resolution)
    const instructions = this.add.text(
      GAME_WIDTH / 2,
      20,
      'ARROWS TO MOVE',
      {
        fontSize: '8px',
        color: '#f7f3e3',
        fontFamily: '"Press Start 2P", "VT323", monospace',
        backgroundColor: '#0b1220',
        padding: { x: 8, y: 4 },
      }
    );
    instructions.setOrigin(0.5);
    instructions.setDepth(DEPTHS.UI_TEXT);
    instructions.setAlpha(0.9);

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
