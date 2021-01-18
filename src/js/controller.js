class Controller {
  constructor (model, view) {
    this.model = model
    this.view = view
    this.isPlaying = false
    this.playInterval = null
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.moveBlock = this.moveBlock.bind(this)
    this.dropSpeed = 200
  }

  createTetrimino () {
    this.model.createTetrimino()
  }

  play () {
    if (this.isPlaying === true){
      return
    }
    this.isPlaying = true
    this.createTetrimino()
    this.playInterval = setInterval(() => {

      const liveBlocks = this.model.livePiece.configurations[this.model.livePiece.rotationIndex]
      // Return and array of objects in which the y position is updated by 1
      const proposedCoordinates = liveBlocks.map(block => {
        const x = block.x + this.model.livePiece.referenceX
        const y = block.y + this.model.livePiece.referenceY + 1
        return { x, y }
      })

      // Return an array of true or false values if the piece
      const validateBlocks = proposedCoordinates.map(block => {
        return this.model.validateMove(block.x, block.y)
      })

      const valid = validateBlocks.every(block => (block === true))

      if (!valid) {
        this.model.fixTetrimino()
        this.model.createTetrimino()
      }

      /**
      * if game is over:
      *   clear interval
      *   return
      * if piece should fix:
      *   model.fixBlocks
      *   model.createTetrimino
      *   check for full lines:
      *     if yes:
      *       remove lines
      *       update score
      * if none of the above:
      *   model.updateLivePieceCoors
      * 
      */

      if (this.model.checkGameOver()){
        console.log('Game Over')
        return
      } 

      // if (this.model.pieceShouldFix()) {
      //   this.model.fixBlocks()
      //   this.model.createTetrimino
      //   if (this.model.checkFullLines()) {
      //     // this.model.removeLines()
      //     // this.model.updateScore()
      //   }
      //   return
      // }

      this.model.updateLivePieceCoor(0, 1)
      return

    }, this.dropSpeed)
  }

  pause () {

  }

  moveBlock (direction) {
    switch (direction){
      case 'left': {
        // const coors = this.model.
        this.model.validateMove()
        this.model.updateLivePieceCoor(-1, 0)
        break
      }
      case 'right': {
        this.model.updateLivePieceCoor(1, 0)
        break
      }
    }
    
  }

  bindFunctions () {
    this.view.startGameHandler(this.play)
    // this.view.pauseGameHandler(this.pause) // function is buggy - implement later
  }

  init () {
    this.model.init()
    this.view.init(this.model.stateSnapshot())
    this.view.initKeyEvents(this.moveBlock)
    this.model.addObserver(this.view)
    this.bindFunctions()
  }
}