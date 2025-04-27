import KeyboardInputController from './KeyboardInputController';
import TouchInputController from './TouchInputController';

class InputManager {
  constructor() {
    this.controllers = [];
    this.inputs = {
      up: false,
      down: false,
      left: false, 
      right: false,
      action: false
    };
  }
  
  initialize() {
    // 始终添加键盘控制器
    const keyboardController = new KeyboardInputController();
    keyboardController.initialize();
    this.controllers.push(keyboardController);
    
    // 添加触摸控制器
    const touchController = new TouchInputController();
    touchController.initialize();
    this.controllers.push(touchController);
  }
  
  update() {
    // 重置输入状态
    this._resetInputs();
    
    // 合并所有控制器的输入
    for (const controller of this.controllers) {
      controller.update();
      const controllerInputs = controller.getInputs();
      
      // 任一控制器激活输入即视为激活
      for (const key in controllerInputs) {
        if (controllerInputs[key]) {
          this.inputs[key] = true;
        }
      }
    }
    
    return this.inputs;
  }
  
  _resetInputs() {
    for (const key in this.inputs) {
      this.inputs[key] = false;
    }
  }
  
  destroy() {
    for (const controller of this.controllers) {
      controller.destroy();
    }
    this.controllers = [];
  }
}

export default InputManager;