/**
 * 战斗管理器 - 回合制战斗核心逻辑
 */

import { Monster } from '../entities/Monster';
import { DamageCalculator } from './DamageCalculator';
import { MOVES_DATABASE } from '../data/MovesDatabase';
import {
  BattleConfig,
  BattleAction,
  BattleActionType,
  MonsterInstance,
} from '../types/MonsterTypes';

/** 战斗状态 */
export enum BattleState {
  INITIALIZING = 'initializing',
  INTRO = 'intro',
  SELECT_ACTION = 'select_action',
  SELECT_MOVE = 'select_move',
  EXECUTE_TURN = 'execute_turn',
  APPLY_DAMAGE = 'apply_damage',
  CHECK_FAINT = 'check_faint',
  SWITCH_FAINTED = 'switch_fainted',
  END_TURN = 'end_turn',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  ESCAPE = 'escape',
}

/** 战斗事件回调 */
export interface BattleCallbacks {
  onStateChange?: (state: BattleState) => void;
  onMessage?: (message: string) => Promise<void> | void;
  onDamage?: (target: 'player' | 'enemy', damage: number, currentHp: number, maxHp: number) => void;
  onMonsterFaint?: (target: 'player' | 'enemy') => void;
  onBattleEnd?: (result: 'victory' | 'defeat' | 'escape') => void;
}

export class BattleManager {
  private state: BattleState = BattleState.INITIALIZING;
  private config: BattleConfig;

  private playerTeam: Monster[] = [];
  private enemyTeam: Monster[] = [];
  private activePlayerMonster: Monster | null = null;
  private activeEnemyMonster: Monster | null = null;

  private turnActions: BattleAction[] = [];
  private callbacks: BattleCallbacks = {};

  constructor(config: BattleConfig) {
    this.config = config;
    this.initializeBattle();
  }

  private initializeBattle(): void {
    // 初始化队伍
    this.playerTeam = this.config.playerTeam.map(data => new Monster(data));
    this.enemyTeam = this.config.enemyTeam.map(data => new Monster(data));

    // 设置首发
    this.activePlayerMonster = this.playerTeam.find(m => !m.isFainted()) ?? null;
    this.activeEnemyMonster = this.enemyTeam.find(m => !m.isFainted()) ?? null;

    this.setState(BattleState.INTRO);
  }

  /**
   * 设置回调
   */
  setCallbacks(callbacks: BattleCallbacks): void {
    this.callbacks = callbacks;
  }

