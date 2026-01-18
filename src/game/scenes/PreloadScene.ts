import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS, ASSET_KEYS } from '../config/constants';

/**
 * PreloadScene - Loads all game assets
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  preload(): void {
    this.createLoadingScreen();
    this.createTileset();
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

  /**
   * Create tileset texture procedurally
   */
  private createTileset(): void {
    // Create a 32x16 canvas for 2 tiles (16x16 each)
    const canvas = this.textures.createCanvas('tileset-canvas', 32, 16);

    if (!canvas) {
      console.error('Failed to create tileset canvas');
      return;
    }

    const ctx = canvas.context;

    // Tile 0 (0, 0): Light gray floor
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 15, 15);

    // Tile 1 (16, 0): Brown wall
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(16, 0, 16, 16);
    ctx.strokeStyle = '#654321';
    ctx.strokeRect(16.5, 0.5, 15, 15);
    // Inner detail
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(18, 2, 12, 12);

    canvas.refresh();

    // Add canvas as texture
    this.textures.addCanvas(ASSET_KEYS.TILESETS.TEST_TILESET, canvas.canvas);

    console.log('🎨 Tileset created procedurally');
  }

  private loadAssets(): void {
    // Load Tiled map JSON
    this.load.tilemapTiledJSON(
      ASSET_KEYS.MAPS.TEST_MAP,
      'src/game/data/maps/test-map.json'
    );

    console.log('📦 Loading tilemap assets');
  }
}
