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
import Chart from 'chart.js/auto'
import FileSaver from 'file-saver'

function preventEscape (resp, wall, bug) {
  negate(resp, bug, wall)
  bug.reflect(wall.normal)
}

function devour (resp, weak, strong, game) {
  engine.deleteEntity(weak)
  strong.consumed++

  if ('starvation' in strong) strong.starvation = 0

  // if (strong instanceof PredatorBug && game.entities.get(PredatorBug).size > 6) return
  if ((strong instanceof PreyBug && strong.consumed === 5) || (strong instanceof PredatorBug && strong.consumed === 30)) {
    engine.deleteEntity(strong)
    repeat(2, () => {
      const child = new strong.constructor({
        x: strong.pos.x,
        y: strong.pos.y,
        bodyAngle: random(0, Math.PI / 2, true),
        ...mutate({
          ...strong.props,
          velocity: strong.initialVelocity
        })
      })
      game.addEntity(child)
    })
  }
}

let foods = 0

const canvas = document.querySelector('#collisionBodies')
const engine = new Engine(
  canvas,
  [
    [[Wall, PreyBug], preventEscape],
    [[Wall, PredatorBug], preventEscape],
    [[Food, PreyBug], (...args) => {
      devour(...args)
      foods--
    }],
    [[PreyBug, PredatorBug], devour]
  ]
)

// generate food
// let frameCount = 0
engine.tickFunctions.add(game => {
  // frameCount++
  // if (frameCount % 5 !== 0) return
  if (foods > 10000) return

  const createFood = () => {
    const food = new Food(
      random(50, window.innerWidth - 50),
      random(50, window.innerHeight - 50)
    )
    game.addEntity(food)
    foods++
  }

  createFood()
  createFood()
})

// show statistics
const preyCounts = []
const predatorCounts = []
const stats = {
  prey: [],
  predator: []
}
const ticks = []
const statsCanvas = document.createElement('canvas')
statsCanvas.width = 400
statsCanvas.height = 400
const entityCountChart = new Chart(
  statsCanvas,
  {
    type: 'line',
    options: {
      responsive: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left'
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right'
        }
      }
    },
    data: {
      labels: ticks,
      datasets: [
        {
          label: 'Prey',
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          data: preyCounts,
          yAxisID: 'y'
        },
        {
          label: 'Predator',
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132, 0.5)',
          data: predatorCounts,
          yAxisID: 'y1'
        }
      ]
    }
  }
)

engine.tickFunctions.add(game => {
  if (game.tickCount % 100 !== 0) return
  const preyCount = game.entities.get(PreyBug).size
  const predatorsCount = game.entities.get(PredatorBug).size
  preyCounts.push(preyCount)
  predatorCounts.push(predatorsCount)
  entityCountChart.update()
  ticks.push(game.tickCount)

  // update stats
  // dump everything
  const preyStats = []
  for (const prey of engine.entities.get(PreyBug)) {
    preyStats.push({
      ...prey.props,
      velocity: prey.initialVelocity
    })
  }
  stats.prey.push(preyStats)

  const predatorStats = []
  for (const predator of engine.entities.get(PredatorBug)) {
    predatorStats.push({
      ...predator.props,
      velocity: predator.initialVelocity
    })
  }
  stats.predator.push(predatorStats)

  if (preyCount === 0 || predatorsCount === 0) {
    engine.stop()
    const statData = JSON.stringify(stats)
    const blob = new Blob([statData])
    FileSaver.saveAs(blob, 'stats.json')
  }
})
document.querySelector('#overlay').open()

document.querySelector('#openPip').addEventListener('click', () => {
  const pipElem = document.createElement('video')
  pipElem.srcObject = statsCanvas.captureStream()
  pipElem.play()
  pipElem.addEventListener('loadedmetadata', () => {
    pipElem.requestPictureInPicture()
  })
})

// entity creation
const walls = {
  top: new Wall({
    x: 0,
    y: 0,
    orientation: 'horizontal',
    thickness: 50,
    normal: [0, -1]
  }),
  bottom: new Wall({
    x: 0,
    y: window.innerHeight - 50,
    orientation: 'horizontal',
    thickness: 50,
    normal: [0, 1]
  }),
  left: new Wall({
    x: 0,
    y: 0,
    orientation: 'vertical',
    thickness: 50,
    normal: [1, 0]
  }),
  right: new Wall({
    x: window.innerWidth - 50,
    y: 0,
    orientation: 'vertical',
    thickness: 50,
    normal: [-1, 0]
  })
}
for (const [, v] of Object.entries(walls)) {
  engine.addEntity(v)
}

// 처음에 10마리 소환
const preyConfig = {
  width: 20,
  height: 20,
  velocity: rotate([10, 0], Math.PI / 6),
  bodyAngle: Math.PI / 3,
  activity: 0.5
}

repeat(100, () => {
  const prey = new PreyBug({
    x: random(20, window.innerWidth - 20),
    y: random(20, window.innerHeight - 20),
    ...preyConfig
  })
  engine.addEntity(prey)
})

repeat(5, () => {
  const predator = new PredatorBug({
    x: random(20, window.innerWidth - 20),
    y: random(20, window.innerHeight - 20),
    width: 50,
    height: 20,
    velocity: rotate([10, 0], Math.PI / 6),
    bodyAngle: Math.PI / 4,
    activity: 0.3
  })
  engine.addEntity(predator)
})

// show dialog
const dialog = new AlertDialog()
dialog.choices = ['start']
dialog.open()
dialog.whenClosed().then((result) => {
  // boot engine
  engine.start()
})
