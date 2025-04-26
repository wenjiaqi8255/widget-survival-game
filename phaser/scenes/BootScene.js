/**
 * 启动场景
 * 负责加载游戏资源和显示启动界面
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 创建动态图形作为游戏资源
        this.createDynamicAssets();
        // 加载游戏所需资源
        // this.load.image('player', 'assets/player.png'); // 后续需创建此资源
        // this.load.image('platform', 'assets/platform.png');
        // this.load.image('collectible', 'assets/collectible.png');
        // this.load.image('obstacle', 'assets/obstacle.png');
        
        // 加载UI资源
        // this.load.image('button', 'assets/button.png');
        
        // 创建加载进度条
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 4, this.cameras.main.height / 2 - 30, this.cameras.main.width / 2, 50);
        
        // 显示加载进度
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.width / 4 + 10, this.cameras.main.height / 2 - 20, (this.cameras.main.width / 2 - 20) * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    create() {
        // 进入开始菜单场景
        this.scene.start('MenuScene');
    }
    
    /**
     * 创建动态生成的游戏资源
     * 使用Phaser的纹理管理器创建图形，无需外部图像
     */
    createDynamicAssets() {
        // 创建玩家图形
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0x2196F3);
        playerGraphics.fillRect(0, 0, 40, 60);
        playerGraphics.fillStyle(0xFFFFFF);
        playerGraphics.fillRect(10, 15, 8, 8);  // 左眼
        playerGraphics.fillRect(22, 15, 8, 8);  // 右眼
        playerGraphics.fillRect(15, 35, 10, 5); // 嘴巴
        playerGraphics.generateTexture('player', 40, 60);
        
        // 创建平台图形
        const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        platformGraphics.fillStyle(0x4CAF50);
        platformGraphics.fillRect(0, 0, 100, 20);
        platformGraphics.fillStyle(0x000000, 0.2);
        for (let i = 0; i < 5; i++) {
            platformGraphics.fillRect(i * 20 + 5, 5, 10, 2);
            platformGraphics.fillRect(i * 20, 12, 15, 2);
        }
        platformGraphics.generateTexture('platform', 100, 20);
        
        // 创建收集物图形
        const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        collectibleGraphics.fillStyle(0xFFD700);
        collectibleGraphics.beginPath();
        collectibleGraphics.arc(15, 15, 12, 0, Math.PI * 2);
        collectibleGraphics.closePath();
        collectibleGraphics.fillPath();
        
        // 添加星星效果
        collectibleGraphics.fillStyle(0xFFFFFF);
        collectibleGraphics.beginPath();
        collectibleGraphics.moveTo(15, 5);
        collectibleGraphics.lineTo(17, 12);
        collectibleGraphics.lineTo(25, 12);
        collectibleGraphics.lineTo(19, 17);
        collectibleGraphics.lineTo(21, 25);
        collectibleGraphics.lineTo(15, 20);
        collectibleGraphics.lineTo(9, 25);
        collectibleGraphics.lineTo(11, 17);
        collectibleGraphics.lineTo(5, 12);
        collectibleGraphics.lineTo(13, 12);
        collectibleGraphics.closePath();
        collectibleGraphics.fillPath();
        collectibleGraphics.generateTexture('collectible', 30, 30);
        
        // 创建障碍物图形
        const obstacleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        obstacleGraphics.fillStyle(0xF44336);
        obstacleGraphics.beginPath();
        obstacleGraphics.arc(20, 20, 10, 0, Math.PI * 2);
        obstacleGraphics.closePath();
        obstacleGraphics.fillPath();
        
        // 添加尖刺
        obstacleGraphics.lineStyle(4, 0xF44336);
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const x1 = 20 + Math.cos(angle) * 10;
            const y1 = 20 + Math.sin(angle) * 10;
            const x2 = 20 + Math.cos(angle) * 18;
            const y2 = 20 + Math.sin(angle) * 18;
            
            obstacleGraphics.beginPath();
            obstacleGraphics.moveTo(x1, y1);
            obstacleGraphics.lineTo(x2, y2);
            obstacleGraphics.closePath();
            obstacleGraphics.strokePath();
        }
        obstacleGraphics.generateTexture('obstacle', 40, 40);
        
        // 创建按钮图形
        const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        buttonGraphics.fillStyle(0x2196F3);
        buttonGraphics.fillRoundedRect(0, 0, 150, 50, 10);
        buttonGraphics.generateTexture('button', 150, 50);
    }
}