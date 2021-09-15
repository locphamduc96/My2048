// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Block from "./Block";
import BlockWrap from "./BlockWrap";
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

  blockPool = null;

  gameLayoutWidth: number = 4;
  gameLayoutHeight: number = 4;

  halfSizeOfGameLayout: number = 320;
  halfSizeOfBlock: number = 140 / 2;
  spaceBetween2Block: number = 16;

  startBlockX: number = 0;
  startBlockY: number = 0;

  blockArray: BlockWrap[][] = null;

  countTotalNumberedBlock: number = 0;

  currentScore: number = 0;
  highestScore: number = 0;

  isDoingAction: boolean = false;

  startTouchPos: cc.Vec2 = null;

  // textColor: cc.Color = new cc.Color(119, 110, 101);

  onLoad() {
    this.blockPool = new cc.NodePool();

    for (let i = 0; i < this.gameLayoutWidth * this.gameLayoutHeight; i++) {
      let block = cc.instantiate(this.blockPrefab);
      this.blockPool.put(block);
    }

    this.startBlockX =
      -this.halfSizeOfGameLayout +
      this.spaceBetween2Block +
      this.halfSizeOfBlock;
    this.startBlockY =
      this.halfSizeOfGameLayout -
      this.spaceBetween2Block -
      this.halfSizeOfBlock;

    this.createGameBoard();

    this.enableTouch();

    cc.systemEvent.on(
      cc.SystemEvent.EventType.KEY_DOWN,
      this.keyInputAction,
      this
    );
  }

  start() {
    this.resetGameBoard();
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

        let newBlockWrap = new BlockWrap();
        newBlockWrap.setValue(0);
        this.blockArray[i].push(newBlockWrap);
      }
    }

    console.log(this.blockArray);
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

    let i: number = 0;
    let j: number = 0;
    do {
      i = this.randomRangeInt(0, 4);
      j = this.randomRangeInt(0, 4);
    } while (this.blockArray[i][j].value !== 0);

    let blockWrap: BlockWrap = this.blockArray[i][j];
    let block: cc.Node = this.blockPool.get();
    let blockCpn: Block = block.getComponent("Block");

    let position: cc.Vec3 = this.calculatePosition(i, j);
    block.position = position;
    blockCpn.value = value;
    this.gameLayout.addChild(block);

    blockWrap.block = block;
    blockWrap.value = value;

    block.scale = 0;
    block.getComponent("Block").newBlockAnimation();

    this.countTotalNumberedBlock++;

    return true;
  }

  // newBlock(i: number, j: number, value: number): boolean {
  //   if (this.countTotalNumberedBlock === 16) {
  //     console.log("reach 16 block");
  //     return false;
  //   }

  //   let blockWrap: BlockWrap = this.blockArray[i][j];
  //   let block: cc.Node = this.blockPool.get();
  //   let blockCpn: Block = block.getComponent("Block");

  //   let position: cc.Vec3 = this.calculatePosition(i, j);
  //   block.position = position;
  //   blockCpn.value = value;
  //   this.gameLayout.addChild(block);

  //   blockWrap.block = block;
  //   blockWrap.value = value;

  //   this.countTotalNumberedBlock++;

  //   return true;
  // }

  resetGameBoard() {
    this.countTotalNumberedBlock = 0;

    for (let i = 0; i < this.gameLayoutWidth; i++) {
      for (let j = 0; j < this.gameLayoutHeight; j++) {
        let blockWrap: BlockWrap = this.blockArray[i][j];
        if (blockWrap.block !== null) {
          this.blockPool.put(blockWrap.block);
        }
        blockWrap.value = 0;
      }
    }
    let value: number = this.randomRangeInt(1, 3) * 2;
    this.randomNewBlock(value);
    this.randomNewBlock(2);

    this.currentScore = 0;
    this.forceUpdateScore();
  }

  enableTouch() {
    console.log("enableTouch");
    this.gameLayout.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.gameLayout.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  disableTouch() {
    this.gameLayoutBackground.off(
      cc.Node.EventType.TOUCH_START,
      this.onTouchStart,
      this
    );
    this.gameLayoutBackground.off(
      cc.Node.EventType.TOUCH_END,
      this.onTouchEnd,
      this
    );
  }

  onTouchStart(event: cc.Touch): void {
    console.log(event.getLocation());
    this.startTouchPos = event.getLocation();
  }

  onTouchEnd(event: cc.Touch): void {
    if (this.isDoingAction) {
      return;
    }

    this.isDoingAction = true;
    let endPos = event.getLocation();
    let deltaX = endPos.x - this.startTouchPos.x;
    let deltaY = endPos.y - this.startTouchPos.y;
    let offset = 100;
    if (Math.abs(deltaX) < offset && Math.abs(deltaY) < offset) {
      this.isDoingAction = false;
      return;
    }

    let direction: DIRECTION;
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      direction = deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    } else {
      direction = deltaY > 0 ? DIRECTION.UP : DIRECTION.DOWN;
    }
    this.handleAction(direction);

    this.isDoingAction = false;
  }

  keyInputAction(event: any): void {
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
    this.isDoingAction = false;
  }

  handleAction(direction: DIRECTION): void {
    let score = 0;

    switch (direction) {
      case DIRECTION.LEFT:
        if (!this.canMoveLeft()) {
          return;
        }
        score = this.moveLeft();
        break;
      case DIRECTION.RIGHT:
        if (!this.canMoveRight()) {
          return;
        }
        score = this.moveRight();
        break;
      case DIRECTION.UP:
        if (!this.canMoveUp()) {
          return;
        }
        score = this.moveUp();
        break;
      case DIRECTION.DOWN:
        if (!this.canMoveDown()) {
          return;
        }
        score = this.moveDown();
        break;
    }

    this.updateScore(score);

    this.scheduleOnce(() => {
      this.randomNewBlock(2);
      let isEndGame: boolean = this.checkEndGame();
      console.log(isEndGame);
      if (isEndGame) {
        let popup: PopupEndGame =
          this.popupEndGame.getComponent("PopupEndGame");
        popup.show();
      }
    }, 0.2);

    this.scheduleOnce(() => {
      this.printBoard();
    }, 1);
  }

  canMoveLeft(): boolean {
    for (let y: number = 0; y < this.gameLayoutHeight; y++) {
      for (let x: number = 0; x < this.gameLayoutWidth - 1; x++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        let blockWrap2: BlockWrap = this.blockArray[x + 1][y];
        if (
          (blockWrap1.value === 0 && blockWrap2.value !== 0) ||
          (blockWrap1.value !== 0 && blockWrap1.value === blockWrap2.value)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  canMoveRight() {
    for (let y: number = 0; y < this.gameLayoutHeight; y++) {
      for (let x: number = this.gameLayoutWidth - 1; x > 0; x--) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        let blockWrap2: BlockWrap = this.blockArray[x - 1][y];
        if (
          (blockWrap1.value === 0 && blockWrap2.value !== 0) ||
          (blockWrap1.value !== 0 && blockWrap1.value === blockWrap2.value)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  canMoveUp() {
    for (let x: number = 0; x < this.gameLayoutHeight; x++) {
      for (let y: number = 0; y < this.gameLayoutWidth - 1; y++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        let blockWrap2: BlockWrap = this.blockArray[x][y + 1];
        if (
          (blockWrap1.value === 0 && blockWrap2.value !== 0) ||
          (blockWrap1.value !== 0 && blockWrap1.value === blockWrap2.value)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  canMoveDown() {
    for (let x: number = 0; x < this.gameLayoutHeight; x++) {
      for (let y: number = this.gameLayoutWidth - 1; y > 0; y--) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        let blockWrap2: BlockWrap = this.blockArray[x][y - 1];
        if (
          (blockWrap1.value === 0 && blockWrap2.value !== 0) ||
          (blockWrap1.value !== 0 && blockWrap1.value === blockWrap2.value)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  moveLeft(): number {
    let score = 0;
    for (let y: number = 0; y < this.gameLayoutHeight; y++) {
      for (let x: number = 0; x < this.gameLayoutWidth - 1; x++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value !== 0) {
          for (let i = x + 1; i < this.gameLayoutWidth; i++) {
            let blockWrap2: BlockWrap = this.blockArray[i][y];
            if (blockWrap2.value !== 0) {
              if (blockWrap1.value === blockWrap2.value) {
                blockWrap1
                  .getBlock()
                  .getComponent("Block")
                  .updateValueAnimation();
                blockWrap2
                  .getBlock()
                  .getComponent("Block")
                  .moveAnimation2(blockWrap1.block.position, this.blockPool);

                blockWrap1.setValue(blockWrap1.getValue() * 2);
                blockWrap2.setValue(0);
                score += blockWrap1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let x: number = 0; x < this.gameLayoutWidth - 1; x++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value === 0) {
          for (let i = x + 1; i < this.gameLayoutWidth; i++) {
            let blockWrap2: BlockWrap = this.blockArray[i][y];
            if (blockWrap2.value !== 0) {
              let block1Position: cc.Vec3 = this.calculatePosition(x, y);

              blockWrap2.block
                .getComponent("Block")
                .moveAnimation(block1Position);

              this.blockArray[x][y].block = this.blockArray[i][y].block;
              this.blockArray[x][y].value = this.blockArray[i][y].value;
              this.blockArray[i][y].block = null;
              this.blockArray[i][y].value = 0;

              break;
            }
          }
        }
      }
    }

    return score;
  }

  moveRight(): number {
    let score = 0;
    for (let y: number = 0; y < this.gameLayoutHeight; y++) {
      for (let x: number = this.gameLayoutWidth - 1; x > 0; x--) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value !== 0) {
          for (let i = x - 1; i >= 0; i--) {
            let blockWrap2: BlockWrap = this.blockArray[i][y];
            if (blockWrap2.value !== 0) {
              if (blockWrap1.value === blockWrap2.value) {
                blockWrap1
                  .getBlock()
                  .getComponent("Block")
                  .updateValueAnimation();
                blockWrap2
                  .getBlock()
                  .getComponent("Block")
                  .moveAnimation2(blockWrap1.block.position, this.blockPool);

                blockWrap1.setValue(blockWrap1.getValue() * 2);
                blockWrap2.setValue(0);
                score += blockWrap1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let x: number = this.gameLayoutWidth - 1; x > 0; x--) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value === 0) {
          for (let i = x - 1; i >= 0; i--) {
            let blockWrap2: BlockWrap = this.blockArray[i][y];
            if (blockWrap2.value !== 0) {
              let block1Position: cc.Vec3 = this.calculatePosition(x, y);

              blockWrap2.block
                .getComponent("Block")
                .moveAnimation(block1Position);

              this.blockArray[x][y].block = this.blockArray[i][y].block;
              this.blockArray[x][y].value = this.blockArray[i][y].value;
              this.blockArray[i][y].block = null;
              this.blockArray[i][y].value = 0;

              break;
            }
          }
        }
      }
    }

    return score;
  }

  moveUp(): number {
    let score = 0;
    for (let x: number = 0; x < this.gameLayoutWidth; x++) {
      for (let y: number = 0; y < this.gameLayoutHeight - 1; y++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value !== 0) {
          for (let i = y + 1; i < this.gameLayoutHeight; i++) {
            let blockWrap2: BlockWrap = this.blockArray[x][i];
            if (blockWrap2.value !== 0) {
              if (blockWrap1.value === blockWrap2.value) {
                blockWrap1
                  .getBlock()
                  .getComponent("Block")
                  .updateValueAnimation();
                blockWrap2
                  .getBlock()
                  .getComponent("Block")
                  .moveAnimation2(blockWrap1.block.position, this.blockPool);

                blockWrap1.setValue(blockWrap1.getValue() * 2);
                blockWrap2.setValue(0);
                score += blockWrap1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let y: number = 0; y < this.gameLayoutHeight - 1; y++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value === 0) {
          for (let i = y + 1; i < this.gameLayoutHeight; i++) {
            let blockWrap2: BlockWrap = this.blockArray[x][i];
            if (blockWrap2.value !== 0) {
              let block1Position: cc.Vec3 = this.calculatePosition(x, y);

              blockWrap2.block
                .getComponent("Block")
                .moveAnimation(block1Position);

              this.blockArray[x][y].block = this.blockArray[x][i].block;
              this.blockArray[x][y].value = this.blockArray[x][i].value;
              this.blockArray[x][i].block = null;
              this.blockArray[x][i].value = 0;

              break;
            }
          }
        }
      }
    }

    return score;
  }

  moveDown(): number {
    let score = 0;
    for (let x: number = 0; x < this.gameLayoutHeight; x++) {
      for (let y: number = this.gameLayoutWidth - 1; y > 0; y--) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value !== 0) {
          for (let i = y - 1; i >= 0; i--) {
            let blockWrap2: BlockWrap = this.blockArray[x][i];
            if (blockWrap2.value !== 0) {
              if (blockWrap1.value === blockWrap2.value) {
                blockWrap1
                  .getBlock()
                  .getComponent("Block")
                  .updateValueAnimation();
                blockWrap2
                  .getBlock()
                  .getComponent("Block")
                  .moveAnimation2(blockWrap1.block.position, this.blockPool);

                blockWrap1.setValue(blockWrap1.getValue() * 2);
                blockWrap2.setValue(0);
                score += blockWrap1.value;
                this.countTotalNumberedBlock--;
              }
              break;
            }
          }
        }
      }

      for (let y: number = this.gameLayoutWidth - 1; y > 0; y--) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value === 0) {
          for (let i = y - 1; i >= 0; i--) {
            let blockWrap2: BlockWrap = this.blockArray[x][i];
            if (blockWrap2.value !== 0) {
              let block1Position: cc.Vec3 = this.calculatePosition(x, y);

              blockWrap2.block
                .getComponent("Block")
                .moveAnimation(block1Position);

              this.blockArray[x][y].block = this.blockArray[x][i].block;
              this.blockArray[x][y].value = this.blockArray[x][i].value;
              this.blockArray[x][i].block = null;
              this.blockArray[x][i].value = 0;

              break;
            }
          }
        }
      }
    }

    return score;
  }

  updateScore(value: number) {
    if (value > 0) {
      this.currentScore += value;
      cc.tween(this.scoreValue.node)
        .to(0.2, { scale: 1.2, opacity: 150 })
        .call(() => {
          this.scoreValue.string = this.currentScore.toString();
        })
        .to(0.2, { scale: 1.0, opacity: 255 })
        .start();

      if (this.highestScore < this.currentScore) {
        this.highestScore = this.currentScore;
        cc.tween(this.highestScoreValue.node)
          .to(0.2, { scale: 1.2, opacity: 150 })
          .call(() => {
            this.highestScoreValue.string = this.highestScore.toString();
          })
          .to(0.2, { scale: 1.0, opacity: 255 })
          .start();
      }
    }
  }

  forceUpdateScore() {
    cc.tween(this.scoreValue.node)
      .to(0.2, { scale: 1.2, opacity: 150 })
      .call(() => {
        this.scoreValue.string = this.currentScore.toString();
      })
      .to(0.2, { scale: 1.0, opacity: 255 })
      .start();

    if (this.highestScore < this.currentScore) {
      this.highestScore = this.currentScore;
      cc.tween(this.highestScoreValue.node)
        .to(0.2, { scale: 1.2, opacity: 150 })
        .call(() => {
          this.highestScoreValue.string = this.highestScore.toString();
        })
        .to(0.2, { scale: 1.0, opacity: 255 })
        .start();
    }
  }

  checkEndGame(): boolean {
    for (let x = 0; x < this.gameLayoutWidth; x++) {
      for (let y = 0; y < this.gameLayoutHeight; y++) {
        let blockWrap1: BlockWrap = this.blockArray[x][y];
        if (blockWrap1.value === 0) {
          return false;
        } else {
          if (x + 1 < this.gameLayoutWidth) {
            let block2: BlockWrap = this.blockArray[x + 1][y];
            if (block2.value === 0 || block2.value === blockWrap1.value) {
              return false;
            }
          }

          if (y + 1 < this.gameLayoutHeight) {
            let block3: BlockWrap = this.blockArray[x][y + 1];
            if (block3.value === 0 || block3.value === blockWrap1.value) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  //  random from min to max -1
  randomRangeInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  printBoard() {
    console.log("--------------------------------------");
    for (let i = 0; i < 4; i++) {
      let block = this.blockArray[0][i].toStr();
      let block1 = this.blockArray[1][i].toStr();
      let block2 = this.blockArray[2][i].toStr();
      let block3 = this.blockArray[3][i].toStr();
      console.log(block, block1, block2, block3);
    }
  }
}

enum DIRECTION {
  LEFT,
  RIGHT,
  UP,
  DOWN,
}
