/**
 * 遭遇系统 - 草地随机遇敌
 */

import Phaser from 'phaser';
import { Monster } from '../entities/Monster';
import { MonsterInstance } from '../types/MonsterTypes';

/** 遭遇条目 */
export interface EncounterEntry {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number;
}

/** 遭遇区域配置 */
export interface EncounterZone {
  id: string;
  encounterRate: number;
  monsters: EncounterEntry[];
}

export class EncounterSystem {
  private zone: EncounterZone;
  private stepsInGrass: number = 0;
  private grassTiles: Set<string> = new Set();

  constructor(zone: EncounterZone) {
    this.zone = zone;
  }

  /**
   * 设置草地瓦片
   */
  setGrassTiles(tiles: Array<{ x: number; y: number }>): void {
    this.grassTiles.clear();
    tiles.forEach(t => this.grassTiles.add(`${t.x},${t.y}`));
  }

  /**
   * 添加草地瓦片
   */
  addGrassTile(x: number, y: number): void {
    this.grassTiles.add(`${x},${y}`);
  }

  /**
   * 检查瓦片是否是草地
   */
  isGrassTile(x: number, y: number): boolean {
    return this.grassTiles.has(`${x},${y}`);
  }

  /**
   * 检查是否触发遭遇
   */
  checkEncounter(tileX: number, tileY: number): MonsterInstance | null {
    // 检查是否在草地上
    if (!this.isGrassTile(tileX, tileY)) {
      this.stepsInGrass = 0;
      return null;
    }

    this.stepsInGrass++;

    // 计算遭遇概率（步数越多概率越高）
    const baseRate = this.zone.encounterRate / 100;
    const stepsBonus = Math.min(this.stepsInGrass * 0.03, 0.4);
    const finalRate = baseRate + stepsBonus;

    if (Math.random() > finalRate) {
      return null;
    }

    // 触发遭遇，重置计数
    this.stepsInGrass = 0;

    return this.generateWildMonster();
  }

  /**
   * 生成野生怪物
   */
  private generateWildMonster(): MonsterInstance {
    // 按权重随机选择
    const totalWeight = this.zone.monsters.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;

    let selected = this.zone.monsters[0]!;
    for (const entry of this.zone.monsters) {
      random -= entry.weight;
      if (random <= 0) {
        selected = entry;
        break;
      }
    }

    // 随机等级
    const level = Phaser.Math.Between(selected.minLevel, selected.maxLevel);

    // 使用 Monster 类创建野生怪物
    const monster = Monster.createWild(selected.speciesId, level);
    return monster.getData();
  }

  /**
   * 重置步数计数
   */
  resetSteps(): void {
    this.stepsInGrass = 0;
  }
}

/**
 * 默认遭遇区域配置
 */
export const DEFAULT_ENCOUNTER_ZONE: EncounterZone = {
  id: 'grass-area',
  encounterRate: 15, // 15%基础概率
  monsters: [
    { speciesId: 4, minLevel: 2, maxLevel: 5, weight: 50 }, // 小电鼠
    { speciesId: 5, minLevel: 2, maxLevel: 4, weight: 50 }, // 土拨鼠
  ],
};
