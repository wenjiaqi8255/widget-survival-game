/**
 * 分数管理器
 * 负责管理游戏分数、层级和相关奖励逻辑
 */
export default class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.level = 1;
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听平台碰撞事件，用于检查是否需要提升层级
        this.scene.events.on('platform-collision', this.checkLevelUp, this);
        
        // 监听收集物收集事件
        this.scene.events.on('collectible-collected', this.handleCollectible, this);
        
        // 监听障碍物碰撞事件
        this.scene.events.on('obstacle-hit', this.handleObstacle, this);
        
        // 清理事件
        this.scene.events.once('shutdown', this.cleanupEventListeners, this);
    }
    
    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        this.scene.events.off('platform-collision', this.checkLevelUp, this);
        this.scene.events.off('collectible-collected', this.handleCollectible, this);
        this.scene.events.off('obstacle-hit', this.handleObstacle, this);
    }
    
    /**
     * 处理收集物收集
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Collectible} collectible - 收集物对象
     */
    handleCollectible(player, collectible) {
        // 基础分数
        this.addScore(10);
    }
    
    /**
     * 处理障碍物碰撞
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Obstacle} obstacle - 障碍物对象
     */
    handleObstacle(player, obstacle) {
        // 如果玩家处于能力增强状态，给予额外分数
        if (player.powerupActive) {
            this.addScore(15);
        }
    }
    
    /**
     * 增加分数
     * @param {number} points - 要增加的分数点数
     * @param {Object} bonusInfo - 额外的奖励信息
     * @returns {number} 实际增加的总分数
     */
    addScore(points, bonusInfo = {}) {
        // 基础分数
        let totalPoints = points;
        
        // 应用额外奖励倍率
        if (bonusInfo.multiplier && bonusInfo.multiplier > 1) {
            const bonusPoints = Math.floor(points * (bonusInfo.multiplier - 1));
            totalPoints += bonusPoints;
            
            // 发出奖励分数事件
            if (bonusPoints > 0) {
                this.scene.events.emit('bonus-points', bonusPoints, bonusInfo.reason || '奖励!');
            }
        }
        
        // 更新总分
        this.score += totalPoints;
        
        // 发出分数更新事件
        this.scene.events.emit('update-score', this.score);
        
        return totalPoints;
    }
    
    /**
     * 检查是否需要提升层级
     * @param {number} cameraY - 当前相机Y坐标
     */
    checkLevelUp(player, platform) {
        // 获取当前世界管理器计算的层级
        const worldManager = this.scene.worldManager;
        if (!worldManager) return;
        
        const newLevel = worldManager.calculateLevel();
        
        // 如果层级提高，给予奖励
        if (newLevel > this.level) {
            this.level = newLevel;
            
            // 发出层级更新事件
            this.scene.events.emit('update-level', this.level);
            
            // 给予层级奖励
            this.addScore(50);
            
            // 播放层级提升音效
            if (this.scene.sound && this.scene.sound.get('levelUp')) {
                this.scene.sound.play('levelUp');
            }
            
            // 发出层级提升事件
            this.scene.events.emit('level-up', this.level);
        }
    }
    
    /**
     * 获取当前分数
     * @returns {number} 当前分数
     */
    getScore() {
        return this.score;
    }
    
    /**
     * 获取当前层级
     * @returns {number} 当前层级
     */
    getLevel() {
        return this.level;
    }
    
    /**
     * 重置分数和层级
     */
    reset() {
        this.score = 0;
        this.level = 1;
        
        // 发出重置事件
        this.scene.events.emit('update-score', this.score);
        this.scene.events.emit('update-level', this.level);
    }
    
    /**
     * 获取游戏结束时的统计信息
     * @returns {Object} 包含分数和层级的对象
     */
    getStats() {
        return {
            score: this.score,
            level: this.level
        };
    }
}