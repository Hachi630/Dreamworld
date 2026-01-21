/**
 * 怪物数据 - 5种初始怪物
 */

import { MonsterSpecies, ElementType, NatureType, NatureModifier } from '../types/MonsterTypes';

export const MONSTER_DATABASE: Record<number, MonsterSpecies> = {
  // 火焰小精灵 - 火系御三家
  1: {
    id: 1,
    name: '火焰小精灵',
    types: [ElementType.FIRE],
    baseStats: {
      hp: 45,
      attack: 52,
      defense: 43,
      spAttack: 60,
      spDefense: 50,
      speed: 65,
    },
    learnset: [
      { level: 1, moveId: 'scratch' },
      { level: 1, moveId: 'growl' },
      { level: 4, moveId: 'ember' },
      { level: 8, moveId: 'leer' },
      { level: 12, moveId: 'quickAttack' },
    ],
    catchRate: 45,
    expYield: 62,
    spriteKey: 'monster-fire',
  },

  // 水滴精灵 - 水系御三家
  2: {
    id: 2,
    name: '水滴精灵',
    types: [ElementType.WATER],
    baseStats: {
      hp: 50,
      attack: 48,
      defense: 65,
      spAttack: 50,
      spDefense: 64,
      speed: 43,
    },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'tailWhip' },
      { level: 4, moveId: 'waterGun' },
      { level: 8, moveId: 'bubble' },
      { level: 12, moveId: 'waterPulse' },
    ],
    catchRate: 45,
    expYield: 63,
    spriteKey: 'monster-water',
  },

  // 草叶精灵 - 草系御三家
  3: {
    id: 3,
    name: '草叶精灵',
    types: [ElementType.GRASS],
    baseStats: {
      hp: 45,
      attack: 49,
      defense: 49,
      spAttack: 65,
      spDefense: 65,
      speed: 45,
    },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'growl' },
      { level: 4, moveId: 'vineWhip' },
      { level: 8, moveId: 'absorb' },
      { level: 12, moveId: 'razorLeaf' },
    ],
    catchRate: 45,
    expYield: 64,
    spriteKey: 'monster-grass',
  },

  // 小电鼠 - 电系野生怪物
  4: {
    id: 4,
    name: '小电鼠',
    types: [ElementType.ELECTRIC],
    baseStats: {
      hp: 35,
      attack: 55,
      defense: 40,
      spAttack: 50,
      spDefense: 50,
      speed: 90,
    },
    learnset: [
      { level: 1, moveId: 'thunderShock' },
      { level: 1, moveId: 'growl' },
      { level: 5, moveId: 'quickAttack' },
      { level: 10, moveId: 'spark' },
    ],
    catchRate: 190,
    expYield: 112,
    spriteKey: 'monster-electric',
  },

  // 土拨鼠 - 地面系野生怪物
  5: {
    id: 5,
    name: '土拨鼠',
    types: [ElementType.GROUND],
    baseStats: {
      hp: 40,
      attack: 45,
      defense: 40,
      spAttack: 35,
      spDefense: 30,
      speed: 50,
    },
    learnset: [
      { level: 1, moveId: 'scratch' },
      { level: 1, moveId: 'sandAttack' },
      { level: 5, moveId: 'mudSlap' },
      { level: 10, moveId: 'dig' },
    ],
    catchRate: 255,
    expYield: 53,
    spriteKey: 'monster-ground',
  },
};

/**
 * 性格修正
 */
export const NATURE_MODIFIERS: Record<NatureType, NatureModifier> = {
  [NatureType.HARDY]: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
  [NatureType.LONELY]: { attack: 1.1, defense: 0.9, spAttack: 1, spDefense: 1, speed: 1 },
  [NatureType.BRAVE]: { attack: 1.1, defense: 1, spAttack: 1, spDefense: 1, speed: 0.9 },
  [NatureType.ADAMANT]: { attack: 1.1, defense: 1, spAttack: 0.9, spDefense: 1, speed: 1 },
  [NatureType.NAUGHTY]: { attack: 1.1, defense: 1, spAttack: 1, spDefense: 0.9, speed: 1 },
  [NatureType.BOLD]: { attack: 0.9, defense: 1.1, spAttack: 1, spDefense: 1, speed: 1 },
  [NatureType.DOCILE]: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
  [NatureType.RELAXED]: { attack: 1, defense: 1.1, spAttack: 1, spDefense: 1, speed: 0.9 },
  [NatureType.IMPISH]: { attack: 1, defense: 1.1, spAttack: 0.9, spDefense: 1, speed: 1 },
  [NatureType.LAX]: { attack: 1, defense: 1.1, spAttack: 1, spDefense: 0.9, speed: 1 },
  [NatureType.TIMID]: { attack: 0.9, defense: 1, spAttack: 1, spDefense: 1, speed: 1.1 },
  [NatureType.HASTY]: { attack: 1, defense: 0.9, spAttack: 1, spDefense: 1, speed: 1.1 },
  [NatureType.SERIOUS]: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
  [NatureType.JOLLY]: { attack: 1, defense: 1, spAttack: 0.9, spDefense: 1, speed: 1.1 },
  [NatureType.NAIVE]: { attack: 1, defense: 1, spAttack: 1, spDefense: 0.9, speed: 1.1 },
  [NatureType.MODEST]: { attack: 0.9, defense: 1, spAttack: 1.1, spDefense: 1, speed: 1 },
  [NatureType.MILD]: { attack: 1, defense: 0.9, spAttack: 1.1, spDefense: 1, speed: 1 },
  [NatureType.QUIET]: { attack: 1, defense: 1, spAttack: 1.1, spDefense: 1, speed: 0.9 },
  [NatureType.BASHFUL]: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
  [NatureType.RASH]: { attack: 1, defense: 1, spAttack: 1.1, spDefense: 0.9, speed: 1 },
  [NatureType.CALM]: { attack: 0.9, defense: 1, spAttack: 1, spDefense: 1.1, speed: 1 },
  [NatureType.GENTLE]: { attack: 1, defense: 0.9, spAttack: 1, spDefense: 1.1, speed: 1 },
  [NatureType.SASSY]: { attack: 1, defense: 1, spAttack: 1, spDefense: 1.1, speed: 0.9 },
  [NatureType.CAREFUL]: { attack: 1, defense: 1, spAttack: 0.9, spDefense: 1.1, speed: 1 },
  [NatureType.QUIRKY]: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
};

/**
 * 获取怪物物种数据
 */
export function getMonsterSpecies(id: number): MonsterSpecies | undefined {
  return MONSTER_DATABASE[id];
}

/**
 * 获取性格修正
 */
export function getNatureModifier(nature: NatureType): NatureModifier {
  return NATURE_MODIFIERS[nature];
}
