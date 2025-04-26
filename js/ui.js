/**
 * UI模块 - 管理游戏界面元素
 */
const UI = {
    // UI元素引用
    scoreDisplay: null,
    layerIndicator: null,
    gameOverScreen: null,
    startScreen: null,
    finalScore: null,
    maxDepth: null,
    debugPanel: null,
    
    // 初始化UI
    init() {
        // 获取UI元素
        this.scoreDisplay = document.querySelector('.score-display');
        this.layerIndicator = document.querySelector('.layer-indicator');
        this.gameOverScreen = document.getElementById('game-over');
        this.startScreen = document.getElementById('start-screen');
        this.finalScore = document.getElementById('final-score');
        this.maxDepth = document.getElementById('max-depth');
        
        // 添加调试信息显示（仅在开发模式下）
        this.createDebugDisplay();
        
        // 设置按钮事件监听 - 确保正确绑定Game对象的this上下文
        document.getElementById('start-btn').addEventListener('click', function() {
            Game.start.call(Game);
        });
        document.getElementById('restart-btn').addEventListener('click', function() {
            Game.start.call(Game);
        });
        
        // 更新初始显示
        this.updateScore(0);
        this.updateLayerIndicator(1);
        
        return this;
    },
    
    // 显示开始界面
    showStartScreen() {
        this.startScreen.style.display = 'flex';
        this.gameOverScreen.style.display = 'none';
    },
    
    // 隐藏开始界面
    hideStartScreen() {
        this.startScreen.style.display = 'none';
    },
    
    // 显示游戏结束界面
    showGameOver(score, maxLayer) {
        this.gameOverScreen.style.display = 'flex';
        this.finalScore.textContent = score;
        this.maxDepth.textContent = maxLayer;
    },
    
    // 隐藏游戏结束界面
    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
    },
    
    // 更新分数显示
    updateScore(score) {
        this.scoreDisplay.textContent = '分数: ' + score;
    },
    
    // 更新层级显示
    updateLayerIndicator(layer) {
        this.layerIndicator.textContent = '层级: ' + layer;
    },
    
    // 创建调试信息显示（辅助调试坐标系统）
    createDebugDisplay() {
        // 创建调试面板
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.position = 'absolute';
        debugPanel.style.top = '60px';
        debugPanel.style.left = '10px';
        debugPanel.style.background = 'rgba(0,0,0,0.7)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '5px';
        debugPanel.style.fontSize = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.zIndex = '100';
        debugPanel.style.display = 'none'; // 默认隐藏
        
        // 添加切换按钮
        const toggleButton = document.createElement('button');
        toggleButton.id = 'debug-toggle';
        toggleButton.textContent = 'D';
        toggleButton.style.position = 'absolute';
        toggleButton.style.top = '10px';
        toggleButton.style.right = '10px';
        toggleButton.style.width = '20px';
        toggleButton.style.height = '20px';
        toggleButton.style.fontSize = '10px';
        toggleButton.style.background = '#333';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.zIndex = '100';
        toggleButton.addEventListener('click', () => {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('game-container').appendChild(debugPanel);
        document.getElementById('game-container').appendChild(toggleButton);
        
        // 保存引用
        this.debugPanel = debugPanel;
    },
    
    // 更新调试信息（在游戏循环中调用）
    updateDebugInfo() {
        if (this.debugPanel && this.debugPanel.style.display !== 'none') {
            const player = Player;
            const playerEl = document.getElementById('player');
            const playerRect = playerEl.getBoundingClientRect();
            
            // 获取相关坐标信息
            const worldCoords = `世界: X=${player.x.toFixed(0)}, Y=${player.y.toFixed(0)}`;
            const clientCoords = `客户端: X=${playerRect.left.toFixed(0)}, Y=${playerRect.top.toFixed(0)}`;
            
            // 平台信息
            let platformInfo = '无平台';
            if (player.currentPlatform) {
                const platformRect = player.currentPlatform.getBoundingClientRect();
                const platformTop = parseFloat(player.currentPlatform.style.top);
                platformInfo = `平台: 客户端Y=${platformRect.top.toFixed(0)}, 世界Y=${platformTop.toFixed(0)}`;
            }
            
            // 更新调试面板
            this.debugPanel.innerHTML = `
                ${worldCoords}<br>
                ${clientCoords}<br>
                ${platformInfo}<br>
                地面: ${player.isOnGround ? '是' : '否'}<br>
                速度Y: ${player.velocityY.toFixed(1)}
            `;
        }
    },
};