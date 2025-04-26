/**
 * 平台类
 * 处理平台的生成和行为
 */
export default class Platform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, isMoving = false) {
        super(scene, x, y, 'platform');
        
        // 将平台添加到场景和物理系统
        scene.add.existing(this);
        
        // 平台的物理属性设置
        // 注意：对于静态组中的对象，物理属性会在添加到组时自动设置
        // 此处无需调用scene.physics.add.existing
        
        // 设置平台大小
        const scale = isMoving ? 1.0 : Phaser.Math.FloatBetween(0.8, 1.5);
        this.setScale(scale, 0.5);
        
        // 移动平台属性
        this.isMoving = isMoving;
        if (isMoving) {
            this.direction = 1; // 1表示向右，-1表示向左
            this.moveSpeed = Phaser.Math.FloatBetween(50, 100);
            
            // 给移动平台设置特殊颜色
            this.setTint(0x00AAFF);
        }
    }
    
    /**
     * 更新平台位置（针对移动平台）
     * @param {number} delta - 帧间增量时间
     * @param {number} minX - 最小X坐标
     * @param {number} maxX - 最大X坐标
     */
    update(delta, minX, maxX) {
        if (!this.isMoving) return;
        
        // 移动平台
        const deltaSeconds = delta / 1000;
        this.x += this.moveSpeed * this.direction * deltaSeconds;
        
        // 检查边界，改变方向
        if (this.x <= minX) {
            this.x = minX;
            this.direction = 1;
        } else if (this.x >= maxX) {
            this.x = maxX;
            this.direction = -1;
        }
        
        // 更新物理体位置
        this.refreshBody();
    }
    
    /**
     * 刷新物理体位置
     * 当平台在静态组中并且位置改变时，需要调用此方法
     */
    refreshBody() {
        // 刷新静态物理体以匹配新位置
        if (this.body && this.body.position) {
            this.body.position.x = this.x - this.displayWidth / 2;
            this.body.position.y = this.y - this.displayHeight / 2;
        }
    }
}