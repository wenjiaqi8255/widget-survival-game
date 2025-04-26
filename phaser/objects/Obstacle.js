/**
 * 障碍物类
 * 处理游戏中的障碍物行为
 */
export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'adblock') {
        super(scene, x, y, 'obstacle');
        
        // 障碍物类型：adblock, focusmode, battery
        this.type = type;
        
        // 将障碍物添加到场景和物理系统
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体
        
        // 根据类型设置外观
        this.setupAppearance();
        
        // 添加激活时的效果
        this.activationEffects = {};
    }
    
    /**
     * 根据障碍物类型设置外观
     */
    setupAppearance() {
        switch (this.type) {
            case 'adblock':
                // Ad Blocker - 红色阻止符号
                this.setTint(0xFF0000);
                // 添加阻止图标
                const blockIcon = this.scene.add.text(this.x, this.y, '✕', { 
                    fontSize: '16px', 
                    color: '#FFFFFF'
                }).setOrigin(0.5);
                this.blockIcon = blockIcon;
                
                // 旋转效果
                this.scene.tweens.add({
                    targets: this,
                    angle: 360,
                    duration: 3000,
                    repeat: -1
                });
                break;
                
            case 'focusmode':
                // 专注模式区域 - 灰色区域
                this.setTint(0x444444);
                this.setAlpha(0.7);
                // 添加专注图标
                const focusIcon = this.scene.add.text(this.x, this.y, '👁️', { 
                    fontSize: '16px'
                }).setOrigin(0.5);
                this.focusIcon = focusIcon;
                
                // 缩放效果
                this.scene.tweens.add({
                    targets: this,
                    scale: { from: 1, to: 1.2 },
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
                // 设置更大的碰撞区域
                this.setScale(1.5);
                break;
                
            case 'battery':
                // 电池低电量警告 - 黄色闪烁
                this.setTint(0xFFCC00);
                // 添加电池图标
                const batteryIcon = this.scene.add.text(this.x, this.y, '🔋', { 
                    fontSize: '16px'
                }).setOrigin(0.5);
                this.batteryIcon = batteryIcon;
                
                // 闪烁效果
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 1, to: 0.3 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                break;
        }
    }
    
    /**
     * 应用障碍物效果
     * @param {Player} player - 玩家对象
     * @param {GameScene} gameScene - 游戏场景
     */
    applyEffect(player, gameScene) {
        switch (this.type) {
            case 'adblock':
                // Ad Blocker效果：如果玩家不在无敌状态，游戏结束
                if (!player.powerupActive) {
                    gameScene.gameOver = true;
                    gameScene.showGameOver();
                } else {
                    // 玩家处于无敌状态，摧毁障碍物
                    this.destroy();
                    gameScene.addScore(5);
                }
                break;
                
            case 'focusmode':
                // 专注模式效果：减慢玩家移动速度
                if (!player.powerupActive) {
                    player.enterFocusMode(gameScene, 5000);
                } else {
                    // 玩家处于无敌状态，摧毁障碍物
                    this.destroy();
                    gameScene.addScore(5);
                }
                break;
                
            case 'battery':
                // 电池低电量警告效果：加快屏幕滚动速度
                if (!player.powerupActive) {
                    gameScene.increaseScrollSpeed(1.5, 5000);
                } else {
                    // 玩家处于无敌状态，摧毁障碍物
                    this.destroy();
                    gameScene.addScore(5);
                }
                break;
        }
    }
    
    /**
     * 更新障碍物
     */
    update() {
        // 更新图标位置
        if (this.blockIcon) {
            this.blockIcon.setPosition(this.x, this.y);
        }
        if (this.focusIcon) {
            this.focusIcon.setPosition(this.x, this.y);
        }
        if (this.batteryIcon) {
            this.batteryIcon.setPosition(this.x, this.y);
        }
    }
    
    /**
     * 障碍物被销毁时清理关联元素
     */
    destroy() {
        if (this.blockIcon) {
            this.blockIcon.destroy();
        }
        if (this.focusIcon) {
            this.focusIcon.destroy();
        }
        if (this.batteryIcon) {
            this.batteryIcon.destroy();
        }
        super.destroy();
    }
}