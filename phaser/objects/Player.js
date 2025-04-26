/**
 * 玩家类
 * 封装玩家相关的属性和方法
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // 将玩家添加到场景和物理系统
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置玩家属性
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        
        // 自定义碰撞体积
        this.body.setSize(32, 48);
        
        // 玩家跳跃属性
        this.jumpForce = -400;
        this.jumpCount = 0;
        this.maxJumps = 1; // 单段跳
        
        // 能力增强状态
        this.powerupActive = false;
        
        // 确保玩家不会被屏幕滚动推动
        this.body.allowGravity = true;
    }
    
    /**
     * 更新玩家
     * @param {object} cursors - 键盘光标对象
     * @param {Phaser.Input.Keyboard.Key} jumpKey - 跳跃键
     */
    update(cursors, jumpKey) {
        // 左右移动
        if (cursors.left.isDown) {
            this.setVelocityX(-250);
        } else if (cursors.right.isDown) {
            this.setVelocityX(250);
        } else {
            // 停止水平移动
            this.setVelocityX(0);
        }
        
        // 跳跃逻辑
        const canJump = this.body.touching.down || this.jumpCount < this.maxJumps;
        if ((cursors.up.isDown || jumpKey.isDown) && canJump) {
            if (this.body.touching.down) {
                this.jumpCount = 0; // 重置跳跃计数
            }
            
            this.setVelocityY(this.jumpForce);
            this.jumpCount++;
        }
        
        // 如果玩家在地面上，重置跳跃计数
        if (this.body.touching.down) {
            this.jumpCount = 0;
        }
        
        // 水平边界检查（防止离开屏幕）
        const halfWidth = this.displayWidth / 2;
        const worldWidth = this.scene.physics.world.bounds.width;
        
        if (this.x < halfWidth) {
            this.x = halfWidth;
            this.body.velocity.x = 0;
        } else if (this.x > worldWidth - halfWidth) {
            this.x = worldWidth - halfWidth;
            this.body.velocity.x = 0;
        }
    }
    
    /**
     * 激活能力增强状态
     * @param {Phaser.Scene} scene - 当前场景
     */
    activatePowerup(scene) {
        this.powerupActive = true;
        
        // 视觉效果：玩家变大并改变颜色
        this.setTint(0xFFD700); // 金色
        this.setScale(1.5);
        
        // 3秒后结束增强状态
        scene.time.delayedCall(3000, () => {
            this.powerupActive = false;
            this.clearTint();
            this.setScale(1);
        });
    }
}