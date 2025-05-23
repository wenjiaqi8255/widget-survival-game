/**
 * 游戏主场景
 * 实现游戏的核心功能：持续下滑的屏幕、玩家控制、碰撞检测和多层级
 */
import Player from '../objects/Player.js';
import InputManager from '../input/InputManager.js';
import WorldManager from '../utils/WorldManager.js';
import EntityFactory from '../utils/EntityFactory.js';
import UIManager from '../utils/UIManager.js';
import CollisionManager from '../utils/CollisionManager.js';
import ScoreManager from '../utils/ScoreManager.js';
import GameSystemFactory from '../utils/GameSystem.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // 游戏状态
        this.gameOver = false;
        
        // 系统配置
        this.systemType = 'noticeability'; // 'noticeability' 或 'alignment'
    }

    create() {
        // 初始化管理器
        this.initManagers();
        
        // 创建游戏世界
        this.worldManager.createWorld();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建平台、收集物和障碍物
        this.entityFactory.createInitialPlatforms();
        
        // 设置碰撞检测
        this.setupCollisions();
        
        // 设置事件
        this.setupEvents();
        
        // 创建音效
        this.createSounds();
    }

    update(time, delta) {
        if (this.gameOver) return;
        
        // 更新输入
        this.updateInput();
        
        // 更新世界滚动
        this.worldManager.updateScroll(delta);
        
        // 生成新的游戏元素
        this.entityFactory.updateGameElements(
            this.worldManager.getCameraViewBounds(),
            this.scoreManager.getLevel()
        );
        
        // 更新玩家
        this.updatePlayer();
        
        // 更新游戏系统
        if (this.gameSystem) {
            this.gameSystem.update(delta);
        }
        
        // 更新移动平台
        this.entityFactory.updatePlatforms(delta);
        
        // 更新障碍物
        this.entityFactory.updateObstacles();
        
        // 检查玩家是否掉出屏幕
        this.checkPlayerBounds();
        
        // 清理屏幕外的游戏元素
        this.entityFactory.cleanupOffscreenElements(this.worldManager.getCameraPosition());
    }
    
    /**
     * 初始化管理器
     */
    initManagers() {
        // 世界管理器 - 负责相机和滚动
        this.worldManager = new WorldManager(this);
        this.worldManager.setupCamera();
        
        // 实体工厂 - 负责生成游戏实体
        this.entityFactory = new EntityFactory(this);
        
        // UI管理器 - 负责游戏界面
        this.uiManager = new UIManager(this);
        
        // 碰撞管理器 - 负责碰撞检测
        this.collisionManager = new CollisionManager(this);
        
        // 分数管理器 - 负责分数和层级
        this.scoreManager = new ScoreManager(this);
        
        // 游戏系统 - 负责特定的游戏机制（显眼度或路线系统）
        this.gameSystem = GameSystemFactory.createSystem(this.systemType, this);
    }
    
    /**
     * 创建玩家
     */
    createPlayer() {
        this.player = new Player(this, 180, 300);
    }
    
    /**
     * 设置碰撞检测
     */
    setupCollisions() {
        // 使用碰撞管理器设置碰撞
        this.collisionManager.setupCollisions(this.player, {
            platforms: this.entityFactory.getPlatforms(),
            collectibles: this.entityFactory.getCollectibles(),
            obstacles: this.entityFactory.getObstacles()
        });
    }
    
    /**
     * 设置游戏事件
     */
    setupEvents() {
        // 每5秒增加难度
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.worldManager.increaseDifficulty();
            },
            callbackScope: this,
            loop: true
        });
        
        // 订阅重要事件
        this.events.on('player-out-of-bounds', this.onPlayerOutOfBounds, this);
        
        // 收集物音效事件
        this.events.on('collectible-collected', this.playCollectSound, this);
        
        // 层级提升事件
        this.events.on('level-up', (level) => {
            this.events.emit('show-status', `进入层级 ${level}!`, 0xFFFF00);
            this.sound.play('levelUp');
        });
        
        // 清理事件
        this.events.once('shutdown', () => {
            this.events.off('player-out-of-bounds', this.onPlayerOutOfBounds, this);
            this.events.off('collectible-collected', this.playCollectSound, this);
            this.events.off('level-up');
        });
    }
    
    /**
     * 创建游戏音效
     */
    createSounds() {
        this.sounds = {
            collect: this.sound.add('collect', { volume: 0.5 }),
            powerup: this.sound.add('powerup', { volume: 0.6 }),
            hit: this.sound.add('hit', { volume: 0.5 }),
            notification: this.sound.add('notification', { volume: 0.4 }),
            levelUp: this.sound.add('levelUp', { volume: 0.7 })
        };
    }
    
    /**
     * 更新输入控制
     */
    updateInput() {
        // 获取输入管理器的输入状态
        const inputs = this.inputManager ? this.inputManager.update() : {};
        
        // 如果还没有初始化输入管理器，则初始化它
        if (!this.inputManager) {
            this.setupInput();
            return;
        }
        
        // 为游戏中的键盘输入控制器模拟键盘输入状态
        this.cursors.left.isDown = inputs.left || false;
        this.cursors.right.isDown = inputs.right || false;
        this.cursors.up.isDown = inputs.up || false;
        this.cursors.down.isDown = inputs.down || false;  // 添加对down键的处理
        this.jumpKey.isDown = inputs.action || false;
    }
    
    /**
     * 设置输入控制
     */
    setupInput() {
        // 添加键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 添加跳跃按键 (空格键)
        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // 初始化输入管理器
        this.inputManager = new InputManager();
        this.inputManager.initialize();
        
        // 加载触摸控制器样式
        this._loadTouchControlsStyle();
    }
    
    /**
     * 加载触摸控制样式
     */
    _loadTouchControlsStyle() {
        // 确保已经加载了触摸控制样式
        const styleSheets = Array.from(document.styleSheets);
        const touchControlsStyleLoaded = styleSheets.some(sheet => 
            sheet.href && sheet.href.includes('touch-controls.css')
        );
        
        if (!touchControlsStyleLoaded) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'styles/touch-controls.css';
            document.head.appendChild(link);
        }
    }
    
    /**
     * 更新玩家
     */
    updatePlayer() {
        if (this.player) {
            this.player.update(this.cursors, this.jumpKey);
            
            // 确保玩家不会离相机太远 - 自动跟随效果
            const cameraView = this.worldManager.getCameraViewBounds();
            const idealPlayerY = cameraView.top + this.cameras.main.height * 0.4; // 玩家理想位置在屏幕上方40%处
            
            // 如果玩家比理想位置低太多，轻微向上推
            if (this.player.y > idealPlayerY + 100 && this.player.body.velocity.y > 0) {
                this.player.setVelocityY(this.player.body.velocity.y * 0.95);
            }
        }
    }
    
    /**
     * 检查玩家是否掉出屏幕
     */
    checkPlayerBounds() {
        if (this.player) {
            const cameraView = this.worldManager.getCameraViewBounds();
            this.collisionManager.checkPlayerOutOfBounds(this.player, cameraView);
        }
    }
    
    /**
     * 当玩家掉出屏幕时
     */
    onPlayerOutOfBounds() {
        if (!this.gameOver) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    /**
     * 播放收集物音效
     */
    playCollectSound(player, collectible) {
        // 播放音效
        if (collectible.type === 'color') {
            this.sounds.collect.play();
        } else if (collectible.type === 'sound') {
            this.sounds.notification.play();
        }
    }
    
    /**
     * 显示暂停屏幕滚动的状态
     * 为了向后兼容，提供这个方法给旧代码调用
     */
    pauseScrolling(duration) {
        return this.worldManager.pauseScrolling(duration);
    }
    
    /**
     * 增加滚动速度
     * 为了向后兼容，提供这个方法给旧代码调用
     */
    increaseScrollSpeed(multiplier, duration) {
        this.worldManager.increaseScrollSpeed(multiplier, duration);
    }
    
    /**
     * 显示状态提示
     * 为了向后兼容，提供这个方法给旧代码调用
     */
    showStatus(message, color) {
        this.events.emit('show-status', message, color);
    }
    
    /**
     * 隐藏状态提示
     * 为了向后兼容，提供这个方法给旧代码调用
     */
    hideStatus() {
        this.events.emit('hide-status');
    }
    
    /**
     * 添加分数
     * 为了向后兼容，提供这个方法给旧代码调用
     */
    addScore(points) {
        // 获取系统额外分数
        let bonusInfo = this.gameSystem ? this.gameSystem.getScoreBonus() : {};
        
        // 添加分数
        return this.scoreManager.addScore(points, bonusInfo);
    }
    
    /**
     * 显示游戏结束屏幕
     */
    showGameOver() {
        // 停止物理系统
        this.physics.pause();
        
        // 获取统计数据
        const stats = {
            score: this.scoreManager.getScore(),
            level: this.scoreManager.getLevel()
        };
        
        // 添加系统特定的统计数据
        if (this.gameSystem) {
            Object.assign(stats, this.gameSystem.getStats());
        }
        
        // 创建游戏结束UI
        this.uiManager.createGameOverUI(stats);
    }
}