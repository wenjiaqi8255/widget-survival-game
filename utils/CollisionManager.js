/**
 * 碰撞管理器
 * 负责处理游戏中的碰撞检测和响应
 */
export default class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * 设置游戏对象之间的碰撞
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Object} entityGroups - 包含实体组的对象（平台、收集物和障碍物）
     */
    setupCollisions(player, entityGroups) {
        const { platforms, collectibles, obstacles } = entityGroups;
        
        // 玩家与平台的碰撞
        this.scene.physics.add.collider(player, platforms, this.onPlatformCollision, null, this);
        
        // 玩家与收集物的重叠
        this.scene.physics.add.overlap(player, collectibles, this.onCollectibleOverlap, null, this);
        
        // 玩家与障碍物的重叠
        this.scene.physics.add.overlap(player, obstacles, this.onObstacleOverlap, null, this);
    }
    
    /**
     * 玩家与平台碰撞的回调
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Platform} platform - 平台对象
     */
    onPlatformCollision(player, platform) {
        // 仅当玩家从上方碰到平台时进行处理
        if (player.body.velocity.y > 0 && player.y < platform.y) {
            // 发出平台碰撞事件
            this.scene.events.emit('platform-collision', player, platform);
        }
    }
    
    /**
     * 玩家与收集物重叠的回调
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Collectible} collectible - 收集物对象
     */
    onCollectibleOverlap(player, collectible) {
        // 发出收集物收集事件
        this.scene.events.emit('collectible-collected', player, collectible);
        
        // 调用收集物的效果
        collectible.applyEffect(player, this.scene);
    }
    
    /**
     * 玩家与障碍物重叠的回调
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Obstacle} obstacle - 障碍物对象
     */
    onObstacleOverlap(player, obstacle) {
        // 发出障碍物碰撞事件
        this.scene.events.emit('obstacle-hit', player, obstacle);
        
        // 调用障碍物的效果
        obstacle.applyEffect(player, this.scene);
    }
    
    /**
     * 检查玩家是否掉出屏幕
     * @param {Phaser.Physics.Arcade.Sprite} player - 玩家对象
     * @param {Object} cameraView - 相机视图范围
     * @returns {boolean} 如果玩家掉出屏幕则返回true
     */
    checkPlayerOutOfBounds(player, cameraView) {
        // 检查玩家是否掉出屏幕底部
        if (player.y > cameraView.bottom + 100) {
            // 发出玩家掉出屏幕事件
            this.scene.events.emit('player-out-of-bounds');
            return true;
        }
        
        // 确保玩家不会超出相机顶部
        const cameraTop = cameraView.top;
        if (player.y < cameraTop - 50) {
            player.y = cameraTop - 50;
            player.body.velocity.y = 0;
        }
        
        return false;
    }
}