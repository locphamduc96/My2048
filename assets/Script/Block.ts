// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  //

  @property(cc.Layout)
  background: cc.Layout = null;

  @property(cc.Label)
  valueLabel: cc.Label = null;

  value: number = 0;
  position: cc.Vec3 = null;

  moveAnimationDuration: number = 0.1;
  newBlockAnimationDuration: number = 0.1;
  updateValueAnimationDuration: number = 0.1;

  color1: cc.Color = new cc.Color(205, 193, 180);

  onLoad() {
    // this.updateBlock();
  }

  start() {}

  update(dt: number) {
    if (this && this.value && this.value !== 0) {
      this.node.scale = 1;
      this.node.opacity = 255;
      this.valueLabel.string = this.value.toString();
      this.background.node.color = cc.Color.WHITE;
      if (this.value > 100) {
        this.valueLabel.fontSize = 52;
      }
      if (this.value > 1000) {
        this.valueLabel.fontSize = 48;
      }
    } else {
      this.node.scale = 0;
      this.valueLabel.string = "";
      this.background.node.color = this.color1;
    }
  }

  moveAnimation(position: cc.Vec3) {
    cc.tween(this.node)
      .to(this.moveAnimationDuration, { position: position })
      .start();
  }

  moveAnimation2(position: cc.Vec3) {
    let currentPosition: cc.Vec3 = this.node.position;
    cc.tween(this.node)
      .to(this.moveAnimationDuration, { position: position, opacity: 0 })
      .to(0, { position: currentPosition })
      .start();
  }

  newBlockAnimation() {
    cc.tween(this.node)
      .to(0, { scale: 0.5 })
      .to(this.newBlockAnimationDuration, { scale: 1 })
      .start();
  }

  updateValueAnimation() {
    cc.tween(this.node)
      .to(this.updateValueAnimationDuration, { scale: 1.1 })
      .to(this.updateValueAnimationDuration, { scale: 1.0 })
      .start();
  }
}
