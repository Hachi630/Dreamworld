/**
 * BattleScene - 战斗场景
 */

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../config/constants';
import { BattleManager, BattleState } from '../systems/BattleManager';
import { BattleUI } from '../ui/BattleUI';
import { BattleConfig, BattleActionType } from '../types/MonsterTypes';
import { MOVES_DATABASE } from '../data/MovesDatabase';

export class BattleScene extends Phaser.Scene {
  private battleManager!: BattleManager;
  private battleUI!: BattleUI;
  private config!: BattleConfig;

  // 精灵图
  private playerMonsterSprite?: Phaser.GameObjects.Rectangle;
  private enemyMonsterSprite?: Phaser.GameObjects.Rectangle;

  // 战斗背景
  private background?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENE_KEYS.BATTLE });
  }

  init(config: BattleConfig): void {
    this.config = config;
  }

  create(): void {
    this.createBackground();
    this.createBattleManager();
    this.createMonsterSprites();
    this.createUI();
    this.setupUICallbacks();

    // 开始战斗流程
    this.startBattle();
  }

  update(): void {
    // 处理UI输入
    const state = this.battleManager.getState();

    if (state === BattleState.SELECT_ACTION) {
      this.battleUI.handleActionInput();
    } else if (state === BattleState.SELECT_MOVE) {
      this.battleUI.handleMoveInput();
    }
  }

  private createBackground(): void {
    // 简单的战斗背景
    this.background = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x3d5a45
    );
    this.background.setDepth(DEPTHS.BACKGROUND);

    // 地面
    const ground = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 50,
      GAME_WIDTH,
      100,
      0x5a7d4c
    );
    ground.setDepth(DEPTHS.BACKGROUND + 1);

    // 战斗平台 - 玩家侧
    const playerPlatform = this.add.ellipse(100, GAME_HEIGHT - 70, 120, 30, 0x8fbc8f);
    playerPlatform.setDepth(DEPTHS.GROUND);

    // 战斗平台 - 敌方侧
    const enemyPlatform = this.add.ellipse(GAME_WIDTH - 100, 130, 100, 25, 0x8fbc8f);
    enemyPlatform.setDepth(DEPTHS.GROUND);
  }

  private createBattleManager(): void {
    this.battleManager = new BattleManager(this.config);

    // 绑定事件回调
    this.battleManager.setCallbacks({
      onStateChange: (state) => this.handleStateChange(state),
      onMessage: (msg) => this.battleUI.showMessage(msg),
      onDamage: (target, _damage, currentHp, maxHp) => {
        this.playDamageAnimation(target);
        this.battleUI.animateHPBar(target, currentHp, maxHp);
      },
      onMonsterFaint: (target) => this.playFaintAnimation(target),
      onBattleEnd: (result) => this.handleBattleEnd(result),
    });
  }

  private createMonsterSprites(): void {
    // 使用简单的矩形作为怪物占位符
    // 后续可以替换为实际的精灵图

    const playerMonster = this.battleManager.getActivePlayerMonster();
    const enemyMonster = this.battleManager.getActiveEnemyMonster();

    // 获取怪物颜色
    const playerColor = this.getMonsterColor(playerMonster?.getSpecies().types[0]);
    const enemyColor = this.getMonsterColor(enemyMonster?.getSpecies().types[0]);

    // 玩家怪物（屏幕左下方）
    this.playerMonsterSprite = this.add.rectangle(
      100,
      GAME_HEIGHT - 100,
      48,
      48,
      playerColor
    );
    this.playerMonsterSprite.setStrokeStyle(2, 0x000000);
    this.playerMonsterSprite.setDepth(DEPTHS.PLAYER);

    // 敌方怪物（屏幕右上方）
    this.enemyMonsterSprite = this.add.rectangle(
      GAME_WIDTH - 100,
      100,
      40,
      40,
      enemyColor
    );
    this.enemyMonsterSprite.setStrokeStyle(2, 0x000000);
    this.enemyMonsterSprite.setDepth(DEPTHS.NPC);
  }

  private getMonsterColor(type?: string): number {
    const colors: Record<string, number> = {
      fire: 0xff6b35,
      water: 0x4fc3f7,
      grass: 0x66bb6a,
      electric: 0xffeb3b,
      ground: 0xa1887f,
      normal: 0x9e9e9e,
    };
    return colors[type ?? 'normal'] ?? 0x9e9e9e;
  }

  private createUI(): void {
    this.battleUI = new BattleUI(this);
    this.battleUI.createActionMenu();
    this.battleUI.createMoveMenu();
    this.battleUI.createHPBars();
    this.battleUI.createMessageBox();

    // 初始化HP条
    const playerMonster = this.battleManager.getActivePlayerMonster();
    const enemyMonster = this.battleManager.getActiveEnemyMonster();

    if (playerMonster) {
      this.battleUI.updateHPBar('player', playerMonster);
    }
    if (enemyMonster) {
      this.battleUI.updateHPBar('enemy', enemyMonster);
    }
  }

  private setupUICallbacks(): void {
    // 行动选择事件
    this.battleUI.onActionSelect = (action) => {
      switch (action) {
        case 'fight':
          const playerMonster = this.battleManager.getActivePlayerMonster();
          if (playerMonster) {
            this.battleManager.enterMoveSelect();
            this.battleUI.showMoveMenu(playerMonster);
          }
          break;
        case 'bag':
          // TODO: 背包功能
          this.battleUI.showMessage('背包功能尚未实现');
          break;
        case 'pokemon':
          // TODO: 换怪功能
          this.battleUI.showMessage('换怪功能尚未实现');
          break;
        case 'run':
          this.battleManager.selectPlayerAction({
            type: BattleActionType.RUN,
            priority: -6,
            speed: 0,
            actorIsPlayer: true,
          });
          break;
      }
    };

    // 技能选择事件
    this.battleUI.onMoveSelect = (moveIndex) => {
      const monster = this.battleManager.getActivePlayerMonster();
      if (!monster) return;

      const moves = monster.getMoves();
      const move = moves[moveIndex];
      if (!move) return;

      const moveData = MOVES_DATABASE[move.moveId];

      this.battleManager.selectPlayerAction({
        type: BattleActionType.FIGHT,
        priority: moveData?.priority ?? 0,
        speed: monster.getStats().speed,
        actorIsPlayer: true,
        moveIndex,
      });
    };

    // 技能取消事件
    this.battleUI.onMoveCancel = () => {
      this.battleManager.enterActionSelect();
      this.battleUI.showActionMenu();
    };
  }

  private handleStateChange(state: BattleState): void {
    switch (state) {
      case BattleState.SELECT_ACTION:
        this.battleUI.showActionMenu();
        break;
      case BattleState.SELECT_MOVE:
        // 已在 onActionSelect 处理
        break;
      case BattleState.EXECUTE_TURN:
        this.battleUI.hideAllMenus();
        break;
    }
  }

  private async startBattle(): Promise<void> {
    // 入场动画
    await this.playIntroAnimation();

    // 开始战斗介绍
    await this.battleManager.startIntro();
  }

  private playIntroAnimation(): Promise<void> {
    return new Promise((resolve) => {
      // 敌方怪物从右侧滑入
      if (this.enemyMonsterSprite) {
        this.enemyMonsterSprite.x = GAME_WIDTH + 50;
        this.tweens.add({
          targets: this.enemyMonsterSprite,
          x: GAME_WIDTH - 100,
          duration: 500,
          ease: 'Power2',
        });
      }

      // 玩家怪物从左侧滑入
      if (this.playerMonsterSprite) {
        this.playerMonsterSprite.x = -50;
        this.tweens.add({
          targets: this.playerMonsterSprite,
          x: 100,
          duration: 500,
          ease: 'Power2',
          onComplete: () => resolve(),
        });
      } else {
        resolve();
      }
    });
  }

  private playDamageAnimation(target: 'player' | 'enemy'): void {
    const sprite = target === 'player'
      ? this.playerMonsterSprite
      : this.enemyMonsterSprite;

    if (!sprite) return;

    // 闪烁动画
    this.tweens.add({
      targets: sprite,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 3,
    });
  }

  private playFaintAnimation(target: 'player' | 'enemy'): void {
    const sprite = target === 'player'
      ? this.playerMonsterSprite
      : this.enemyMonsterSprite;

    if (!sprite) return;

    // 下落并消失
    this.tweens.add({
      targets: sprite,
      y: sprite.y + 50,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
    });
  }

  private async handleBattleEnd(result: 'victory' | 'defeat' | 'escape'): Promise<void> {
    switch (result) {
      case 'victory':
        await this.battleUI.showMessage('战斗胜利！');
        break;
      case 'defeat':
        await this.battleUI.showMessage('战斗失败...');
        break;
      case 'escape':
        // 已在 BattleManager 显示消息
        break;
    }

    // 等待一下再返回
    this.time.delayedCall(500, () => {
      this.returnToMap();
    });
  }

  private returnToMap(): void {
    // 淡出
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // 清理资源
      this.battleUI.destroy();

      // 停止战斗场景，恢复地图场景
      this.scene.stop(SCENE_KEYS.BATTLE);
      this.scene.resume(SCENE_KEYS.MAP);

      // 通知地图场景战斗结束
      const mapScene = this.scene.get(SCENE_KEYS.MAP);
      mapScene.events.emit('battleEnd', {
        result: this.battleManager.getState(),
        playerTeam: this.battleManager.getUpdatedPlayerTeam(),
      });
    });
  }
}
