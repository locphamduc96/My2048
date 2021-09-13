// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Game from "./Game";

@ccclass
export default class NewClass extends cc.Component {
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.on("mousedown", () => {
      let game: Game = this.node.parent.getComponent("Game");
      game.randomNewBlock(2);
    });
  }

  start() {}

  // update (dt) {}
}
