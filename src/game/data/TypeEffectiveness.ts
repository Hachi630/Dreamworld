/**
 * 属性克制表
 */

import { ElementType } from '../types/MonsterTypes';

/**
 * 类型克制表
 * 攻击方 -> 防御方 -> 倍率
 * 2 = 效果拔群, 0.5 = 效果不佳, 0 = 没有效果
 */
export const TYPE_CHART: Partial<Record<ElementType, Partial<Record<ElementType, number>>>> = {
  [ElementType.NORMAL]: {
    [ElementType.ROCK]: 0.5,
    [ElementType.GHOST]: 0,
    [ElementType.STEEL]: 0.5,
  },
  [ElementType.FIRE]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.WATER]: 0.5,
    [ElementType.GRASS]: 2,
    [ElementType.ICE]: 2,
    [ElementType.BUG]: 2,
    [ElementType.ROCK]: 0.5,
    [ElementType.DRAGON]: 0.5,
    [ElementType.STEEL]: 2,
  },
  [ElementType.WATER]: {
    [ElementType.FIRE]: 2,
    [ElementType.WATER]: 0.5,
    [ElementType.GRASS]: 0.5,
    [ElementType.GROUND]: 2,
    [ElementType.ROCK]: 2,
    [ElementType.DRAGON]: 0.5,
  },
  [ElementType.GRASS]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.WATER]: 2,
    [ElementType.GRASS]: 0.5,
    [ElementType.POISON]: 0.5,
    [ElementType.GROUND]: 2,
    [ElementType.FLYING]: 0.5,
    [ElementType.BUG]: 0.5,
    [ElementType.ROCK]: 2,
    [ElementType.DRAGON]: 0.5,
    [ElementType.STEEL]: 0.5,
  },
  [ElementType.ELECTRIC]: {
    [ElementType.WATER]: 2,
    [ElementType.ELECTRIC]: 0.5,
    [ElementType.GRASS]: 0.5,
    [ElementType.GROUND]: 0,
    [ElementType.FLYING]: 2,
    [ElementType.DRAGON]: 0.5,
  },
  [ElementType.ICE]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.WATER]: 0.5,
    [ElementType.GRASS]: 2,
    [ElementType.ICE]: 0.5,
    [ElementType.GROUND]: 2,
    [ElementType.FLYING]: 2,
    [ElementType.DRAGON]: 2,
    [ElementType.STEEL]: 0.5,
  },
  [ElementType.FIGHTING]: {
    [ElementType.NORMAL]: 2,
    [ElementType.ICE]: 2,
    [ElementType.POISON]: 0.5,
    [ElementType.FLYING]: 0.5,
    [ElementType.PSYCHIC]: 0.5,
    [ElementType.BUG]: 0.5,
    [ElementType.ROCK]: 2,
    [ElementType.GHOST]: 0,
    [ElementType.DARK]: 2,
    [ElementType.STEEL]: 2,
    [ElementType.FAIRY]: 0.5,
  },
  [ElementType.POISON]: {
    [ElementType.GRASS]: 2,
    [ElementType.POISON]: 0.5,
    [ElementType.GROUND]: 0.5,
    [ElementType.ROCK]: 0.5,
    [ElementType.GHOST]: 0.5,
    [ElementType.STEEL]: 0,
    [ElementType.FAIRY]: 2,
  },
  [ElementType.GROUND]: {
    [ElementType.FIRE]: 2,
    [ElementType.ELECTRIC]: 2,
    [ElementType.GRASS]: 0.5,
    [ElementType.POISON]: 2,
    [ElementType.FLYING]: 0,
    [ElementType.BUG]: 0.5,
    [ElementType.ROCK]: 2,
    [ElementType.STEEL]: 2,
  },
  [ElementType.FLYING]: {
    [ElementType.ELECTRIC]: 0.5,
    [ElementType.GRASS]: 2,
    [ElementType.FIGHTING]: 2,
    [ElementType.BUG]: 2,
    [ElementType.ROCK]: 0.5,
    [ElementType.STEEL]: 0.5,
  },
  [ElementType.PSYCHIC]: {
    [ElementType.FIGHTING]: 2,
    [ElementType.POISON]: 2,
    [ElementType.PSYCHIC]: 0.5,
    [ElementType.DARK]: 0,
    [ElementType.STEEL]: 0.5,
  },
  [ElementType.BUG]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.GRASS]: 2,
    [ElementType.FIGHTING]: 0.5,
    [ElementType.POISON]: 0.5,
    [ElementType.FLYING]: 0.5,
    [ElementType.PSYCHIC]: 2,
    [ElementType.GHOST]: 0.5,
    [ElementType.DARK]: 2,
    [ElementType.STEEL]: 0.5,
    [ElementType.FAIRY]: 0.5,
  },
  [ElementType.ROCK]: {
    [ElementType.FIRE]: 2,
    [ElementType.ICE]: 2,
    [ElementType.FIGHTING]: 0.5,
    [ElementType.GROUND]: 0.5,
    [ElementType.FLYING]: 2,
    [ElementType.BUG]: 2,
    [ElementType.STEEL]: 0.5,
  },
  [ElementType.GHOST]: {
    [ElementType.NORMAL]: 0,
    [ElementType.PSYCHIC]: 2,
    [ElementType.GHOST]: 2,
    [ElementType.DARK]: 0.5,
  },
  [ElementType.DRAGON]: {
    [ElementType.DRAGON]: 2,
    [ElementType.STEEL]: 0.5,
    [ElementType.FAIRY]: 0,
  },
  [ElementType.DARK]: {
    [ElementType.FIGHTING]: 0.5,
    [ElementType.PSYCHIC]: 2,
    [ElementType.GHOST]: 2,
    [ElementType.DARK]: 0.5,
    [ElementType.FAIRY]: 0.5,
  },
  [ElementType.STEEL]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.WATER]: 0.5,
    [ElementType.ELECTRIC]: 0.5,
    [ElementType.ICE]: 2,
    [ElementType.ROCK]: 2,
    [ElementType.STEEL]: 0.5,
    [ElementType.FAIRY]: 2,
  },
  [ElementType.FAIRY]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.FIGHTING]: 2,
    [ElementType.POISON]: 0.5,
    [ElementType.DRAGON]: 2,
    [ElementType.DARK]: 2,
    [ElementType.STEEL]: 0.5,
  },
};

/**
 * 计算类型克制倍率
 */
export function getTypeEffectiveness(
  attackType: ElementType,
  defenderTypes: [ElementType, ElementType?]
): number {
  let multiplier = 1;

  for (const defType of defenderTypes) {
    if (defType) {
      const chart = TYPE_CHART[attackType];
      const effectiveness = chart?.[defType];
      if (effectiveness !== undefined) {
        multiplier *= effectiveness;
      }
    }
  }

  return multiplier;
}

/**
 * 获取克制效果描述
 */
export function getEffectivenessMessage(effectiveness: number): string | null {
  if (effectiveness === 0) {
    return '没有效果...';
  } else if (effectiveness >= 2) {
    return '效果拔群！';
  } else if (effectiveness > 0 && effectiveness < 1) {
    return '效果不佳...';
  }
  return null;
}
