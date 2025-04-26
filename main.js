/**
 * 游戏主入口文件
 * 导入所有场景和配置，初始化Phaser游戏
 */
// 移除模块导入，改用全局变量
// import Phaser from 'phaser';
import config from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

// 添加场景到配置
config.scene = [BootScene, MenuScene, GameScene];

// 创建游戏实例
window.addEventListener('DOMContentLoaded', () => {
    new Phaser.Game(config);
});