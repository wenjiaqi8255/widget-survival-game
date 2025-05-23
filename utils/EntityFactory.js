/**
 * 实体工厂
 * 负责创建游戏中的实体（平台、收集物、障碍物等）
 */
import Platform from '../objects/Platform.js';
import Collectible from '../objects/Collectible.js';
import Obstacle from '../objects/Obstacle.js';

export default class EntityFactory {
    constructor(scene) {
        this.scene = scene;
        this.lastPlatformY = 0;
        this.lastCollectibleTime = 0;
        this.lastObstacleTime = 0;
        
        // 创建实体组
        this.platforms = scene.physics.add.staticGroup();
        this.collectibles = scene.physics.add.staticGroup();
        this.obstacles = scene.physics.add.staticGroup();
    }
    
    /**
     * 获取平台组
     * @returns {Phaser.Physics.Arcade.StaticGroup} 平台组
     */
    getPlatforms() {
        return this.platforms;
    }
    
    /**
     * 获取收集物组
     * @returns {Phaser.Physics.Arcade.StaticGroup} 收集物组
     */
    getCollectibles() {
        return this.collectibles;
    }
    
    /**
     * 获取障碍物组
     * @returns {Phaser.Physics.Arcade.StaticGroup} 障碍物组
     */
    getObstacles() {
        return this.obstacles;
    }
    
    /**
     * 创建初始平台
     */
    createInitialPlatforms() {
        // 添加起始平台（确保玩家有立足点）
        const startPlatform = new Platform(this.scene, 180, 350, false);
        // 使用物理静态组的正确添加方法
        this.platforms.add(startPlatform);
        startPlatform.setScale(2, 0.5);
        // 刷新静态组的物理边界
        this.platforms.refresh();
        
        this.lastPlatformY = startPlatform.y;
        
        // 生成几个初始平台
        for (let i = 0; i < 5; i++) {
            this.generatePlatform(400 + i * 100);
        }
    }
    
    /**
     * 生成平台
     * @param {number} y - 平台的Y坐标
     * @param {number} level - 当前游戏层级
     * @returns {Platform} 创建的平台实例
     */
    generatePlatform(y, level = 1) {
        // 随机X位置
        const x = Phaser.Math.Between(50, this.scene.cameras.main.width - 50);
        
        // 随着层级提高，增加移动平台的几率
        const movingChance = 5 + Math.min(level, 20); // 最高25%
        const isMoving = Phaser.Math.Between(1, 100) <= movingChance;
        
        // 创建平台实例
        const platform = new Platform(this.scene, x, y, isMoving);
        // 使用物理静态组的正确添加方法
        this.platforms.add(platform);
        // 刷新静态组的物理边界
        this.platforms.refresh();
        
        this.lastPlatformY = y;
        return platform;
    }
    
    /**
     * 生成收集物
     * @param {number} y - 收集物的Y坐标
     * @param {string} type - 收集物类型
     * @returns {Collectible} 创建的收集物实例
     */
    generateCollectible(y, type = 'color') {
        // 随机X位置
        const x = Phaser.Math.Between(20, this.scene.cameras.main.width - 20);
        
        // 创建收集物实例
        const collectible = new Collectible(this.scene, x, y, type);
        // 使用物理静态组的正确添加方法
        this.collectibles.add(collectible);
        // 刷新静态组的物理边界
        this.collectibles.refresh();
        
        // 记录生成时间
        this.lastCollectibleTime = this.scene.time.now;
        
        return collectible;
    }
    
    /**
     * 生成障碍物
     * @param {number} y - 障碍物的Y坐标
     * @param {string} type - 障碍物类型
     * @returns {Obstacle} 创建的障碍物实例
     */
    generateObstacle(y, type = 'adblock') {
        // 随机X位置
        const x = Phaser.Math.Between(20, this.scene.cameras.main.width - 20);
        
        // 创建障碍物实例
        const obstacle = new Obstacle(this.scene, x, y, type);
        // 使用物理静态组的正确添加方法
        this.obstacles.add(obstacle);
        // 刷新静态组的物理边界
        this.obstacles.refresh();
        
        // 记录生成时间
        this.lastObstacleTime = this.scene.time.now;
        
        return obstacle;
    }
    
