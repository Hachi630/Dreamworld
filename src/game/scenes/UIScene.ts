import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../config/constants';

/**
 * UIScene - Overlay scene for dialogue, menus, and UI elements
 * Runs in parallel with MapScene
 */
export class UIScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.UI });
  }

  create(): void {
    console.log('UIScene ready (overlay)');

    this.createDebugInfo();

    // In the future, this scene will contain:
    // - Dialogue boxes
    // - Choice menus
    // - Interaction prompts
    // - HUD elements
  }

  private createDebugInfo(): void {
    // FPS counter in top-right corner
    this.debugText = this.add.text(GAME_WIDTH - 10, 10, '', {
      fontSize: '8px',
      color: '#9fb3c8',
      fontFamily: '"Press Start 2P", "VT323", monospace',
      backgroundColor: '#0b1220',
      padding: { x: 6, y: 4 },
    });
    this.debugText.setOrigin(1, 0);
    this.debugText.setDepth(DEPTHS.UI_OVERLAY);
    this.debugText.setAlpha(0.85);
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
   * Future methods to implement:
   * - showDialogue(text, speaker)
   * - showChoices(choices[])
   * - showPrompt(text, key)
   * - hideDialogue()
   */
}
