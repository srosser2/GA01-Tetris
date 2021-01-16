class Controller {
  constructor (model, view) {
    this.model = model
    this.view = view
    this.isPlaying = false
    this.playInterval = null
    this.play = this.play.bind(this)
    this.moveBlock = this.moveBlock.bind(this)
  }

  createTetrimino () {
    this.model.createTetrimino()
    // this.view.stateUpdate(this.model.stateSnapshot())
  }

  play () {
    if (this.isPlaying === true){
      return
    }
    this.isPlaying = true
    this.createTetrimino()
    this.playInterval = setInterval(() => {
      // this.view.stateUpdate(this.model.stateSnapshot())
      switch (true) {
        case true:
          this.model.updateLivePieceCoor(0, 1)
      }
      /**
       * Every interval:
       *  - check if game is over
       *    - if yes, clear interval, display score
       *  - check for full lines
       *    - if yes, increase score, remove line, create new piece
       *  - check for piece collision
       *    - if yes, freeze piece, create new piece
       *  - else
       *    - move piece down 1 position
       */
    }, 500)
  }

  pause () {
    if (this.isPlaying === true){
      this.isPlaying = false
      clearInterval(this.playInterval)
    }
  }

  moveBlock (direction) {
    switch (direction){
      case 'left': {
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
    this.view.bindStartGame(this.play)
  }

  init () {
    this.model.init()
    this.view.init(this.model.stateSnapshot())
    this.view.initKeyEvents(this.moveBlock)
    this.model.addObserver(this.view)
    this.bindFunctions()
  }
}