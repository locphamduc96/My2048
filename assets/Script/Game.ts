// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Block from "./Block";
import PopupEndGame from "./PopupEndGame";

@ccclass
export default class NewClass extends cc.Component {
  //
  @property(cc.Node)
  gameLayout: cc.Node = null;

  @property(cc.Node)
  gameLayoutBackground: cc.Node = null;

  @property(cc.Node)
  popupEndGame: cc.Node = null;

  @property(cc.Prefab)
  blockBackgroundPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  blockPrefab: cc.Prefab = null;

  @property(cc.Label)
  scoreValue: cc.Label = null;

  @property(cc.Label)
  highestScoreValue: cc.Label = null;

  gameLayoutWidth: number = 4;
  gameLayoutHeight: number = 4;

  halfSizeOfGameLayout: number = 320;
  halfSizeOfBlock: number = 140 / 2;
  spaceBetween2Block: number = 16;

  startBlockX: number = 0;
  startBlockY: number = 0;

  blockArray: cc.Node[][] = null;

  countTotalNumberedBlock: number = 0;

  currentScore: number = 0;
  highestScore: number = 0;

  isDoingAction: boolean = false;

  onLoad() {
    this.startBlockX =
      -this.halfSizeOfGameLayout +
      this.spaceBetween2Block +
      this.halfSizeOfBlock;
    this.startBlockY =
      this.halfSizeOfGameLayout -
      this.spaceBetween2Block -
      this.halfSizeOfBlock;

    this.createGameBoard();

    cc.systemEvent.on(
      cc.SystemEvent.EventType.KEY_DOWN,
      this.keyInputAction,
      this
    );
  }

  start() {
    this.resetGameBoard();
    this.blockArray[0][0].getComponent("Block").value = 2;
    this.blockArray[1][0].getComponent("Block").value = 2;
    this.blockArray[3][0].getComponent("Block").value = 2;

    this.blockArray[0][3].getComponent("Block").value = 2;
    this.blockArray[3][3].getComponent("Block").value = 2;
  }

  update(dt: number) {}

  createGameBoard() {
    this.blockArray = [];
    for (let i = 0; i < this.gameLayoutWidth; i++) {
      this.blockArray[i] = [];
      for (let j = 0; j < this.gameLayoutHeight; j++) {
        let position: cc.Vec3 = this.calculatePosition(i, j);

        let backgroundBlock: cc.Node = cc.instantiate(
          this.blockBackgroundPrefab
        );
        this.gameLayoutBackground.addChild(backgroundBlock);
        backgroundBlock.setPosition(position);

        let newBlock: cc.Node = cc.instantiate(this.blockPrefab);
        this.gameLayout.addChild(newBlock);
        newBlock.setPosition(position);

        let newBlockComponent: Block = newBlock.getComponent("Block");
        newBlockComponent.position = position;
        newBlockComponent.value = 0;

        this.blockArray[i].push(newBlock);
      }
    }
  }

  resetGameBoard() {
    this.countTotalNumberedBlock = 0;

    for (let i = 0; i < this.gameLayoutWidth; i++) {
      for (let j = 0; j < this.gameLayoutHeight; j++) {
        let block: Block = this.blockArray[i][j].getComponent("Block");
        block.value = 0;
      }
    }
    // let value: number = this.randomRangeInt(1, 3) * 2;
    // this.randomNewBlock(value);
    // this.randomNewBlock(2);

    this.currentScore = 0;
    this.forceUpdateScore();
  }

  calculatePosition(_x: number, _y: number): cc.Vec3 {
    let x = this.startBlockX + _x * (140 + 16);
    let y = this.startBlockY - _y * (140 + 16);
    return new cc.Vec3(x, y, 0);
  }

  randomNewBlock(value: number): boolean {
    if (this.countTotalNumberedBlock === 16) {
      console.log("reach 16 block");
      return false;
    }

    let _x1: number = 0;
    let _y1: number = 0;
    do {
      _x1 = this.randomRangeInt(0, 4);
      _y1 = this.randomRangeInt(0, 4);
    } while (this.blockArray[_x1][_y1].getComponent("Block").value !== 0);

    let block: Block = this.blockArray[_x1][_y1].getComponent("Block");
    block.value = value;
    block.newBlockAnimation();
    this.countTotalNumberedBlock++;

    return true;
  }

  //  random from min to max -1
  randomRangeInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  touchInputAction() {}

