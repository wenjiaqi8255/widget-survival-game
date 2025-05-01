/**
 * 路线追踪系统
 * 管理玩家的路线选择（守序vs混乱）及相关计数器和状态
 */
export default class AlignmentSystem {
    constructor(scene) {
        this.scene = scene;
        
        // 路线类型常量
        this.NEUTRAL = 'neutral';  // 中立
        this.ORDERLY = 'orderly';  // 守序
        this.CHAOTIC = 'chaotic';  // 混乱
        
        // 初始化路线状态
        this.currentAlignment = this.NEUTRAL;      // 当前路线
        this.alignmentStrength = 0;                // 路线强度(0-100)
        this.streakCount = 0;                      // 连续路线行为计数
        this.alignmentHistory = [];                // 最近路线行为历史
        
        // 路线分数
        this.orderlyScore = 0;                     // 守序分数
        this.chaoticScore = 0;                     // 混乱分数
        
        // 创建UI元素
        this.createUI();
    }
    
    /**
     * 创建路线系统UI
     */
    createUI() {
        // 创建路线指示器背景
        this.alignmentBg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            60,
            200,
            16,
            0x333333
        ).setScrollFactor(0).setAlpha(0.7);
        
        // 创建路线指示器填充
        this.alignmentBar = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2 - 100, // 左侧起点
            60,
            0, // 宽度初始为0
            12,
            0x888888 // 中立色
        ).setScrollFactor(0).setOrigin(0, 0.5);
        
        // 创建路线名称文本
        this.alignmentText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            80,
            '路线: 中立',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#AAAAAA',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setScrollFactor(0).setOrigin(0.5);
        
        // 创建连续计数器文本
        this.streakText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            '连续: 0',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setScrollFactor(0).setOrigin(0.5).setAlpha(0.8);
    }
    
    /**
     * 记录守序路线行为
     * @param {number} points - 行为强度点数
     */
    recordOrderlyAction(points = 1) {
        // 如果当前路线是混乱，重置连续计数
        if (this.currentAlignment === this.CHAOTIC) {
            this.streakCount = 0;
        }
        
        // 增加连续计数
        this.streakCount += (this.currentAlignment === this.ORDERLY) ? 1 : 0;
        
        // 更新路线强度
        this.alignmentStrength = Math.min(100, this.alignmentStrength + points);
        
        // 更新当前路线
        this.currentAlignment = this.ORDERLY;
        
        // 更新历史记录
        this.updateAlignmentHistory(this.ORDERLY);
        
        // 更新路线分数
        this.orderlyScore += points * (1 + this.streakCount * 0.1); // 连续行为提供额外奖励
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 记录混乱路线行为
     * @param {number} points - 行为强度点数
     */
    recordChaoticAction(points = 1) {
        // 如果当前路线是守序，重置连续计数
        if (this.currentAlignment === this.ORDERLY) {
            this.streakCount = 0;
        }
        
        // 增加连续计数
        this.streakCount += (this.currentAlignment === this.CHAOTIC) ? 1 : 0;
        
        // 更新路线强度
        this.alignmentStrength = Math.min(100, this.alignmentStrength + points);
        
        // 更新当前路线
        this.currentAlignment = this.CHAOTIC;
        
        // 更新历史记录
        this.updateAlignmentHistory(this.CHAOTIC);
        
        // 更新路线分数
        this.chaoticScore += points * (1 + this.streakCount * 0.1); // 连续行为提供额外奖励
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 记录中立行为
     */
    recordNeutralAction() {
        // 减弱当前路线强度
        this.alignmentStrength = Math.max(0, this.alignmentStrength - 5);
        
        // 如果路线强度为0，重置为中立
        if (this.alignmentStrength === 0) {
            this.currentAlignment = this.NEUTRAL;
            this.streakCount = 0;
        }
        
        // 更新历史记录
        this.updateAlignmentHistory(this.NEUTRAL);
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 更新路线历史记录
     * @param {string} alignment - 路线类型
     */
    updateAlignmentHistory(alignment) {
        // 保持最多10个历史记录
        if (this.alignmentHistory.length >= 10) {
            this.alignmentHistory.shift();
        }
        
        // 添加新记录
        this.alignmentHistory.push({
            type: alignment,
            timestamp: Date.now()
        });
    }
    
    /**
     * 获取当前主导路线
     * @returns {string} 当前主导的路线类型
     */
    getDominantAlignment() {
        return this.currentAlignment;
    }
    
    /**
     * 获取路线强度
     * @returns {number} 当前路线强度（0-100）
     */
    getAlignmentStrength() {
        return this.alignmentStrength;
    }
    
    /**
     * 获取连续行为计数
     * @returns {number} 连续同一路线行为的计数
     */
    getStreakCount() {
        return this.streakCount;
    }
    
    /**
     * 获取路线分数
     * @returns {object} 包含两种路线分数的对象
     */
    getScores() {
        return {
            orderly: this.orderlyScore,
            chaotic: this.chaoticScore,
            total: this.orderlyScore + this.chaoticScore
        };
    }
    
    /**
     * 更新UI元素
     */
    updateUI() {
        // 更新路线条位置和长度
        const barWidth = Math.min(200, this.alignmentStrength * 2); // 最大200像素宽
        this.alignmentBar.width = barWidth;
        
        // 更新条的位置和颜色
        if (this.currentAlignment === this.ORDERLY) {
            // 守序路线 - 蓝色，从左向右填充
            this.alignmentBar.fillColor = 0x3498db;
            this.alignmentBar.x = this.scene.cameras.main.width / 2 - 100;
        } else if (this.currentAlignment === this.CHAOTIC) {
            // 混乱路线 - 红色，从右向左填充
            this.alignmentBar.fillColor = 0xe74c3c;
            this.alignmentBar.x = this.scene.cameras.main.width / 2 + 100 - barWidth;
        } else {
            // 中立 - 灰色，居中填充
            this.alignmentBar.fillColor = 0x888888;
            this.alignmentBar.x = this.scene.cameras.main.width / 2 - barWidth / 2;
        }
        
        // 更新路线文本
        let alignmentName, alignmentColor;
        switch (this.currentAlignment) {
            case this.ORDERLY:
                alignmentName = '守序';
                alignmentColor = '#3498db';
                break;
            case this.CHAOTIC:
                alignmentName = '混乱';
                alignmentColor = '#e74c3c';
                break;
            default:
                alignmentName = '中立';
                alignmentColor = '#AAAAAA';
        }
        
        this.alignmentText.setText(`路线: ${alignmentName}`);
        this.alignmentText.setColor(alignmentColor);
        
        // 更新连续计数文本
        this.streakText.setText(`连续: ${this.streakCount}`);
        
        // 如果有连续计数，强调显示
        if (this.streakCount > 0) {
            this.streakText.setAlpha(1);
            // 根据连续次数调整文本大小
            const scaleFactor = Math.min(1.3, 1 + this.streakCount * 0.05);
            this.streakText.setScale(scaleFactor);
        } else {
            this.streakText.setAlpha(0.8);
            this.streakText.setScale(1);
        }
    }
}