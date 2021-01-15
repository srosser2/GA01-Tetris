class View {
  constructor (state){
    this.state = {}
    this.root = document.querySelector('#root')
    this.grid = this.createGrid(10, 20, 30)
    this.testFn = console.log
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
      border: '1px solid black'
    }
    const grid = this.createElement('div', attributes, styles)
    return grid
  }

  createTetrimino (tetrimino) {
    console.log(tetrimino.configurations[0])
    tetrimino.configurations[0].map(block => {
      const el = this.createElement(
        'div',
        {
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

  updateLivePiece (x, y) {
    
  }

  stateUpdate (newState) {
    const currentState = { ...this.state }
    /**
     * Loop through curent state
     * if currentState[key] !== newState[key]
     *  - trigger UI update
     */
    for (const key in newState){
      switch (true){
        case key === 'livePiece':
          if (!currentState[key]){
            this.createTetrimino(newState[key])

          } else {
            const blocks = Array.from(document.querySelectorAll('.live'))
            blocks.forEach((block, i) => {
              // Overwrite coordinates using new state
              // Live Tetrimino
              const tetriminoModel = newState[key]
              // The current rotation form of the tetrimino
              const currentConfig = tetriminoModel.configurations[tetriminoModel.rotationIndex]
              // 1 specific block
              const currentBlock = currentConfig[i]
              // Updated coordinates for the block
              const blockCoordinates = currentBlock.translateCoordinates(tetriminoModel.referenceX, tetriminoModel.referenceY)
              // Update the element style coordinates
              block.style.gridColumnStart = blockCoordinates.x
              block.style.gridColumnEnd = blockCoordinates.x + 1
              block.style.gridRowStart = blockCoordinates.y
              block.style.gridRowEnd = blockCoordinates.y + 1
            })
          }
      }
    }
    return this.state = newState
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

  bindStartGame (fn) {
    const startBtn = document.querySelector('#start')
    startBtn.addEventListener('click', fn)
  }

  generateUI () {
    const leftContainer = this.createLeftContainer()
    const sideBar = this.createSideBar()
    const startButton = this.createButton('Start', 'start')
    this.root.appendChild(leftContainer)
    this.root.appendChild(sideBar)
    sideBar.appendChild(startButton)
    leftContainer.appendChild(this.grid)
  }

  init () {
    this.generateUI()
    this.initKeyEvents(this.testFn)
  }
}