  keyInputAction(event: any) {
    if (this.isDoingAction) {
      return;
    }

    this.isDoingAction = true;
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.handleAction(DIRECTION.LEFT);
        break;
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.handleAction(DIRECTION.RIGHT);
        break;
      case cc.macro.KEY.w:
      case cc.macro.KEY.up:
        this.handleAction(DIRECTION.UP);
        break;
      case cc.macro.KEY.s:
      case cc.macro.KEY.down:
        this.handleAction(DIRECTION.DOWN);
        break;
    }
  }

  handleAction(direction: DIRECTION) {
    let score = 0;
    switch (direction) {
      case DIRECTION.LEFT:
        score = this.moveLeft();
        break;
      case DIRECTION.RIGHT:
        score = this.moveRight();
        break;
      case DIRECTION.UP:
        score = this.moveUp();
        break;
      case DIRECTION.DOWN:
        score = this.moveDown();
        break;
    }
    this.scheduleOnce(() => {
      this.randomNewBlock(2);
    }, 0.2);

    this.updateScore(score);

    let isEndGame: boolean = this.checkEndGame();
    if (isEndGame) {
      let popup: PopupEndGame = this.popupEndGame.getComponent("PopupEndGame");
      popup.show();
    }

    this.scheduleOnce(() => {
      this.printBoard();
    }, 1);

    this.scheduleOnce(() => {
      this.isDoingAction = false;
    });
  }

  moveLeft(): number {
    let score = 0;
    for (let y: number = 0; y < this.gameLayoutHeight; y++) {
      for (let x: number = 0; x < this.gameLayoutWidth - 1; x++) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value !== 0) {
          for (let i = x + 1; i < this.gameLayoutWidth; i++) {
            let block2: Block = this.blockArray[i][y].getComponent("Block");
            if (block2.value !== 0) {
              if (block1.value === block2.value) {
                block1.updateValueAnimation();
                block2.moveAnimation2(block1.node.position);
                block1.value *= 2;
                block2.value = 0;
                score += block1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let x: number = 0; x < this.gameLayoutWidth - 1; x++) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value === 0) {
          for (let i = x + 1; i < this.gameLayoutWidth; i++) {
            let block2: Block = this.blockArray[i][y].getComponent("Block");
            if (block2.value !== 0) {
              let block1Position: cc.Vec3 = new cc.Vec3(block1.node.position);
              let block2Position: cc.Vec3 = new cc.Vec3(block2.node.position);

              block1.node.position = block2Position;
              block2.moveAnimation(block1Position);

              let tempNode: cc.Node = this.blockArray[i][y];
              this.blockArray[i][y] = this.blockArray[x][y];
              this.blockArray[x][y] = tempNode;
              break;
            }
          }
        }
      }
    }

    this.fixPositionAfterMove();
    return score;
  }

  moveRight(): number {
    let score = 0;
    for (let y: number = 0; y < this.gameLayoutHeight; y++) {
      for (let x: number = this.gameLayoutWidth - 1; x > 0; x--) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value !== 0) {
          for (let _x = x - 1; _x >= 0; _x--) {
            let block2: Block = this.blockArray[_x][y].getComponent("Block");
            if (block2.value !== 0) {
              if (block1.value === block2.value) {
                block1.updateValueAnimation();
                block2.moveAnimation2(block1.node.position);
                block1.value *= 2;
                block2.value = 0;
                score += block1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let x: number = this.gameLayoutWidth - 1; x > 0; x--) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value === 0) {
          for (let i = x - 1; i >= 0; i--) {
            let block2: Block = this.blockArray[i][y].getComponent("Block");
            if (block2.value !== 0) {
              let block1Position: cc.Vec3 = new cc.Vec3(block1.node.position);
              let block2Position: cc.Vec3 = new cc.Vec3(block2.node.position);

              block1.node.position = block2Position;
              block2.moveAnimation(block1Position);

              let tempNode: cc.Node = this.blockArray[i][y];
              this.blockArray[i][y] = this.blockArray[x][y];
              this.blockArray[x][y] = tempNode;

              break;
            }
          }
        }
      }
    }

    this.fixPositionAfterMove();
    return score;
  }

  moveUp(): number {
    let score = 0;
    for (let x: number = 0; x < this.gameLayoutWidth; x++) {
      for (let y: number = 0; y < this.gameLayoutHeight - 1; y++) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value !== 0) {
          for (let i = y + 1; i < this.gameLayoutHeight; i++) {
            let block2: Block = this.blockArray[x][i].getComponent("Block");
            if (block2.value !== 0) {
              if (block1.value === block2.value) {
                block1.updateValueAnimation();
                block2.moveAnimation2(block1.node.position);
                block1.value *= 2;
                block2.value = 0;
                score += block1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let y: number = 0; y < this.gameLayoutHeight - 1; y++) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value === 0) {
          for (let i = y + 1; i < this.gameLayoutHeight; i++) {
            let block2: Block = this.blockArray[x][i].getComponent("Block");
            if (block2.value !== 0) {
              let block1Position: cc.Vec3 = new cc.Vec3(block1.node.position);
              let block2Position: cc.Vec3 = new cc.Vec3(block2.node.position);

              block2.moveAnimation(block1Position);
              block1.node.position = block2Position;

              let tempNode: cc.Node = this.blockArray[x][i];
              this.blockArray[x][i] = this.blockArray[x][y];
              this.blockArray[x][y] = tempNode;
              break;
            }
          }
        }
      }
    }

    this.fixPositionAfterMove();
    return score;
  }

  moveDown(): number {
    let score = 0;
    for (let x: number = 0; x < this.gameLayoutHeight; x++) {
      for (let y: number = this.gameLayoutWidth - 1; y > 0; y--) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value !== 0) {
          for (let i = y - 1; i >= 0; i--) {
            let block2: Block = this.blockArray[x][i].getComponent("Block");
            if (block2.value !== 0) {
              if (block1.value === block2.value) {
                block1.updateValueAnimation();
                block2.moveAnimation2(block1.node.position);
                block1.value *= 2;
                block2.value = 0;
                score += block1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let y: number = this.gameLayoutWidth - 1; y > 0; y--) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value === 0) {
          for (let i = y - 1; i >= 0; i--) {
            let block2: Block = this.blockArray[x][i].getComponent("Block");
            if (block2.value !== 0) {
              let block1Position: cc.Vec3 = new cc.Vec3(block1.node.position);
              let block2Position: cc.Vec3 = new cc.Vec3(block2.node.position);

              block1.node.position = block2Position;
              block2.moveAnimation(block1Position);

              let tempNode: cc.Node = this.blockArray[x][i];
              this.blockArray[x][i] = this.blockArray[x][y];
              this.blockArray[x][y] = tempNode;

              break;
            }
          }
        }
      }
    }

    this.fixPositionAfterMove();
    return score;
  }

  fixPositionAfterMove() {
    this.scheduleOnce(() => {
      for (let i = 0; i < this.gameLayoutWidth; i++) {
        for (let j = 0; j < this.gameLayoutHeight; j++) {
          let currBLock: Block = this.blockArray[i][j].getComponent("Block");
          let position: cc.Vec3 = this.calculatePosition(i, j);
          currBLock.node.position = position;
        }
      }
    }, 0.1);
  }

  updateScore(value: number) {
    if (value > 0) {
      this.currentScore += value;
      cc.tween(this.scoreValue.node)
        .to(0.2, { scale: 1.2, opacity: 150, color: cc.Color.GRAY })
        .call(() => {
          this.scoreValue.string = this.currentScore.toString();
        })
        .to(0.2, { scale: 1.0, opacity: 255, color: cc.Color.BLACK })
        .start();

      if (this.highestScore < this.currentScore) {
        this.highestScore = this.currentScore;
        cc.tween(this.highestScoreValue.node)
          .to(0.2, { scale: 1.2, opacity: 150, color: cc.Color.GRAY })
          .call(() => {
            this.highestScoreValue.string = this.highestScore.toString();
          })
          .to(0.2, { scale: 1.0, opacity: 255, color: cc.Color.BLACK })
          .start();
      }
    }
  }

  forceUpdateScore() {
    cc.tween(this.scoreValue.node)
      .to(0.2, { scale: 1.2, opacity: 0, color: cc.Color.GRAY })
      .call(() => {
        this.scoreValue.string = this.currentScore.toString();
      })
      .to(0.2, { scale: 1.0, opacity: 255, color: cc.Color.BLACK })
      .start();

    if (this.highestScore < this.currentScore) {
      this.highestScore = this.currentScore;
      cc.tween(this.highestScoreValue.node)
        .to(0.2, { scale: 1.2, opacity: 0, color: cc.Color.GRAY })
        .call(() => {
          this.highestScoreValue.string = this.highestScore.toString();
        })
        .to(0.2, { scale: 1.0, opacity: 255, color: cc.Color.BLACK })
        .start();
    }
  }

  checkEndGame(): boolean {
    for (let x = 0; x < this.gameLayoutWidth; x++) {
      for (let y = 0; y < this.gameLayoutHeight; y++) {
        let block1: Block = this.blockArray[x][y].getComponent("Block");
        if (block1.value === 0) {
          return false;
        } else {
          if (x + 1 < this.gameLayoutWidth) {
            let block2: Block = this.blockArray[x + 1][y].getComponent("Block");
            if (block2.value === 0 || block2.value === block1.value) {
              return false;
            }
          }

          if (y + 1 < this.gameLayoutHeight) {
            let block3: Block = this.blockArray[x][y + 1].getComponent("Block");
            if (block3.value === 0 || block3.value === block1.value) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  printBoard() {
    console.log("--------------------------------------");
    for (let i = 0; i < 4; i++) {
      let block = this.printBlock(this.blockArray[0][i].getComponent("Block"));
      let block1 = this.printBlock(this.blockArray[1][i].getComponent("Block"));
      let block2 = this.printBlock(this.blockArray[2][i].getComponent("Block"));
      let block3 = this.printBlock(this.blockArray[3][i].getComponent("Block"));
      console.log(block, block1, block2, block3);
    }
  }

  printBlock(block: Block): string {
    return (
      "(" + block.node.x + ", " + block.node.y + "), " + block.value + "\t\t|"
    );
  }
}

enum DIRECTION {
  LEFT,
  RIGHT,
  UP,
  DOWN,
}
