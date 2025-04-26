// 创建简单的矩形图像 - 玩家
const playerCanvas = document.createElement('canvas');
playerCanvas.width = 40;
playerCanvas.height = 60;
const playerCtx = playerCanvas.getContext('2d');
playerCtx.fillStyle = '#2196F3';
playerCtx.fillRect(0, 0, 40, 60);

// 创建简单的矩形图像 - 平台
const platformCanvas = document.createElement('canvas');
platformCanvas.width = 100;
platformCanvas.height = 20;
const platformCtx = platformCanvas.getContext('2d');
platformCtx.fillStyle = '#4CAF50';
platformCtx.fillRect(0, 0, 100, 20);

// 创建简单的圆形图像 - 收集物
const collectibleCanvas = document.createElement('canvas');
collectibleCanvas.width = 30;
collectibleCanvas.height = 30;
const collectibleCtx = collectibleCanvas.getContext('2d');
collectibleCtx.fillStyle = '#FFD700';
collectibleCtx.beginPath();
collectibleCtx.arc(15, 15, 12, 0, Math.PI * 2);
collectibleCtx.fill();

// 创建简单的矩形图像 - 障碍物
const obstacleCanvas = document.createElement('canvas');
obstacleCanvas.width = 40;
obstacleCanvas.height = 40;
const obstacleCtx = obstacleCanvas.getContext('2d');
obstacleCtx.fillStyle = '#F44336';
obstacleCtx.beginPath();
obstacleCtx.arc(20, 20, 18, 0, Math.PI * 2);
obstacleCtx.fill();

// 将图像导出为数据URL
console.log('player.png:', playerCanvas.toDataURL());
console.log('platform.png:', platformCanvas.toDataURL());
console.log('collectible.png:', collectibleCanvas.toDataURL());
console.log('obstacle.png:', obstacleCanvas.toDataURL());