  private setState(newState: BattleState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  getState(): BattleState {
    return this.state;
  }

  getActivePlayerMonster(): Monster | null {
    return this.activePlayerMonster;
  }

  getActiveEnemyMonster(): Monster | null {
    return this.activeEnemyMonster;
  }

  getPlayerTeam(): Monster[] {
    return this.playerTeam;
  }

  getConfig(): BattleConfig {
    return this.config;
  }

  /**
   * 开始战斗介绍
   */
  async startIntro(): Promise<void> {
    const enemy = this.activeEnemyMonster;
    const player = this.activePlayerMonster;

    if (this.config.type === 'wild') {
      await this.callbacks.onMessage?.(`野生的 ${enemy?.getName()} 出现了！`);
    } else {
      await this.callbacks.onMessage?.(`${this.config.trainerName} 想要对战！`);
      await this.callbacks.onMessage?.(`${this.config.trainerName} 派出了 ${enemy?.getName()}！`);
    }

    await this.callbacks.onMessage?.(`去吧！${player?.getName()}！`);

    this.setState(BattleState.SELECT_ACTION);
  }

  /**
   * 进入行动选择状态
   */
  enterActionSelect(): void {
    this.setState(BattleState.SELECT_ACTION);
  }

  /**
   * 进入技能选择状态
   */
  enterMoveSelect(): void {
    this.setState(BattleState.SELECT_MOVE);
  }

  /**
   * 玩家选择行动
   */
  async selectPlayerAction(action: BattleAction): Promise<void> {
    if (this.state !== BattleState.SELECT_ACTION &&
        this.state !== BattleState.SELECT_MOVE) {
      return;
    }

    // 处理逃跑
    if (action.type === BattleActionType.RUN) {
      await this.handleRun();
      return;
    }

    // 生成敌方AI行动
    const enemyAction = this.generateEnemyAction();

    this.turnActions = [action, enemyAction];
    this.sortActionsByPriority();

    this.setState(BattleState.EXECUTE_TURN);
    await this.executeTurn();
  }

  /**
   * 敌方AI决策
   */
  private generateEnemyAction(): BattleAction {
    const moves = this.activeEnemyMonster?.getMoves() ?? [];
    const validMoves = moves.filter(m => m.currentPp > 0);

    // 随机选择技能
    const moveIndex = validMoves.length > 0
      ? Math.floor(Math.random() * validMoves.length)
      : 0;

    const moveData = moves[moveIndex] ? MOVES_DATABASE[moves[moveIndex].moveId] : null;

    return {
      type: BattleActionType.FIGHT,
      priority: moveData?.priority ?? 0,
      speed: this.activeEnemyMonster?.getStats().speed ?? 0,
      actorIsPlayer: false,
      moveIndex,
    };
  }

  /**
   * 按优先级和速度排序行动
   */
  private sortActionsByPriority(): void {
    this.turnActions.sort((a, b) => {
      // 优先级高的先行动
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // 同优先级比速度，速度相同则随机
      if (a.speed !== b.speed) {
        return b.speed - a.speed;
      }
      return Math.random() - 0.5;
    });
  }

  /**
   * 执行回合
   */
  private async executeTurn(): Promise<void> {
    for (const action of this.turnActions) {
      // 检查执行者是否已濒死
      const actor = action.actorIsPlayer
        ? this.activePlayerMonster
        : this.activeEnemyMonster;

      if (!actor || actor.isFainted()) {
        continue;
      }

      await this.executeAction(action);

      // 检查战斗是否结束
      if (this.checkBattleEnd()) {
        return;
      }
    }

    // 回合结束，进入下一回合
    if (!this.checkBattleEnd()) {
      this.setState(BattleState.SELECT_ACTION);
    }
  }

  /**
   * 执行单个行动
   */
  private async executeAction(action: BattleAction): Promise<void> {
    const attacker = action.actorIsPlayer
      ? this.activePlayerMonster
      : this.activeEnemyMonster;
    const defender = action.actorIsPlayer
      ? this.activeEnemyMonster
      : this.activePlayerMonster;

    if (!attacker || !defender) {
      return;
    }

    switch (action.type) {
      case BattleActionType.FIGHT:
        await this.executeMove(attacker, defender, action, action.actorIsPlayer);
        break;
      // TODO: 道具、换怪等
    }
  }

  /**
   * 执行技能
   */
  private async executeMove(
    attacker: Monster,
    defender: Monster,
    action: BattleAction,
    isPlayer: boolean
  ): Promise<void> {
    const moves = attacker.getMoves();
    const moveIndex = action.moveIndex ?? 0;
    const moveInstance = moves[moveIndex];

    if (!moveInstance) {
      return;
    }

    const move = MOVES_DATABASE[moveInstance.moveId];
    if (!move) {
      return;
    }

    await this.callbacks.onMessage?.(`${attacker.getName()} 使用了 ${move.name}！`);

    // 消耗PP
    attacker.usePP(moveIndex);

    // 命中判定
    if (!DamageCalculator.checkHit(move)) {
      await this.callbacks.onMessage?.('但是攻击没有命中！');
      return;
    }

    // 计算伤害
    const result = DamageCalculator.calculate(attacker, defender, move);

    // 显示效果消息
    for (const msg of result.messages) {
      await this.callbacks.onMessage?.(msg);
    }

    // 应用伤害
    if (result.damage > 0) {
      defender.takeDamage(result.damage);
      this.callbacks.onDamage?.(
        isPlayer ? 'enemy' : 'player',
        result.damage,
        defender.getCurrentHp(),
        defender.getMaxHp()
      );
    }

    // 检查濒死
    if (defender.isFainted()) {
      await this.callbacks.onMessage?.(`${defender.getName()} 倒下了！`);
      this.callbacks.onMonsterFaint?.(isPlayer ? 'enemy' : 'player');
    }
  }

  /**
   * 处理逃跑
   */
  private async handleRun(): Promise<void> {
    if (!this.config.canEscape) {
      await this.callbacks.onMessage?.('无法逃跑！');
      this.setState(BattleState.SELECT_ACTION);
      return;
    }

    // 野生战斗可以逃跑
    // 简化逃跑逻辑：80%成功率
    const success = Math.random() < 0.8;

    if (success) {
      await this.callbacks.onMessage?.('成功逃跑了！');
      this.setState(BattleState.ESCAPE);
      this.callbacks.onBattleEnd?.('escape');
    } else {
      await this.callbacks.onMessage?.('逃跑失败！');
      // 敌方行动
      const enemyAction = this.generateEnemyAction();
      this.turnActions = [enemyAction];
      await this.executeTurn();
    }
  }

  /**
   * 检查战斗是否结束
   */
  private checkBattleEnd(): boolean {
    const playerAlive = this.playerTeam.some(m => !m.isFainted());
    const enemyAlive = this.enemyTeam.some(m => !m.isFainted());

    if (!enemyAlive) {
      this.setState(BattleState.VICTORY);
      this.callbacks.onBattleEnd?.('victory');
      return true;
    }

    if (!playerAlive) {
      this.setState(BattleState.DEFEAT);
      this.callbacks.onBattleEnd?.('defeat');
      return true;
    }

    return false;
  }

  /**
   * 获取更新后的玩家队伍数据
   */
  getUpdatedPlayerTeam(): MonsterInstance[] {
    return this.playerTeam.map(m => m.getData());
  }
}
