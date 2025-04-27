/**
 * 输入控制器接口
 * 定义所有输入设备必须实现的方法
 */
class InputController {
  constructor() {
    if (this.constructor === InputController) {
      throw new Error("抽象类不能被直接实例化");
    }
  }

  initialize() {
    throw new Error("必须实现initialize方法");
  }

  update() {
    throw new Error("必须实现update方法");
  }

  getInputs() {
    throw new Error("必须实现getInputs方法");
  }

  destroy() {
    throw new Error("必须实现destroy方法");
  }
}

export default InputController;