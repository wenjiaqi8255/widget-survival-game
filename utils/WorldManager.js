/**
 * 世界管理器
 * 负责管理游戏世界、相机和屏幕滚动相关逻辑
 */
export default class WorldManager {
    constructor(scene) {
        this.scene = scene;
        this.cameraScrollY = 0;
        this.scrollSpeed = 40;
        this.defaultScrollSpeed = 40;
        this.scrollSpeedMultiplier = 1;
        this.scrollingPaused = false;
        this.scrollPauseTimer = null;
        this.scrollSpeedTimer = null;
    }
    
    /**
     * 创建游戏世界
     */
    createWorld() {
        // 创建背景
        this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height * 2, 0x87CEEB)
            .setOrigin(0, 0)
            .setScrollFactor(0.5, 0.5); // 视差背景
    }
    
    /**
     * 设置相机和世界边界
     */
    setupCamera() {
        // 设置世界边界 - 足够大以容纳游戏内容
        this.scene.physics.world.setBounds(0, 0, this.scene.cameras.main.width, 5000);
        
        // 确保相机不超出世界边界
        this.scene.cameras.main.setBounds(
            0, 0, 
            this.scene.physics.world.bounds.width, 
            this.scene.physics.world.bounds.height
        );
    }
    
    /**
     * 更新屏幕滚动
     * @param {number} delta - 时间增量(毫秒)
     */
    updateScroll(delta) {
        if (this.scrollingPaused) return;
        
        // 根据delta计算当前帧相机应该滚动的距离
        const scrollAmount = this.scrollSpeed * this.scrollSpeedMultiplier * (delta / 1000);
        
        // 更新相机位置 - 向下滚动
        this.scene.cameras.main.scrollY += scrollAmount;
        this.cameraScrollY = this.scene.cameras.main.scrollY;
    }
    
    /**
     * 暂停屏幕滚动
     * @param {number} duration - 暂停持续时间(毫秒)
     * @returns {number} 实际暂停时间
     */
    pauseScrolling(duration = 1000) {
        if (this.scrollPauseTimer) {
            this.scrollPauseTimer.remove();
        }
        
        // 立即暂停
        this.scrollingPaused = true;
        
        // 设置计时器恢复滚动
        this.scrollPauseTimer = this.scene.time.delayedCall(duration, () => {
            this.scrollingPaused = false;
            // 发出滚动恢复事件
            if (this.scene.events) {
                this.scene.events.emit('scroll-resumed');
            }
        });
        
        // 发出滚动暂停事件
        if (this.scene.events) {
            this.scene.events.emit('scroll-paused', duration);
        }
        
        return duration;
    }
    
    /**
     * 增加屏幕滚动速度
     * @param {number} multiplier - 速度倍数
     * @param {number} duration - 持续时间(毫秒)
     */
    increaseScrollSpeed(multiplier = 1.5, duration = 5000) {
        if (this.scrollSpeedTimer) {
            this.scrollSpeedTimer.remove();
        }
        
        // 设置滚动速度倍数
        this.scrollSpeedMultiplier = multiplier;
        
        // 发出滚动速度改变事件
        if (this.scene.events) {
            this.scene.events.emit('scroll-speed-changed', multiplier);
        }
        
        // 设置计时器恢复正常速度
        this.scrollSpeedTimer = this.scene.time.delayedCall(duration, () => {
            this.scrollSpeedMultiplier = 1;
            // 发出滚动速度恢复事件
            if (this.scene.events) {
                this.scene.events.emit('scroll-speed-restored');
            }
        });
    }
    
    /**
     * 获取当前相机位置
     * @returns {number} 当前相机Y轴位置
     */
    getCameraPosition() {
        return this.cameraScrollY;
    }
    
    /**
     * 获取相机视图范围
     * @returns {object} 包含相机视图上下边界的对象
     */
    getCameraViewBounds() {
        return {
            top: this.cameraScrollY,
            bottom: this.cameraScrollY + this.scene.cameras.main.height
        };
    }
    
    /**
     * 根据相机位置计算当前层级
     * @returns {number} 当前层级
     */
    calculateLevel() {
        return Math.floor(this.cameraScrollY / 1000) + 1;
    }
    
    /**
     * 增加难度
     */
    increaseDifficulty() {
        // 随着时间推移增加难度 - 但限制最大速度
        if (this.scrollSpeed < 80) {
            this.scrollSpeed += 0.1;
            this.defaultScrollSpeed = this.scrollSpeed;
        }
    }
    
    /**
     * 设置滚动速度
     * @param {number} speed - 新的滚动速度
     */
    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
        this.defaultScrollSpeed = speed;
    }
    
    /**
     * 检查对象是否已经离开屏幕上方
     * @param {object} gameObject - 游戏对象
     * @param {number} buffer - 额外缓冲距离
     * @returns {boolean} 如果对象已经离开屏幕上方则返回true
     */
    isObjectOffScreenTop(gameObject, buffer = 200) {
        return gameObject.y < this.cameraScrollY - buffer;
    }
}