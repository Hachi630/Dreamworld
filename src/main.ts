import { GameApp } from './game/GameApp';
import './styles.css';

/**
 * Application entry point
 * Initializes the game when DOM is ready
 */

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('🌙 Starting Dream World...');

  // Create game instance
  const gameApp = new GameApp();

  // Make game instance available globally for debugging
  (window as any).game = gameApp.getGame();

  console.log('✨ Dream World started successfully');
});
