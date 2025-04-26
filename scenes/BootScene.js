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
        
        // 创建空音频键，以便稍后动态生成音效
        this.createEmptySounds();
        
        // 加载游戏音效
        this.loadSounds();
        
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
     * 在缓存中创建空的音效键，以便稍后动态生成
     */
    createEmptySounds() {
        // 创建1秒长度的静音数据作为默认音效
        const ctx = new AudioContext();
        const sampleRate = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, sampleRate * 0.1, sampleRate);
        const source = buffer.getChannelData(0);
        
        // 填充静音数据（全零）
        for (let i = 0; i < source.length; i++) {
            source[i] = 0;
        }

        // 将 AudioBuffer 转换为 ArrayBuffer
        const wavBuffer = this.audioBufferToWav(buffer);
        
        // 创建 Blob 和 base64 数据
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const silentSoundURL = URL.createObjectURL(blob);
        
        // 预加载所有需要的音效键
        this.load.audio('collect', silentSoundURL);
        this.load.audio('powerup', silentSoundURL);
        this.load.audio('hit', silentSoundURL);
        this.load.audio('notification', silentSoundURL);
        this.load.audio('levelUp', silentSoundURL);
    }
    
    /**
     * 将 AudioBuffer 转换为 WAV 格式的 ArrayBuffer
     * @param {AudioBuffer} buffer - 音频缓冲区
     * @returns {ArrayBuffer} - WAV 格式的数据
     */
    audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2;
        const sampleRate = buffer.sampleRate;
        
        const wav = new ArrayBuffer(44 + length);
        const view = new DataView(wav);
        
        // RIFF标识符
        this.writeString(view, 0, 'RIFF');
        // RIFF区块大小
        view.setUint32(4, 36 + length, true);
        // RIFF类型
        this.writeString(view, 8, 'WAVE');
        // 格式标识符
        this.writeString(view, 12, 'fmt ');
        // 格式区块大小
        view.setUint32(16, 16, true);
        // 采样格式代码
        view.setUint16(20, 1, true);
        // 声道数
        view.setUint16(22, numOfChan, true);
        // 采样率
        view.setUint32(24, sampleRate, true);
        // 每秒字节数
        view.setUint32(28, sampleRate * 2 * numOfChan, true);
        // 每采样字节数
        view.setUint16(32, numOfChan * 2, true);
        // 每样本位数
        view.setUint16(34, 16, true);
        // 数据标识符
        this.writeString(view, 36, 'data');
        // 数据区块大小
        view.setUint32(40, length, true);
        
        // 写入采样数据
        const data = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            // 将浮点值转换为16位整数
            const sample = Math.max(-1, Math.min(1, data[i]));
            const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, value, true);
            offset += 2;
        }
        
        return wav;
    }
    
    /**
     * 辅助函数：在DataView中写入字符串
     */
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    /**
     * 加载游戏音效
     * 使用Web Audio API在运行时生成音效
     */
    loadSounds() {
        // 使用Phaser内置声音库生成简单音效
        this.generateSounds();
    }
    
    /**
     * 生成基本音效
     * 使用Web Audio API在运行时生成音效
     */
    generateSounds() {
        // 收集物音效
        this.generateCollectSound();
        
        // 能力提升音效
        this.generatePowerupSound();
        
        // 碰撞音效
        this.generateHitSound();
        
        // 通知声音
        this.generateNotificationSound();
        
        // 升级音效
        this.generateLevelUpSound();
    }
    
    /**
     * 生成收集物音效
     */
    generateCollectSound() {
        const collect = this.sound.get('collect');
        if (!collect) return;
        
        // 使用Web Audio API生成简单的收集音效
        const context = this.sound.context;
        const buffer = context.createBuffer(1, context.sampleRate * 0.3, context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成上升音调的音效
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const frequency = 880 + 440 * t;
            data[i] = Math.sin(i * frequency * Math.PI * 2 / context.sampleRate) * (1 - t);
        }
        
        // 替换原始音效
        collect.source.buffer = buffer;
    }
    
    /**
     * 生成能力提升音效
     */
    generatePowerupSound() {
        const powerup = this.sound.get('powerup');
        if (!powerup) return;
        
        // 使用Web Audio API生成能力提升音效
        const context = this.sound.context;
        const buffer = context.createBuffer(1, context.sampleRate * 0.5, context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成能力提升音效
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const f1 = 220 + 880 * t;
            const f2 = 330 + 660 * t;
            data[i] = Math.sin(i * f1 * Math.PI * 2 / context.sampleRate) * 0.5 + 
                      Math.sin(i * f2 * Math.PI * 2 / context.sampleRate) * 0.5 * (1 - t);
        }
        
        // 替换原始音效
        powerup.source.buffer = buffer;
    }
    
    /**
     * 生成碰撞音效
     */
    generateHitSound() {
        const hit = this.sound.get('hit');
        if (!hit) return;
        
        // 使用Web Audio API生成碰撞音效
        const context = this.sound.context;
        const buffer = context.createBuffer(1, context.sampleRate * 0.3, context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成碰撞音效
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            data[i] = Math.random() * 2 - 1;
            data[i] *= (1 - t);
        }
        
        // 替换原始音效
        hit.source.buffer = buffer;
    }
    
    /**
     * 生成通知声音
     */
    generateNotificationSound() {
        const notification = this.sound.get('notification');
        if (!notification) return;
        
        // 使用Web Audio API生成通知音效
        const context = this.sound.context;
        const buffer = context.createBuffer(1, context.sampleRate * 0.4, context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成通知音效
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const phase = i / buffer.length * 5;
            const f = phase < 0.5 ? 440 : 880;  // 两段音调
            data[i] = Math.sin(i * f * Math.PI * 2 / context.sampleRate) * (1 - t * 0.6);
        }
        
        // 替换原始音效
        notification.source.buffer = buffer;
    }
    
    /**
     * 生成升级音效
     */
    generateLevelUpSound() {
        const levelUp = this.sound.get('levelUp');
        if (!levelUp) return;
        
        // 使用Web Audio API生成升级音效
        const context = this.sound.context;
        const buffer = context.createBuffer(1, context.sampleRate * 0.6, context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成升级音效
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const sequence = Math.floor(t * 4);  // 4个音符序列
            
            let f;
            switch (sequence) {
                case 0: f = 440; break;
                case 1: f = 554; break;
                case 2: f = 659; break;
                case 3: f = 880; break;
                default: f = 440;
            }
            
            data[i] = Math.sin(i * f * Math.PI * 2 / context.sampleRate) * 
                      (1 - Math.abs(t * 4 - Math.floor(t * 4) - 0.5) * 0.5);
        }
        
        // 替换原始音效
        levelUp.source.buffer = buffer;
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