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

  play () {
    if (this.isPlaying === true){
      return
    }
    this.isPlaying = true
    this.model.createTetrimino()

    this.playInterval = setInterval(() => {
      if (this.model.checkGameOver()){
        clearInterval(this.playInterval)
        alert('Game Over! You scored ' + this.model.score + ' points' )
        return
      } 

      const proposedCoordinates = this.model.livePiece.getTranslatedCoordinates(0, 1)
      // Return an array of true or false values if the piece

      const valid = this.model.validateMultipleBlocks(proposedCoordinates)

      if (valid) {
        this.model.updateLivePieceCoor(0, 1)
        return 
      }

      if (!valid) {
        this.model.fixTetrimino()
        const fullRows = this.model.checkAllRows()
        if (fullRows.length > 0) {
          this.model.clearRows(fullRows)
        }
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

      // if (this.model.pieceShouldFix()) {
      //   this.model.fixBlocks()
      //   this.model.createTetrimino
      //   if (this.model.checkFullLines()) {
      //     // this.model.removeLines()
      //     // this.model.updateScore()
      //   }
      //   return
      // }

      return

    }, this.dropSpeed)
  }

  pause () {

  }

  moveBlock (direction) {
    switch (direction){
      case 'left': {
        const proposed = this.model.livePiece.getTranslatedCoordinates(-1, 0)
        const valid = this.model.validateMultipleBlocks(proposed)
        if (valid) {
          this.model.updateLivePieceCoor(-1, 0)
        }
        break
      }
      case 'right': {
        const proposed = this.model.livePiece.getTranslatedCoordinates(1, 0)
        const valid = this.model.validateMultipleBlocks(proposed)
        if (valid) {
          this.model.updateLivePieceCoor(1, 0)
        }
        break
      }
      case 'up': {
        const valid = this.model.validateMultipleBlocks(this.model.livePiece.getRotatedCoordinates())
        if (valid) {
          this.model.livePiece.rotate()
        }
        break
      }
    }
    
  }

  bindFunctions () {
    this.view.startGameHandler(this.play)
    // this.view.pauseGameHandler(this.pause) // function is buggy - implement later
  }

  init () {

    this.view.init(this.model.stateSnapshot())
    this.view.initKeyEvents(this.moveBlock)
    this.model.addObserver(this.view)
    this.bindFunctions()
  }
}