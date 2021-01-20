class GameModel {
  constructor(){
    this.livePiece = {}
    this.fixedBlocks = [
      // {
      //   id: 'bl-1611133257898',
      //   x: 4,
      //   y: 19
      // },
      // {
      //   id: 'bl-1611130060808',
      //   x: 5, 
      //   y: 19
      // },
      // {
      //   id: 'bl-1611129470307',
      //   x: 5, 
      //   y: 20
      // },
      // {
      //   id: 'bl-1611125369982', 
      //   x: 6, 
      //   y: 20
      // }
    ]
    this.queue = []
    this.score = 0
    this.level = 0
    this.numberOfLines = 0
    this.createTetrimino = this.createTetrimino
    this.observers = []
    this.dropSpeed = 1000
    this.softDropSpeed = 50
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
    const arr = [new I(), new J(), new L(), new O(), new S(), new T(), new Z()]
    // const arr = [new Z()]
    const tetrimino = arr[Math.floor(Math.random() * arr.length)]
    this.livePiece = tetrimino
    this.notifyObservers({ livePiece: this.livePiece })
  }

  updateLivePieceCoor (x, y) {
    // Get the live piece
    this.livePiece.updateBlockCoordinates(x, y)
    this.notifyObservers({ livePiece: this.livePiece })
  }

  rotateLivePiece () {
    this.livePiece.rotate()
    this.notifyObservers({
      livePiece: this.livePiece
    })
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

    // piece cannot occupy the space of existing pieces
    this.fixedBlocks.forEach(block => {
      if (block.x === x && block.y === y){
        valid = false
      }
    })

    return valid
  }

  validateMultipleBlocks (blockArray) {
    const validBlocks = blockArray.map(block => {
      return this.validateMove(block.x, block.y)
    })
    const valid = validBlocks.every(block => (block === true))
    return valid
  }

  fixTetrimino () {
    // Method will break tetrimino into individual blocks and push to fixed pieces
    const livePiece = { ...this.livePiece }
    const blocks = livePiece.blocks
    blocks.forEach(block => {
      const fixedCoors = block.translateCoordinates(livePiece.referenceX, livePiece.referenceY)
      block.setCoordinates(fixedCoors.x, fixedCoors.y)
      this.fixedBlocks.push(block)
    })
    this.notifyObservers({ fixedBlocks: [...this.fixedBlocks] })
  }

  checkFullRow (rowNum) {
    /**
     * if 10 blocks have the same y value, then return true
     */
    let counter = 0
    this.fixedBlocks.forEach(block => {
      if (block.y === rowNum) {
        counter ++
      }
    })
    if (counter === WIDTH) {
      return rowNum
    }
  }

  checkAllRows () {
    const clearRows = []
    for (let i = 0; i <= HEIGHT; i++){
      if (this.checkFullRow(i)){
        clearRows.push(this.checkFullRow(i))
      }
    }
    return clearRows
  }

  clearRows (rowNums) {
    // Update Score
    this.updateScore(rowNums.length)
    this.updateNumberOfLines(rowNums.length)
    this.updateLevel()
    this.increaseDropSpeed()

    // Remove rows from model
    rowNums.forEach(row => {
      const mapped = this.fixedBlocks.map(block => {
        /**
         * If block are below current row number, do nothing
         * If blocks are in the current row nuimber, remove
         * If blocks are above the current row number, add 1 from y
         * return the array
         */
        if (block.y > row){
          return block
        }
        if (block.y === row) {
          return null
        }
        if (block.y < row){
          const updatedBlock = { ...block }
          updatedBlock.y += 1
          return updatedBlock
        }
      })
      
      const filtered = mapped.filter(block => block !== null)
      this.fixedBlocks = filtered
    })

    this.notifyObservers({ 
      fixedBlocks: this.fixedBlocks,
      score: this.score,
      numberOfLines: this.numberOfLines,
      level: this.level
    })
  }

  updateScore (numberOfLines) {
    let score
    switch (true) {
      case numberOfLines === 1: {
        score = 40 * (this.level + 1)
        break
      }
      case numberOfLines === 2: {
        score = 100 * (this.level + 1)
        break
      }
      case numberOfLines === 3: {
        score = 300 * (this.level + 1)
        break
      }
      case numberOfLines === 4: {
        score = 1200 * (this.level + 1)
      }
    }
    this.score = this.score + score
  }

  updateNumberOfLines (numberOfLines) {
    this.numberOfLines += numberOfLines
  }

  updateLevel () {
    const level = Math.floor(this.numberOfLines / 10)
    this.level = level
  }

  increaseDropSpeed () {
    const decrement = this.level * 50
    this.dropSpeed = 1000 - decrement
  }

  checkGameOver () {
    const isOver = this.fixedBlocks.some(block => block.y < 2 && block.x === 4)
    return isOver
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

}

/**************
 * Block Class
 **************/

class Block {
  constructor(x, y, id){
    this.id = id
    this.x = x
    this.y = y
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * Coordinates for live peices are only 'translated'
   * The starting positions are added to the Tetrimino's reference points
   */
  translateCoordinates (x, y) {
    return {
      x: this.x + x,
      y: this.y + y
    }
  }

  setCoordinates (x, y){
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
    this.blocks = []
    this.configurations = []
    this.referenceX = 4
    this.referenceY = 0
  }

  generateID () {
    return `bl-${Date.now() - (Math.floor(Math.random() * 10000000))}`
  }

  rotate () {
    // Cycle through configurations
    if (this.rotationIndex < this.configurations.length - 1) {
      this.rotationIndex += 1
    } else {
      this.rotationIndex = 0
    }
    // Update the each block to the new position
    this.blocks.forEach((block, i) => {
      const coordinates = this.configurations[this.rotationIndex]
      block.setCoordinates(coordinates[i].x, coordinates[i].y)
    })
  }

  getTranslatedCoordinates (x, y){
    return this.blocks.map(block => {
      return {
        x: block.x + this.referenceX + x,
        y: block.y + this.referenceY + y
      }
    })
  }

  getRotatedCoordinates () {
    // Cycle through configurations
    let rI = this.rotationIndex
    if (rI < this.configurations.length - 1) {
      rI += 1
    } else {
      rI = 0
    }
    // Update the each block to the new position
    const coordinates = this.blocks.map((block, i) => {
      const configCoors = this.configurations[0][i]
      return {
        x: configCoors.x + this.referenceX,
        y: configCoors.y + this.referenceY
      }
    })
    return coordinates
  }

  updateBlockCoordinates (x, y) {
    this.referenceX += x
    this.referenceY += y
  }
}

class I extends Tetrimino {
  constructor(){
    super()
    this.referenceY = 1
    this.blocks = [
      new Block(0, 1, this.generateID()),
      new Block(1, 1, this.generateID()),
      new Block(2, 1, this.generateID()),
      new Block(3, 1, this.generateID())
    ]
    this.configurations = [
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 }
      ],
      [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 }
      ],
      [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 }
      ],
      [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 }
      ]
    ]
    this.cssClass = 'i-block'
  }
}

