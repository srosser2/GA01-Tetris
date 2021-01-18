class View {
  constructor (){
    this.state = {}
    this.root = document.querySelector('#root')
    this.grid = this.createGrid(WIDTH, HEIGHT, 20)
  }

  /**
   * 
   * @param {string} tag 
   * @param {Object} attributes 
   * @param {Object} styles
   */
  createElement (tag, attributes, styles = {}) {
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

  /**
   * 
   * @param {number} w - width
   * @param {number} h - height
   * @param {number} size - size in px
   */
  createGrid (w, h, size) {
    const attributes = {
      id: 'grid'
    }
    const styles = {
      display: 'grid',
      gridTemplateColumns: `repeat(${w}, ${size}px)`,
      gridTemplateRows: `repeat(${h}, ${size}px)`,
      border: '1px solid #A8A8A8'
    }
    const grid = this.createElement('div', attributes, styles)
    return grid
  }

  createTetrimino (tetrimino) {
    tetrimino.configurations[0].map(block => {
      const el = this.createElement(
        'div',
        {
          id: block.id,
          class: 'live block'
        },
        {
          gridColumnStart: block.x + tetrimino.referenceX,
          gridColumnEnd: block.x + tetrimino.referenceX + 1,
          gridRowStart: block.y + tetrimino.referenceY,
          gridRowEnd: block.y + tetrimino.referenceY + 1
        }
      )
      this.grid.append(el)
    })
  }

  createButton (buttonText, id) {
    const button = this.createElement(
      'button',
      {
        id: id,
        class: 'button'
      }
    )

    button.innerHTML = buttonText
    return button

  }

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

  updateUI (stateKey) {
    switch (true) {
      // Change to live piece
      case stateKey === 'livePiece': {
        let liveBlocks = Array.from(document.querySelectorAll('.live'))
        if (liveBlocks.length === 0) {
          this.createTetrimino(this.state[stateKey])
          liveBlocks = Array.from(document.querySelectorAll('.live'))
        }
        // Update the coordinates
        liveBlocks.forEach((block, i) => {
          const tModel = this.state[stateKey]
          const currentConfig = tModel.configurations[tModel.rotationIndex]
          const currentBlock = currentConfig[i]
          const blockCoordinates = currentBlock.translateCoordinates(tModel.referenceX, tModel.referenceY)
          this.updateCoordinates(block, blockCoordinates)
        })
        break
      }
      case stateKey === 'fixedBlocks': {
        const liveBlocks = Array.from(document.querySelectorAll('.live'))
        liveBlocks.forEach(block => { 
          // find the equivalent block in model
          const blockModel = this.state[stateKey].find(bl => bl.id === block.id)
          block.classList.remove('live')
          block.classList.add('fixed')
          this.updateCoordinates(block, blockModel)
        })
      }
    }
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

  initKeyEvents (fn) {
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

  generateUI () {
    const leftContainer = this.createLeftContainer()
    const sideBar = this.createSideBar()
    const startButton = this.createButton('Start', 'start')
    // const pauseButton = this.createButton('Pause', 'pause')
    this.root.appendChild(leftContainer)
    this.root.appendChild(sideBar)
    sideBar.appendChild(startButton)
    // sideBar.appendChild(pauseButton)
    leftContainer.appendChild(this.grid)
  }

  init (state) {
    this.generateUI()
    this.state = state
  }
}