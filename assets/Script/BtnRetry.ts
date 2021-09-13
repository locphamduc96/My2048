// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Game from "./Game";
import PopupEndGame from "./PopupEndGame";

@ccclass
export default class NewClass extends cc.Component {
  //
  @property(cc.Node)
  gameCanvas: cc.Node = null;

  @property(cc.Node)
  popupEndGame: cc.Node = null;

  onLoad() {
    this.node.on("mousedown", () => {
      let game: Game = this.gameCanvas.getComponent("Game");
      game.resetGameBoard();

      let popup: PopupEndGame = this.popupEndGame.getComponent("PopupEndGame");
      popup.hide();
    });
  }

  start() {}

  // update (dt) {}
}
