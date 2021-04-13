### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png) General Assembly - Software Engineering Immersive

# GA Project 1 - Tetris


## Overview
In the first of four projects, GA asked students to build a grid-based game using the skills learned in the first few weeks of the course. Students were given several options of classic games, and asked to recreate the game in 1 week.

I opted to build Tetris as I thought it would be a good level of challenge for my skill set. I also felt that I would be able to recreate the gameplay faithfully to the original game.

You can play the game [here](https://srosser2.github.io/GA01-Tetris/).

![](https://imgur.com/L9lGGxq.jpg)

## Brief

* **Render a game in the browser**
* **Design logic for winning** & **visually display which player won**
* **Include separate HTML / CSS / JavaScript files**
* Stick with **KISS (Keep It Simple Stupid)** and **DRY (Don't Repeat Yourself)** principles
* Use **Javascript** for **DOM manipulation**
* **Deploy your game online**, where the rest of the world can access it
* Use **semantic markup** for HTML and CSS (adhere to best practices)

## Technologies Used

- HTML
- CSS
- Javascript
- Git
- GitHub


## Approach

### Planning

Before writing any code, I planned out the functionality of the app using a whiteboard. I broke down the full game into individual features, and then used the **MoSCoW** prioritization method to prioritize features into 'Must Have', 'Should Have', 'Could Have' and 'Won't Have'. Using these priorities I worked out what features were required for the Minimum Viable Product (**MVP**).

Once I had my features listed, I planned out the architecture of the app. In order to maintain a robust structure, I opted to use the Model, View, Controller (**MVC**). I also wanted to follow the Object Oriented Programming (**OOP**) paradigm, so initially I split various features between classes for Model, View and Controller.

The Models included:

* A Game model - to track the state of the game, validate the movement of tetris pieces, manage the score and levels etc.
* A Block model - an individual tetris block, containing x and y coordinates, and methods to detect collisions (later moved out of this class)
* A Tetrimino model/interface - a class containing information about the configuration of blocks for a certain piece, including its rotated states, its reference x and y positions, methods for transforming the block coordinates. All specific tetriminos extended this class to inherit methods, but had their own bespoke configurations of blocks and rotations.

The View was a class to manage anything related to the DOM, including updating the DOM to reflect changes in the Model, and also for taking input from event listeners, and passing them to the Controller.

The Controller class acted as the communication between the Model and the View, both of which were passed as arguements to the constructor function of the Controller. The Controller was responsible for dispatching changes to the Model by calling its methods, and also passing actions from events captured from the View. This class handled the main aspects of controlling the game such as setting a timeout after which the tetrimno would drop, whether a piece should freeze in place and whether the player could legally move the piece.

I decided to use CSS grid to layout the main area, as it seemed most logical to manage the placement of blocks. This made it easy to update the coordinates of each block numerically. 

With the above points planned out, I was ready to start with the project.

### Project Setup

The first steps in the project required setting up the MVC structure. I set up the following js files, and connected them together in the index.html.

**models.js**

```js
class Model {
// ...
}

```

**views.js**

```js
class View {
// ...
}

```


**controller.js**

```js
class Controller {
	constructor(model, view) {
		this.model = model
		this.view = view
	}
// ...
}

```
**app.js**

```js
const app = new Controller(new Model, new View)

```

### Blocks, Tetriminos and Transforming Pieces

I created a simple class for individual Blocks, each of which has an x and y value.

I then created a more complex class for Tetriminos, which contained configurations of blocks in terms of x and y, and methods to translate, rotate and update the coordinates of the blocks. Each piece extended the main class, and provided 4 configurations of blocks, representing each rotated state of each piece.

**models.js** 

```
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
      const configCoors = this.configurations[rI][i]
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

```

The logic for validating movements is handled in the main Model class, and when an action occurs the Model takes the coordinate values of each block in play, and checks if it is a legal move.

**models.js**

```
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

```


### Triggering Actions

The Controller has several method that controls game play. 

`play()` is responsible for controlling several actions, such as removing the menu, setting game play to active, and calling `dropTimeout`. `dropTimeout` is responsible for dropping each tetrimino at increasing speeds using `setTimeout`, and for determining whether the drop is valid or if the piece should freeze.

There are similar methods that validate left and right movements, as well as rotations, in the `moveBlock` method. The general pattern is to compute the proposed coordinates for a given move, check if it's valid, and if so, apply the transformation to the live piece:

**controller.js**

```
const proposed = this.model.livePiece.getTranslatedCoordinates(1, 0)
const valid = this.model.validateMultipleBlocks(proposed)
if (valid) {
	this.model.updateLivePieceCoor(1, 0)
}

```
The Controller dispatches actions to the Model, and the Model is updated accordingly.


### Updating the View

The Model implements the Observer pattern, which informs the View of any changes on given events. The implementation is a simple but powerful way to separate the logic between the Model and the View.

The extracts below demonstrate:

1. The Model creating the `addObserver` and `notifyObservers`. `notifyObservers` triggers an `update` method on each observer.
2. The Controller registering the View as an observer using the `addObserver` method.
3. The View's implementation of the `update` method, updating the View state, and then calling the `updateUI` method, which contains switch cases for actions to call depending on which part of the state has changed. The switch cases include:
	* Managing movement/rotation of the live tetrimino
	* Fixing the live piece
	* Updating the score
	* Updating the level
	* Updating the number of lines cleared
	* Updating the queue of upcoming tetriminos
	* Updating the final scoreboard

**models.js**

```
  addObserver (observer) {
    this.observers.push(observer)
  }


  notifyObservers (update) {
    this.observers.forEach(observer => {
      observer.update(update)
    })
  }

```

**controller.js**

```
init () {
    this.view.init(this.model.stateSnapshot())
    this.view.initKeyDownEvents(this.moveBlock)
    this.view.initKeyUpEvents(this.resetDropSpeed)
    this.model.addObserver(this.view) // Register the view as an observer
    this.bindFunctions()
}
```

**views.js**

```
  update (obj){
    for (const key in obj) {
      this.state[key] = obj[key]
      this.updateUI(key)
    } 
  }

```


With the above methods, the Model only needs to call `notifyObservers`, and pass and object of relevant updates, e.g.:

**model.js**

```
	this.notifyObservers({ 
      fixedBlocks: this.fixedBlocks,
      score: this.score,
      numberOfLines: this.numberOfLines,
      level: this.level
    })

```

### Event Handlers

Event listeners are registered with elements in the View, and are passed a callback function. The callback function for each event listener dispatches changes to the Model via the Controller.

**views.js**

```
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

```

**controller.js**

```
  moveBlock (direction) {
    if (this.isPlaying) {
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
      }
    }
  }
  
  
  bindFunctions () {
    this.view.startGameHandler(this.play)
    this.view.pauseGameHandler(this.pause)
    this.view.leftKeyHandler(this.moveBlock)
    this.view.rightKeyHandler(this.moveBlock)
    this.view.upKeyHandler(this.moveBlock)
    this.view.downKeyHandler(this.moveBlock)
    this.view.downKeyUpHandler(this.resetDropSpeed)
    this.view.showHowToHandler(this.showHowTo)
    this.view.showLeaderBoardHandler(this.showLeaderboard)
    this.view.returnToMenuHandler(this.returnToMenu)
    this.view.addScoreHandler(this.addScore)
  }

```

## Known Bugs

* There is a minor bug for the game over case, where the final blocks overlap each other, however this doesn't seem to impact score, or ending the game.

## Wins

* The gameplay is smooth and true to the original game.
* Implementing 'Pause' functionality was more difficult than first anticipated, but the functionality works well now.
* I am happy with the UI and UX.

## Challenges

* I spent some time after finishing the project to make the game mobile responsive, and achieved it to some degree, but the user experience isn't as good as the desktop version.
* I added an animation for clearing rows, but this caused some small issues, so I thought it was better to remove the functionality.

## Future Improvements

* Towards the end of the project, I added a lot of event listeners in the View, which could be refactored pretty easily.
* It would be good to test on different browsers, screens and operating systems (it was built using a Mac).
* The mobile experience could be improved, such as positioning the queue of pieces below the main grid, and displaying them horizontally rather than vertically.
* The game logic mutates variables heavily, so it would be interesting to see how the game would work using more of a functional programming approach.

## Key Learnings

It was interesting to apply the MVC architecture to a game, and I had not used the Observer Pattern before, but I was really impressed at how easy it made updating the View. 

