/**
 * 伤害计算器 - 宝可梦风格伤害公式
 */

import { Monster } from '../entities/Monster';
import { MoveData, MoveCategory, DamageResult } from '../types/MonsterTypes';
import { getTypeEffectiveness, getEffectivenessMessage } from '../data/TypeEffectiveness';

export class DamageCalculator {
  /**
   * 计算伤害
   */
  static calculate(
    attacker: Monster,
    defender: Monster,
    move: MoveData
  ): DamageResult {
    const messages: string[] = [];

    // 状态技能不造成伤害
    if (move.category === MoveCategory.STATUS || move.power === 0) {
      return { damage: 0, effectiveness: 1, isCritical: false, messages };
    }

    const attackerStats = attacker.getStats();
    const defenderStats = defender.getStats();
    const defenderTypes = defender.getSpecies().types;

    // 选择攻击/防御属性
    const isPhysical = move.category === MoveCategory.PHYSICAL;
    const attackStat = isPhysical ? attackerStats.attack : attackerStats.spAttack;
    const defenseStat = isPhysical ? defenderStats.defense : defenderStats.spDefense;

    // 计算类型克制
    const effectiveness = getTypeEffectiveness(move.type, defenderTypes);

    if (effectiveness === 0) {
      messages.push('没有效果...');
      return { damage: 0, effectiveness: 0, isCritical: false, messages };
    }

    // 添加效果消息
    const effectMsg = getEffectivenessMessage(effectiveness);
    if (effectMsg) {
      messages.push(effectMsg);
    }

    // 暴击判定 (1/16 概率)
    const isCritical = Math.random() < 0.0625;
    const criticalMultiplier = isCritical ? 1.5 : 1;
    if (isCritical) {
      messages.push('会心一击！');
    }

    // 同属性加成 (STAB)
    const attackerTypes = attacker.getSpecies().types;
    const stab = attackerTypes.includes(move.type) ? 1.5 : 1;

    // 随机浮动 (0.85 - 1.00)
    const random = 0.85 + Math.random() * 0.15;

    // 宝可梦伤害公式
    const level = attacker.getLevel();
    const baseDamage = Math.floor(
      ((2 * level / 5 + 2) * move.power * attackStat / defenseStat) / 50 + 2
    );

    const finalDamage = Math.floor(
      baseDamage * stab * effectiveness * criticalMultiplier * random
    );

    return {
      damage: Math.max(1, finalDamage), // 最少造成1点伤害
      effectiveness,
      isCritical,
      messages,
    };
  }

  /**
   * 命中判定
   */
  static checkHit(move: MoveData, accuracyModifier: number = 1): boolean {
    const hitChance = (move.accuracy / 100) * accuracyModifier;
    return Math.random() < hitChance;
  }

  /**
   * 检查状态效果是否触发
   */
  static checkStatusEffect(move: MoveData): boolean {
    if (!move.effect || !move.effectChance) {
      return false;
    }
    return Math.random() * 100 < move.effectChance;
  }
}
