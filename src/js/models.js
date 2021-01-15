class GameModel {
  constructor(){
    this.livePiece = {}
    this.fixedPieces = []
    this.queue = []
    this.score = 0
    this.level = 1
    this.createTetrimino = this.createTetrimino
    this.observers = []
  }

  stateSnapshot () {
    return {
      livePiece: this.livePiece,
      fixedPieces: this.fixedPieces,
      queue: this.queue,
      score: this.score,
      level: this.level
    }
  }

  fixTetrimino () {
    // Method will break tetrimino into individual blocks and push to fixed pieces
    const livePiece = { ...this.livePiece }
    const blocks = livePiece.configurations[livePiece.rotationIndex]
    blocks.forEach(block => {
      this.fixedPieces.push(block)
    })
    this.livePiece = {}
    this.notifyObservers(
      {
        livePiece: { ...this.livePiece },
        fixedPieces: [...this.fixedPieces]
      },
      'fixTetrimino')
  }

  updateLivePieceCoor (x, y) {
    const a = this.livePiece.updateBlockCoordinates(x, y)
    // this.notifyObservers()
    if (a === false) {
      this.fixTetrimino()
      this.createTetrimino()
      
      // console.log(this.fixedPieces)
    }
  }

  createTetrimino () {
    const tetrimino = new LeftRightZigZag()
    this.livePiece = tetrimino
  }

  checkFullRow () {

  }

  clearRow () {

  }

  updateScore () {

  }

  updateModel () {
    /**
     * The model updates under the following conditions:
     * - a new piece is added
     * - a live piece moves horizontally or vertically
     * - a live piece is rotated
     * - a piece cannot fall any further and is fixed
     * - a row is made
     */
  }

  addObserver (observer) {
    this.observers.push(observer)
  }

  notifyObservers (update = this.stateSnapshot(), label = 'Notice: ') {
    console.log(label)
    this.observers.forEach(observer => {
      observer.update(update)
    })
  }

  init () {
  }
}

/**************
 * Block Class
 **************/

class Block {
  constructor(x, y){
    this.x = x
    this.y = y
  }

  translateCoordinates (x, y) {
    return {
      x: this.x + x,
      y: this.y + y
    }
  }

  blockCanMove (x, y) {
    /**
     * TO DO
     * Block can't move if:
     * - block is at the very bottom of the grid
     * - block has a block directly below it
     */ 
    const coordinates = this.translateCoordinates(x, y)
    // if it is at the bottom
    if (coordinates.y >= 20) {
      return false
    }
    return true
  }

}

/**************
 * Tetrimino Class
 **************/

class Tetrimino {
  constructor() {
    this.rotationIndex = 0
    this.configurations = []
    this.referenceX = 4
    this.referenceY = 0
  }

  rotate () {
    
  }

  updateBlockCoordinates (x, y) {
    const blocks = this.configurations[this.rotationIndex]
    const canMove = blocks.map(block => {
      return block.blockCanMove(this.referenceX, this.referenceY)
    })
    if (canMove.indexOf(false) !== -1) {
      // TO DO: it would be better if this logic was separated
      return false
    } else {
      this.referenceX += x
      this.referenceY += y
    }
  }
}

class Square extends Tetrimino {
  constructor(){
    super()
    this.configurations = [
      [
        new Block(0, 1),
        new Block(1, 1),
        new Block(0, 2),
        new Block(1, 2)
      ]
    ]
  }
}

class LeftRightZigZag extends Tetrimino {
  constructor(){
    super()
    this.configurations = [
      [
        new Block(0, 2),
        new Block(1, 2),
        new Block(1, 1),
        new Block(2, 1)
      ]
    ]
  }
}