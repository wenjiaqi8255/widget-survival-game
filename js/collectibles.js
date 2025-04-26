/**
 * 收集物模块 - 处理游戏中的收集物和道具
 */
const Collectibles = {
    // 初始化
    init() {
        return this;
    },
    
    // 检查收集物碰撞
    checkCollisions(player, gameContainerRect) {
        const playerEl = document.getElementById('player');
        const playerRect = playerEl.getBoundingClientRect();
        
        // 碰撞检测 - 收集物
        const collectibles = document.querySelectorAll('.collectible');
        collectibles.forEach(collectible => {
            const collectRect = collectible.getBoundingClientRect();
            
            // 检查是否在游戏容器可见范围内
            if (collectRect.bottom < gameContainerRect.top || 
                collectRect.top > gameContainerRect.bottom) {
                return; // 不在可见范围内，跳过
            }
            
            // 使用getBoundingClientRect获取的实际位置进行碰撞检测
            const collided = !(
                playerRect.right < collectRect.left ||
                playerRect.left > collectRect.right ||
                playerRect.bottom < collectRect.top ||
                playerRect.top > collectRect.bottom
            );
            
            if (collided) {
                // 收集效果
                if (collectible.classList.contains('colorful-block')) {
                    // 增强状态 - 无敌状态，消除所有碰到的障碍物，取消重力
                    Player.activatePowerup();
                } else if (collectible.classList.contains('notification-sound')) {
                    // 暂停滚动
                    World.pauseScrolling(2000); // 暂停2秒
                }
                
                // 增加分数并移除收集物
                Game.increaseScore(100);
                collectible.remove();
            }
        });
    },
    
    // 生成收集物
    generate(layer, scrollArea) {
        // 生成收集物 - 只生成彩色方块和通知声音
        for (let i = 0; i < 5 + Math.floor(layer / 10); i++) {
            const collectible = document.createElement('div');
            const type = Math.floor(Math.random() * 2); // 只有两种类型
            
            if (type === 0) {
                collectible.className = 'collectible colorful-block';
            } else {
                collectible.className = 'collectible notification-sound';
            }
            
            collectible.style.left = Math.floor(Math.random() * 300) + 'px';
            collectible.style.top = Math.floor(Math.random() * 1800) + 100 + 'px';
            scrollArea.appendChild(collectible);
        }
    }
};