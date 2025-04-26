/**
 * 游戏主场景
 * 实现游戏的核心功能：持续下滑的屏幕、玩家控制、碰撞检测和多层级
 */
import Player from '../objects/Player.js';
import Platform from '../objects/Platform.js';
import Collectible from '../objects/Collectible.js';
import Obstacle from '../objects/Obstacle.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // 初始化游戏变量
        this.score = 0;
        this.level = 1;
        this.scrollSpeed = 40; // 相机每帧下移的像素数
        this.gameOver = false;
        this.lastPlatformY = 0;
        
        // 元素生成时间控制
        this.lastCollectibleTime = 0;
        this.lastObstacleTime = 0;
        
        // 当前相机位置追踪
        this.cameraScrollY = 0;
    }

    create() {
        // 创建游戏世界
        this.createWorld();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建平台组
        this.createPlatforms();
        
        // 创建收集物和障碍物组
        this.createCollectiblesAndObstacles();
        
        // 设置相机和屏幕滚动
        this.setupCamera();
        
        // 设置输入控制
        this.setupInput();
        
        // 创建UI
        this.createUI();
        
        // 设置碰撞检测
        this.setupCollisions();
        
        // 设置游戏事件
        this.setupEvents();
    }

    update(time, delta) {
        if (this.gameOver) return;
        
        // 持续向下滚动整个世界
        this.scrollWorld(delta);
        
        // 生成新的平台、收集物和障碍物
        this.generateGameElements();
        
        // 更新玩家
        if (this.player) {
            this.player.update(this.cursors, this.jumpKey);
            
            // 确保玩家不会离相机太远 - 自动跟随效果
            const cameraY = this.cameras.main.scrollY;
            const idealPlayerY = cameraY + this.cameras.main.height * 0.4; // 玩家理想位置在屏幕上方40%处
            
            // 如果玩家比理想位置低太多，轻微向上推
            if (this.player.y > idealPlayerY + 100 && this.player.body.velocity.y > 0) {
                this.player.setVelocityY(this.player.body.velocity.y * 0.95);
            }
        }
        
        // 更新移动平台
        this.updatePlatforms(delta);
        
        // 检查玩家是否掉出屏幕
        this.checkPlayerBounds();
        
        // 清理屏幕外的游戏元素
        this.cleanupOffscreenElements();
    }

    createWorld() {
        // 创建背景
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height * 2, 0x87CEEB)
            .setOrigin(0, 0)
            .setScrollFactor(0.5, 0.5); // 视差背景
    }

    createPlayer() {
        // 使用Player类创建玩家
        this.player = new Player(this, 180, 300);
    }

    createPlatforms() {
        // 创建平台组 - 修改为静态物理组
        this.platforms = this.physics.add.staticGroup();
        
        // 创建初始平台
        this.generateInitialPlatforms();
    }

    createCollectiblesAndObstacles() {
        // 创建收集物组
        this.collectibles = this.physics.add.staticGroup();
        
        // 创建障碍物组
        this.obstacles = this.physics.add.staticGroup();
    }

    setupCamera() {
        // 设置世界边界 - 足够大以容纳游戏内容
        this.physics.world.setBounds(0, 0, this.cameras.main.width, 5000);
        
        // 确保相机不超出世界边界
        this.cameras.main.setBounds(0, 0, this.physics.world.bounds.width, this.physics.world.bounds.height);
    }

    setupInput() {
        // 添加键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 添加跳跃按键 (空格键)
        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createUI() {
        // 创建分数文本
        this.scoreText = this.add.text(20, 20, '分数: 0', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0); // 固定在相机上
        
        // 创建层级文本
        this.levelText = this.add.text(this.cameras.main.width - 20, 20, '层级: 1', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0).setScrollFactor(0); // 固定在相机上
    }

    setupCollisions() {
        // 玩家与平台的碰撞
        this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);
        
        // 玩家与收集物的重叠
        this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
        
        // 玩家与障碍物的重叠
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
    }

    setupEvents() {
        // 每5秒增加难度
        this.time.addEvent({
            delay: 5000,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
    }

    scrollWorld(delta) {
        // 使用相机系统滚动，而非手动移动元素
        if (!this.gameOver) {
            // 根据delta计算当前帧相机应该滚动的距离
            const scrollAmount = this.scrollSpeed * (delta / 1000);
            
            // 更新相机位置 - 向下滚动
            this.cameras.main.scrollY += scrollAmount;
            this.cameraScrollY = this.cameras.main.scrollY;
        }
    }

    generateGameElements() {
        // 获取相机底部位置
        const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height;
        
        // 仅当最后一个平台距离相机底部不足200像素时生成新平台
        if (this.lastPlatformY < cameraBottom + 200) {
            // 在相机底部下方生成新平台
            const y = this.lastPlatformY + Phaser.Math.Between(80, 150);
            this.generatePlatform(y);
            this.lastPlatformY = y; // 确保更新lastPlatformY
        }
        
        // 使用时间戳控制生成频率
        const currentTime = this.time.now;
        
        // 收集物生成：每2秒最多一个，在屏幕底部下方生成
        if (!this.lastCollectibleTime || currentTime - this.lastCollectibleTime > 2000) {
            if (Phaser.Math.Between(1, 100) <= 20) {
                const y = cameraBottom + Phaser.Math.Between(50, 200);
                this.generateCollectible(y);
                this.lastCollectibleTime = currentTime;
            }
        }
        
        // 障碍物生成：每3秒最多一个，在屏幕底部下方生成
        if (!this.lastObstacleTime || currentTime - this.lastObstacleTime > 3000) {
            if (Phaser.Math.Between(1, 100) <= 15) {
                const y = cameraBottom + Phaser.Math.Between(100, 200);
                this.generateObstacle(y);
                this.lastObstacleTime = currentTime;
            }
        }
    }

    updatePlatforms(delta) {
        // 获取游戏区域边界
        const minX = 50;
        const maxX = this.cameras.main.width - 50;
        
        // 更新所有移动平台
        this.platforms.getChildren().forEach(platform => {
            if (platform.isMoving) {
                platform.update(delta, minX, maxX);
            }
        });
    }

    checkPlayerBounds() {
        // 检查玩家是否掉出屏幕底部
        const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height;
        
        if (this.player.y > cameraBottom + 100) {
            this.gameOver = true;
            this.showGameOver();
        }
        
        // 使玩家始终位于相机视图中（保持玩家与相机的相对位置）
        const cameraTop = this.cameras.main.scrollY;
        // 如果玩家上升到相机顶部以上，限制其位置
        if (this.player.y < cameraTop - 50) {
            this.player.y = cameraTop - 50;
            this.player.body.velocity.y = 0;
        }
    }

    cleanupOffscreenElements() {
        // 获取相机顶部位置（向上额外留出200像素的缓冲区）
        const cameraTop = this.cameras.main.scrollY - 200;
        
        // 清理已经完全离开相机视图上方的游戏元素
        const groups = [this.platforms, this.collectibles, this.obstacles];
        
        groups.forEach(group => {
            group.getChildren().forEach(item => {
                if (item.y < cameraTop) {
                    item.destroy();
                }
            });
        });
    }

    generateInitialPlatforms() {
        // 添加起始平台（确保玩家有立足点）
        const startPlatform = new Platform(this, 180, 350, false);
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

    generatePlatform(y) {
        // 随机X位置
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
        
        // 5%的几率生成移动平台
        const isMoving = Phaser.Math.Between(1, 100) <= 5;
        
        // 创建平台实例
        const platform = new Platform(this, x, y, isMoving);
        // 使用物理静态组的正确添加方法
        this.platforms.add(platform);
        // 刷新静态组的物理边界
        this.platforms.refresh();
        
        this.lastPlatformY = y;
        return platform;
    }

    generateCollectible(y) {
        // 随机X位置
        const x = Phaser.Math.Between(20, this.cameras.main.width - 20);
        
        // 创建收集物实例
        const collectible = new Collectible(this, x, y);
        // 使用物理静态组的正确添加方法
        this.collectibles.add(collectible);
        // 刷新静态组的物理边界
        this.collectibles.refresh();
        
        return collectible;
    }

    generateObstacle(y) {
        // 随机X位置
        const x = Phaser.Math.Between(20, this.cameras.main.width - 20);
        
        // 创建障碍物实例
        const obstacle = new Obstacle(this, x, y);
        // 使用物理静态组的正确添加方法
        this.obstacles.add(obstacle);
        // 刷新静态组的物理边界
        this.obstacles.refresh();
        
        return obstacle;
    }

    onPlatformCollision(player, platform) {
        // 仅当玩家从上方碰到平台时进行处理
        if (player.body.velocity.y > 0 && player.y < platform.y) {
            // 检查是否需要升级层级
            this.checkLevelUp();
        }
    }

    collectItem(player, collectible) {
        // 收集物效果
        collectible.destroy();
        
        // 增加分数
        this.score += 10;
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 10%的几率激活能力增强
        if (Phaser.Math.Between(1, 100) <= 10) {
            this.player.activatePowerup(this);
        }
    }

    hitObstacle(player, obstacle) {
        // 如果玩家处于能力增强状态，销毁障碍物
        if (this.player.powerupActive) {
            obstacle.destroy();
            this.score += 5;
            this.scoreText.setText(`分数: ${this.score}`);
        } else {
            // 否则游戏结束
            this.gameOver = true;
            this.showGameOver();
        }
    }

    increaseDifficulty() {
        // 随着时间推移增加难度 - 但限制最大速度
        if (this.scrollSpeed < 5) {
            this.scrollSpeed += 0.1;
        }
    }

    checkLevelUp() {
        // 检查是否需要升级层级（基于相机位置）
        // 使用相机滚动位置而非玩家位置计算层级
        const newLevel = Math.floor(this.cameraScrollY / 1000) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.levelText.setText(`层级: ${this.level}`);
            
            // 给予层级奖励
            this.score += 50;
            this.scoreText.setText(`分数: ${this.score}`);
            
            // 增加难度
            this.scrollSpeed += 0.5;
        }
    }

    showGameOver() {
        // 停止物理系统
        this.physics.pause();
        
        // 显示游戏结束文本
        const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, '游戏结束', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 显示最终分数
        const finalScoreText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, `最终分数: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 添加重新开始按钮
        const restartButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, '重新开始', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#2196F3',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        }).setOrigin(0.5).setScrollFactor(0).setInteractive();
        
        // 添加按钮悬停效果
        restartButton.on('pointerover', () => {
            restartButton.setBackgroundColor('#1E88E5');
            restartButton.setScale(1.1);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setBackgroundColor('#2196F3');
            restartButton.setScale(1);
        });
        
        // 点击重新开始按钮
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}