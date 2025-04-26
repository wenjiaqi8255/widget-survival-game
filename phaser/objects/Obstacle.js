/**
 * 障碍物类
 * 处理游戏中的障碍物行为
 */
export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'obstacle');
        
        // 将障碍物添加到场景和物理系统
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体
        
        // 可以添加旋转效果使障碍物更有威胁感
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1
        });
    }
}