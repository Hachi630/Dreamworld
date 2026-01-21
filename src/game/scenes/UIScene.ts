import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../config/constants';

/**
 * UIScene - Overlay scene for dialogue, menus, and UI elements
 * Runs in parallel with MapScene
 */
export class UIScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;

  // 对话框相关
  private dialogueBox?: Phaser.GameObjects.Container;
  private dialogueText?: Phaser.GameObjects.Text;
  private speakerText?: Phaser.GameObjects.Text;
  private isDialogueVisible: boolean = false;

  // 对话队列系统
  private dialogueQueue: Array<{ text: string; speaker?: string }> = [];
  private onDialogueComplete?: () => void;

  constructor() {
    super({ key: SCENE_KEYS.UI });
  }

  create(): void {
    console.log('UIScene ready (overlay)');

    this.createDebugInfo();
    this.createExitButton();

    // In the future, this scene will contain:
    // - Dialogue boxes
    // - Choice menus
    // - Interaction prompts
    // - HUD elements
  }

  private createDebugInfo(): void {
    // FPS counter in top-right corner
    this.debugText = this.add.text(GAME_WIDTH - 10, 10, '', {
      fontSize: '10px',
      color: '#9fb3c8',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      backgroundColor: '#0b1220',
      padding: { x: 6, y: 4 },
    });
    this.debugText.setOrigin(1, 0);
    this.debugText.setDepth(DEPTHS.UI_OVERLAY);
    this.debugText.setAlpha(0.85);
  }

  private createExitButton(): void {
    // 退出按钮在左上角
    const exitBtn = this.add.text(10, 10, '✕ 退出', {
      fontSize: '10px',
      color: '#9fb3c8',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      backgroundColor: '#0b1220',
      padding: { x: 6, y: 4 },
    });
    exitBtn.setDepth(DEPTHS.UI_OVERLAY);
    exitBtn.setInteractive({ useHandCursor: true });

    exitBtn.on('pointerover', () => {
      exitBtn.setColor('#ffd166');
    });

    exitBtn.on('pointerout', () => {
      exitBtn.setColor('#9fb3c8');
    });

    exitBtn.on('pointerdown', () => {
      // 返回标题界面
      this.scene.stop(SCENE_KEYS.MAP);
      this.scene.stop(SCENE_KEYS.UI);
      this.scene.start(SCENE_KEYS.TITLE);
    });
  }

  update(): void {
    // Update debug info
    if (this.debugText) {
      const fps = Math.round(this.game.loop.actualFps);
      this.debugText.setText(`FPS ${fps}`);
    }
  }

  /**
   * Show a simple toast message
   * (Future: create proper toast component)
   */
  showToast(message: string, duration: number = 2000): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT - 80;

    const panel = this.add.rectangle(centerX, centerY, 200, 28, 0x1b263b);
    panel.setStrokeStyle(2, 0xffd166);

    const text = this.add.text(centerX, centerY, message.toUpperCase(), {
      fontSize: '10px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });
    text.setOrigin(0.5);

    const toast = this.add.container(0, 0, [panel, text]);
    toast.setDepth(DEPTHS.UI_OVERLAY);
    toast.setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: toast,
      alpha: 0.95,
      duration: 300,
      onComplete: () => {
        // Fade out after duration
        this.tweens.add({
          targets: toast,
          alpha: 0,
          delay: duration,
          duration: 300,
          onComplete: () => {
            toast.destroy();
          },
        });
      },
    });
  }

  /**
   * 创建对话框
   */
  private createDialogueBox(): void {
    const boxWidth = GAME_WIDTH - 40;
    const boxHeight = 80;
    const boxX = GAME_WIDTH / 2;
    const boxY = GAME_HEIGHT - 55;

    // 对话框背景
    const background = this.add.rectangle(0, 0, boxWidth, boxHeight, 0x1b263b);
    background.setStrokeStyle(3, 0xffd166);

    // 说话者名字
    this.speakerText = this.add.text(-boxWidth / 2 + 12, -boxHeight / 2 - 16, '', {
      fontSize: '12px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      backgroundColor: '#1b263b',
      padding: { x: 6, y: 3 },
    });

    // 对话内容
    this.dialogueText = this.add.text(-boxWidth / 2 + 12, -boxHeight / 2 + 12, '', {
      fontSize: '12px',
      color: '#f7f3e3',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      wordWrap: { width: boxWidth - 30 },
      lineSpacing: 6,
    });

    // 继续提示（闪烁的小三角）
    const continueHint = this.add.text(boxWidth / 2 - 20, boxHeight / 2 - 18, '▼', {
      fontSize: '12px',
      color: '#ffd166',
      fontFamily: '"Press Start 2P", "VT323", monospace',
    });

    // 闪烁动画
    this.tweens.add({
      targets: continueHint,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // 组合成容器
    this.dialogueBox = this.add.container(boxX, boxY, [
      background,
      this.speakerText,
      this.dialogueText,
      continueHint,
    ]);
    this.dialogueBox.setDepth(DEPTHS.UI_OVERLAY);
    this.dialogueBox.setVisible(false);
  }

  /**
   * 显示对话框
   * @param text 对话内容
   * @param speaker 说话者名字（可选）
   */
  showDialogue(text: string, speaker?: string): void {
    if (!this.dialogueBox) {
      this.createDialogueBox();
    }

    if (this.speakerText) {
      this.speakerText.setText(speaker ? speaker.toUpperCase() : '');
    }

    if (this.dialogueText) {
      this.dialogueText.setText(text);
    }

    this.dialogueBox?.setVisible(true);
    this.dialogueBox?.setAlpha(0);

    // 淡入动画
    this.tweens.add({
      targets: this.dialogueBox,
      alpha: 1,
      duration: 200,
    });

    this.isDialogueVisible = true;
  }

  /**
   * 隐藏对话框
   */
  hideDialogue(): void {
    if (!this.dialogueBox || !this.isDialogueVisible) return;

    // 淡出动画
    this.tweens.add({
      targets: this.dialogueBox,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.dialogueBox?.setVisible(false);
      },
    });

    this.isDialogueVisible = false;
  }

  /**
   * 检查对话框是否显示中
   */
  isDialogueShowing(): boolean {
    return this.isDialogueVisible;
  }

  /**
   * 播放对话序列
   * @param dialogues 对话数组
   * @param onComplete 全部对话结束后的回调
   */
  playDialogues(
    dialogues: Array<{ text: string; speaker?: string }>,
    onComplete?: () => void
  ): void {
    this.dialogueQueue = [...dialogues];
    this.onDialogueComplete = onComplete;
    this.showNextDialogue();
  }

  /**
   * 显示下一条对话
   */
  private showNextDialogue(): void {
    if (this.dialogueQueue.length === 0) {
      // 对话全部结束
      this.hideDialogue();
      if (this.onDialogueComplete) {
        this.time.delayedCall(300, () => {
          this.onDialogueComplete?.();
          this.onDialogueComplete = undefined;
        });
      }
      return;
    }

    const next = this.dialogueQueue.shift()!;
    this.showDialogue(next.text, next.speaker);

    // 设置点击/按键监听，进入下一句
    const advance = () => {
      this.showNextDialogue();
    };

    this.input.once('pointerdown', advance);
    this.input.keyboard?.once('keydown-SPACE', advance);
    this.input.keyboard?.once('keydown-ENTER', advance);
  }
}
