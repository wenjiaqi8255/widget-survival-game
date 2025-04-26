/**
 * 收集物类
 * 处理游戏中的收集物行为
 */
export default class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'collectible');
        
        // 将收集物添加到场景和物理系统
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体
        
        // 添加浮动动画效果
        scene.tweens.add({
            targets: this,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
}