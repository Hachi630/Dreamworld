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
    this.createPixelBackdrop();
    this.createLoadingScreen();
    this.createTileset();
    this.loadAssets();
  }

  create(): void {
    console.log('PreloadScene complete - All assets loaded');
    // Transition to TitleScene
    this.scene.start(SCENE_KEYS.TITLE);
  }

  private createPixelBackdrop(): void {
    const sky = this.add.graphics();
    const colors = [0x0f1b2b, 0x132238, 0x1b304a, 0x23405c];
    const pixel = 6;

    for (let y = 0; y < GAME_HEIGHT; y += pixel) {
      const band = Math.floor((y / GAME_HEIGHT) * colors.length);
      for (let x = 0; x < GAME_WIDTH; x += pixel) {
        const noise = Phaser.Math.Between(-1, 1);
        const index = Phaser.Math.Clamp(band + noise, 0, colors.length - 1);
        sky.fillStyle(colors[index], 1);
        sky.fillRect(x, y, pixel, pixel);
      }
    }
  }

  private createLoadingScreen(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Title
    const title = this.add.text(centerX, centerY - 80, 'Dream World', {
      fontSize: '18px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    title.setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(centerX, centerY - 30, 'Loading...', {
      fontSize: '10px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    loadingText.setOrigin(0.5);

    const barWidth = 240;
    const barHeight = 16;

    // Progress bar background
    const progressBarBg = this.add.rectangle(
      centerX,
      centerY + 10,
      barWidth + 10,
      barHeight + 8,
      COLORS.SECONDARY
    );
    progressBarBg.setStrokeStyle(2, COLORS.PRIMARY);

    // Progress bar fill
    const progressBar = this.add.rectangle(
      centerX - barWidth / 2,
      centerY + 10,
      0,
      barHeight,
      COLORS.ACCENT
    );
    progressBar.setOrigin(0, 0.5);

    // Percentage text
    const percentText = this.add.text(centerX, centerY + 36, '0%', {
      fontSize: '8px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    percentText.setOrigin(0.5);

    // Update progress
    this.load.on('progress', (value: number) => {
      progressBar.width = barWidth * value;
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

    // Tile 0 (0, 0): Pixel floor
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 15, 15);
    ctx.fillStyle = '#7b8794';
    ctx.fillRect(2, 2, 4, 4);

    // Tile 1 (16, 0): Brick wall
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(16, 0, 16, 16);
    ctx.strokeStyle = '#5c3a1a';
    ctx.strokeRect(16.5, 0.5, 15, 15);
    ctx.fillStyle = '#a56b3f';
    ctx.fillRect(18, 2, 12, 6);
    ctx.fillRect(18, 10, 6, 4);

    canvas.refresh();

    // Add canvas as texture
    this.textures.addCanvas(ASSET_KEYS.TILESETS.TEST_TILESET, canvas.canvas);

    console.log('Tileset created procedurally');
  }

  private loadAssets(): void {
    // Load Tiled map JSON
    this.load.tilemapTiledJSON(
      ASSET_KEYS.MAPS.TEST_MAP,
      'src/game/data/maps/test-map.json'
    );

    console.log('Loading tilemap assets');
  }
}
