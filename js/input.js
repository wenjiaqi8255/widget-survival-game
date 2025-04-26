/**
 * 输入处理模块 - 处理键盘和触摸输入
 */
const Input = {
    // 触摸相关变量
    touchActive: false,
    lastTouchX: 0,
    lastTouchY: 0,
    touchStartTime: 0,
    
    // 初始化输入监听
    init() {
        // 键盘控制
        document.addEventListener('keydown', this.handleKeyDown);
        
        // 触摸/鼠标控制
        const playerEl = document.getElementById('player');
        playerEl.addEventListener('mousedown', this.handleTouchStart);
        playerEl.addEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('mousemove', this.handleTouchMove);
        document.addEventListener('touchmove', this.handleTouchMove);
        document.addEventListener('mouseup', this.handleTouchEnd);
        document.addEventListener('touchend', this.handleTouchEnd);
        
        // 双击跳跃
        document.getElementById('game-container').addEventListener('dblclick', (e) => {
            if (Game.isRunning) {
                Physics.jump(Player);
                e.preventDefault();
            }
        });
        
        return this;
    },
    
    // 卸载输入监听
    removeListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        const playerEl = document.getElementById('player');
        playerEl.removeEventListener('mousedown', this.handleTouchStart);
        playerEl.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('mousemove', this.handleTouchMove);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('mouseup', this.handleTouchEnd);
        document.removeEventListener('touchend', this.handleTouchEnd);
    },
    
    // 键盘输入处理
    handleKeyDown(e) {
        if (!Game.isRunning) return;
        
        if (e.key === 'ArrowLeft') {
            Player.move('left', 15);
        } else if (e.key === 'ArrowRight') {
            Player.move('right', 15);
        } else if (e.key === 'ArrowUp' || e.key === ' ') {
            // 向上键或空格键跳跃
            Physics.jump(Player);
            e.preventDefault(); // 防止空格键滚动页面
        }
    },
    
    // 触摸开始处理
    handleTouchStart(e) {
        if (!Game.isRunning) return;
        
        Input.touchActive = true;
        Input.lastTouchX = e.clientX || (e.touches && e.touches[0].clientX);
        Input.lastTouchY = e.clientY || (e.touches && e.touches[0].clientY);
        Input.touchStartTime = Date.now();
        e.preventDefault();
    },
    
    // 触摸移动处理
    handleTouchMove(e) {
        if (!Game.isRunning || !Input.touchActive) return;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (clientX === undefined || clientY === undefined) return;
        
        const deltaX = clientX - Input.lastTouchX;
        
        // 只允许左右移动，不允许通过触摸直接控制垂直位置
        Player.move(deltaX < 0 ? 'left' : 'right', Math.abs(deltaX));
        
        Input.lastTouchX = clientX;
        Input.lastTouchY = clientY;
        e.preventDefault();
    },
    
    // 触摸结束处理
    handleTouchEnd(e) {
        if (!Game.isRunning) return;
        
        // 检测快速点击（视为跳跃）
        const touchDuration = Date.now() - Input.touchStartTime;
        if (touchDuration < 200) { // 200毫秒内的点击视为跳跃
            Physics.jump(Player);
        }
        
        Input.touchActive = false;
    }
};