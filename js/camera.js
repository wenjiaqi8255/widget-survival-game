/**
 * 相机系统模块 - 控制游戏视图和自动下降
 */
const Camera = {
    // 相机属性
    position: { x: 0, y: 0 },
    viewHeight: 640, // 游戏容器高度
    descentSpeed: 2.0, // 固定下降速度
    outOfBoundsTimer: 0,
    maxOutOfBoundsTime: 3.0, // 最大视野外生存时间
    playerOutOfBounds: false, // 标记玩家是否在视野外
    
    // 初始化相机
    init() {
        // 初始化相机位置，与玩家初始位置一致
        this.position = { x: 0, y: 300 };
        this.outOfBoundsTimer = 0;
        this.playerOutOfBounds = false;
        console.log("相机初始化位置：", this.position);
        return this;
    },
    
    // 更新相机位置 - 重构后的版本，独立于玩家
    update(deltaTime, playerPosition) {
        // 相机固定下降 - 使用deltaTime保证速度一致
        this.position.y += this.descentSpeed * deltaTime;
        
        console.log(`相机位置: ${this.position.y.toFixed(2)}, 移动量: ${(this.descentSpeed * deltaTime).toFixed(2)}, 玩家位置: ${playerPosition.y.toFixed(2)}`);
        
        // 检查玩家是否在视野内
        const isPlayerVisible = this.isInView(playerPosition);
        
        // 计时器逻辑 - 玩家超出视野处理
        if (!isPlayerVisible) {
            this.outOfBoundsTimer += deltaTime;
            console.log(`警告: 玩家在视野外 ${this.outOfBoundsTimer.toFixed(1)}秒，最大允许时间: ${this.maxOutOfBoundsTime}秒`);
            
            // 更新玩家超出视野状态
            if (this.outOfBoundsTimer >= this.maxOutOfBoundsTime) {
                this.playerOutOfBounds = true;
            }
        } else {
            // 玩家回到视野内，重置计时器
            this.outOfBoundsTimer = 0;
            this.playerOutOfBounds = false;
        }
        
        return !this.playerOutOfBounds; // 返回玩家是否在允许的视野范围内
    },
    
    // 检查对象是否在相机视野内
    isInView(objectPosition) {
        // 计算相机视野边界
        const topBoundary = this.position.y - (this.viewHeight / 2);
        const bottomBoundary = this.position.y + (this.viewHeight / 2);
        
        const inView = objectPosition.y >= topBoundary && objectPosition.y <= bottomBoundary;
        
        // 调试输出
        if (!inView) {
            console.log(`玩家不在视野内! 玩家Y: ${objectPosition.y.toFixed(2)}, 相机视野: ${topBoundary.toFixed(2)}~${bottomBoundary.toFixed(2)}`);
        }
        
        return inView;
    },
    
    // 获取相机滚动偏移量 - 用于渲染
    getScrollOffset() {
        // 计算滚动偏移量，使相机中心处于屏幕中心
        return this.position.y - (this.viewHeight / 2);
    }
};