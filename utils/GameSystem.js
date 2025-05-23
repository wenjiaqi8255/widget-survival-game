/**
 * 游戏系统接口
 * 定义了游戏路线系统应该实现的基本接口
 */
import NoticeabilitySystem from './NoticeabilitySystem.js';
import AlignmentSystem from './AlignmentSystem.js';

export class GameSystem {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * 更新系统状态
     * @param {number} delta - 时间增量(毫秒)
     */
    update(delta) {
        // 抽象方法，由子类实现
    }
    
    /**
     * 处理收集物收集事件
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Collectible} collectible - 收集物对象
     */
    onCollectibleCollected(player, collectible) {
        // 抽象方法，由子类实现
    }
    
    /**
     * 处理障碍物碰撞事件
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Obstacle} obstacle - 障碍物对象
     */
    onObstacleHit(player, obstacle) {
        // 抽象方法，由子类实现
    }
    
    /**
     * 获取分数加成信息
     * @returns {Object} 包含倍率和原因的对象
     */
    getScoreBonus() {
        // 抽象方法，由子类实现
        return { multiplier: 1, reason: '' };
    }
    
    /**
     * 获取游戏结束时的系统统计数据
     * @returns {Object} 系统特定的统计数据
     */
    getStats() {
        // 抽象方法，由子类实现
        return {};
    }
    
    /**
     * 重置系统状态
     */
    reset() {
        // 抽象方法，由子类实现
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听收集物收集事件
        this.scene.events.on('collectible-collected', this.onCollectibleCollected, this);
        
        // 监听障碍物碰撞事件
        this.scene.events.on('obstacle-hit', this.onObstacleHit, this);
        
        // 清理事件
        this.scene.events.once('shutdown', this.cleanupEventListeners, this);
    }
    
    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        this.scene.events.off('collectible-collected', this.onCollectibleCollected, this);
        this.scene.events.off('obstacle-hit', this.onObstacleHit, this);
    }
}

/**
 * 显眼度系统适配器
 * 适配NoticeabilitySystem到GameSystem接口
 */
export class NoticeabilitySystemAdapter extends GameSystem {
    constructor(scene) {
        super(scene);
        
        // 导入实际的NoticeabilitySystem
        this.system = new NoticeabilitySystem(scene);
        
        this.setupEventListeners();
    }
    
    update(delta) {
        this.system.update(delta);
        
        // 如果显眼模式状态变化，发出相应事件
        if (this.system.isNoticeModeActive()) {
            const intensity = this.system.getNoticeModeIntensity();
            
            // 触发玩家显眼模式
            if (this.scene.player && !this.scene.player.inNoticeMode) {
                this.scene.player.enterNoticeMode(
                    this.scene, 
                    intensity,
                    this.system.calculateNoticeDuration()
                );
            }
            
            // 触发世界滚动速度变化
            if (this.scene.worldManager) {
                const speedMultiplier = 1 + (intensity * 4); // 最多提高400%
                this.scene.worldManager.scrollSpeedMultiplier = speedMultiplier;
            }
        } else {
            // 退出显眼模式
            if (this.scene.player && this.scene.player.inNoticeMode) {
                this.scene.player.exitNoticeMode();
            }
            
            // 恢复滚动速度
            // if (this.scene.worldManager) {
            //     this.scene.worldManager.scrollSpeedMultiplier = 1;
            // }
        }
    }
    
    onCollectibleCollected(player, collectible) {
        if (collectible.type === 'sound') {
            // 声音收集物增加显眼度并激活显眼模式
            const result = this.system.increaseNoticeability(15, true);
            
            // 显示显眼度增加提示
            const bonusText = result.consecutive > 1 ? `(x${result.consecutive} 连击!)` : '';
            this.scene.events.emit('show-status', `显眼度 +${Math.floor(result.amount)} ${bonusText}`, 0xFF5555);
            
            // 屏幕停顿时间根据显眼度缩短
            const noticeLevel = this.system.getNoticeabilityLevel();
            const pauseDuration = 1000 * (1 - Math.min(0.7, noticeLevel / 100)); // 最多减少70%
            
            if (this.scene.worldManager) {
                this.scene.worldManager.pauseScrolling(pauseDuration);
            }
        }
        // 移除了颜色收集物对显眼度系统的影响
        // 颜色收集物不再影响显眼度
    }
    
