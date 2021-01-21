class View {
  constructor (){
    this.state = {}
    this.root = document.querySelector('#root')
    this.grid = this.createGrid(WIDTH, HEIGHT, SIZE, 'grid')
    this.sideBar = document.querySelector('#rhs')
    this.mainContainer = document.querySelector('#lhs')
  }

  /**
   * 
   * @param {string} tag 
   * @param {Object} attributes 
   * @param {Object} styles
   */
  createElement (tag, attributes = {}, styles = {}) {
    const element = document.createElement(tag)

    const styleKeys = Object.keys(styles)
    styleKeys.forEach(style => {
      element.style[style] = styles[style]
    })

    const attributeKeys = Object.keys(attributes)
    attributeKeys.forEach(attr => {
      element.setAttribute(attr, attributes[attr])
    })
    return element
  }

  createLeftContainer () {
    return this.createElement(
      'section',
      {
        id: 'lhs',
        class: 'left-column'
      })
  }

  createSideBar () {
    return this.createElement(
      'aside',
      {
        id: 'rhs',
        class: 'right-column'
      }
    )
  }

  createQueue () {
    const queue = this.createGrid(6, 10, SIZE, 'queue')
    return queue
  }

  /**
   * 
   * @param {number} w - width
   * @param {number} h - height
   * @param {number} size - size in px
   */
  createGrid (w, h, size, id) {
    const attributes = {
      id: id
    }
    const styles = {
      display: 'grid',
      gridTemplateColumns: `repeat(${w}, ${size}px)`,
      gridTemplateRows: `repeat(${h}, ${size}px)`,
    }
    const grid = this.createElement('div', attributes, styles)
    return grid
  }

  createTetrimino (model, classes = null) {
    const tetrimino = model.blocks.map(block => {
      const el = this.createElement(
        'div',
        {
          id: block.id,
          class: `block ${classes.join(' ')} ${model.cssClass}`
        },
        {
          gridColumnStart: block.x + model.referenceX,
          gridColumnEnd: block.x + model.referenceX + 1,
          gridRowStart: block.y + model.referenceY,
          gridRowEnd: block.y + model.referenceY + 1
        }
      )
      return el
    })
    return tetrimino
  }

  createButton (buttonText, id, classes) {
    const button = this.createElement(
      'button',
      {
        id: id,
        class: classes.join(' ')
      }
    )

    button.innerHTML = buttonText
    return button

  }

  createStatsDisplay () {
    const statsContainer = this.createElement(
      'section',
      {
        id: 'stats-container'
      }
    )
    const scoreField = this.createElement(
      'div',
      {
        id: 'score'
      }
    )
    scoreField.innerHTML = 0

    const level = this.createElement(
      'div',
      {
        id: 'level'
      }
    )
    level.innerHTML = 0

    const lines = this.createElement(
      'div',
      {
        id: 'lines'
      }
    )
    lines.innerHTML = 0

    statsContainer.appendChild(scoreField)
    statsContainer.appendChild(level)
    statsContainer.appendChild(lines)

    return statsContainer
  }

  /************************************
   * DOM Updates
   ************************************/

  update (obj){
    for (const key in obj) {
      this.state[key] = obj[key]
      this.updateUI(key)
    } 
  }

  updateCoordinates (element, updatedCoordinates) {
    element.style.gridColumnStart = updatedCoordinates.x
    element.style.gridColumnEnd = updatedCoordinates.x + 1
    element.style.gridRowStart = updatedCoordinates.y
    element.style.gridRowEnd = updatedCoordinates.y + 1
  }

  updateQueue () {
    const queue = document.querySelector('#queue')
    queue.innerHTML = ''
    const tetriminos = this.state.queue.map((tetrimino, i)=> {
      tetrimino.referenceX = 1
      tetrimino.referenceY = i * 3
      const tet = this.createTetrimino(tetrimino, [])
      return tet
    })

    tetriminos.forEach(tetrimino => {
      tetrimino.forEach(block => queue.appendChild(block))
    })
  }

  clearFixedBlocks () {
    const blocksDOM = Array.from(document.querySelectorAll('.fixed'))
    const blocksDOMIDs = blocksDOM.map(block => block.id)
    const blockModelIDs = this.state.fixedBlocks.map(block => block.id)
    const toRemove = []
    const toUpdate = []
    blocksDOMIDs.forEach(id => blockModelIDs.indexOf(id) === -1 ? toRemove.push(id) : toUpdate.push(id))
    toRemove.forEach(id => {
      const el = document.getElementById(id)
      el.remove()
    })
    toUpdate.forEach(id => {
      const el = document.getElementById(id)
      const model = this.state.fixedBlocks.find(block => block.id === id)
      this.updateCoordinates(el, model)
    })
  }

  updateResultString () {
    const resultEl = document.getElementById('result-string')
    const resultStr = `You reached <strong>level ${this.state.level}</strong>, scoring <strong>${this.state.score}</strong> points and clearing <strong>${this.state.numberOfLines}</strong> ${this.state.numberOfLines > 1 ? 'lines' : 'line'}!`
    resultEl.innerHTML = resultStr
  }

  updateScoreBoard () {
    const scoreTable = document.getElementById('leader-board-tbody')
    scoreTable.innerHTML = ''
    const scores = this.state.scoreBoard.map((score, i)=> {
      const tr = this.createElement('tr')
      const position = this.createElement('td')
      const name = this.createElement('td')
      const points = this.createElement('td')
      position.innerHTML = `#${i + 1}`
      name.innerHTML = score.name
      points.innerHTML = score.score
      const arr = [position, name, points]
      arr.forEach(item => tr.append(item))
      return tr
    })
    scores.forEach(score => scoreTable.append(score))
  }

  updateUI (stateKey) {
    switch (true) {
      case stateKey === 'livePiece': {
        const tModel = this.state[stateKey]
        
        if (this.state[stateKey] === null) {
          this.grid.innerHTML = ''
          return null
        } 

        let liveBlocks = Array.from(document.querySelectorAll('.live'))
        if (liveBlocks.length === 0) {
          tModel.referenceX = 4
          const tetrimino = this.createTetrimino(this.state[stateKey], ['live'])

          tetrimino.forEach(block => this.render(block, '#grid'))
          liveBlocks = Array.from(document.querySelectorAll('.live'))
        }
        // Update the coordinates
        liveBlocks.forEach((block, i) => {
          
          const currentConfig = tModel.blocks
          const currentBlock = currentConfig[i]
          const blockCoordinates = currentBlock.translateCoordinates(tModel.referenceX, tModel.referenceY)
          this.updateCoordinates(block, blockCoordinates)
        })
        break
      }
      case stateKey === 'fixedBlocks': {

        if (this.state[stateKey] === null) {
          return null
        }

        const liveBlocks = Array.from(document.querySelectorAll('.live'))
        liveBlocks.forEach(block => { 
          // find the equivalent block in model
          const blockModel = this.state[stateKey].find(bl => bl.id === block.id)
          block.classList.remove('live')
          block.classList.add('fixed')
          this.updateCoordinates(block, blockModel)
        })
        this.clearFixedBlocks()
        break
      }
      case stateKey === 'score': {
        const scoreField = document.getElementById('score')
        scoreField.innerHTML = this.state[stateKey]
        break
      }
      case stateKey === 'numberOfLines': {
        const linesField = document.getElementById('lines')
        linesField.innerHTML = this.state[stateKey]
        break
      }
      case stateKey === 'level': {
        const levelField = document.getElementById('level')
        levelField.innerHTML = this.state[stateKey]
        break
      }
      case stateKey === 'queue': {
        this.updateQueue()
        break
      }
      case stateKey === 'scoreBoard': {
        this.updateScoreBoard()
        break
      }
      
    }
  }

  resetUI () {
    this.update({
      livePiece: null,
      fixedBlocks: null,
      score: 0,
      numberOfLines: 0,
      level: 0,
      queue: []
    })
  }


  /**
   * 
   * @param {HTMLElement} element 
   * @param {string} parent 
   */
  render (element, parent) {
    const parentElement = document.querySelector(parent)
    parentElement.append(element)
  }



  /************************************
   * Popup Management
   ************************************/

  showPopup () {
    const backdrop = document.getElementById('backdrop')
    const popup = document.getElementById('popup')
    backdrop.classList.remove('hidden')
    popup.classList.remove('hidden')
  }

  hidePopup () {
    const backdrop = document.getElementById('backdrop')
    const popup = document.getElementById('popup')
    backdrop.classList.add('hidden')
    popup.classList.add('hidden')
  }



  showMenuPanel (panelID) {
    this.showPopup()
    const menuDivs = Array.from(document.querySelectorAll('.menu'))
    const panelToShow = document.getElementById(panelID)
    menuDivs.forEach(menu => menu.classList.add('hidden'))
    panelToShow.classList.remove('hidden')
  }



  /************************************
   * Event Handlers
   ************************************/

  initKeyDownEvents (fn) {
    document.addEventListener('keydown', e => {
      const key = e.code

      switch (true){
        case key === 'ArrowLeft':
          fn('left')
          break
        case key === 'ArrowDown':
          fn('down')
          break
        case key === 'ArrowRight':
          fn('right')
          break
        case key === 'ArrowUp':
          fn('up')
          break
        case key === 'Space':
          fn('space')
          break
      }
    })
  }

  initKeyUpEvents (fn) {
    document.addEventListener('keyup', e => {
      const key = e.code
      if (key === 'ArrowDown') {
        fn('down')
      }
    })
  }

  startGameHandler (fn) {
    const startBtn = document.querySelector('#start')
    startBtn.addEventListener('click', fn)
  }

  pauseGameHandler (fn) {
    const pauseBtn = document.querySelector('#pause')
    pauseBtn.addEventListener('click', fn)
  }

  showLeaderBoardHandler (fn) {
    const showLeaderBoardBtn = document.querySelector('#leaderboard-btn')
    showLeaderBoardBtn.addEventListener('click', fn)
  }

  returnToMenuHandler (fn) {
    const returnToMenuBtns = Array.from(document.querySelectorAll('.return-menu'))
    returnToMenuBtns.forEach(btn => btn.addEventListener('click', fn))
  }

  addScoreHandler (fn) {
    const addScoreBtn = document.querySelector('#add-score')
    // const a = this.getPlayerName()
    // const a = this.getPlayerName()
    addScoreBtn.addEventListener('click', fn)
  }

  getPlayerName () {
    const playerName = document.querySelector('#player-name')
    return playerName.value
  }

  generateUI () {
    const queue = this.createQueue()
    this.sideBar.appendChild(queue)
    this.mainContainer.appendChild(this.grid)
  }

  init (state) {
    this.generateUI()
    this.state = state
    this.updateScoreBoard()
  }
}