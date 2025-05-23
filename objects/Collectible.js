/**
 * 收集物类
 * 处理游戏中的收集物行为
 */
export default class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'color') {
        super(scene, x, y, 'collectible');
        
        // 收集物类型：color(鲜艳色块)，sound(通知声音)
        this.type = type;
        
        // 将收集物添加到场景和物理系统
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体
        
        // 根据类型设置外观
        this.setupAppearance();
        
        // 添加浮动动画效果
        scene.tweens.add({
            targets: this,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 根据收集物类型设置外观
     */
    setupAppearance() {
        switch (this.type) {
            case 'color':
                // 鲜艳色块 - 使用明亮的红色
                this.setTint(0xFF5555);
                break;
            case 'sound':
                // 通知声音 - 使用明亮的黄色（更显眼）
                this.setTint(0xFFDD00);
                // 添加声音图标和闪烁效果
                const soundIcon = this.scene.add.text(this.x, this.y - 15, '🔔', { 
                    fontSize: '16px' 
                }).setOrigin(0.5);
                
                // 添加闪烁效果
                this.scene.tweens.add({
                    targets: soundIcon,
                    alpha: { from: 0.5, to: 1 },
                    scale: { from: 0.8, to: 1.2 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                
                // 将图标绑定到收集物
                this.soundIcon = soundIcon;
                
                // 添加辉光效果
                const glow = this.scene.add.sprite(this.x, this.y, 'collectible')
                    .setTint(0xFFF0AA)
                    .setScale(1.5)
                    .setAlpha(0.3);
                
                this.scene.tweens.add({
                    targets: glow,
                    scale: { from: 1.4, to: 1.8 },
                    alpha: { from: 0.3, to: 0.1 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1
                });
                
                this.glowEffect = glow;
                break;
        }
    }
    
    /**
     * 应用收集物效果
     * @param {Player} player - 玩家对象
     * @param {GameScene} gameScene - 游戏场景
     */
    applyEffect(player, gameScene) {
        switch (this.type) {
            case 'color':
                // 鲜艳色块效果：玩家临时变大，清除所有阻碍物
                player.activatePowerup(gameScene);
                // 清除视野中的所有障碍物
                this.clearObstacles(gameScene);
                break;
            case 'sound':
                // 通知声音效果：短暂停止屏幕滚动
                // 如果使用显眼度系统，暂停时间会根据显眼度动态调整
                let pauseDuration = 1500; // 默认暂停1.5秒
                
                // 显眼度系统相关效果（如果存在）
                if (gameScene.noticeabilitySystem) {
                    // 基础暂停时间根据显眼度减少
                    const noticeLevel = gameScene.noticeabilitySystem.getNoticeabilityLevel();
                    pauseDuration = Math.max(300, 1500 * (1 - Math.min(0.8, noticeLevel / 100))); // 最多减少80%，最少300ms
                    
                    // 应用屏幕晃动效果
                    if (noticeLevel > 30) {
                        // 晃动程度与显眼度成正比
                        const shakeIntensity = Math.min(0.03, noticeLevel * 0.0005); // 最大强度0.03
                        gameScene.cameras.main.shake(300, shakeIntensity);
                    }
                    
                    // 触发闪光效果
                    this.createFlashEffect(gameScene);
                }
                
                gameScene.pauseScrolling(pauseDuration);
                
                // 如果玩家处于显眼模式，增加滚动速度
                if (gameScene.noticeabilitySystem && 
                    gameScene.noticeabilitySystem.isNoticeModeActive()) {
                    const intensity = gameScene.noticeabilitySystem.getNoticeModeIntensity();
                    // 显眼度越高，滚动加速越明显
                    const speedBoost = 1.3 + (intensity * 0.5); // 1.3x 到 1.8x 之间
                    const boostDuration = 3000 + (intensity * 2000); // 3-5秒
                    
                    // 暂停结束后应用加速
                    gameScene.time.delayedCall(pauseDuration, () => {
                        gameScene.increaseScrollSpeed(speedBoost, boostDuration);
                    });
                }
                break;
        }
        
        // 销毁收集物及其附属元素
        this.destroyWithEffects();
    }
    
    /**
     * 创建闪光效果
     * @param {GameScene} gameScene - 游戏场景
     */
    createFlashEffect(gameScene) {
        // 创建全屏闪光效果
        const flash = gameScene.add.rectangle(
            gameScene.cameras.main.width / 2,
            gameScene.cameras.main.height / 2,
            gameScene.cameras.main.width,
            gameScene.cameras.main.height,
            0xFFFFFF
        ).setScrollFactor(0).setDepth(1000).setAlpha(0);
        
        // 闪烁动画
        gameScene.tweens.add({
            targets: flash,
            alpha: { from: 0.6, to: 0 },
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    /**
     * 清除屏幕中的所有障碍物
     * @param {GameScene} gameScene - 游戏场景
     */
    clearObstacles(gameScene) {
        // 移除自动清除障碍物的逻辑
        // 让障碍物在玩家碰到时才被销毁
        
        // 额外增加一些分数
        gameScene.addScore(15);
        
        // 显示提示文本
        gameScene.showStatus('无敌状态！碰撞障碍物可摧毁它们', 0xFFD700);
        
        // 注意：无敌状态结束时，Player.deactivatePowerup()方法会调用hideStatus()
    }
    
    /**
     * 收集物被销毁时带有特效
     */
    destroyWithEffects() {
        // 创建消失动画
        if (this.scene) {
            // 粒子效果
            const particles = this.scene.add.particles('collectible');
            const emitter = particles.createEmitter({
                x: this.x,
                y: this.y,
                speed: { min: 50, max: 150 },
                scale: { start: 0.4, end: 0 },
                lifespan: 600,
                blendMode: 'ADD',
                quantity: 10
            });
            
            // 自动销毁粒子系统
            this.scene.time.delayedCall(600, () => {
                particles.destroy();
            });
        }
        
        // 清理关联元素
        if (this.soundIcon) {
            this.soundIcon.destroy();
        }
        if (this.glowEffect) {
            this.glowEffect.destroy();
        }
        
        // 销毁收集物本身
        super.destroy();
    }
    
    /**
     * 收集物被销毁时清理关联元素
     */
    destroy() {
        this.destroyWithEffects();
    }
}