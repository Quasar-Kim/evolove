import Engine from '../src/Engine.js'
import Wall from '../src/Wall.js'
import AlertDialog from 'https://cdn.jsdelivr.net/npm/elix@15.0.1/define/AlertDialog.js'
import negate from '../src/negate.js'
import Food from '../src/Food.js'
import PreyBug from '../src/PreyBug.js'
import PredatorBug from '../src/PredatorBug.js'
import mutate from '../src/mutate.js'
import { rotate } from 'mathjs'
import { times as repeat, random } from 'lodash-es'

function preventEscape (resp, wall, bug) {
  negate(resp, bug, wall)
  bug.reflect(wall.normal)
}

function devour (resp, weak, strong, game) {
  engine.deleteEntity(weak)
  strong.consumed++

  if (strong.consumed === 5) {
    engine.deleteEntity(strong)
    repeat(2, () => {
      const child = new strong.constructor({
        x: strong.pos.x,
        y: strong.pos.y,
        bodyAngle: random(0, Math.PI / 2, true),
        ...mutate(strong.props)
      })
      game.addEntity(child)
    })
  }
}

const engine = new Engine(
  document.querySelector('#collisionBodies'),
  [
    [[Wall, PreyBug], preventEscape],
    [[Wall, PredatorBug], preventEscape],
    [[Food, PreyBug], devour],
    [[PreyBug, PredatorBug], devour]
  ]
)

// entity creation
const walls = {
  top: new Wall({
    x: 0,
    y: 0,
    orientation: 'horizontal',
    thickness: 10,
    normal: [0, -1]
  }),
  bottom: new Wall({
    x: 0,
    y: window.innerHeight - 10,
    orientation: 'horizontal',
    thickness: 10,
    normal: [0, 1]
  }),
  left: new Wall({
    x: 0,
    y: 0,
    orientation: 'vertical',
    thickness: 10,
    normal: [1, 0]
  }),
  right: new Wall({
    x: window.innerWidth - 10,
    y: 0,
    orientation: 'vertical',
    thickness: 10,
    normal: [-1, 0]
  })
}
for (const [, v] of Object.entries(walls)) {
  engine.addEntity(v)
}

const prey = new PreyBug({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  width: 20,
  height: 20,
  velocity: rotate([5, 0], Math.PI / 6),
  bodyAngle: Math.PI / 3,
  activity: 0.5
})
engine.addEntity(prey)

const predator = new PredatorBug({
  x: 50,
  y: 50,
  width: 50,
  height: 20,
  velocity: rotate([5, 0], Math.PI / 6),
  bodyAngle: Math.PI / 4,
  activity: 0.3
})
engine.addEntity(predator)

// generate food
let foods = 0
engine.tickFunctions.add(game => {
  if (foods > 200) return

  const food = new Food(
    random(20, window.innerWidth - 20),
    random(20, window.innerHeight - 20)
  )
  game.addEntity(food)
  foods++
})

// show dialog
const dialog = new AlertDialog()
dialog.choices = ['start']
dialog.open()
dialog.whenClosed().then((result) => {
  // boot engine
  engine.start()
})
