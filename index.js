import start from './src/start.js'

// 처음 시작 시 dialog 표시
const dialogElem = document.querySelector('#configOverlay')
dialogElem.open()

// form submit시 시뮬레이터 시작
document.querySelector('#setting').addEventListener('submit', evt => {
  evt.preventDefault()
  dialogElem.close()
  document.querySelector('section.left-panel').hidden = false

  const setting = Object.fromEntries(new FormData(evt.target))
  start({
    renderCanvas: '#renderer',
    control: {
      playButton: '#startButton',
      stopButton: '#resumeButton'
    },
    stats: {
      canvas: '#populationChart',
      downloadButton: '#downloadStats'
    },
    predator: {
      count: Number(setting.predatorCount),
      fissionOn: Number(setting.predatorFissionOn),
      props: JSON.parse(setting.predatorProps)
    },
    prey: {
      count: Number(setting.preyCount),
      fissionOn: Number(setting.preyFissionOn),
      props: JSON.parse(setting.preyProps)
    }
  })
})
