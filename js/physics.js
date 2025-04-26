/**
 * 物理系统模块 - 处理重力、跳跃和碰撞检测
 */
const Physics = {
    // 物理常量
    gravity: 0.35,         // 重力加速度
    jumpForce: -12,       // 跳跃力量（负值表示向上）
    friction: 0.8,        // 摩擦力
    maxJumps: 1,          // 最大跳跃次数（1表示不允许二段跳）
    lastTimestamp: 0,     // 上一帧时间戳
    deltaTime: 0,         // 时间增量
    
    // 工具函数：将客户端坐标转换为游戏世界坐标
    convertClientToWorld(clientX, clientY) {
        // 获取滚动区域和游戏容器
        const scrollArea = document.getElementById('scroll-area');
        const gameContainer = document.getElementById('game-container');
        const gameContainerRect = gameContainer.getBoundingClientRect();
        
        // 游戏容器相对于视口的偏移
        const containerOffsetX = gameContainerRect.left;
        const containerOffsetY = gameContainerRect.top;
        
        // 计算游戏世界坐标（需考虑相机位置）
        const worldX = clientX - containerOffsetX;
        // 注意：我们的y坐标需要添加相机滚动位置
        const worldY = clientY - containerOffsetY - parseFloat(scrollArea.style.top || '0');
        
        return { x: worldX, y: worldY };
    },
    
    // 初始化
    init() {
        this.lastTimestamp = 0;
        this.deltaTime = 0;
        return this;
    },
    
    // 计算时间增量
    calculateDeltaTime(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        this.deltaTime = (timestamp - this.lastTimestamp) / 1000; // 转换为秒
        this.lastTimestamp = timestamp;
        return this.deltaTime;
    },
    
    // 应用重力 - 重构后的版本
    applyGravity(player, deltaTime, powerupActive) {
        if (!powerupActive) {
            // 只有在空中时应用重力
            if (!player.isOnGround) {
                player.velocityY += this.gravity * deltaTime;
                
                // 限制下落速度上限
                if (player.velocityY > 15) {
                    player.velocityY = 15;
                }
                
                console.debug(`【重力】速度Y: ${player.velocityY.toFixed(2)}, 增加: ${(this.gravity * deltaTime).toFixed(2)}`);
            }
        } else {
            // 增强状态下无重力
            player.velocityY = 0;
        }
    },
    
    // 执行跳跃
    jump(player) {
        if (player.isOnGround || player.jumpCount < this.maxJumps) {
            player.velocityY = this.jumpForce;
            player.jumpCount++;
            player.isOnGround = false;
            player.currentPlatform = null; // 清除当前平台引用
            
            // 跳跃的视觉反馈
            document.getElementById('player').classList.add('jumping');
            document.getElementById('player').style.transform = 'scale(0.95, 1.05)';
            setTimeout(() => {
                document.getElementById('player').style.transform = 'scale(1)';
            }, 100);
            
            console.debug(`【跳跃】玩家跳跃，初始速度Y: ${player.velocityY}`);
        }
    },
    
    // 验证玩家是否真的站在平台上（修改为使用getBoundingClientRect）
    validatePlayerOnGround(player) {
        // 如果玩家标记为在地面上但没有关联平台，状态不一致
        if (player.isOnGround && !player.currentPlatform) {
            console.warn("状态不一致：玩家标记为在地面但没有关联平台");
            player.isOnGround = false;
            return false;
        }
        
        // 如果玩家有关联平台，使用getBoundingClientRect验证位置关系
        if (player.currentPlatform) {
            const playerEl = document.getElementById('player');
            const playerRect = playerEl.getBoundingClientRect();
            const platformRect = player.currentPlatform.getBoundingClientRect();
            
            // 计算玩家底部和平台顶部的位置
            const playerBottom = playerRect.bottom;
            const platformTop = platformRect.top;
            
            // 检查玩家底部是否确实接近平台顶部（误差在5像素内）
            const onPlatform = Math.abs(playerBottom - platformTop) <= 5;
            
            // 如果不在平台上但状态是isOnGround，修正状态
            if (!onPlatform && player.isOnGround) {
                console.warn(`玩家与平台分离！玩家底部Y=${playerBottom.toFixed(2)}, 平台顶部Y=${platformTop.toFixed(2)}, 差值=${Math.abs(playerBottom - platformTop).toFixed(2)}`);
                player.isOnGround = false;
                player.currentPlatform = null;
                return false;
            }
            
            return onPlatform;
        }
        
        return player.isOnGround;
    },
    
    // 检查碰撞 - 统一入口
    checkCollisions(player, gameContainerRect, deltaTime) {
        // 首先验证玩家是否真的站在平台上
        this.validatePlayerOnGround(player);
        
        // 1. 检查平台碰撞
        this.checkPlatformCollisions(player, gameContainerRect);
        
        // 2. 应用边界限制
        this.checkBoundaries(player);
        
        // 其他碰撞检测可以在这里添加
    },
    
    // 碰撞检测 - 平台
    checkPlatformCollisions(player, gameContainerRect) {
        const wasOnGround = player.isOnGround;
        player.isOnGround = false;
        
        const playerEl = document.getElementById('player');
        const playerHeight = playerEl.offsetHeight;
        const playerWidth = playerEl.offsetWidth;
        
        // 使用玩家的世界坐标
        const playerBottom = player.y + playerHeight;
        const playerLeft = player.x;
        const playerRight = player.x + playerWidth;
        
        // 为了调试，同时获取客户端坐标
        const playerRect = playerEl.getBoundingClientRect();
        
        // 获取相机信息用于视野判断
        const scrollArea = document.getElementById('scroll-area');
        const cameraY = parseFloat(scrollArea.style.top || '0') * -1;
        const viewportHeight = gameContainerRect.height;
        
        // 检查所有UI元素（平台）
        const uiElements = document.querySelectorAll('.ui-element');
        console.debug(`检查 ${uiElements.length} 个平台元素`);
        
        let platformsChecked = 0;
        
        uiElements.forEach(uiElement => {
            // 获取平台的世界坐标
            const platformTop = parseFloat(uiElement.style.top);
            const platformLeft = parseFloat(uiElement.style.left);
            const platformHeight = uiElement.offsetHeight;
            const platformWidth = uiElement.offsetWidth;
            const platformBottom = platformTop + platformHeight;
            const platformRight = platformLeft + platformWidth;
            
            // 检查平台是否在相机视野范围内（世界坐标）
            // 平台底部在相机顶部以上 或 平台顶部在相机底部以下
            if (platformBottom < cameraY || platformTop > cameraY + viewportHeight) {
                return; // 平台不在视野范围内，跳过
            }
            
            platformsChecked++;
            
            // 详细调试输出
            console.debug(`检查平台碰撞(世界坐标) - 玩家底部Y: ${playerBottom.toFixed(2)}, 平台顶部Y: ${platformTop.toFixed(2)}`);
            console.debug(`玩家X范围: ${playerLeft.toFixed(2)}~${playerRight.toFixed(2)}, 平台X范围: ${platformLeft.toFixed(2)}~${platformRight.toFixed(2)}`);
            
            // 检查垂直位置条件 - 优化判断逻辑
            const verticalCheck = Math.abs(playerBottom - platformTop) < 5 && playerBottom >= platformTop;
            
            // 检查水平重叠条件
            const horizontalCheck = playerRight > platformLeft && playerLeft < platformRight;
            
            // 检查速度条件（只有下落或停止时才能站在平台上）
            const velocityCheck = player.velocityY >= 0;
            
            console.debug(`碰撞条件检查 - 垂直: ${verticalCheck}, 水平: ${horizontalCheck}, 速度: ${velocityCheck}`);
            
            // 检查是否从上方碰到平台（站在平台上）
            if (verticalCheck && horizontalCheck && velocityCheck) {
                // 当前和期望的玩家Y位置（用于调试）
                const currentY = player.y;
                const expectedY = platformTop - playerHeight;
                
                // 设置玩家位置，使其底部与平台顶部对齐
                player.y = expectedY;
                
                // 输出调试信息
                console.debug(`【平台碰撞】玩家落在平台上，从Y=${currentY.toFixed(2)}到Y=${expectedY.toFixed(2)}, 平台Y=${platformTop.toFixed(2)}`);
                
                player.velocityY = 0; // 重置垂直速度
                player.isOnGround = true;
                player.jumpCount = 0; // 重置跳跃次数
                
                // 存储当前平台引用，用于处理移动平台和状态验证
                player.currentPlatform = uiElement;
                
                // 如果是移动平台，记录初始X位置（这里使用世界坐标）
                if (uiElement.classList.contains('moving-platform')) {
                    player.lastPlatformX = platformLeft;
                }
                
                // 如果玩家刚刚落地，添加轻微的着陆反弹效果
                if (!wasOnGround) {
                    playerEl.style.transform = 'scale(1.1, 0.9)';
                    setTimeout(() => {
                        playerEl.style.transform = 'scale(1)';
                    }, 100);
                }
            } 
            // 其他方向的碰撞检测也采用世界坐标
            else {
                // 使用世界坐标判断是否发生碰撞
                const collided = !(
                    playerRight < platformLeft ||
                    playerLeft > platformRight ||
                    playerBottom < platformTop ||
                    player.y > platformBottom
                );
                
                if (collided && !player.powerupActive) {
                    // 计算各个方向的重叠量
                    const overlapLeft = playerRight - platformLeft;
                    const overlapRight = platformRight - playerLeft;
                    const overlapTop = playerBottom - platformTop;
                    const overlapBottom = platformBottom - player.y;
                    
                    // 找出最小重叠方向
                    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                    
                    // 根据最小重叠方向调整玩家位置
                    if (minOverlap === overlapLeft) {
                        // 从左侧碰撞
                        player.x -= overlapLeft;
                    } else if (minOverlap === overlapRight) {
                        // 从右侧碰撞
                        player.x += overlapRight;
                    } else if (minOverlap === overlapBottom) {
                        // 从下方碰撞（头顶撞到平台底部）
                        player.velocityY = 1; // 反弹一点
                    }
                }
                else if (collided && player.powerupActive) {
                    // 增强状态可以穿透UI元素
                    if (1) { // 30%几率销毁碰到的UI元素
                        uiElement.remove();
                        
                        // 添加消除动画效果
                        const dissolve = document.createElement('div');
                        dissolve.style.position = 'absolute';
                        dissolve.style.width = uiElement.style.width;
                        dissolve.style.height = uiElement.style.height;
                        dissolve.style.backgroundColor = 'rgba(255, 215, 0, 0.5)';
                        dissolve.style.borderRadius = '8px';
                        dissolve.style.left = uiElement.style.left;
                        dissolve.style.top = uiElement.style.top;
                        dissolve.style.zIndex = '15';
                        dissolve.style.animation = 'fadeOut 0.3s forwards';
                        
                        document.getElementById('scroll-area').appendChild(dissolve);
                        
                        // 0.5秒后移除消除效果
                        setTimeout(() => {
                            if (dissolve.parentNode) {
                                dissolve.parentNode.removeChild(dissolve);
                            }
                        }, 300);
                        
                        // 增加少量分数
                        Game.increaseScore(10);
                    }
                }
            }
        });
        
        console.debug(`共检查了 ${platformsChecked} 个平台, 玩家在地面: ${player.isOnGround}`);
    },
    
    // 边界检查
    checkBoundaries(player) {
        if (player.x < 0) player.x = 0;
        if (player.x > 300) player.x = 300;
        if (player.y < 0) {
            player.y = 0;
            player.velocityY = 0; // 防止顶部反弹
        }
        if (player.y > 2000) player.y = 2000; // 扩大底部边界到世界高度
    },
    
    // 检查玩家是否超出相机视野
    checkOutOfBounds(player, camera) {
        // 计算玩家相对于相机视野的位置
        const playerPosition = { x: player.x, y: player.y };
        return !camera.isInView(playerPosition);
    }
};