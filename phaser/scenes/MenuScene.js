/**
 * 菜单场景
 * 负责显示游戏开始界面和基本选项
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // 添加背景
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x87CEEB)
            .setOrigin(0, 0);
            
        // 添加游戏标题
        this.add.text(this.cameras.main.width / 2, 150, 'Attention Game', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // 添加开始按钮
        const startButton = this.add.text(this.cameras.main.width / 2, 300, '开始游戏', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#2196F3',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // 添加按钮悬停效果
        startButton.on('pointerover', () => {
            startButton.setBackgroundColor('#1E88E5');
            startButton.setScale(1.1);
        });
        
        startButton.on('pointerout', () => {
            startButton.setBackgroundColor('#2196F3');
            startButton.setScale(1);
        });
        
        // 点击开始按钮进入游戏
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // 添加游戏说明
        this.add.text(this.cameras.main.width / 2, 400, '控制:\n← → 左右移动\n↑ 或 空格键跳跃', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}