/**
 * UI管理器
 * 负责游戏界面元素的创建和更新
 */
export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.scoreText = null;
        this.levelText = null;
        this.statusText = null;
        
        // UI层级设置
        this.UI_LAYER = 1000;
        
        this.createUI();
    }
    
    /**
     * 创建UI元素
     */
    createUI() {
        // 创建分数文本
        this.scoreText = this.scene.add.text(20, 20, '分数: 0', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(this.UI_LAYER); // 固定在相机上
        
        // 创建层级文本
        this.levelText = this.scene.add.text(this.scene.cameras.main.width - 20, 20, '层级: 1', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(this.UI_LAYER); // 固定在相机上
        
        // 创建状态指示器
        this.statusText = this.scene.add.text(this.scene.cameras.main.width / 2, 20, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setAlpha(0).setDepth(this.UI_LAYER);
        
        // 监听事件
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听分数变化事件
        this.scene.events.on('update-score', this.updateScore, this);
        
        // 监听层级变化事件
        this.scene.events.on('update-level', this.updateLevel, this);
        
        // 监听状态变化事件
        this.scene.events.on('show-status', this.showStatus, this);
        this.scene.events.on('hide-status', this.hideStatus, this);
        
        // 监听滚动相关事件
        this.scene.events.on('scroll-paused', (duration) => {
            this.showStatus('屏幕已暂停!', 0x00FFFF);
        }, this);
        
        this.scene.events.on('scroll-resumed', () => {
            this.hideStatus();
        }, this);
        
        this.scene.events.on('scroll-speed-changed', (multiplier) => {
            this.showStatus('滚动加速!', 0xFFAA00);
        }, this);
        
        this.scene.events.on('scroll-speed-restored', () => {
            this.hideStatus();
        }, this);
        
        // 清理事件
        this.scene.events.once('shutdown', this.cleanupEventListeners, this);
    }
    
    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        this.scene.events.off('update-score', this.updateScore, this);
        this.scene.events.off('update-level', this.updateLevel, this);
        this.scene.events.off('show-status', this.showStatus, this);
        this.scene.events.off('hide-status', this.hideStatus, this);
        this.scene.events.off('scroll-paused', null, this);
        this.scene.events.off('scroll-resumed', null, this);
        this.scene.events.off('scroll-speed-changed', null, this);
        this.scene.events.off('scroll-speed-restored', null, this);
    }
    
    /**
     * 更新分数显示
     * @param {number} score - 当前分数
     */
    updateScore(score) {
        this.scoreText.setText(`分数: ${score}`);
    }
    
    /**
     * 更新层级显示
     * @param {number} level - 当前层级
     */
    updateLevel(level) {
        this.levelText.setText(`层级: ${level}`);
    }
    
    /**
     * 显示状态提示
     * @param {string} message - 提示消息
     * @param {number} color - 颜色(十六进制)
     * @param {number} duration - 显示持续时间(毫秒)，如果为0则不自动隐藏
     */
    showStatus(message, color = 0xFFFFFF, duration = 0) {
        this.statusText.setText(message);
        this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
        
        // 淡入效果
        this.scene.tweens.add({
            targets: this.statusText,
            alpha: 1,
            duration: 200
        });
        
        // 如果指定了持续时间，则在之后自动淡出
        if (duration > 0) {
            this.scene.time.delayedCall(duration, () => {
                this.hideStatus();
            });
        }
    }
    
    /**
     * 隐藏状态提示
     */
    hideStatus() {
        // 淡出效果
        this.scene.tweens.add({
            targets: this.statusText,
            alpha: 0,
            duration: 200
        });
    }
    
    /**
     * 创建游戏结束UI
     * @param {object} stats - 游戏统计信息对象
     */
    createGameOverUI(stats) {
        const { score, level, noticeabilityData, alignmentData } = stats;
        
        // 显示游戏结束文本
        const gameOverText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 - 80, '游戏结束', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
        
        // 显示最终分数
        const finalScoreText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 - 20, `最终分数: ${score}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
        
        // 显示到达的层级
        const levelText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + 20, `到达层级: ${level}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
        
        // 初始Y偏移
        let yOffset = 60;
        
        // 根据使用的系统显示相关统计
        if (noticeabilityData) {
            // 显示显眼度统计
            const noticeText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + yOffset, 
                `最终显眼度: ${Math.floor(noticeabilityData.level)}%`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#FF5555',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
            yOffset += 30;
            
            const notificationsText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + yOffset, 
                `收集通知: ${noticeabilityData.notifications}个`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#FF9900',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
            yOffset += 30;
        } 
        else if (alignmentData) {
            // 显示路线分数
            const orderlyScoreText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + yOffset, 
                `守序分数: ${Math.floor(alignmentData.orderly)}`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#3498db',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
            yOffset += 30;
            
            const chaoticScoreText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + yOffset, 
                `混乱分数: ${Math.floor(alignmentData.chaotic)}`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#e74c3c',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setScrollFactor(0).setDepth(this.UI_LAYER);
            yOffset += 30;
        }
        
        // 添加重新开始按钮
        const restartButton = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + yOffset + 40, '重新开始', {
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
        }).setOrigin(0.5).setScrollFactor(0).setInteractive().setDepth(this.UI_LAYER);
        
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
            this.scene.scene.restart();
        });
        
        return { gameOverText, finalScoreText, levelText, restartButton };
    }
}