    /**
     * 更新并生成新的游戏元素
     * @param {object} cameraView - 相机视图范围
     * @param {number} level - 当前游戏层级
     */
    updateGameElements(cameraView, level) {
        this.generatePlatformsIfNeeded(cameraView);
        this.generateCollectiblesIfNeeded(cameraView, level);
        this.generateObstaclesIfNeeded(cameraView, level);
    }
    
    /**
     * 根据需要生成新的平台
     * @param {object} cameraView - 相机视图范围
     */
    generatePlatformsIfNeeded(cameraView) {
        // 仅当最后一个平台距离相机底部不足200像素时生成新平台
        if (this.lastPlatformY < cameraView.bottom + 200) {
            // 在相机底部下方生成新平台
            const y = this.lastPlatformY + Phaser.Math.Between(80, 150);
            this.generatePlatform(y);
            this.lastPlatformY = y; // 确保更新lastPlatformY
        }
    }
    
    /**
     * 根据需要生成新的收集物
     * @param {object} cameraView - 相机视图范围
     * @param {number} level - 当前游戏层级
     */
    generateCollectiblesIfNeeded(cameraView, level) {
        const currentTime = this.scene.time.now;
        
        // 收集物生成：每2秒最多一个，在屏幕底部下方生成
        if (!this.lastCollectibleTime || currentTime - this.lastCollectibleTime > 2000) {
            // 根据当前层级调整生成概率
            const collectibleChance = 20 + Math.min(level * 2, 20); // 随层级增加生成几率，最高40%
            
            if (Phaser.Math.Between(1, 100) <= collectibleChance) {
                const y = cameraView.bottom + Phaser.Math.Between(50, 200);
                
                // 随机确定收集物类型，80%几率生成通知声音收集物
                const collectibleType = Phaser.Math.Between(1, 100) <= 80 ? 'sound' : 'color';
                
                this.generateCollectible(y, collectibleType);
            }
        }
    }
    
    /**
     * 根据需要生成新的障碍物
     * @param {object} cameraView - 相机视图范围
     * @param {number} level - 当前游戏层级
     */
    generateObstaclesIfNeeded(cameraView, level) {
        const currentTime = this.scene.time.now;
        
        // 障碍物生成：每3秒最多一个，在屏幕底部下方生成
        if (!this.lastObstacleTime || currentTime - this.lastObstacleTime > 3000) {
            // 根据当前层级调整生成概率
            const obstacleChance = 15 + Math.min(level * 3, 30); // 随层级增加生成几率，最高45%
            
            if (Phaser.Math.Between(1, 100) <= obstacleChance) {
                const y = cameraView.bottom + Phaser.Math.Between(100, 200);
                
                // 根据当前层级和随机性确定障碍物类型
                let obstacleType;
                const typeRoll = Phaser.Math.Between(1, 100);
                
                if (typeRoll <= 40) {
                    obstacleType = 'adblock'; // 40%几率生成Ad Blocker
                } else if (typeRoll <= 70) {
                    obstacleType = 'focusmode'; // 30%几率生成专注模式
                } else {
                    obstacleType = 'battery'; // 30%几率生成电池警告
                }
                
                this.generateObstacle(y, obstacleType);
            }
        }
    }
    
    /**
     * 更新移动平台
     * @param {number} delta - 时间增量
     */
    updatePlatforms(delta) {
        // 获取游戏区域边界
        const minX = 50;
        const maxX = this.scene.cameras.main.width - 50;
        
        // 更新所有移动平台
        this.platforms.getChildren().forEach(platform => {
            if (platform.isMoving) {
                platform.update(delta, minX, maxX);
            }
        });
    }
    
    /**
     * 更新障碍物
     */
    updateObstacles() {
        // 更新所有障碍物
        this.obstacles.getChildren().forEach(obstacle => {
            obstacle.update();
        });
    }
    
    /**
     * 清理屏幕外的游戏元素
     * @param {number} cameraTop - 相机顶部位置
     */
    cleanupOffscreenElements(cameraTop) {
        // 清理已经完全离开相机视图上方的游戏元素
        const groups = [this.platforms, this.collectibles, this.obstacles];
        
        groups.forEach(group => {
            group.getChildren().forEach(item => {
                if (item.y < cameraTop - 200) { // 向上额外留出200像素的缓冲区
                    item.destroy();
                }
            });
        });
    }
}