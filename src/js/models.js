class GameModel {
  constructor(){
    this.livePiece = {}
    this.fixedBlocks = [
      // {
      //   id: 1,
      //   x: 4,
      //   y: 3
      // }
    ]
    this.queue = []
    this.score = 0
    this.level = 1
    this.createTetrimino = this.createTetrimino
    this.observers = []
  }

  stateSnapshot () {
    return {
      livePiece: this.livePiece,
      fixedBlocks: this.fixedBlocks,
      queue: this.queue,
      score: this.score,
      level: this.level
    }
  }

  createTetrimino () {
    const tetrimino = new Square()
    // const tetrimino = new LeftRightZigZag()
    this.livePiece = tetrimino
    this.notifyObservers({ livePiece: this.livePiece })
  }

  updateLivePieceCoor (x, y) {
    // Get the live piece
    const tet = this.livePiece
    // Map over each block in the tetrimino, returning an array of booleans to check if each block is valid
    const validBlocks = tet.configurations[tet.rotationIndex].map(block => {
      const blockCoors = block.translateCoordinates(tet.referenceX + x, tet.referenceY + y)
      return this.validateMove(blockCoors.x, blockCoors.y)
    })

    // If there is a false value, return
    const valid = !(validBlocks.some(block => block === false))
    if (!valid) {
      return
    }
    // Else, update the block coordinates of the piece
    this.livePiece.updateBlockCoordinates(x, y)
    this.notifyObservers({ livePiece: this.livePiece })
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * Method should be called on each individual block,
   * if any block returns false, whole tetrimino should
   * either be denied movement or it should freeze
   */
  validateMove (x, y) {
    let valid = true
    // Piece cannot move less than the left wall
    if (x <= 0) {
      valid = false
    }
    // piece cannot move above the right wall
    if (x >= WIDTH + 1) {
      valid = false
    }
    // piece cannot move lower than the bottom row
    if (y >= HEIGHT + 1) {
      valid = false
    }

    this.fixedBlocks.forEach(block => {
      if (block.x === x && block.y === y){
        console.log(`Block x (${block.x}) === x (${x}) && Block y (${block.y}) === x (${y})`)
        valid = false
      }
    })

    return valid
  }

  pieceShouldFix (x, y) {
    // should return a boolean - to be called at the end of each interval in the controller
    let shouldFix = false
    shouldFix = y >= HEIGHT ? true : false
    if (!shouldFix) {
      shouldFix = this.fixedBlocks.some(block => {
        return (block.x === x && block.y === y)
      })
    }
    return shouldFix
  }

  fixTetrimino () {
    // Method will break tetrimino into individual blocks and push to fixed pieces
    const livePiece = { ...this.livePiece }
    const blocks = livePiece.configurations[livePiece.rotationIndex]
    blocks.forEach(block => {
      const fixedCoors = block.translateCoordinates(livePiece.referenceX, livePiece.referenceY)
      block.fixCoordinates(fixedCoors.x, fixedCoors.y)
      this.fixedBlocks.push(block)
    })
    this.notifyObservers({ fixedBlocks: [...this.fixedBlocks] })
  }

  checkFullRow () {

  }

  clearRow () {

  }

  updateScore () {

  }

  checkGameOver () {
    return false
  }

  /**
   * 
   * @param {class} observer 
   * Method to add classes as observers:
   * - observers are notified when model changes
   */
  addObserver (observer) {
    this.observers.push(observer)
  }

  /**
   * 
   * @param {Object} update 
   * Method to run through any observers with updates to state
   * Observers have a corresponding update method, which
   * reacts to changes in state
   */
  notifyObservers (update) {
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
    this.id = `bl-${Date.now() - (Math.floor(Math.random() * 10000000))}`
    this.x = x
    this.y = y
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * Coordinates for live peices are only 'translated'
   * The starting positions are added to the Tetrimino's reference points
   * Reference points are updated
   */
  translateCoordinates (x, y) {
    return {
      x: this.x + x,
      y: this.y + y
    }
  }

  fixCoordinates (x, y){
    this.x = x
    this.y = y
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
    this.referenceX += x
    this.referenceY += y
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