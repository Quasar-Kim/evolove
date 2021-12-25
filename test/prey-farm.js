import Engine from '../src/Engine.js'
import Entity from '../src/Entity.js'
import Wall from '../src/Wall.js'
import AlertDialog from 'https://cdn.jsdelivr.net/npm/elix@15.0.1/define/AlertDialog.js'
import negate from '../src/negate.js'
import Food from '../src/Food.js'
import PreyBug from '../src/PreyBug.js'
import mutate from '../src/mutate.js'
import { rotate } from 'mathjs'
import { times as repeat, random } from 'lodash-es'

const engine = new Engine(
  document.querySelector('#collisionBodies'),
  [
    [[Wall, PreyBug], (resp, wall, prey) => {
      negate(resp, prey, wall)
      prey.reflect(wall.normal)
    }],
    [[Food, PreyBug], (resp, food, prey) => {
      engine.deleteEntity(food)
      prey.consumed++

      if (prey.consumed === 5) {
        // 분열
        engine.deleteEntity(prey)
        repeat(2, () => {
          const mutated = mutate(prey.props)
          const child = new PreyBug({
            x: prey.pos.x,
            y: prey.pos.y,
            bodyAngle: random(0, Math.PI / 2, true),
            ...mutated
          })
          engine.addEntity(child)
          console.log(mutated)
        })
      }
    }]
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

const bug = new PreyBug({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  width: 20,
  height: 20,
  velocity: rotate([5, 0], Math.PI / 6),
  bodyAngle: Math.PI / 3,
  activity: 0.5
})
engine.addEntity(bug)

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
