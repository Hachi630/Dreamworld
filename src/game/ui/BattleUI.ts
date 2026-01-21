/**
 * 战斗UI组件
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTHS, COLORS } from '../config/constants';
import { Monster } from '../entities/Monster';
import { MOVES_DATABASE } from '../data/MovesDatabase';

export class BattleUI {
  private scene: Phaser.Scene;

  // UI容器
  private actionMenu?: Phaser.GameObjects.Container;
  private moveMenu?: Phaser.GameObjects.Container;
  private messageBox?: Phaser.GameObjects.Container;
  private playerHPBar?: Phaser.GameObjects.Container;
  private enemyHPBar?: Phaser.GameObjects.Container;

  // 回调
  public onActionSelect?: (action: 'fight' | 'bag' | 'pokemon' | 'run') => void;
  public onMoveSelect?: (moveIndex: number) => void;
  public onMoveCancel?: () => void;

  // 当前选中索引
  private selectedActionIndex: number = 0;
  private selectedMoveIndex: number = 0;

  // 按键监听
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyZ?: Phaser.Input.Keyboard.Key;
  private keyX?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupInput();
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.keyZ = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  /**
   * 创建行动菜单
   */
  createActionMenu(): void {
    const boxWidth = 120;
    const boxHeight = 70;
    const boxX = GAME_WIDTH - boxWidth / 2 - 8;
    const boxY = GAME_HEIGHT - boxHeight / 2 - 8;

    // 背景
    const bg = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, COLORS.SECONDARY);
    bg.setStrokeStyle(2, COLORS.ACCENT);

    // 按钮布局 (2x2)
    const buttons: { text: Phaser.GameObjects.Text; action: 'fight' | 'bag' | 'pokemon' | 'run' }[] = [];
    const actions: Array<{ text: string; action: 'fight' | 'bag' | 'pokemon' | 'run' }> = [
      { text: '战斗', action: 'fight' },
      { text: '背包', action: 'bag' },
      { text: '精灵', action: 'pokemon' },
      { text: '逃跑', action: 'run' },
    ];

    const buttonContainer = this.scene.add.container(0, 0);

    actions.forEach((btn, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = -28 + col * 56;
      const y = -14 + row * 28;

      const text = this.scene.add.text(x, y, btn.text, {
        fontSize: '10px',
        color: '#f7f3e3',
        fontFamily: '"Press Start 2P", "VT323", monospace',
      });
      text.setOrigin(0.5);

      buttons.push({ text, action: btn.action });
      buttonContainer.add(text);
    });

    this.actionMenu = this.scene.add.container(boxX, boxY, [bg, buttonContainer]);
    this.actionMenu.setDepth(DEPTHS.UI_OVERLAY);
    this.actionMenu.setData('buttons', buttons);
    this.actionMenu.setVisible(false);
  }

  /**
   * 创建技能菜单
   */
  createMoveMenu(): void {
    const boxWidth = GAME_WIDTH - 136;
    const boxHeight = 70;
    const boxX = boxWidth / 2 + 8;
    const boxY = GAME_HEIGHT - boxHeight / 2 - 8;

    const bg = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, COLORS.SECONDARY);
    bg.setStrokeStyle(2, COLORS.ACCENT);

    this.moveMenu = this.scene.add.container(boxX, boxY, [bg]);
    this.moveMenu.setDepth(DEPTHS.UI_OVERLAY);
    this.moveMenu.setVisible(false);
  }

  /**
   * 更新技能菜单内容
   */
  updateMoveMenu(monster: Monster): void {
    if (!this.moveMenu) return;

    // 清除旧内容（保留背景）
    const children = this.moveMenu.getAll();
    children.slice(1).forEach(child => child.destroy());

    const moves = monster.getMoves();
    const buttons: Phaser.GameObjects.Text[] = [];

    moves.forEach((move, i) => {
      const moveData = MOVES_DATABASE[move.moveId];
      if (!moveData) return;

      const col = i % 2;
      const row = Math.floor(i / 2);
      const boxWidth = GAME_WIDTH - 136;
      const x = -boxWidth / 2 + 80 + col * 160;
      const y = -14 + row * 28;

      const text = this.scene.add.text(x, y,
        `${moveData.name}`, {
          fontSize: '10px',
          color: move.currentPp > 0 ? '#f7f3e3' : '#666666',
          fontFamily: '"Press Start 2P", "VT323", monospace',
        });
      text.setOrigin(0.5);

      // PP显示
      const ppText = this.scene.add.text(x + 60, y,
        `${move.currentPp}/${moveData.pp}`, {
          fontSize: '8px',
          color: move.currentPp > 0 ? '#9fb3c8' : '#666666',
          fontFamily: '"Press Start 2P", "VT323", monospace',
        });
      ppText.setOrigin(0.5);

      buttons.push(text);
      this.moveMenu?.add([text, ppText]);
    });

    // 返回按钮
    const backText = this.scene.add.text(0, 28, '← 返回', {
      fontSize: '8px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    backText.setOrigin(0.5);
    this.moveMenu.add(backText);

    this.moveMenu.setData('buttons', buttons);
    this.moveMenu.setData('monster', monster);
  }

  /**
   * 创建HP条
   */
  createHPBars(): void {
    // 敌方HP条（左上）
    this.enemyHPBar = this.createHPBarContainer(16, 24, false);

    // 玩家HP条（右下）
    this.playerHPBar = this.createHPBarContainer(GAME_WIDTH - 140, GAME_HEIGHT - 100, true);
  }

  private createHPBarContainer(x: number, y: number, showHpText: boolean): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // 背景框
    const bgBox = this.scene.add.rectangle(60, 20, 130, 44, COLORS.SECONDARY);
    bgBox.setStrokeStyle(2, COLORS.PRIMARY);

    // 名称
    const nameText = this.scene.add.text(8, 6, '', {
      fontSize: '10px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });

    // 等级
    const levelText = this.scene.add.text(100, 6, '', {
      fontSize: '8px',
      color: '#9fb3c8',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });

    // HP标签
    const hpLabel = this.scene.add.text(8, 22, 'HP', {
      fontSize: '8px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });

    // HP条背景
    const hpBg = this.scene.add.rectangle(75, 24, 80, 8, 0x333333);

    // HP条填充
    const hpFill = this.scene.add.rectangle(36, 24, 78, 6, 0x4ade80);
    hpFill.setOrigin(0, 0.5);

    container.add([bgBox, nameText, levelText, hpLabel, hpBg, hpFill]);

    // HP文字（仅玩家显示）
    if (showHpText) {
      const hpText = this.scene.add.text(75, 36, '', {
        fontSize: '8px',
        color: '#f7f3e3',
        fontFamily: '"Press Start 2P", "VT323", monospace',
      });
      hpText.setOrigin(0.5);
      container.add(hpText);
      container.setData('hpText', hpText);
    }

    container.setData('nameText', nameText);
    container.setData('levelText', levelText);
    container.setData('hpFill', hpFill);
    container.setDepth(DEPTHS.UI_OVERLAY);

    return container;
  }

  /**
   * 更新HP条显示
   */
  updateHPBar(target: 'player' | 'enemy', monster: Monster): void {
    const bar = target === 'player' ? this.playerHPBar : this.enemyHPBar;
    if (!bar) return;

    const nameText = bar.getData('nameText') as Phaser.GameObjects.Text;
    const levelText = bar.getData('levelText') as Phaser.GameObjects.Text;
    const hpFill = bar.getData('hpFill') as Phaser.GameObjects.Rectangle;
    const hpText = bar.getData('hpText') as Phaser.GameObjects.Text | undefined;

    nameText.setText(monster.getName());
    levelText.setText(`Lv${monster.getLevel()}`);

    const ratio = monster.getHpPercent();
    const targetWidth = 78 * ratio;

    // HP条颜色变化
    let color = 0x4ade80; // 绿色
    if (ratio < 0.5) color = 0xfbbf24; // 黄色
    if (ratio < 0.2) color = 0xef4444; // 红色

    hpFill.setFillStyle(color);
    hpFill.width = targetWidth;

    // 更新HP文字
    if (hpText) {
      hpText.setText(`${monster.getCurrentHp()}/${monster.getMaxHp()}`);
    }
  }

  /**
   * HP条动画
   */
  animateHPBar(target: 'player' | 'enemy', currentHp: number, maxHp: number): void {
    const bar = target === 'player' ? this.playerHPBar : this.enemyHPBar;
    if (!bar) return;

    const hpFill = bar.getData('hpFill') as Phaser.GameObjects.Rectangle;
    const hpText = bar.getData('hpText') as Phaser.GameObjects.Text | undefined;

    const ratio = currentHp / maxHp;
    const targetWidth = 78 * ratio;

    // HP条颜色变化
    let color = 0x4ade80;
    if (ratio < 0.5) color = 0xfbbf24;
    if (ratio < 0.2) color = 0xef4444;

    // 动画过渡
    this.scene.tweens.add({
      targets: hpFill,
      width: targetWidth,
      duration: 300,
      onUpdate: () => {
        hpFill.setFillStyle(color);
      },
    });

    // 更新HP文字
    if (hpText) {
      hpText.setText(`${currentHp}/${maxHp}`);
    }
  }

  /**
   * 创建消息框
   */
  createMessageBox(): void {
    const boxWidth = GAME_WIDTH - 136;
    const boxHeight = 50;
    const boxX = boxWidth / 2 + 8;
    const boxY = GAME_HEIGHT - boxHeight / 2 - 8;

    const bg = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, COLORS.SECONDARY);
    bg.setStrokeStyle(2, COLORS.ACCENT);

    const text = this.scene.add.text(-boxWidth / 2 + 12, -boxHeight / 2 + 12, '', {
      fontSize: '10px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      wordWrap: { width: boxWidth - 24 },
    });

    // 继续提示符
    const continueIndicator = this.scene.add.text(boxWidth / 2 - 16, boxHeight / 2 - 12, '▼', {
      fontSize: '8px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    continueIndicator.setVisible(false);

    // 闪烁动画
    this.scene.tweens.add({
      targets: continueIndicator,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.messageBox = this.scene.add.container(boxX, boxY, [bg, text, continueIndicator]);
    this.messageBox.setDepth(DEPTHS.UI_OVERLAY);
    this.messageBox.setData('text', text);
    this.messageBox.setData('indicator', continueIndicator);
    this.messageBox.setVisible(false);
  }

  /**
   * 显示消息
   */
  showMessage(message: string): Promise<void> {
    return new Promise((resolve) => {
      this.hideAllMenus();
      this.messageBox?.setVisible(true);

      const text = this.messageBox?.getData('text') as Phaser.GameObjects.Text;
      const indicator = this.messageBox?.getData('indicator') as Phaser.GameObjects.Text;

      text.setText(message);
      indicator.setVisible(true);

      // 点击或按键继续
      const advance = () => {
        this.scene.input.off('pointerdown', advance);
        this.scene.input.keyboard?.off('keydown-Z', advance);
        this.scene.input.keyboard?.off('keydown-SPACE', advance);
        this.scene.input.keyboard?.off('keydown-ENTER', advance);
        indicator.setVisible(false);
        resolve();
      };

      this.scene.input.once('pointerdown', advance);
      this.scene.input.keyboard?.once('keydown-Z', advance);
      this.scene.input.keyboard?.once('keydown-SPACE', advance);
      this.scene.input.keyboard?.once('keydown-ENTER', advance);
    });
  }

  /**
   * 显示行动菜单
   */
  showActionMenu(): void {
    this.hideAllMenus();
    this.actionMenu?.setVisible(true);
    this.selectedActionIndex = 0;
    this.updateActionHighlight();
  }

  /**
   * 显示技能菜单
   */
  showMoveMenu(monster: Monster): void {
    this.updateMoveMenu(monster);
    this.hideAllMenus();
    this.moveMenu?.setVisible(true);
    this.selectedMoveIndex = 0;
    this.updateMoveHighlight();
  }

  /**
   * 隐藏所有菜单
   */
  hideAllMenus(): void {
    this.actionMenu?.setVisible(false);
    this.moveMenu?.setVisible(false);
    this.messageBox?.setVisible(false);
  }

  /**
   * 更新行动菜单高亮
   */
  private updateActionHighlight(): void {
    const buttons = this.actionMenu?.getData('buttons') as Array<{ text: Phaser.GameObjects.Text; action: string }>;
    if (!buttons) return;

    buttons.forEach((btn, i) => {
      btn.text.setColor(i === this.selectedActionIndex ? '#ffd166' : '#f7f3e3');
    });
  }

  /**
   * 更新技能菜单高亮
   */
  private updateMoveHighlight(): void {
    const buttons = this.moveMenu?.getData('buttons') as Phaser.GameObjects.Text[];
    const monster = this.moveMenu?.getData('monster') as Monster;
    if (!buttons || !monster) return;

    const moves = monster.getMoves();
    buttons.forEach((btn, i) => {
      const move = moves[i];
      if (move && move.currentPp > 0) {
        btn.setColor(i === this.selectedMoveIndex ? '#ffd166' : '#f7f3e3');
      }
    });
  }

  /**
   * 处理行动菜单输入
   */
  handleActionInput(): void {
    if (!this.actionMenu?.visible) return;

    const buttons = this.actionMenu.getData('buttons') as Array<{ text: Phaser.GameObjects.Text; action: 'fight' | 'bag' | 'pokemon' | 'run' }>;
    if (!buttons) return;

    // 方向键
    if (Phaser.Input.Keyboard.JustDown(this.cursors!.left)) {
      if (this.selectedActionIndex % 2 === 1) {
        this.selectedActionIndex--;
        this.updateActionHighlight();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.right)) {
      if (this.selectedActionIndex % 2 === 0) {
        this.selectedActionIndex++;
        this.updateActionHighlight();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.up)) {
      if (this.selectedActionIndex >= 2) {
        this.selectedActionIndex -= 2;
        this.updateActionHighlight();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.down)) {
      if (this.selectedActionIndex < 2) {
        this.selectedActionIndex += 2;
        this.updateActionHighlight();
      }
    }

    // 确认
    if (this.keyZ && Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      const selected = buttons[this.selectedActionIndex];
      if (selected) {
        this.onActionSelect?.(selected.action);
      }
    }
  }

  /**
   * 处理技能菜单输入
   */
  handleMoveInput(): void {
    if (!this.moveMenu?.visible) return;

    const buttons = this.moveMenu.getData('buttons') as Phaser.GameObjects.Text[];
    const monster = this.moveMenu.getData('monster') as Monster;
    if (!buttons || !monster) return;

    const moves = monster.getMoves();

    // 方向键
    if (Phaser.Input.Keyboard.JustDown(this.cursors!.left)) {
      if (this.selectedMoveIndex % 2 === 1) {
        this.selectedMoveIndex--;
        this.updateMoveHighlight();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.right)) {
      if (this.selectedMoveIndex % 2 === 0 && this.selectedMoveIndex + 1 < moves.length) {
        this.selectedMoveIndex++;
        this.updateMoveHighlight();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.up)) {
      if (this.selectedMoveIndex >= 2) {
        this.selectedMoveIndex -= 2;
        this.updateMoveHighlight();
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.down)) {
      if (this.selectedMoveIndex + 2 < moves.length) {
        this.selectedMoveIndex += 2;
        this.updateMoveHighlight();
      }
    }

    // 确认
    if (this.keyZ && Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      const move = moves[this.selectedMoveIndex];
      if (move && move.currentPp > 0) {
        this.onMoveSelect?.(this.selectedMoveIndex);
      }
    }

    // 取消
    if (this.keyX && Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.onMoveCancel?.();
    }
  }

  /**
   * 销毁所有UI元素
   */
  destroy(): void {
    this.actionMenu?.destroy();
    this.moveMenu?.destroy();
    this.messageBox?.destroy();
    this.playerHPBar?.destroy();
    this.enemyHPBar?.destroy();
  }
}
