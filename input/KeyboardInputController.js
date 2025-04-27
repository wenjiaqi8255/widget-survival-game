import InputController from './InputController';

class KeyboardInputController extends InputController {
  constructor() {
    super();
    this.keys = {};
  }

  initialize() {
    // 监听键盘事件
    window.addEventListener('keydown', this._handleKeyDown.bind(this));
    window.addEventListener('keyup', this._handleKeyUp.bind(this));
  }

  _handleKeyDown(e) {
    this.keys[e.code] = true;
  }

  _handleKeyUp(e) {
    this.keys[e.code] = false;
  }

  update() {
    // 在游戏循环中调用，可以在这里处理持续按键等逻辑
  }

  getInputs() {
    // 返回当前输入状态
    return {
      up: this.keys['ArrowUp'] || this.keys['KeyW'] || false,
      down: this.keys['ArrowDown'] || this.keys['KeyS'] || false,
      left: this.keys['ArrowLeft'] || this.keys['KeyA'] || false,
      right: this.keys['ArrowRight'] || this.keys['KeyD'] || false,
      action: this.keys['Space'] || false
    };
  }

  destroy() {
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
  }
}

export default KeyboardInputController;