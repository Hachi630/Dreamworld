import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS, ASSET_KEYS } from '../config/constants';
import { Player } from '../entities/Player';
import { Monster } from '../entities/Monster';
import { EncounterSystem, DEFAULT_ENCOUNTER_ZONE } from '../systems/EncounterSystem';
import { BattleConfig, MonsterInstance } from '../types/MonsterTypes';

/**
 * MapScene - Main gameplay scene with tilemap, player, and interactions
 */
export class MapScene extends Phaser.Scene {
  private player?: Player;
  private map?: Phaser.Tilemaps.Tilemap;
  private collisionLayer?: Phaser.Tilemaps.TilemapLayer;

  // 遭遇系统
  private encounterSystem?: EncounterSystem;

  // 玩家队伍
  private playerTeam: MonsterInstance[] = [];

  constructor() {
    super({ key: SCENE_KEYS.MAP });
  }

  create(): void {
    console.log('MapScene started');

    this.createTilemap();
    this.createPlayer();
    this.setupCamera();
    this.setupEncounterSystem();
    this.setupPlayerTeam();
    this.launchUIScene();
    this.setupBattleEndListener();

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
    this.collisionLayer = this.map.createLayer('collision', tileset, 0, 0) ?? undefined;

    if (this.collisionLayer) {
      this.collisionLayer.setDepth(DEPTHS.GROUND + 1);
      // Set all tiles in collision layer as colliding
      this.collisionLayer.setCollisionByExclusion([-1]);
    }

    console.log('Tilemap created');
  }

  private createPlayer(): void {
    // Create player at center of 50x50 map
    this.player = new Player(this, 25, 25);

    // Pass collision layer reference to player
    if (this.collisionLayer) {
      this.player.setCollisionLayer(this.collisionLayer);
    }

    // 设置移动完成回调，检查遭遇
    this.player.onMoveComplete = (tileX, tileY) => {
      this.checkEncounter(tileX, tileY);
    };

    console.log('Player added to scene with grid movement');
  }

  private setupCamera(): void {
    // 设置相机边界为地图大小
    if (this.map) {
      this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
    // 相机跟随玩家
    if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }
  }

  private setupEncounterSystem(): void {
    this.encounterSystem = new EncounterSystem(DEFAULT_ENCOUNTER_ZONE);

    // 设置草地区域（地图中心区域作为草地）
    // 可以根据地图数据来定义草地区域
    for (let x = 5; x < 45; x++) {
      for (let y = 5; y < 45; y++) {
        // 跳过边缘（墙壁）
        if (x > 1 && x < 48 && y > 1 && y < 48) {
          this.encounterSystem.addGrassTile(x, y);
        }
      }
    }

    console.log('Encounter system initialized');
  }

  private setupPlayerTeam(): void {
    // 创建初始怪物（火焰小精灵，5级）
    const starter = Monster.createStarter(1, 5);
    this.playerTeam = [starter.getData()];

    console.log('Player team initialized with starter monster');
  }

  private launchUIScene(): void {
    // Launch UI scene as overlay (runs in parallel)
    this.scene.launch(SCENE_KEYS.UI);
    console.log('UI Scene launched');
  }

  private setupBattleEndListener(): void {
    // 监听战斗结束事件
    this.events.on('battleEnd', (data: { result: string; playerTeam: MonsterInstance[] }) => {
      console.log('Battle ended:', data.result);
      // 更新玩家队伍数据
      this.playerTeam = data.playerTeam;

      // 恢复玩家移动
      this.player?.setMovementEnabled(true);

      // 淡入
      this.cameras.main.fadeIn(500);
    });
  }

  private checkEncounter(tileX: number, tileY: number): void {
    if (!this.encounterSystem) return;

    const wildMonster = this.encounterSystem.checkEncounter(tileX, tileY);

    if (wildMonster) {
      this.startWildBattle(wildMonster);
    }
  }

  private startWildBattle(wildMonster: MonsterInstance): void {
    // 禁用玩家移动
    this.player?.setMovementEnabled(false);

    // 战斗过渡效果
    this.playBattleTransition(() => {
      const battleConfig: BattleConfig = {
        type: 'wild',
        canEscape: true,
        canCapture: true,
        playerTeam: this.playerTeam,
        enemyTeam: [wildMonster],
      };

      // 暂停地图场景和UI场景，启动战斗场景
      this.scene.pause(SCENE_KEYS.MAP);
      this.scene.pause(SCENE_KEYS.UI);
      this.scene.launch(SCENE_KEYS.BATTLE, battleConfig);
    });
  }

  private playBattleTransition(onComplete: () => void): void {
    // 闪烁效果
    const flash = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000
    );
    flash.setAlpha(0);
    flash.setDepth(DEPTHS.UI_OVERLAY + 10);
    flash.setScrollFactor(0);

    // 多次闪烁
    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        // 最终淡入黑屏
        this.tweens.add({
          targets: flash,
          alpha: 1,
          duration: 200,
          onComplete: () => {
            flash.destroy();
            onComplete();
          },
        });
      },
    });
  }

  private showInstructions(): void {
    // Add instruction text (smaller font for pixel-art resolution)
    const instructions = this.add.text(
      GAME_WIDTH / 2,
      20,
      '方向键移动 | 草地可遇敌',
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
    instructions.setScrollFactor(0);

    // Fade out after a few seconds
    this.tweens.add({
      targets: instructions,
      alpha: 0,
      delay: 4000,
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
