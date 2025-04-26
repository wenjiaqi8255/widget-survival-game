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
                // 通知声音 - 使用鲜艳的蓝色
                this.setTint(0x5555FF);
                // 添加声音图标
                const soundIcon = this.scene.add.text(this.x, this.y - 15, '🔊', { 
                    fontSize: '14px' 
                }).setOrigin(0.5);
                // 将图标绑定到收集物
                this.soundIcon = soundIcon;
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
                gameScene.pauseScrolling(1500); // 暂停1.5秒
                break;
        }
        
        // 销毁收集物及其附属元素
        if (this.soundIcon) {
            this.soundIcon.destroy();
        }
        this.destroy();
    }
    
    /**
     * 清除屏幕中的所有障碍物
     * @param {GameScene} gameScene - 游戏场景
     */
    clearObstacles(gameScene) {
        // 获取当前相机视图范围
        const cameraView = {
            top: gameScene.cameras.main.scrollY,
            bottom: gameScene.cameras.main.scrollY + gameScene.cameras.main.height
        };
        
        // 清除视野中的所有障碍物
        gameScene.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.y >= cameraView.top && obstacle.y <= cameraView.bottom) {
                // 添加消失动画
                gameScene.tweens.add({
                    targets: obstacle,
                    alpha: 0,
                    scale: 0.2,
                    duration: 300,
                    onComplete: () => obstacle.destroy()
                });
            }
        });
        
        // 额外增加一些分数
        gameScene.addScore(15);
    }
    
    /**
     * 收集物被销毁时清理关联元素
     */
    destroy() {
        if (this.soundIcon) {
            this.soundIcon.destroy();
        }
        super.destroy();
    }
}