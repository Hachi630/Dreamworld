/**
 * 怪物系统类型定义
 */

/** 元素属性类型 */
export enum ElementType {
  NORMAL = 'normal',
  FIRE = 'fire',
  WATER = 'water',
  GRASS = 'grass',
  ELECTRIC = 'electric',
  ICE = 'ice',
  FIGHTING = 'fighting',
  POISON = 'poison',
  GROUND = 'ground',
  FLYING = 'flying',
  PSYCHIC = 'psychic',
  BUG = 'bug',
  ROCK = 'rock',
  GHOST = 'ghost',
  DRAGON = 'dragon',
  DARK = 'dark',
  STEEL = 'steel',
  FAIRY = 'fairy',
}

/** 技能类别 */
export enum MoveCategory {
  PHYSICAL = 'physical',
  SPECIAL = 'special',
  STATUS = 'status',
}

/** 状态异常 */
export enum StatusEffect {
  NONE = 'none',
  BURN = 'burn',
  FREEZE = 'freeze',
  PARALYSIS = 'paralysis',
  POISON = 'poison',
  SLEEP = 'sleep',
  CONFUSION = 'confusion',
}

/** 性格类型 */
export enum NatureType {
  HARDY = 'hardy',
  LONELY = 'lonely',
  BRAVE = 'brave',
  ADAMANT = 'adamant',
  NAUGHTY = 'naughty',
  BOLD = 'bold',
  DOCILE = 'docile',
  RELAXED = 'relaxed',
  IMPISH = 'impish',
  LAX = 'lax',
  TIMID = 'timid',
  HASTY = 'hasty',
  SERIOUS = 'serious',
  JOLLY = 'jolly',
  NAIVE = 'naive',
  MODEST = 'modest',
  MILD = 'mild',
  QUIET = 'quiet',
  BASHFUL = 'bashful',
  RASH = 'rash',
  CALM = 'calm',
  GENTLE = 'gentle',
  SASSY = 'sassy',
  CAREFUL = 'careful',
  QUIRKY = 'quirky',
}

/** 基础属性 */
export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

/** 技能数据 */
export interface MoveData {
  id: string;
  name: string;
  type: ElementType;
  category: MoveCategory;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  effect?: StatusEffect;
  effectChance?: number;
  description: string;
}

/** 怪物物种数据 */
export interface MonsterSpecies {
  id: number;
  name: string;
  types: [ElementType, ElementType?];
  baseStats: BaseStats;
  learnset: { level: number; moveId: string }[];
  catchRate: number;
  expYield: number;
  spriteKey: string;
}

/** 技能实例 */
export interface MoveInstance {
  moveId: string;
  currentPp: number;
}

/** 怪物个体实例 */
export interface MonsterInstance {
  speciesId: number;
  nickname?: string;
  level: number;
  exp: number;
  currentHp: number;
  moves: MoveInstance[];
  ivs: BaseStats;
  evs: BaseStats;
  nature: NatureType;
  status: StatusEffect;
  statusTurns?: number;
  isShiny?: boolean;
}

/** 性格修正值 */
export interface NatureModifier {
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

/** 战斗行动类型 */
export enum BattleActionType {
  FIGHT = 'fight',
  ITEM = 'item',
  SWITCH = 'switch',
  RUN = 'run',
}

/** 战斗行动 */
export interface BattleAction {
  type: BattleActionType;
  priority: number;
  speed: number;
  actorIsPlayer: boolean;
  moveIndex?: number;
  itemId?: string;
  switchToIndex?: number;
}

/** 战斗配置 */
export interface BattleConfig {
  type: 'wild' | 'trainer';
  canEscape: boolean;
  canCapture: boolean;
  playerTeam: MonsterInstance[];
  enemyTeam: MonsterInstance[];
  trainerName?: string;
  backgroundKey?: string;
}

/** 伤害计算结果 */
export interface DamageResult {
  damage: number;
  effectiveness: number;
  isCritical: boolean;
  messages: string[];
}
