import Engine from '../src/Engine.js'
import Wall from '../src/Wall.js'
import Bug from '../src/Bug.js'
import AlertDialog from 'https://cdn.jsdelivr.net/npm/elix@15.0.1/define/AlertDialog.js'
import negate from '../src/negate.js'
import { rotate } from 'mathjs'

const engine = new Engine(
  document.querySelector('#collisionBodies'),
  [
    [[Wall, Bug], (resp, wall, bug) => {
      negate(resp, bug)
      bug.reflect(wall.normal)
    }]
  ]
)

// entity creation
const topWall = new Wall({
  x: 0,
  y: 0,
  orientation: 'horizontal',
  thickness: 10,
  normal: [0, -1]
})
engine.addEntity(topWall)

const bug = new Bug({
  x: 50,
  y: 50,
  width: 50,
  height: 50,
  velocity: rotate([1, 0], Math.PI / 6),
  bodyAngle: Math.PI / 3
})
engine.addEntity(bug)

const dialog = new AlertDialog()
dialog.choices = ['start']
dialog.open()
dialog.whenClosed().then((result) => {
  // boot engine
  engine.start()
})
