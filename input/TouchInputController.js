import InputController from './InputController.js';

class TouchInputController extends InputController {
  constructor() {
    super();
    this.touchInputs = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };
    this.touchControls = null;
  }

  initialize() {
    // 创建触摸控制UI
    this._createTouchControls();
    
    // 监听屏幕尺寸变化，调整控制器位置
    window.addEventListener('resize', this._adjustControlsPosition.bind(this));
  }

  _createTouchControls() {
    // 创建控制UI元素
    this.touchControls = document.createElement('div');
    this.touchControls.className = 'touch-controls';
    
    // 方向按钮
    const dpad = document.createElement('div');
    dpad.className = 'dpad';
    
    // 上下左右按钮
    const buttons = ['up', 'down', 'left', 'right'];
    buttons.forEach(dir => {
      const btn = document.createElement('button');
      btn.className = `btn-${dir}`;
      btn.setAttribute('data-direction', dir);
      
      // 添加触摸事件
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchInputs[dir] = true;
      });
      
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchInputs[dir] = false;
      });
      
      dpad.appendChild(btn);
    });
    
    // 动作按钮
    const actionButton = document.createElement('button');
    actionButton.className = 'btn-action';
    
    actionButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchInputs.action = true;
    });
    
    actionButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchInputs.action = false;
    });
    
    // 添加到控制器容器
    this.touchControls.appendChild(dpad);
    this.touchControls.appendChild(actionButton);
    
    // 添加到页面
    document.body.appendChild(this.touchControls);
    
    // 调整位置
    this._adjustControlsPosition();
    
    // 只在移动设备上显示
    this._showControlsOnlyOnMobile();
  }
  
  _adjustControlsPosition() {
    // 根据屏幕尺寸调整控制器位置
    if (this.touchControls) {
      // 简单实现，实际应根据游戏UI布局调整
    }
  }
  
  _showControlsOnlyOnMobile() {
    // 检测是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.touchControls.style.display = isMobile ? 'flex' : 'none';
  }

  update() {
    // 在游戏循环中调用
  }

  getInputs() {
    return this.touchInputs;
  }

  destroy() {
    // 移除事件监听
    if (this.touchControls) {
      document.body.removeChild(this.touchControls);
      window.removeEventListener('resize', this._adjustControlsPosition);
    }
  }
}

export default TouchInputController;