/**
 * 资源生成器
 * 用于创建游戏所需的基本资源
 */

// 创建Canvas元素
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

// 生成玩家图像
function generatePlayerImage() {
    const canvas = createCanvas(40, 60);
    const ctx = canvas.getContext('2d');
    
    // 填充蓝色矩形作为玩家
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, 0, 40, 60);
    
    // 添加眼睛
    ctx.fillStyle = 'white';
    ctx.fillRect(10, 15, 8, 8);
    ctx.fillRect(22, 15, 8, 8);
    
    // 添加嘴巴
    ctx.fillStyle = 'white';
    ctx.fillRect(15, 35, 10, 5);
    
    return canvas.toDataURL();
}

// 生成平台图像
function generatePlatformImage() {
    const canvas = createCanvas(100, 20);
    const ctx = canvas.getContext('2d');
    
    // 绘制平台
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, 100, 20);
    
    // 添加纹理
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 20 + 5, 5, 10, 2);
        ctx.fillRect(i * 20, 12, 15, 2);
    }
    
    return canvas.toDataURL();
}

// 生成收集物图像
function generateCollectibleImage() {
    const canvas = createCanvas(30, 30);
    const ctx = canvas.getContext('2d');
    
    // 绘制圆形收集物
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(15, 15, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加星星效果
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(17, 12);
    ctx.lineTo(25, 12);
    ctx.lineTo(19, 17);
    ctx.lineTo(21, 25);
    ctx.lineTo(15, 20);
    ctx.lineTo(9, 25);
    ctx.lineTo(11, 17);
    ctx.lineTo(5, 12);
    ctx.lineTo(13, 12);
    ctx.fill();
    
    return canvas.toDataURL();
}

// 生成障碍物图像
function generateObstacleImage() {
    const canvas = createCanvas(40, 40);
    const ctx = canvas.getContext('2d');
    
    // 绘制尖刺障碍物
    ctx.fillStyle = '#F44336';
    
    // 绘制中心圆形
    ctx.beginPath();
    ctx.arc(20, 20, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制尖刺
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const x1 = 20 + Math.cos(angle) * 10;
        const y1 = 20 + Math.sin(angle) * 10;
        const x2 = 20 + Math.cos(angle) * 18;
        const y2 = 20 + Math.sin(angle) * 18;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F44336';
    ctx.stroke();
    
    return canvas.toDataURL();
}

// 生成按钮图像
function generateButtonImage() {
    const canvas = createCanvas(150, 50);
    const ctx = canvas.getContext('2d');
    
    // 绘制按钮
    ctx.fillStyle = '#2196F3';
    ctx.roundRect(0, 0, 150, 50, 10);
    ctx.fill();
    
    return canvas.toDataURL();
}

// 保存所有图像
const player = generatePlayerImage();
const platform = generatePlatformImage();
const collectible = generateCollectibleImage();
const obstacle = generateObstacleImage();
const button = generateButtonImage();

// 将图像数据打印到控制台
console.log('玩家图像:', player);
console.log('平台图像:', platform);
console.log('收集物图像:', collectible);
console.log('障碍物图像:', obstacle);
console.log('按钮图像:', button);

// 指导用户如何保存这些图像
console.log('\n将上面的Base64图像数据复制到浏览器地址栏，然后保存图像');