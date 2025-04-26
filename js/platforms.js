/**
 * 平台生成器模块 - 处理游戏平台的生成
 */
const PlatformGenerator = {
    // 平台属性
    platformTypes: ['normal', 'moving'],
    lastGeneratedY: 0,
    platformGap: 2.5, // 平台间间距
    platforms: [],
    
    // 初始化平台生成器
    init() {
        this.lastGeneratedY = 0;
        this.platforms = [];
        return this;
    },
    
    // 生成初始平台
    generateInitialPlatforms(screenHeight) {
        this.platforms = [];
        // 在视野范围内预生成几个平台
        for (let y = 0; y < screenHeight * 2; y += this.platformGap * 40) {
            const platform = this.createPlatform(y);
            this.platforms.push(platform);
            this.lastGeneratedY = y;
            
            // 创建实际的DOM元素
            this.createPlatformElement(platform);
        }
        return this.platforms;
    },
    
    // 更新平台生成
    update(cameraPosition, screenHeight) {
        // 只在需要时生成新平台
        if (this.lastGeneratedY < cameraPosition.y + screenHeight * 1.5) {
            const newPlatform = this.createPlatform(this.lastGeneratedY + this.platformGap * 40);
            this.platforms.push(newPlatform);
            this.lastGeneratedY = newPlatform.position.y;
            
            // 创建实际的DOM元素
            this.createPlatformElement(newPlatform);
            return newPlatform;
        }
        return null;
    },
    
    // 创建平台对象
    createPlatform(y) {
        // 随机选择平台类型
        const type = this.platformTypes[Math.floor(Math.random() * this.platformTypes.length)];
        
        // 在屏幕范围内随机平台宽度和位置
        const width = 80 + Math.random() * 100; // 平台宽度在80-180之间
        const x = Math.random() * (360 - width); // 确保平台不会超出屏幕
        
        return {
            type: type,
            position: { x: x, y: y },
            width: width,
            height: 20
        };
    },
    
    // 创建平台的DOM元素
    createPlatformElement(platform) {
        const scrollArea = document.getElementById('scroll-area');
        const platformEl = document.createElement('div');
        
        // 设置平台样式
        platformEl.className = 'ui-element platform-' + platform.type;
        platformEl.style.width = platform.width + 'px';
        platformEl.style.height = platform.height + 'px';
        platformEl.style.left = platform.position.x + 'px';
        platformEl.style.top = platform.position.y + 'px';
        
        // 根据类型添加额外样式
        if (platform.type === 'moving') {
            platformEl.classList.add('moving-platform');
            // 添加移动动画
            const moveDistance = 50 + Math.random() * 50;
            const animationDuration = 3 + Math.random() * 2;
            platformEl.style.animation = `movePlatform ${animationDuration}s infinite alternate ease-in-out`;
            platformEl.style.animationDelay = `${Math.random()}s`;
            
            // 添加自定义属性以供CSS动画使用
            platformEl.style.setProperty('--move-distance', `${moveDistance}px`);
        } else {
            platformEl.classList.add('normal-platform');
        }
        
        // 根据平台类型设置不同的颜色
        platformEl.style.backgroundColor = platform.type === 'normal' ? 
            'rgba(33, 150, 243, 0.8)' : 'rgba(156, 39, 176, 0.8)';
        
        scrollArea.appendChild(platformEl);
        return platformEl;
    },
    
    // 清理超出视野的平台
    cleanupPlatforms(cameraPosition, viewHeight) {
        // 保留距相机不远的平台
        const threshold = viewHeight * 1.5;
        this.platforms = this.platforms.filter(platform => {
            const distance = Math.abs(platform.position.y - cameraPosition.y);
            return distance < threshold;
        });
        
        // 清理DOM元素
        const platformEls = document.querySelectorAll('.ui-element');
        platformEls.forEach(platformEl => {
            const y = parseFloat(platformEl.style.top);
            if (Math.abs(y - cameraPosition.y) > threshold) {
                platformEl.remove();
            }
        });
    }
};