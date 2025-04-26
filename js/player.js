/**
 * 玩家模块 - 处理玩家相关的状态和行为
 */
const Player = {
    // 玩家属性
    x: 150,
    y: 300,
    velocityY: 0,
    isOnGround: false,
    canJump: true,
    jumpCount: 0,
    powerupActive: false,
    lastY: 300, // 添加上一帧的Y位置，用于调试
    currentPlatform: null, // 当前站立的平台
    lastPlatformX: 0, // 上一帧平台的X位置
    
    // 初始化玩家
    init() {
        this.x = 150;
        this.y = 300;
        this.velocityY = 0;
        this.isOnGround = false;
        this.canJump = true;
        this.jumpCount = 0;
        this.powerupActive = false;
        this.currentPlatform = null;
        this.lastPlatformX = 0;
        
        // 重置玩家位置和状态
        const playerEl = document.getElementById('player');
        playerEl.style.left = this.x + 'px';
        playerEl.style.top = this.y + 'px';
        playerEl.style.transform = 'scale(1)';
        playerEl.classList.remove('jumping', 'grounded', 'falling');
        
        return this;
    },
    
    // 更新玩家位置 - 使用世界坐标系统的版本
    update(deltaTime, cameraDescentSpeed) {
        this.lastY = this.y; // 保存更新前的Y位置
        
        // 首先验证玩家是否真的站在平台上 (在每帧开始时进行验证)
        if (this.isOnGround && this.currentPlatform) {
            const playerEl = document.getElementById('player');
            
            // 使用getBoundingClientRect获取实际显示位置
            const playerRect = playerEl.getBoundingClientRect();
            const platformRect = this.currentPlatform.getBoundingClientRect();
            
            // 计算玩家底部和平台顶部的实际位置
            const playerBottom = playerRect.bottom;
            const platformTop = platformRect.top;
            
            // 如果玩家与平台之间的距离超过阈值，则认为玩家不再站在平台上
            if (Math.abs(playerBottom - platformTop) > 5) {
                console.warn(`玩家与平台脱离! 差距: ${Math.abs(playerBottom - platformTop).toFixed(2)}px`);
                this.isOnGround = false;
                this.currentPlatform = null;
            }
        }
        
        // 根据玩家状态更新位置
        if (this.isOnGround) {
            // 站在平台上时，跟随相机下降（世界坐标）
            this.y += cameraDescentSpeed * deltaTime;
            this.velocityY = 0; // 确保速度为0
            
            // 如果站在移动平台上，处理水平移动（使用世界坐标）
            if (this.currentPlatform && this.currentPlatform.classList.contains('moving-platform')) {
                try {
                    // 获取平台当前的世界位置
                    const platformCurrentX = parseFloat(this.currentPlatform.style.left);
                    
                    // 计算平台的移动差值，并应用到玩家位置
                    if (this.lastPlatformX !== undefined && this.lastPlatformX !== null) {
                        const deltaX = platformCurrentX - this.lastPlatformX;
                        this.x += deltaX;
                        console.debug(`【平台移动】平台X位置: ${platformCurrentX.toFixed(2)}, 玩家X位置更新: ${this.x.toFixed(2)}, 偏移量: ${deltaX.toFixed(2)}`);
                    }
                    
                    // 更新上一帧的平台位置
                    this.lastPlatformX = platformCurrentX;
                } catch (error) {
                    console.error("处理移动平台时出错:", error);
                }
            }
            
            console.debug(`【玩家在地面】世界Y位置: ${this.y.toFixed(2)}, 相对位置变化: +${(cameraDescentSpeed * deltaTime).toFixed(2)}, 速度Y: ${this.velocityY.toFixed(2)}`);
        } else {
            // 在空中时，受重力影响 (世界坐标)
            // 位移 = 速度 × 时间
            const gravityMovement = this.velocityY * deltaTime * 60; // 乘以60以基于帧率调整
            this.y += gravityMovement;
            
            // 额外加上相机下降速度，使玩家跟随世界滚动
            const cameraMovement = cameraDescentSpeed * deltaTime;
            this.y += cameraMovement;
            
            // 记录详细的移动信息
            console.debug(`【玩家在空中】世界Y位置: ${this.y.toFixed(2)}, 重力位移: ${gravityMovement.toFixed(2)}, 相机位移: ${cameraMovement.toFixed(2)}, 速度Y: ${this.velocityY.toFixed(2)}`);
            
            // 玩家不在平台上，重置平台相关变量
            this.currentPlatform = null;
            this.lastPlatformX = null;
        }
        
        // 更新玩家元素的位置 (使用世界坐标更新DOM)
        const playerEl = document.getElementById('player');
        playerEl.style.left = this.x + 'px';
        playerEl.style.top = this.y + 'px';
        
        // 更新玩家状态的视觉效果
        this.updateStateVisual();
    },
    
    // 更新玩家状态的视觉效果
    updateStateVisual() {
        const playerEl = document.getElementById('player');
        
        // 移除所有状态类
        playerEl.classList.remove('jumping', 'grounded', 'falling');
        
        if (this.isOnGround) {
            playerEl.classList.add('grounded');
        } else if (this.velocityY < 0) {
            playerEl.classList.add('jumping');
        } else if (this.velocityY > 0) {
            playerEl.classList.add('falling');
        }
    },
    
    // 移动玩家
    move(direction, amount) {
        if (direction === 'left') {
            this.x -= amount;
        } else if (direction === 'right') {
            this.x += amount;
        }
        
        // 应用边界限制
        Physics.checkBoundaries(this);
    },
    
    // 激活增强状态
    activatePowerup() {
        this.powerupActive = true;
        const playerEl = document.getElementById('player');
        
        // 视觉效果
        playerEl.style.transform = 'scale(1.5)';
        playerEl.style.boxShadow = '0 0 20px rgba(255,215,0,0.8)';
        playerEl.style.backgroundColor = '#FFD700';
        
        // 3秒后恢复正常
        setTimeout(() => { 
            this.powerupActive = false; 
            playerEl.style.transform = 'scale(1)';
            playerEl.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
            playerEl.style.backgroundColor = '#2196F3';
        }, 3000);
    }
};