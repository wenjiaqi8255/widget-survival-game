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
        
        // 玩家状态
        this.powerupActive = false; // 能力增强状态
        this.inFocusMode = false;   // 专注模式状态
        this.normalSpeed = 250;     // 正常移动速度
        this.focusSpeed = 120;      // 专注模式移动速度
        this.powerupSpeed = 350;    // 能力增强移动速度
        
        // 确保玩家不会被屏幕滚动推动
        this.body.allowGravity = true;
    }
    
    /**
     * 更新玩家
     * @param {object} cursors - 键盘光标对象
     * @param {Phaser.Input.Keyboard.Key} jumpKey - 跳跃键
     */
    update(cursors, jumpKey) {
        // 计算当前移动速度
        const currentSpeed = this.getCurrentSpeed();
        
        // 左右移动
        if (cursors.left.isDown) {
            this.setVelocityX(-currentSpeed);
        } else if (cursors.right.isDown) {
            this.setVelocityX(currentSpeed);
        } else {
            // 停止水平移动
            this.setVelocityX(0);
        }
        
        // 处理上下移动（仅当玩家处于能力增强状态时）
        if (this.powerupActive) {
            if (cursors.up.isDown) {
                this.setVelocityY(-currentSpeed);
            } else if (cursors.down.isDown) {
                this.setVelocityY(currentSpeed);
            } else {
                // 停止垂直移动
                this.setVelocityY(0);
            }
        } else {
            // 正常跳跃逻辑（非能力增强状态）
            const canJump = this.body.touching.down || this.jumpCount < this.maxJumps;
            if ((cursors.up.isDown || jumpKey.isDown) && canJump) {
                if (this.body.touching.down) {
                    this.jumpCount = 0; // 重置跳跃计数
                }
                
                // 根据状态调整跳跃力度
                let jumpForce = this.jumpForce;
                if (this.powerupActive) {
                    jumpForce *= 1.2; // 能力增强时跳跃更高
                } else if (this.inFocusMode) {
                    jumpForce *= 0.7; // 专注模式跳跃更低
                }
                
                this.setVelocityY(jumpForce);
                this.jumpCount++;
            }
            
            // 如果玩家在地面上，重置跳跃计数
            if (this.body.touching.down) {
                this.jumpCount = 0;
            }
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
        
        // 更新能力增强状态的视觉效果
        if (this.powerupActive) {
            this.updatePowerupVisuals();
        }
    }
    
    /**
     * 根据当前状态获取移动速度
     * @returns {number} 当前移动速度
     */
    getCurrentSpeed() {
        if (this.powerupActive) {
            return this.powerupSpeed;
        } else if (this.inFocusMode) {
            return this.focusSpeed;
        } else {
            return this.normalSpeed;
        }
    }
    
    /**
     * 激活能力增强状态
     * @param {Phaser.Scene} scene - 当前场景
     * @param {number} duration - 持续时间(毫秒)，默认3000
     */
    activatePowerup(scene, duration = 3000) {
        this.powerupActive = true;
        
        // 视觉效果：玩家变大并改变颜色
        this.setTint(0xFFD700); // 金色
        this.setScale(1.5);
        
        // 禁用重力
        this.body.allowGravity = false;
        
        // 清理之前可能存在的粒子系统
        this.cleanupParticleEffects();
        
        // 创建新的粒子系统
        this.particles = scene.add.particles('collectible');
        this.emitter = this.particles.createEmitter({
            lifespan: 200,
            speed: { min: 50, max: 100 },
            scale: { start: 0.4, end: 0 },
            quantity: 1,
            blendMode: 'ADD',
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Rectangle(-this.width/2, -this.height/2, this.width, this.height),
                quantity: 12
            }
        });
        this.emitter.startFollow(this);
        
        // 如果有现有的timer，先清除
        if (this.powerupTimer) {
            this.powerupTimer.remove();
        }
        
        // 设置持续时间
        this.powerupTimer = scene.time.delayedCall(duration, () => {
            this.deactivatePowerup();
        });
        
        // 添加状态文字
        if (this.stateText) this.stateText.destroy();
        this.stateText = scene.add.text(this.x, this.y - 40, '无敌!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }
    
    /**
     * 更新能力增强状态的视觉效果
     */
    updatePowerupVisuals() {
        // 更新状态文字位置
        if (this.stateText) {
            this.stateText.setPosition(this.x, this.y - 40);
        }
    }
    
    /**
     * 停用能力增强状态
     */
    deactivatePowerup() {
        this.powerupActive = false;
        
        // 恢复外观
        this.clearTint();
        this.setScale(1);
        
        // 重新启用重力
        this.body.allowGravity = true;
        
        // 清理粒子效果
        this.cleanupParticleEffects();
        
        // 移除状态文字
        if (this.stateText) {
            this.stateText.destroy();
            this.stateText = null;
        }
        
        // 隐藏GameScene中的状态提示文本
        if (this.scene && typeof this.scene.hideStatus === 'function') {
            this.scene.hideStatus();
        }
    }
    
    /**
     * 进入专注模式
     * @param {Phaser.Scene} scene - 当前场景
     * @param {number} duration - 持续时间(毫秒)，默认5000
     */
    enterFocusMode(scene, duration = 5000) {
        this.inFocusMode = true;
        
        // 视觉效果：玩家变暗/变灰
        this.setTint(0x666666);
        
        // 添加减速视觉效果
        this.setAlpha(0.7);
        
        // 如果有现有的timer，先清除
        if (this.focusModeTimer) {
            this.focusModeTimer.remove();
        }
        
        // 设置持续时间
        this.focusModeTimer = scene.time.delayedCall(duration, () => {
            this.exitFocusMode();
        });
        
        // 添加状态文字
        if (this.stateText) this.stateText.destroy();
        this.stateText = scene.add.text(this.x, this.y - 40, '减速!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#AAAAAA',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }
    
    /**
     * 退出专注模式
     */
    exitFocusMode() {
        this.inFocusMode = false;
        
        // 恢复外观
        this.clearTint();
        this.setAlpha(1);
        
        // 移除状态文字
        if (this.stateText) {
            this.stateText.destroy();
            this.stateText = null;
        }
    }
    
    /**
     * 清理粒子效果
     */
    cleanupParticleEffects() {
        if (this.emitter) {
            this.emitter.stop();
            if (this.emitter.manager) {
                this.emitter.manager.destroy();
            }
            this.emitter = null;
        }
        if (this.particles) {
            this.particles.destroy();
            this.particles = null;
        }
    }
}