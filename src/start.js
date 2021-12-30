import { times as repeat, random } from 'lodash-es'
import Chart from 'chart.js/auto'
import FileSaver from 'file-saver'

import Engine from './Engine.js'
import Wall from './Wall.js'
import Food from './Food.js'
import PreyBug from './PreyBug.js'
import PredatorBug from './PredatorBug.js'
import negate from './negate.js'
import mutate from './mutate.js'

/**
 * @param {object} config
 * @param {string} config.renderCanvas
 * @param {object} config.stats
 * @param {string} config.stats.canvas
 * @param {string} config.stats.downloadButton
 * @param {object} config.predator
 * @param {number} config.predator.fissionOn
 * @param {number} config.predator.count
 * @param {object} config.predator.props
 * @param {object} config.prey
 * @param {number} config.prey.fissionOn
 * @param {number} config.prey.count
 * @param {object} config.prey.props
 * @param {object} config.control
 * @param {string} config.control.playButton
 * @param {string} config.control.stopButton
 */
export default function start (config) {
  // 상수
  const INNER_WIDTH = window.innerWidth
  const INNER_HEIGHT = window.innerHeight
  const WALL_THICKNESS = 50

  // 글로벌 변수들
  let foods = 0

  // Element 들
  const playButtonElem = document.querySelector(config.control.playButton)
  const stopButtonElem = document.querySelector(config.control.stopButton)
  const renderCanvasElem = document.querySelector(config.renderCanvas)
  const statsCanvasElem = document.querySelector(config.stats.canvas)
  const statsDownloadButtonElem = document.querySelector(config.stats.downloadButton)

  // 통계 데이터
  const preyCounts = []
  const predatorCounts = []
  const ticks = []
  const stats = {
    prey: [],
    predator: []
  }

  // 통계를 보여줄 차트 생성
  const entityCountChart = new Chart(
    statsCanvasElem,
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

  // 다운로드 버튼 클릭시 통계 데이터 다운로드 할 수 있게

  /**
   * 수집된 통계 데이터 다운로드
   */
  function downloadStats () {
    const statData = JSON.stringify(stats)
    const blob = new Blob([statData])
    FileSaver.saveAs(blob, 'stats.json')
  }
  statsDownloadButtonElem.addEventListener('click', () => downloadStats())

  // 오브젝트 사이의 상호작용 정의

  /**
   * 오브젝트가 벽에 부딛쳤을때 탈출 방지
   */
  function preventEscape (resp, wall, bug) {
    negate(resp, bug, wall)
    bug.reflect(wall.normal)
  }

  /**
   * 먹기(먹이를 prey가, prey를 predator가)
   */
  function devour (resp, weak, strong, game) {
    engine.deleteEntity(weak)
    strong.consumed++

    if ('starvation' in strong) strong.starvation = 0

    if ((strong instanceof PreyBug && strong.consumed === config.prey.fissionOn) || (strong instanceof PredatorBug && strong.consumed === config.predator.fissionOn)) {
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

  const interactions = [
    [[Wall, PreyBug], preventEscape],
    [[Wall, PredatorBug], preventEscape],
    [[Food, PreyBug], (...args) => {
      devour(...args)
      foods--
    }],
    [[PreyBug, PredatorBug], devour]
  ]

  // 매 틱마다 일어나는 일들 정의

  /**
   * 음식 2개씩 필드 안에 소환
   * @param {Engine} game
   */
  function summonFoods (game) {
    if (foods > 10000) return

    const createFood = () => {
      const food = new Food(
        random(50, INNER_WIDTH - 50),
        random(50, window.innerHeight - 50)
      )
      game.addEntity(food)
      foods++
    }

    createFood()
    createFood()
  }

  /**
   * 데이터 수집하고 차트 표시
   * @param {Engine} game
   */
  function gatherStats (game) {
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
  }

  // 엔진 만들기
  const engine = new Engine(renderCanvasElem, interactions)
  engine.tickFunctions
    .add(summonFoods)
    .add(gatherStats)

  // 컨트롤 버튼에 리스너 바인딩
  playButtonElem.addEventListener('click', () => engine.start())
  stopButtonElem.addEventListener('click', () => engine.stop())

  // 엔티티 만들기: 벽
  // TODO: 벽 숨기기
  const walls = {
    top: new Wall({
      x: 0,
      y: 0,
      orientation: 'horizontal',
      thickness: WALL_THICKNESS,
      normal: [0, -1]
    }),
    bottom: new Wall({
      x: 0,
      y: window.innerHeight - WALL_THICKNESS,
      orientation: 'horizontal',
      thickness: WALL_THICKNESS,
      normal: [0, 1]
    }),
    left: new Wall({
      x: 0,
      y: 0,
      orientation: 'vertical',
      thickness: WALL_THICKNESS,
      normal: [1, 0]
    }),
    right: new Wall({
      x: INNER_WIDTH - WALL_THICKNESS,
      y: 0,
      orientation: 'vertical',
      thickness: WALL_THICKNESS,
      normal: [-1, 0]
    })
  }
  for (const wall of Object.values(walls)) {
    engine.addEntity(wall)
  }

  // 엔티티 만들기: preyBug
  repeat(config.prey.count, () => {
    const prey = new PreyBug({
      x: random(WALL_THICKNESS, INNER_WIDTH - WALL_THICKNESS - config.prey.props.width),
      y: random(WALL_THICKNESS, INNER_HEIGHT - WALL_THICKNESS - config.prey.props.height),
      ...config.prey.props
    })
    engine.addEntity(prey)
  })

  // 엔티티 만들기: predatorBug
  repeat(config.predator.count, () => {
    const predator = new PredatorBug({
      x: random(WALL_THICKNESS, INNER_WIDTH - WALL_THICKNESS - config.predator.props.width),
      y: random(WALL_THICKNESS, INNER_HEIGHT - WALL_THICKNESS - config.predator.props.height),
      ...config.predator.props
    })
    engine.addEntity(predator)
  })

  // 마지막으로 엔진 시작
  engine.start()
}
