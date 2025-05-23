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
        this.inNoticeMode = false;  // 显眼模式状态
        this.normalSpeed = 250;     // 正常移动速度
        this.focusSpeed = 120;      // 专注模式移动速度
        this.powerupSpeed = 350;    // 能力增强移动速度
        this.noticeModeSpeed = 300; // 显眼模式移动速度
        
        // 确保玩家不会被屏幕滚动推动
        this.body.allowGravity = true;
        
        // 尾迹效果
        this.trailTime = 0;
        this.trailDelay = 30; // 显眼模式下每帧都生成，否则只在快速移动时生成
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
            // 修改：在空中增加下落加速度
            if (!this.body.touching.down && this.body.velocity.y > 0) {
                // 下落加速度为重力的1.5倍
                this.body.velocity.y += 0.5 * this.scene.physics.world.gravity.y * this.scene.sys.game.loop.delta / 1000;
            }
            
            // 修改：只允许在地面上跳跃
            const canJump = this.body.touching.down;
            if ((cursors.up.isDown || jumpKey.isDown) && canJump) {
                // 根据状态调整跳跃力度
                let jumpForce = this.jumpForce;
                if (this.powerupActive) {
                    jumpForce *= 1.2; // 能力增强时跳跃更高
                } else if (this.inFocusMode) {
                    jumpForce *= 0.7; // 专注模式跳跃更低
                } else if (this.inNoticeMode) {
                    jumpForce *= 1.1; // 显眼模式跳跃略高
                }
                
                this.setVelocityY(jumpForce);
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
        
        // 更新状态的视觉效果
        if (this.powerupActive) {
            this.updatePowerupVisuals();
        }
        
        // 生成移动尾迹
        this.updateTrail();
    }
    
    /**
     * 更新尾迹效果
     */
    updateTrail() {
        // 获取当前时间
        const now = this.scene.time.now;
        
        // 检查是否应该生成新的尾迹
        const shouldCreateTrail = this.inNoticeMode || 
            (Math.abs(this.body.velocity.x) > this.normalSpeed * 0.8) || 
            (Math.abs(this.body.velocity.y) > Math.abs(this.jumpForce) * 0.5);
            
        if (shouldCreateTrail && now > this.trailTime) {
            // 设置下一个尾迹的时间
            this.trailTime = now + (this.inNoticeMode ? 30 : 100);
            
            // 创建尾迹效果
            let trailAlpha = 0.4;
            let trailScale = 0.8;
            let trailColor = 0xFFFFFF;
            
            if (this.powerupActive) {
                trailColor = 0xFFD700; // 金色
                trailAlpha = 0.6;
            } else if (this.inFocusMode) {
                trailColor = 0x666666; // 灰色
                trailAlpha = 0.3;
            } else if (this.inNoticeMode) {
                // 显眼模式尾迹颜色在红黄之间变化
                const time = now % 1000 / 1000;
                const r = 0xff;
                const g = Math.floor(0x55 + time * 0xaa);
                trailColor = (r << 16) | (g << 8);
                trailAlpha = 0.7;
                trailScale = 1.0;
            }
            
            // 创建尾迹精灵
            const trail = this.scene.add.sprite(this.x, this.y, 'player')
                .setAlpha(trailAlpha)
                .setTint(trailColor)
                .setScale(this.scale * trailScale)
                .setDepth(this.depth - 1);
                
            // 淡出并销毁尾迹
            this.scene.tweens.add({
                targets: trail,
                alpha: 0,
                scale: this.scale * trailScale * 0.6,
                duration: this.inNoticeMode ? 400 : 200,
                onComplete: () => {
                    trail.destroy();
                }
            });
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
        } else if (this.inNoticeMode) {
            return this.noticeModeSpeed;
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
     * 进入显眼模式
     * @param {Phaser.Scene} scene - 当前场景
     * @param {number} intensity - 强度 (0-1)
     * @param {number} duration - 持续时间(毫秒)
     */
    enterNoticeMode(scene, intensity = 0.5, duration = 5000) {
        this.inNoticeMode = true;
        
        // 保存强度值用于视觉效果
        this.noticeModeIntensity = intensity;
        
        // 调整速度基于强度
        this.noticeModeSpeed = this.normalSpeed + (intensity * 100); // 250-350
        
        // 清除已有计时器
        if (this.noticeModeTimer) {
            this.noticeModeTimer.remove();
        }
        
        // 清除已有特效
        if (this.noticeEffects) {
            this.cleanupNoticeEffects();
        }
        
        // 创建特效容器
        this.noticeEffects = {
            particles: null,
            emitter: null,
            colorTween: null
        };
        
        // 强度高于阈值时添加粒子效果
        if (intensity > 0.3) {
            this.noticeEffects.particles = scene.add.particles('collectible');
            this.noticeEffects.emitter = this.noticeEffects.particles.createEmitter({
                lifespan: 300,
                speed: { min: 30, max: 100 },
                scale: { start: 0.2, end: 0 },
                quantity: Math.floor(intensity * 2) + 1,
                frequency: 100 - intensity * 80, // 20-100ms
                blendMode: 'ADD',
                tint: [0xFF5500, 0xFF0000, 0xFF9900]
            });
            this.noticeEffects.emitter.startFollow(this);
        }
        
        // 添加颜色变换效果
        const colorTween = scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 500,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
                const value = tween.getValue();
                const r = 0xff;
                const g = Math.floor(value * 2.55);
                const b = 0;
                const color = (r << 16) | (g << 8) | b;
                this.setTint(color);
            }
        });
        this.noticeEffects.colorTween = colorTween;
        
        // 添加状态文字
        if (this.stateText) this.stateText.destroy();
        this.stateText = scene.add.text(this.x, this.y - 40, '显眼!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FF5500',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // 文字闪烁效果
        scene.tweens.add({
            targets: this.stateText,
            alpha: { from: 0.6, to: 1 },
            scale: { from: 0.9, to: 1.1 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });
        
        // 设置持续时间
        this.noticeModeTimer = scene.time.delayedCall(duration, () => {
            this.exitNoticeMode();
        });
    }
    
    /**
     * 退出显眼模式
     */
    exitNoticeMode() {
        this.inNoticeMode = false;
        this.noticeModeIntensity = 0;
        
        // 清理特效
        this.cleanupNoticeEffects();
        
        // 恢复外观
        this.clearTint();
        
        // 移除状态文字
        if (this.stateText) {
            this.stateText.destroy();
            this.stateText = null;
        }
    }
    
    /**
     * 清理显眼模式特效
     */
    cleanupNoticeEffects() {
        if (!this.noticeEffects) return;
        
        if (this.noticeEffects.emitter) {
            this.noticeEffects.emitter.stop();
        }
        
        if (this.noticeEffects.particles) {
            this.noticeEffects.particles.destroy();
        }
        
        if (this.noticeEffects.colorTween) {
            this.noticeEffects.colorTween.stop();
        }
        
        this.noticeEffects = null;
    }
    
    /**
     * 清理所有特效
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
        
        // 同时清理显眼模式特效
        this.cleanupNoticeEffects();
    }
}