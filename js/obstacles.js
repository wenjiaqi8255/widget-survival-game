/**
 * 障碍物模块 - 处理游戏中的各种障碍物
 */
const Obstacles = {
    // 初始化
    init() {
        return this;
    },
    
    // 检查障碍物碰撞
    checkCollisions(player, gameContainerRect) {
        const playerEl = document.getElementById('player');
        const playerRect = playerEl.getBoundingClientRect();
        
        // 障碍物碰撞检测
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            
            // 检查是否在游戏容器可见范围内
            if (obstacleRect.bottom < gameContainerRect.top || 
                obstacleRect.top > gameContainerRect.bottom) {
                return; // 不在可见范围内，跳过
            }
            
            // 使用getBoundingClientRect获取的实际位置进行碰撞检测
            const collided = !(
                playerRect.right < obstacleRect.left ||
                playerRect.left > obstacleRect.right ||
                playerRect.bottom < obstacleRect.top ||
                playerRect.top > obstacleRect.bottom
            );
            
            if (collided) {
                if (player.powerupActive) {
                    // 增强状态时，消除所有碰到的障碍物
                    obstacle.remove();
                    
                    // 添加爆炸动画效果
                    this.createExplosionEffect(obstacle);
                    
                    // 增加分数
                    Game.increaseScore(50);
                } else {
                    // 非增强状态下的障碍物效果
                    if (obstacle.classList.contains('ad-blocker')) {
                        // 广告拦截器直接结束游戏
                        Game.end();
                        return;
                    } else if (obstacle.classList.contains('focus-zone')) {
                        // 减慢玩家速度
                        playerEl.style.transition = 'left 0.5s ease, top 0.5s ease';
                        setTimeout(() => {
                            playerEl.style.transition = 'left 0.1s ease, top 0.1s ease';
                        }, 2000);
                    } else if (obstacle.classList.contains('battery-warning')) {
                        // 临时加快滚动速度
                        const originalSpeed = World.scrollSpeed;
                        World.scrollSpeed *= 2;
                        setTimeout(() => {
                            World.scrollSpeed = originalSpeed;
                        }, 3000);
                    }
                    
                    // 移除障碍物 (只有对于focus-zone和battery-warning)
                    if (!obstacle.classList.contains('ad-blocker')) {
                        obstacle.remove();
                    }
                }
            }
        });
    },
    
    // 创建爆炸动画效果
    createExplosionEffect(obstacle) {
        const explosion = document.createElement('div');
        explosion.style.position = 'absolute';
        explosion.style.width = '50px';
        explosion.style.height = '50px';
        explosion.style.backgroundColor = 'rgba(255, 215, 0, 0.7)';
        explosion.style.borderRadius = '50%';
        explosion.style.left = obstacle.style.left;
        explosion.style.top = obstacle.style.top;
        explosion.style.zIndex = '25';
        explosion.style.animation = 'explode 0.5s forwards';
        
        document.getElementById('scroll-area').appendChild(explosion);
        
        // 0.5秒后移除爆炸效果
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 500);
    },
    
    // 生成障碍物
    generate(layer, scrollArea) {
        // 生成障碍物 - 确保它们不会在玩家初始位置附近生成
        for (let i = 0; i < 3 + Math.floor(layer / 5); i++) {
            const obstacle = document.createElement('div');
            const type = Math.floor(Math.random() * 3);
            
            let obstacleX = Math.floor(Math.random() * 250);
            let obstacleY = Math.floor(Math.random() * 1600) + 400; // 确保不在初始屏幕上
            
            if (type === 0) {
                obstacle.className = 'obstacle ad-blocker';
                obstacle.textContent = 'AD BLOCKER';
            } else if (type === 1) {
                obstacle.className = 'obstacle focus-zone';
            } else {
                obstacle.className = 'obstacle battery-warning';
                obstacle.textContent = '低电量';
            }
            
            obstacle.style.left = obstacleX + 'px';
            obstacle.style.top = obstacleY + 'px';
            scrollArea.appendChild(obstacle);
        }
    }
};