import PreyBug from '../src/PreyBug.js'
import mutate from '../src/mutate.js'
import FileSaver from 'file-saver'

// 1. 20세대까지 변이시키기
// 2. width, height등 다 레코드하기
// 3. 그래프로 그리기 - 파이썬 쓰자
const record = {
  width: [50],
  height: [50],
  velocity: [[1, 0]],
  activity: [0.2]
}

function renderPrey (entity) {
  const prey = document.createElement('div')
  prey.classList.add('prey')
  prey.style.width = `${entity.props.width}px`
  prey.style.height = `${entity.props.height}px`
  prey.textContent = `[${entity.props.velocity}], ${entity.props.activity}`

  document.body.appendChild(prey)
}

const genesisBug = new PreyBug({
  x: 50,
  y: 50,
  width: 50,
  height: 50,
  velocity: [1, 0],
  bodyAngle: 0,
  activity: 0.5
})
renderPrey(genesisBug)
const bugs = [genesisBug]

function * bugGenerator () {
  for (let generation = 1; generation <= 10; generation++) {
    const l = bugs.length
    for (let j = 0; j < l; j++) {
      const bug = bugs[j]
      for (let i = 0; i < 2; i++) {
        const child = new PreyBug(mutate(bug.props))
        // renderPrey(child)
        bugs.push(child)
        record.width.push(child.props.width)
        record.height.push(child.props.height)
        record.velocity.push(child.props.velocity)
        record.activity.push(child.props.activity)
      }
    }
    document.querySelector('#generation').textContent = generation
    document.querySelector('#bugCount').textContent = bugs.length
    yield
  }

  // 결과 저장하기
  console.log('stringify in process...')
  FileSaver.saveAs(new Blob([JSON.stringify(record)]), 'stats.json')
  console.log('done')
}

const generator = bugGenerator()
document.querySelector('#nextBtn').addEventListener('click', () => {
  generator.next()
})

document.querySelector('#forward').addEventListener('click', () => {
  let result
  do {
    result = generator.next()
  } while (!result.done)
})
