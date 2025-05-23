/**
 * 显眼度系统
 * 管理玩家的显眼度等级、显眼模式及相关效果
 */
export default class NoticeabilitySystem {
    constructor(scene) {
        this.scene = scene;
        
        // 显眼度属性
        this.noticeabilityLevel = 0;       // 当前显眼度等级 (0-100)
        this.targetNoticeability = 0;      // 目标显眼度（用于平滑过渡）
        this.noticeDecayRate = 0.1;        // 显眼度自然衰减速率
        this.activeNoticeMode = false;     // 显眼模式激活状态
        
        // 显眼模式属性
        this.noticeModeTimer = null;       // 显眼模式计时器
        this.noticeModeIntensity = 0;      // 显眼模式强度 (0-1)
        this.baseNoticeDuration = 5000;    // 基础显眼模式持续时间（毫秒）
        
        // 收集统计
        this.totalNotifications = 0;       // 收集的总通知数量
        this.consecutiveNotifications = 0; // 连续收集通知计数
        this.lastNotificationTime = 0;     // 上次收集通知的时间
        
        // 创建UI元素
        this.createUI();
    }
    
    /**
     * 创建显眼度系统UI
     */
    createUI() {
        // 创建显眼度指示器背景
        this.noticeabilityBg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            120,
            200,
            16,
            0x333333
        ).setScrollFactor(0).setAlpha(0.7);
        