    onObstacleHit(player, obstacle) {
        if ((obstacle.type === 'adblock' || obstacle.type === 'focusmode') && player.powerupActive) {
            // 用能力增强清除障碍物增加显眼度
            const result = this.system.increaseNoticeability(10, false);
            this.scene.events.emit('show-status', `显眼度 +${Math.floor(result.amount)}`, 0xFF5555);
        } else if (obstacle.type === 'focusmode' && !player.powerupActive) {
            // 进入专注模式降低显眼度
            const result = this.system.decreaseNoticeability(15);
            this.scene.events.emit('show-status', `显眼度 -${Math.floor(result.amount)}`, 0x777777);
        }
    }
    
    getScoreBonus() {
        // 如果处于显眼模式，分数加成
        if (this.system.isNoticeModeActive()) {
            const intensity = this.system.getNoticeModeIntensity();
            const multiplier = 1 + intensity; // 最高2倍
            return { 
                multiplier: multiplier, 
                reason: '显眼加成'
            };
        }
        return { multiplier: 1, reason: '' };
    }
    
    getStats() {
        return {
            noticeabilityData: {
                level: this.system.getNoticeabilityLevel(),
                notifications: this.system.totalNotifications
            }
        };
    }
    
    reset() {
        // 重置到初始状态的逻辑
    }
}

/**
 * 路线系统适配器
 * 适配AlignmentSystem到GameSystem接口
 */
export class AlignmentSystemAdapter extends GameSystem {
    constructor(scene) {
        super(scene);
        
        // 导入实际的AlignmentSystem
        this.system = new AlignmentSystem(scene);
        
        this.setupEventListeners();
    }
    
    update(delta) {
        // 路线系统不需要特殊的更新逻辑
    }
    
    onCollectibleCollected(player, collectible) {
        if (collectible.type === 'color') {
            // 颜色收集物倾向于守序路线
            this.system.recordOrderlyAction(10);
            this.scene.events.emit('show-status', '守序路线得分 +10', 0x3498db);
        } else if (collectible.type === 'sound') {
            // 声音收集物倾向于混乱路线
            this.system.recordChaoticAction(10);
            this.scene.events.emit('show-status', '混乱路线得分 +10', 0xe74c3c);
        }
    }
    
    onObstacleHit(player, obstacle) {
        if (obstacle.type === 'adblock' && player.powerupActive) {
            // 用能力增强清除广告拦截器是混乱行为
            this.system.recordChaoticAction(5);
            this.scene.events.emit('show-status', '混乱路线得分 +5', 0xe74c3c);
        } else if (obstacle.type === 'focusmode' && player.powerupActive) {
            // 用能力增强穿越专注模式是混乱行为
            this.system.recordChaoticAction(5);
            this.scene.events.emit('show-status', '混乱路线得分 +5', 0xe74c3c);
        } else if (obstacle.type === 'focusmode' && !player.powerupActive) {
            // 进入专注模式自然接受减速是守序行为
            this.system.recordOrderlyAction(5);
            this.scene.events.emit('show-status', '守序路线得分 +5', 0x3498db);
        }
    }
    
    getScoreBonus() {
        const alignment = this.system.getDominantAlignment();
        const streak = this.system.getStreakCount();
        
        // 如果有一定的连续路线行为，给予额外分数
        if (streak >= 3) {
            const multiplier = 1 + (0.2 * streak); // 连击倍率
            return { 
                multiplier: multiplier, 
                reason: '连击'
            };
        }
        return { multiplier: 1, reason: '' };
    }
    
    getStats() {
        const alignmentScores = this.system.getScores();
        return {
            alignmentData: {
                orderly: alignmentScores.orderly,
                chaotic: alignmentScores.chaotic,
                total: alignmentScores.total
            }
        };
    }
    
    reset() {
        // 重置到初始状态的逻辑
    }
}

/**
 * 游戏系统工厂
 * 负责创建游戏系统实例
 */
export default class GameSystemFactory {
    /**
     * 创建游戏系统
     * @param {string} type - 系统类型 ('noticeability' | 'alignment')
     * @param {Phaser.Scene} scene - 游戏场景
     * @returns {GameSystem} 游戏系统实例
     */
    static createSystem(type, scene) {
        switch (type) {
            case 'noticeability':
                return new NoticeabilitySystemAdapter(scene);
            case 'alignment':
                return new AlignmentSystemAdapter(scene);
            default:
                console.warn(`未知的游戏系统类型: ${type}`);
                return null;
        }
    }
}