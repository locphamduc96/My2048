// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.active = false;
    this.node.opacity = 0;
  }

  start() {}

  // update (dt) {}

  show() {
    this.node.active = true;
    cc.tween(this.node).to(1, { opacity: 255 }, { easing: "quartOut" }).start();
  }

  hide() {
    this.node.active = false;
    cc.tween(this.node).to(1, { opacity: 0 }, { easing: "quartOut" }).start();
  }
}