class J extends Tetrimino {
  constructor(){
    super()

    this.blocks = [
      new Block(0, 1, this.generateID()),
      new Block(0, 2, this.generateID()),
      new Block(1, 2, this.generateID()),
      new Block(2, 2, this.generateID())
    ]

    this.configurations = [
      [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 }
      ],
      [
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 }
      ], 
      [
        { x: 2, y: 3 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 2 }
      ],
      [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 1 }
      ]
    ]
    this.cssClass = 'j-block'
  }
}

class L extends Tetrimino {
  constructor(){
    super()

    this.blocks = [
      new Block(0, 2, this.generateID()),
      new Block(1, 2, this.generateID()),
      new Block(2, 2, this.generateID()),
      new Block(2, 1, this.generateID())
    ]

    this.configurations = [
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 1 }
      ],
      [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 }
      ], 
      [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
        { x: 0, y: 3 }
      ],
      [
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
        { x: 0, y: 1 }
      ]
    ]
    this.cssClass = 'l-block'
  }
}

class O extends Tetrimino {
  constructor(){
    super()
    this.blocks = [
      new Block(0, 1, this.generateID()),
      new Block(1, 1, this.generateID()),
      new Block(0, 2, this.generateID()),
      new Block(1, 2, this.generateID())
    ]
    this.configurations = [
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 }
      ]
    ]
    this.cssClass = 'o-block'
  }
}

class S extends Tetrimino {
  constructor(){
    super()

    this.blocks = [
      new Block(0, 2, this.generateID()),
      new Block(1, 2, this.generateID()),
      new Block(1, 1, this.generateID()),
      new Block(2, 1, this.generateID())
    ]
    this.configurations = [
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
        { x: 2, y: 1 }
      ],
      [ 
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 3 }
      ],
      [ 
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 0, y: 3 }
      ],
      [ 
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
        { x: 0, y: 1 }
      ]
    ]
    this.cssClass = 's-block'
  }
}

class T extends Tetrimino {
  constructor(){
    super()

    this.blocks = [
      new Block(0, 1, this.generateID()),
      new Block(1, 1, this.generateID()),
      new Block(2, 1, this.generateID()),
      new Block(1, 2, this.generateID())
    ]

    this.configurations = [
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 }
      ],
      [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 1, y: 2 }
      ], 
      [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 2 }
      ],
      [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 2 }
      ]
    ]
    this.cssClass = 't-block'
  }
}

class Z extends Tetrimino {
  constructor(){
    super()

    this.blocks = [
      new Block(0, 1, this.generateID()),
      new Block(1, 1, this.generateID()),
      new Block(1, 2, this.generateID()),
      new Block(2, 2, this.generateID())
    ]
    this.configurations = [
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 }
      ],
      [ 
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 3 }
      ],
      [ 
        { x: 2, y: 3 },
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 0, y: 2 }
      ],
      [ 
        { x: 0, y: 3 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 1 }
      ]
    ]
    this.cssClass = 'z-block'
  }
}





