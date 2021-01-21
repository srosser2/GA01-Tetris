class Controller {
  constructor (model, view) {
    this.model = model
    this.view = view
    this.isPlaying = false
    this.playTimeout = null
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.moveBlock = this.moveBlock.bind(this)
    this.resetDropSpeed = this.resetDropSpeed.bind(this)
    this.softDrop = false
    this.state = {}
  }

  play () {
    if (this.isPlaying === true){
      return
    }
    this.isPlaying = true
    this.model.startGame(this.state)
    this.dropTimeout(this.model.dropSpeed)
  }

  dropTimeout (speed) {
    this.playTimeout = setTimeout(() => {
      if (this.model.checkGameOver()){
        clearInterval(this.playInterval)
        alert('Game Over! You scored ' + this.model.score + ' points' )
        return
      } 

      let sp = this.model.dropSpeed
      if (this.softDrop){
        sp = this.model.softDropSpeed
        this.model.updateScoreDrop()
      }

      const proposedCoordinates = this.model.livePiece.getTranslatedCoordinates(0, 1)
      // Return an array of true or false values if the piece
      const valid = this.model.validateMultipleBlocks(proposedCoordinates)

      if (valid) {
        this.model.updateLivePieceCoor(0, 1)
        return this.dropTimeout(sp)
      }

      if (!valid) {
        this.model.fixTetrimino()
        const fullRows = this.model.checkAllRows()
        if (fullRows.length > 0) {
          this.model.clearRows(fullRows)
        }
        this.model.pushQueueToLive()
      }

      return this.dropTimeout(sp)

    }, speed)
  }

  pause () {
    clearTimeout(this.playTimeout)
    this.isPlaying = false
    const state = this.model.stateSnapshot()
    this.state = state
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
          this.model.rotateLivePiece()
        }
        break
      }
      case 'down': {
        clearTimeout(this.playTimeout)
        this.softDrop = true
        this.dropTimeout(this.model.softDropSpeed)
        break
      }

      case 'space': {
        const state = this.model.stateSnapshot()
        console.log(state)
      }
    }
    
  }

  resetDropSpeed(dir) {
    if (dir === 'down'){
      this.softDrop = false
    }
  }

  bindFunctions () {
    this.view.startGameHandler(this.play)
    this.view.pauseGameHandler(this.pause) // function is buggy - implement later
  }

  init () {
    this.view.init(this.model.stateSnapshot())
    this.view.initKeyDownEvents(this.moveBlock)
    this.view.initKeyUpEvents(this.resetDropSpeed)
    this.model.addObserver(this.view)
    this.bindFunctions()
  }
}