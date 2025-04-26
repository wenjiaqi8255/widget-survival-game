/**
 * Phaser游戏配置文件
 * 定义游戏的基本设置，如尺寸、物理引擎、渲染器等
 */
export default {
    type: Phaser.AUTO,
    width: 360,  // 与原游戏相同宽度
    height: 640, // 适合移动设备的高度
    parent: 'game-container', // 渲染到此DOM元素
    backgroundColor: '#87CEEB', // 天空蓝背景色
    pixelArt: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // 使用Phaser的物理引擎替代自定义重力
            debug: false
        }
    },
    // 定义场景，将在main.js中加载
    scene: []
};