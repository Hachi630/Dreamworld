/**
 * BattleScene - 战斗场景
 */

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../config/constants';
import { BattleManager, BattleState } from '../systems/BattleManager';
import { BattleUI } from '../ui/BattleUI';
import { BattleActionType, BattleConfig } from '../types/MonsterTypes';
import { MOVES_DATABASE } from '../data/MovesDatabase';
import { ensureMonsterTextures } from '../assets/pixelSprites';

export class BattleScene extends Phaser.Scene {
  private battleManager!: BattleManager;
  private battleUI!: BattleUI;
  private config!: BattleConfig;

  private playerMonsterSprite?: Phaser.GameObjects.Image;
  private enemyMonsterSprite?: Phaser.GameObjects.Image;

  private background?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENE_KEYS.BATTLE });
  }

  init(config: BattleConfig): void {
    this.config = config;
  }

  create(): void {
    // Ensure monster textures exist (in case PreloadScene didn't generate them)
    ensureMonsterTextures(this);

    this.createBackground();
    this.createBattleManager();
    this.createMonsterSprites();
    this.createUI();
    this.setupUICallbacks();

    this.startBattle();
  }

  update(): void {
    const state = this.battleManager.getState();

    if (state === BattleState.SELECT_ACTION) {
      this.battleUI.handleActionInput();
    } else if (state === BattleState.SELECT_MOVE) {
      this.battleUI.handleMoveInput();
    }
  }

  private createBackground(): void {
    // Simple battle background
    this.background = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x3d5a45);
    this.background.setDepth(DEPTHS.BACKGROUND);

    const ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, GAME_WIDTH, 100, 0x5a7d4c);
    ground.setDepth(DEPTHS.BACKGROUND + 1);

    const playerPlatform = this.add.ellipse(100, GAME_HEIGHT - 70, 120, 30, 0x8fbc8f);
    playerPlatform.setDepth(DEPTHS.GROUND);

    const enemyPlatform = this.add.ellipse(GAME_WIDTH - 100, 130, 100, 25, 0x8fbc8f);
    enemyPlatform.setDepth(DEPTHS.GROUND);
  }

  private createBattleManager(): void {
    this.battleManager = new BattleManager(this.config);

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
    const playerMonster = this.battleManager.getActivePlayerMonster();
    const enemyMonster = this.battleManager.getActiveEnemyMonster();

    // Player monster (back view)
    if (playerMonster) {
      const key = `${playerMonster.getSpecies().spriteKey}-back`;
      if (this.textures.exists(key)) {
        this.playerMonsterSprite = this.add.image(100, GAME_HEIGHT - 100, key);
        this.playerMonsterSprite.setOrigin(0.5);
        this.playerMonsterSprite.setScale(3);
      } else {
        this.playerMonsterSprite = this.add.image(100, GAME_HEIGHT - 100, playerMonster.getSpecies().spriteKey);
        this.playerMonsterSprite.setOrigin(0.5);
        this.playerMonsterSprite.setScale(3);
        this.playerMonsterSprite.setFlipX(true);
      }
      this.playerMonsterSprite.setDepth(DEPTHS.PLAYER);
    }

    // Enemy monster (front view)
    if (enemyMonster) {
      const key = enemyMonster.getSpecies().spriteKey;
      if (this.textures.exists(key)) {
        this.enemyMonsterSprite = this.add.image(GAME_WIDTH - 100, 100, key);
        this.enemyMonsterSprite.setOrigin(0.5);
        this.enemyMonsterSprite.setScale(2.5);
        this.enemyMonsterSprite.setDepth(DEPTHS.NPC);
      }
    }
  }

  private createUI(): void {
    this.battleUI = new BattleUI(this);
    this.battleUI.createActionMenu();
    this.battleUI.createMoveMenu();
    this.battleUI.createHPBars();
    this.battleUI.createMessageBox();

    const playerMonster = this.battleManager.getActivePlayerMonster();
    const enemyMonster = this.battleManager.getActiveEnemyMonster();

    if (playerMonster) this.battleUI.updateHPBar('player', playerMonster);
    if (enemyMonster) this.battleUI.updateHPBar('enemy', enemyMonster);
  }

  private setupUICallbacks(): void {
    this.battleUI.onActionSelect = (action) => {
      switch (action) {
        case 'fight': {
          const playerMonster = this.battleManager.getActivePlayerMonster();
          if (playerMonster) {
            this.battleManager.enterMoveSelect();
            this.battleUI.showMoveMenu(playerMonster);
          }
          break;
        }
        case 'bag':
          this.battleUI.showMessage('背包功能尚未实现');
          break;
        case 'pokemon':
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

    this.battleUI.onMoveSelect = (moveIndex) => {
      const monster = this.battleManager.getActivePlayerMonster();
      if (!monster) return;

      const move = monster.getMoves()[moveIndex];
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
        break;
      case BattleState.EXECUTE_TURN:
        this.battleUI.hideAllMenus();
        break;
    }
  }

  private async startBattle(): Promise<void> {
    await this.playIntroAnimation();
    await this.battleManager.startIntro();
  }

  private playIntroAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];

      if (this.enemyMonsterSprite) {
        this.enemyMonsterSprite.x = GAME_WIDTH + 50;
        tweens.push(
          this.tweens.add({
            targets: this.enemyMonsterSprite,
            x: GAME_WIDTH - 100,
            duration: 500,
            ease: 'Power2',
          })
        );
      }

      if (this.playerMonsterSprite) {
        this.playerMonsterSprite.x = -50;
        tweens.push(
          this.tweens.add({
            targets: this.playerMonsterSprite,
            x: 100,
            duration: 500,
            ease: 'Power2',
            onComplete: () => resolve(),
          })
        );
      } else {
        resolve();
      }

      // Safety: if only enemy tween exists, resolve when it finishes
      if (!this.playerMonsterSprite && tweens.length === 1) {
        tweens[0]?.setCallback('onComplete', () => resolve());
      }
    });
  }

  private playDamageAnimation(target: 'player' | 'enemy'): void {
    const sprite = target === 'player' ? this.playerMonsterSprite : this.enemyMonsterSprite;
    if (!sprite) return;

    this.tweens.add({
      targets: sprite,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => sprite.setAlpha(1),
    });
  }

  private playFaintAnimation(target: 'player' | 'enemy'): void {
    const sprite = target === 'player' ? this.playerMonsterSprite : this.enemyMonsterSprite;
    if (!sprite) return;

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
        await this.battleUI.showMessage('成功逃跑！');
        break;
    }

    this.time.delayedCall(500, () => this.returnToMap(result));
  }

  private returnToMap(result: 'victory' | 'defeat' | 'escape'): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.battleUI.destroy();

      this.scene.stop(SCENE_KEYS.BATTLE);
      this.scene.resume(SCENE_KEYS.MAP);
      this.scene.resume(SCENE_KEYS.UI);

      const mapScene = this.scene.get(SCENE_KEYS.MAP);
      mapScene.events.emit('battleEnd', {
        result,
        playerTeam: this.battleManager.getUpdatedPlayerTeam(),
      });
    });
  }
}
