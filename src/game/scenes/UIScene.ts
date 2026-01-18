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
    console.log('✓ UIScene ready (overlay)');

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
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
    });
    this.debugText.setOrigin(1, 0);
    this.debugText.setDepth(DEPTHS.UI_OVERLAY);
    this.debugText.setAlpha(0.7);
  }

  update(): void {
    // Update debug info
    if (this.debugText) {
      const fps = Math.round(this.game.loop.actualFps);
      this.debugText.setText(`FPS: ${fps}`);
    }
  }

  /**
   * Show a simple toast message
   * (Future: create proper toast component)
   */
  showToast(message: string, duration: number = 2000): void {
    const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, message, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });
    toast.setOrigin(0.5);
    toast.setDepth(DEPTHS.UI_OVERLAY);
    toast.setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: toast,
      alpha: 0.9,
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
