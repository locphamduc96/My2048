// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Block from "./Block";

export default class NewClass {
  block: cc.Node = null;
  value: number = null;

  setBlock(block: cc.Node) {
    this.block = block;
  }

  getBlock(): cc.Node {
    return this.block;
  }

  setValue(value: number) {
    this.value = value;
    if (this.block !== null) {
      this.block.getComponent("Block").value = value;
    }
  }

  getValue(): number {
    return this.value;
  }

  toStr(): string {
    if (this.block === null) {
      return "(null, null)," + this.value.toString();
    }

    return (
      "(" +
      this.block.position.x +
      ", " +
      this.block.position.y +
      ")," +
      this.value.toString()
    );
  }
}
