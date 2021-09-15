// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Color from "./Color";

@ccclass
export default class NewClass extends cc.Component {
  //
  @property(cc.Layout)
  background: cc.Layout = null;

  @property(cc.Label)
  valueLabel: cc.Label = null;

  value: number = 0;

  moveAnimationDuration: number = 0.1;
  newBlockAnimationDuration: number = 0.1;
  updateValueAnimationDuration: number = 0.1;

  color1: cc.Color = new cc.Color(205, 193, 180);

  onLoad() {}

  start() {}

  update(dt: number) {
    if (this && this.value && this.value !== 0) {
      // this.node.zIndex = 40;
      this.node.opacity = 255;

      let [numberColor, backgroundColor] = this.getColorByValue(this.value);
      this.valueLabel.node.color = numberColor;
      this.valueLabel.string = this.value.toString();
      if (this.value > 100) {
        this.valueLabel.fontSize = 52;
      }
      if (this.value > 1000) {
        this.valueLabel.fontSize = 48;
      }

      this.background.node.color = backgroundColor;
    } else {
      // this.node.scale = 0;
      // this.node.zIndex = 20;
      this.valueLabel.string = "";
      this.background.node.color = this.color1;
    }
  }

  newBlockAnimation() {
    cc.tween(this.node)
      .to(this.newBlockAnimationDuration, { scale: 1.0 })
      .start();
  }

  moveAnimation(position: cc.Vec3) {
    cc.tween(this.node)
      .to(this.moveAnimationDuration, { position: position })
      .start();
  }

  moveAnimation2(position: cc.Vec3, pool: cc.NodePool) {
    cc.tween(this.node)
      .to(this.moveAnimationDuration, { position: position, opacity: 0 })
      .call(() => {
        pool.put(this.node);
      })
      .start();
  }

  updateValueAnimation() {
    cc.tween(this.node)
      .to(this.updateValueAnimationDuration, { scale: 1.1 })
      .to(this.updateValueAnimationDuration, { scale: 1.0 })
      .start();
  }

  numberColor1 = cc.Color.WHITE;
  numberColor2 = cc.Color.BLACK;

  _0: cc.Color = new cc.Color(205, 193, 180);
  _2: cc.Color = new cc.Color(238, 228, 218);
  _4: cc.Color = new cc.Color(237, 224, 200);
  _8: cc.Color = new cc.Color(242, 177, 121);
  _16: cc.Color = new cc.Color(245, 149, 99);
  _32: cc.Color = new cc.Color(246, 124, 96);
  _64: cc.Color = new cc.Color(246, 94, 59);
  _128: cc.Color = new cc.Color(237, 207, 115);
  _256: cc.Color = new cc.Color(237, 204, 98);
  _512: cc.Color = new cc.Color(237, 200, 80);
  _1024: cc.Color = new cc.Color(237, 197, 63);
  _2048: cc.Color = new cc.Color(237, 194, 45);

  getColorByValue(value: number): [cc.Color, cc.Color] {
    let numberColor: cc.Color = null;
    if (value > 4) {
      numberColor = this.numberColor1;
    } else {
      numberColor = this.numberColor2;
    }

    let backgroundColor: cc.Color = null;
    switch (value) {
      case 0:
        backgroundColor = this._0;
        break;
      case 2:
        backgroundColor = this._2;
        break;
      case 4:
        backgroundColor = this._4;
        break;
      case 8:
        backgroundColor = this._8;
        break;
      case 16:
        backgroundColor = this._16;
        break;
      case 32:
        backgroundColor = this._32;
        break;
      case 64:
        backgroundColor = this._64;
        break;
      case 128:
        backgroundColor = this._128;
        break;
      case 256:
        backgroundColor = this._256;
        break;
      case 512:
        backgroundColor = this._512;
        break;
      case 1024:
        backgroundColor = this._1024;
        break;
      default:
      case 2048:
        backgroundColor = this._2048;
        break;
    }

    return [numberColor, backgroundColor];
  }
}
