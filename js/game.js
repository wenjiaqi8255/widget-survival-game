/**
 * 游戏主控制模块 - 管理游戏状态和游戏循环
 */
const Game = {
    // 游戏状态
    isRunning: false,
    score: 0,
    animationFrameId: null,
    
    // 初始化游戏
    init() {
        // 初始化各个模块
        Player.init();
        Physics.init();
        World.init();
        Camera.init(); // 初始化相机系统
        UI.init();
        Collectibles.init();
        Obstacles.init();
        PlatformGenerator.init(); // 初始化平台生成器
        
        // 绑定方法的this
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        
        // 显示开始界面
        UI.showStartScreen();
        
        return this;
    },
    
    // 开始游戏
    start() {
        // 重置游戏状态
        this.isRunning = true;
        this.score = 0;
        
        // 初始化各个模块
        Player.init();
        World.init();
        Camera.init();
        PlatformGenerator.init();
        
        // 生成初始平台
        PlatformGenerator.generateInitialPlatforms(Camera.viewHeight);
        
        // 生成初始的收集物和障碍物
        World.generateLayerContent(1);
        
        // 更新UI
        UI.updateScore(this.score);
        UI.hideStartScreen();
        UI.hideGameOver();
        
        // 初始化输入监听
        Input.init();
        
        // 如果有正在运行的动画帧，取消它
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // 启动游戏循环
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    },
    
    // 结束游戏
    end() {
        if (!this.isRunning) return; // 防止重复调用
        
        this.isRunning = false;
        console.log("游戏结束！");
        
        // 显示游戏结束界面
        UI.showGameOver(this.score, World.currentLayer);
        
        // 取消动画帧
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },
    
    // 增加分数
    increaseScore(amount) {
        this.score += amount;
        UI.updateScore(this.score);
    },
    
    // 游戏主循环 - 重构后的版本
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // 1. 计算时间增量
        const deltaTime = Physics.calculateDeltaTime(timestamp);
        
        // 2. 获取游戏容器边界
        const gameContainerRect = document.getElementById('game-container').getBoundingClientRect();
        
        // 3. 先更新相机位置(独立于玩家)
        const playerPosition = { x: Player.x, y: Player.y };
        const playerStillInGame = Camera.update(deltaTime, playerPosition);
        
        // 如果玩家不在视野内超过最大时间，游戏结束
        if (!playerStillInGame) {
            console.log("玩家超出视野太久，游戏结束！");
            this.end();
            return;
        }
        
        // 4. 更新世界滚动位置以匹配相机
        World.updateScroll(Camera);
        
        // 5. 生成新平台并清理旧平台
        PlatformGenerator.update(Camera.position, Camera.viewHeight);
        PlatformGenerator.cleanupPlatforms(Camera.position, Camera.viewHeight);
        
        // 6. 应用重力(只在玩家在空中时)
        Physics.applyGravity(Player, deltaTime, Player.powerupActive);
        
        // 7. 更新玩家位置(考虑相机影响)
        Player.update(deltaTime, Camera.descentSpeed);
        
        // 8. 更新世界
        World.update(deltaTime);
        
        // 9. 进行碰撞检测(统一入口)
        Physics.checkCollisions(Player, gameContainerRect, deltaTime);
        
        // 10. 碰撞检测 - 收集物
        Collectibles.checkCollisions(Player, gameContainerRect);
        
        // 11. 碰撞检测 - 障碍物
        Obstacles.checkCollisions(Player, gameContainerRect);
        
        // 12. 更新调试信息显示
        UI.updateDebugInfo();
        
        // 13. 检查玩家是否掉出底部边界
        if (Player.y > Camera.position.y + Camera.viewHeight) {
            console.log("玩家掉出底部边界，游戏结束！");
            this.end();
            return;
        }
        
        // 继续游戏循环
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
};

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    Game.init();
});