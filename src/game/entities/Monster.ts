/**
 * Monster 实体类 - 怪物个体
 */

import {
  MonsterInstance,
  MonsterSpecies,
  BaseStats,
  StatusEffect,
  NatureType,
  MoveInstance,
} from '../types/MonsterTypes';
import { MONSTER_DATABASE, getNatureModifier } from '../data/MonsterDatabase';
import { MOVES_DATABASE } from '../data/MovesDatabase';

export class Monster {
  private data: MonsterInstance;
  private species: MonsterSpecies;

  constructor(instance: MonsterInstance) {
    this.data = instance;
    const species = MONSTER_DATABASE[instance.speciesId];
    if (!species) {
      throw new Error(`Monster species not found: ${instance.speciesId}`);
    }
    this.species = species;
  }

  /**
   * 获取显示名称
   */
  getName(): string {
    return this.data.nickname ?? this.species.name;
  }

  /**
   * 获取等级
   */
  getLevel(): number {
    return this.data.level;
  }

  /**
   * 计算实际属性值
   */
  getStats(): BaseStats {
    const level = this.data.level;
    const base = this.species.baseStats;
    const iv = this.data.ivs;
    const ev = this.data.evs;
    const nature = getNatureModifier(this.data.nature);

    const calcStat = (
      baseStat: number,
      ivStat: number,
      evStat: number,
      natureMod: number
    ): number => {
      return Math.floor(
        (Math.floor((2 * baseStat + ivStat + Math.floor(evStat / 4)) * level / 100) + 5) * natureMod
      );
    };

    // HP 特殊计算公式
    const hp = Math.floor(
      (2 * base.hp + iv.hp + Math.floor(ev.hp / 4)) * level / 100
    ) + level + 10;

    return {
      hp,
      attack: calcStat(base.attack, iv.attack, ev.attack, nature.attack),
      defense: calcStat(base.defense, iv.defense, ev.defense, nature.defense),
      spAttack: calcStat(base.spAttack, iv.spAttack, ev.spAttack, nature.spAttack),
      spDefense: calcStat(base.spDefense, iv.spDefense, ev.spDefense, nature.spDefense),
      speed: calcStat(base.speed, iv.speed, ev.speed, nature.speed),
    };
  }

  /**
   * 获取最大HP
   */
  getMaxHp(): number {
    return this.getStats().hp;
  }

  /**
   * 获取当前HP
   */
  getCurrentHp(): number {
    return this.data.currentHp;
  }

  /**
   * 设置当前HP
   */
  setCurrentHp(hp: number): void {
    this.data.currentHp = Math.max(0, Math.min(hp, this.getMaxHp()));
  }

  /**
   * 受到伤害
   */
  takeDamage(damage: number): void {
    this.data.currentHp = Math.max(0, this.data.currentHp - damage);
  }

  /**
   * 恢复HP
   */
  heal(amount: number): void {
    this.data.currentHp = Math.min(this.getMaxHp(), this.data.currentHp + amount);
  }

  /**
   * 是否濒死
   */
  isFainted(): boolean {
    return this.data.currentHp <= 0;
  }

  /**
   * 获取HP百分比
   */
  getHpPercent(): number {
    return this.data.currentHp / this.getMaxHp();
  }

  /**
   * 获取技能列表
   */
  getMoves(): MoveInstance[] {
    return this.data.moves;
  }

  /**
   * 消耗技能PP
   */
  usePP(moveIndex: number): boolean {
    const move = this.data.moves[moveIndex];
    if (move && move.currentPp > 0) {
      move.currentPp--;
      return true;
    }
    return false;
  }

  /**
   * 获取状态异常
   */
  getStatus(): StatusEffect {
    return this.data.status;
  }

  /**
   * 设置状态异常
   */
  setStatus(status: StatusEffect): void {
    this.data.status = status;
  }

  /**
   * 获取原始数据
   */
  getData(): MonsterInstance {
    return this.data;
  }

  /**
   * 获取物种数据
   */
  getSpecies(): MonsterSpecies {
    return this.species;
  }

  /**
   * 创建一个随机野生怪物
   */
  static createWild(speciesId: number, level: number): Monster {
    const species = MONSTER_DATABASE[speciesId];
    if (!species) {
      throw new Error(`Monster species not found: ${speciesId}`);
    }

    const randomIV = (): number => Math.floor(Math.random() * 32);
    const ivs: BaseStats = {
      hp: randomIV(),
      attack: randomIV(),
      defense: randomIV(),
      spAttack: randomIV(),
      spDefense: randomIV(),
      speed: randomIV(),
    };

    const evs: BaseStats = {
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    };

    // 随机性格
    const natures = Object.values(NatureType);
    const nature = natures[Math.floor(Math.random() * natures.length)] ?? NatureType.HARDY;

    // 根据等级获取技能（最多4个）
    const moves: MoveInstance[] = species.learnset
      .filter(l => l.level <= level)
      .slice(-4)
      .map(l => ({
        moveId: l.moveId,
        currentPp: MOVES_DATABASE[l.moveId]?.pp ?? 10,
      }));

    // 确保至少有一个技能
    if (moves.length === 0 && species.learnset.length > 0) {
      const firstMove = species.learnset[0]!;
      moves.push({
        moveId: firstMove.moveId,
        currentPp: MOVES_DATABASE[firstMove.moveId]?.pp ?? 10,
      });
    }

    // 计算最大HP
    const baseHp = species.baseStats.hp;
    const maxHp = Math.floor(
      (2 * baseHp + ivs.hp) * level / 100
    ) + level + 10;

    const instance: MonsterInstance = {
      speciesId,
      level,
      exp: 0,
      currentHp: maxHp,
      moves,
      ivs,
      evs,
      nature,
      status: StatusEffect.NONE,
      isShiny: Math.random() < 1 / 4096,
    };

    return new Monster(instance);
  }

  /**
   * 创建玩家的初始怪物
   */
  static createStarter(speciesId: number, level: number = 5): Monster {
    const monster = Monster.createWild(speciesId, level);
    // 初始怪物可以有更好的个体值
    const minIV = 10;
    const data = monster.getData();
    data.ivs = {
      hp: minIV + Math.floor(Math.random() * (32 - minIV)),
      attack: minIV + Math.floor(Math.random() * (32 - minIV)),
      defense: minIV + Math.floor(Math.random() * (32 - minIV)),
      spAttack: minIV + Math.floor(Math.random() * (32 - minIV)),
      spDefense: minIV + Math.floor(Math.random() * (32 - minIV)),
      speed: minIV + Math.floor(Math.random() * (32 - minIV)),
    };
    // 重新计算HP
    const species = monster.getSpecies();
    const maxHp = Math.floor(
      (2 * species.baseStats.hp + data.ivs.hp) * level / 100
    ) + level + 10;
    data.currentHp = maxHp;
    return monster;
  }
}
