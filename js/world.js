/**
 * 世界模块 - 管理游戏世界、滚动和层级
 */
const World = {
    // 世界属性
    scrollPosition: 0,
    currentLayer: 1,
    scrollPaused: false,
    scrollArea: null,
    
    // 初始化世界
    init() {
        this.scrollPosition = 0;
        this.currentLayer = 1;
        this.scrollPaused = false;
        this.scrollArea = document.getElementById('scroll-area');
        
        // 重置滚动区域
        this.scrollArea.style.top = '0px';
        this.scrollArea.innerHTML = '';
        
        return this;
    },
    
    // 更新世界状态
    update() {
        // 检查是否需要生成新层
        const cameraDepth = Camera.position.y;
        const previousLayer = this.currentLayer;
        
        if (cameraDepth > this.currentLayer * 500) {
            this.currentLayer++;
            UI.updateLayerIndicator(this.currentLayer);
            
            // 调整难度 - 增加相机下降速度
            Camera.descentSpeed = 2.0 + (this.currentLayer * 0.05);
            if (Camera.descentSpeed > 4.0) Camera.descentSpeed = 4.0;
            
            // 生成新一层的收集物和障碍物
            console.log(`生成第${this.currentLayer}层内容`);
            this.generateLayerContent(this.currentLayer);
        }
        
        // 定期生成额外的收集物和障碍物，使游戏更有挑战性
        if (Math.random() < 0.01) { // 1%的几率每帧生成
            const randomLayer = this.currentLayer + Math.floor(Math.random() * 2);
            this.generateRandomElements(randomLayer);
        }
    },
    
    // 更新世界滚动位置以匹配相机
    updateScroll(camera) {
        if (!this.scrollPaused) {
            // 直接使用相机的y位置来设置滚动区域的位置
            // 需要反向滚动（负值）来显示相机下方的内容
            this.scrollArea.style.top = -camera.position.y + 'px';
            
            // 保存当前滚动位置用于其他计算
            this.scrollPosition = camera.position.y;
            
            // 调试信息
            console.log(`滚动区域位置更新为: ${this.scrollArea.style.top}, 相机Y位置: ${camera.position.y}`);
        }
    },
    
    // 暂停滚动一段时间
    pauseScrolling(duration) {
        this.scrollPaused = true;
        setTimeout(() => { 
            this.scrollPaused = false; 
        }, duration);
    },
    
    // 生成层级内容 - 现在通过平台生成器和收集物/障碍物系统处理
    generateLayerContent(layer) {
        // 生成收集物
        Collectibles.generate(layer, this.scrollArea);
        
        // 生成障碍物
        Obstacles.generate(layer, this.scrollArea);
    },
    
    // 生成随机元素 - 少量收集物或障碍物
    generateRandomElements(layer) {
        // 随机决定生成收集物还是障碍物
        if (Math.random() < 0.5) {
            // 生成单个收集物
            const collectible = document.createElement('div');
            const type = Math.floor(Math.random() * 2);
            
            if (type === 0) {
                collectible.className = 'collectible colorful-block';
            } else {
                collectible.className = 'collectible notification-sound';
            }
            
            // 在相机前方生成
            collectible.style.left = Math.floor(Math.random() * 300) + 'px';
            const yPosition = Camera.position.y + Camera.viewHeight + Math.random() * 400;
            collectible.style.top = yPosition + 'px';
            
            this.scrollArea.appendChild(collectible);
        } else {
            // 生成单个障碍物
            const obstacle = document.createElement('div');
            const type = Math.floor(Math.random() * 3);
            
            if (type === 0) {
                obstacle.className = 'obstacle ad-blocker';
                obstacle.textContent = 'AD BLOCKER';
            } else if (type === 1) {
                obstacle.className = 'obstacle focus-zone';
            } else {
                obstacle.className = 'obstacle battery-warning';
                obstacle.textContent = '低电量';
            }
            
            // 在相机前方生成
            obstacle.style.left = Math.floor(Math.random() * 250) + 'px';
            const yPosition = Camera.position.y + Camera.viewHeight + Math.random() * 300;
            obstacle.style.top = yPosition + 'px';
            
            this.scrollArea.appendChild(obstacle);
        }
    },
    
    // 清除世界内容
    clear() {
        if (this.scrollArea) {
            this.scrollArea.innerHTML = '';
        }
    }
};