        // 创建显眼度指示器填充
        this.noticeabilityBar = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2 - 100, // 左侧起点
            120,
            0, // 初始宽度为0
            12,
            0xFF5555 // 显眼度颜色（红色）
        ).setScrollFactor(0).setOrigin(0, 0.5);
        
        // 创建显眼度文本
        this.noticeabilityText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            140,
            '显眼度: 0%',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#FF5555',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setScrollFactor(0).setOrigin(0.5);
        
        // 创建模式状态文本
        this.modeText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            160,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setScrollFactor(0).setOrigin(0.5).setAlpha(0);
    }
    
    /**
     * 更新显眼度系统
     * @param {number} delta - 时间增量（毫秒）
     */
    update(delta) {
        // 平滑过渡显眼度值
        if (this.noticeabilityLevel !== this.targetNoticeability) {
            const diff = this.targetNoticeability - this.noticeabilityLevel;
            this.noticeabilityLevel += diff * 0.05;
            
            // 当差异很小时，直接设置为目标值
            if (Math.abs(diff) < 0.1) {
                this.noticeabilityLevel = this.targetNoticeability;
            }
            
            // 更新UI
            this.updateUI();
        }
        
        // 显眼度自然衰减（仅当未处于显眼模式时）
        if (!this.activeNoticeMode && this.noticeabilityLevel > 0) {
            const decay = this.noticeDecayRate * (delta / 1000);
            this.targetNoticeability = Math.max(0, this.noticeabilityLevel - decay);
        }
        
        // 更新显眼模式的视觉效果
        if (this.activeNoticeMode) {
            this.updateNoticeModeEffects(delta);
        }
        
        // 检查连续通知收集的冷却时间
        const currentTime = this.scene.time.now;
        if (this.consecutiveNotifications > 0 && currentTime - this.lastNotificationTime > 5000) {
            // 5秒内未收集新通知，重置连续计数
            this.consecutiveNotifications = 0;
        }
    }
    
    /**
     * 更新显眼模式的视觉效果
     * @param {number} delta - 时间增量（毫秒）
     */
    updateNoticeModeEffects(delta) {
        // 闪烁效果频率随显眼度增加而增加
        const blinkFrequency = 200 + Math.max(0, 300 - this.noticeabilityLevel * 3);
        const blinkValue = Math.sin(this.scene.time.now / blinkFrequency) * 0.5 + 0.5;
        
        // 应用闪烁效果到玩家
        if (this.scene.player) {
            // 颜色变化（红色 <-> 黄色）
            const red = 0xff;
            const green = Math.floor(0x55 + blinkValue * 0xaa);
            const blue = 0x00;
            const color = (red << 16) | (green << 8) | blue;
            
            this.scene.player.setTint(color);
            
            // 透明度轻微变化
            const alpha = 0.8 + blinkValue * 0.2;
            this.scene.player.setAlpha(alpha);
            
            // 轻微缩放效果
            const scale = 1 + blinkValue * 0.1 * this.noticeModeIntensity;
            this.scene.player.setScale(scale);
        }
    }
    
    /**
     * 增加显眼度
     * @param {number} amount - 增加的显眼度值
     * @param {boolean} activate - 是否激活显眼模式
     */
    increaseNoticeability(amount, activate = false) {
        // 应用连续收集加成
        const bonusAmount = amount * (1 + this.consecutiveNotifications * 0.2);
        
        // 更新目标显眼度
        this.targetNoticeability = Math.min(100, this.noticeabilityLevel + bonusAmount);
        
        // 更新统计
        this.totalNotifications++;
        this.consecutiveNotifications++;
        this.lastNotificationTime = this.scene.time.now;
        
        // 如果需要，激活显眼模式
        if (activate) {
            this.activateNoticeMode();
        }
        
        // 更新UI
        this.updateUI();
        
        return {
            amount: bonusAmount,
            level: this.noticeabilityLevel,
            consecutive: this.consecutiveNotifications
        };
    }
    
    /**
     * 降低显眼度
     * @param {number} amount - 降低的显眼度值
     */
    decreaseNoticeability(amount) {
        // 更新目标显眼度
        this.targetNoticeability = Math.max(0, this.noticeabilityLevel - amount);
        
        // 重置连续计数
        this.consecutiveNotifications = 0;
        
        // 更新UI
        this.updateUI();
        
        return {
            amount: amount,
            level: this.noticeabilityLevel
        };
    }
    
    /**
     * 激活显眼模式
     */
    activateNoticeMode() {
        // 基于当前显眼度计算持续时间和强度
        const duration = this.calculateNoticeDuration();
        this.noticeModeIntensity = this.calculateNoticeIntensity();
        
        // 清除先前的计时器
        if (this.noticeModeTimer) {
            this.noticeModeTimer.remove();
        }
        
        // 设置显眼模式为激活状态
        this.activeNoticeMode = true;
        
        // 显示状态文本
        this.modeText.setText('显眼模式 激活!');
        this.modeText.setColor('#FF5555');
        this.modeText.setAlpha(1);
        
        // 播放激活动画
        this.scene.tweens.add({
            targets: this.modeText,
            scale: { from: 1.5, to: 1 },
            ease: 'Bounce.Out',
            duration: 300
        });
        
        // 设置定时器以停用显眼模式
        this.noticeModeTimer = this.scene.time.delayedCall(duration, () => {
            this.deactivateNoticeMode();
        });
        
        return {
            duration: duration,
            intensity: this.noticeModeIntensity
        };
    }
    
    /**
     * 停用显眼模式
     */
    deactivateNoticeMode() {
        // 取消显眼模式状态
        this.activeNoticeMode = false;
        
        // 重置玩家视觉效果
        if (this.scene.player) {
            this.scene.player.clearTint();
            this.scene.player.setAlpha(1);
            this.scene.player.setScale(1);
        }
        
        // 淡出状态文本
        this.scene.tweens.add({
            targets: this.modeText,
            alpha: 0,
            duration: 500
        });
    }
    
    /**
     * 计算显眼模式持续时间
     * @returns {number} 持续时间（毫秒）
     */
    calculateNoticeDuration() {
        // 显眼度越高，持续时间越短
        const level = this.noticeabilityLevel / 100;
        const reductionFactor = 0.5 + (level * 0.5); // 0.5 ~ 1.0
        return this.baseNoticeDuration * (1 - (level * 0.5)); // 基础时间减少最多50%
    }
    
    /**
     * 计算显眼模式强度
     * @returns {number} 强度值 (0-1)
     */
    calculateNoticeIntensity() {
        // 显眼度越高，强度越大
        return Math.min(1, this.noticeabilityLevel / 50); // 50%显眼度达到最大强度
    }
    
    /**
     * 获取当前显眼度
     * @returns {number} 当前显眼度 (0-100)
     */
    getNoticeabilityLevel() {
        return this.noticeabilityLevel;
    }
    
    /**
     * 获取显眼模式状态
     * @returns {boolean} 是否处于显眼模式
     */
    isNoticeModeActive() {
        return this.activeNoticeMode;
    }
    
    /**
     * 获取显眼模式强度
     * @returns {number} 显眼模式强度 (0-1)
     */
    getNoticeModeIntensity() {
        return this.activeNoticeMode ? this.noticeModeIntensity : 0;
    }
    
    /**
     * 更新UI元素
     */
    updateUI() {
        // 更新进度条长度
        const barWidth = Math.min(200, this.noticeabilityLevel * 2); // 最大200像素宽
        this.noticeabilityBar.width = barWidth;
        
        // 根据显眼度等级变化进度条颜色
        const red = 0xff;
        const green = Math.max(0, Math.min(0xff, Math.floor(0x99 - this.noticeabilityLevel * 0.5)));
        const blue = Math.max(0, Math.min(0xff, Math.floor(0x99 - this.noticeabilityLevel)));
        const fillColor = (red << 16) | (green << 8) | blue;
        this.noticeabilityBar.fillColor = fillColor;
        
        // 更新文本显示
        this.noticeabilityText.setText(`显眼度: ${Math.floor(this.noticeabilityLevel)}%`);
        
        // 根据显眼度变化文本颜色
        const textColor = '#' + fillColor.toString(16).padStart(6, '0');
        this.noticeabilityText.setColor(textColor);
        
        // 如果处于显眼模式，闪烁显眼度文本
        if (this.activeNoticeMode) {
            const pulseFactor = Math.sin(this.scene.time.now / 150) * 0.2 + 1;
            this.noticeabilityText.setScale(pulseFactor);
        } else {
            this.noticeabilityText.setScale(1);
        }
        
        // 连续通知计数显示
        if (this.consecutiveNotifications >= 2) {
            const blink = Math.sin(this.scene.time.now / 200) > 0;
            const countText = `x${this.consecutiveNotifications}`;
            const countColor = blink ? '#FFFF00' : '#FF9900';
            
            // 更新或创建连击计数文本
            if (!this.comboText) {
                this.comboText = this.scene.add.text(
                    this.noticeabilityText.x + this.noticeabilityText.width / 2 + 10,
                    this.noticeabilityText.y,
                    countText,
                    {
                        fontFamily: 'Arial',
                        fontSize: '18px',
                        color: countColor,
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setScrollFactor(0);
            } else {
                this.comboText.setText(countText);
                this.comboText.setColor(countColor);
                this.comboText.setPosition(
                    this.noticeabilityText.x + this.noticeabilityText.width / 2 + 10,
                    this.noticeabilityText.y
                );
                this.comboText.setAlpha(1);
            }
        } else if (this.comboText) {
            // 隐藏连击计数文本
            this.comboText.setAlpha(0);
        }
    }
}