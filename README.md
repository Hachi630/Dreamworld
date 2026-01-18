# Dream World - 梦

A story-driven hand-drawn web game built with Phaser 3, TypeScript, and Vite.

## Features

- 🎨 Hand-drawn aesthetic support (placeholder graphics currently)
- 📖 Story-driven gameplay architecture
- 🎮 Smooth character movement
- 🎬 Multiple scene system (Boot → Preload → Title → Map + UI overlay)
- 🏗️ Modular, extensible architecture ready for AI-assisted development

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Controls

- **Arrow Keys**: Move player
- **Enter**: Start game from title screen

## Project Structure

```
src/
├── main.ts                 # Entry point
├── styles.css              # Global styles
└── game/
    ├── GameApp.ts          # Phaser game initialization
    ├── config/             # Game configuration
    │   ├── gameConfig.ts   # Phaser settings
    │   └── constants.ts    # Global constants
    ├── scenes/             # Game scenes
    │   ├── BootScene.ts    # Initial loading
    │   ├── PreloadScene.ts # Asset loading
    │   ├── TitleScene.ts   # Main menu
    │   ├── MapScene.ts     # Gameplay scene
    │   └── UIScene.ts      # UI overlay
    ├── entities/           # Game entities
    │   └── Player.ts       # Player character
    ├── systems/            # Game systems (future)
    ├── story/              # Story engine (future)
    ├── ui/                 # UI components (future)
    ├── data/               # Game data (future)
    ├── assets/             # Asset organization
    └── utils/              # Utilities (future)
```

## Roadmap

### Phase 1 ✅ (Current)
- [x] Project setup with Vite + TypeScript + Phaser
- [x] Basic scene flow (Boot → Preload → Title → Map)
- [x] Player movement with arrow keys
- [x] UI overlay system
- [x] Placeholder graphics

### Phase 2 (Next)
- [ ] Story engine with command system
- [ ] Dialogue box component
- [ ] Choice menu system
- [ ] Trigger system for interactions
- [ ] NPC entities

### Phase 3 (Future)
- [ ] Save/load system
- [ ] Audio system (BGM + SFX)
- [ ] Camera system with cinematic movements
- [ ] Hand-drawn asset integration
- [ ] Scene data JSON format
- [ ] Ink narrative integration (optional)

## Tech Stack

- **Phaser 3**: Game engine
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

## License

This project is for educational and personal use.
