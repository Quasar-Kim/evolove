import gaussian from 'gaussian'
import { random } from 'lodash-es'

function mutateInRange (val, variation, min, max) {
  const random = gaussian(val, variation).random(1)[0]

  if (random < min) return min
  else if (random > max) return max
  return random
}

function mutateSmall (key, val) {
  switch (key) {
    case 'height':
    case 'width': {
      return mutateInRange(val, 10, 1, 1000)
    }
    case 'velocity': {
      return val.map(i => mutateInRange(i, 0.1, 0.25, 150))
    }
    case 'activity': {
      return mutateInRange(val, 0.005, 0.001, 1)
    }
  }
}

function mutateBig (key, val) {
  switch (key) {
    case 'height':
    case 'width': {
      return mutateInRange(val, 25, 1, 1000)
    }
    case 'velocity': {
      return val.map(i => mutateInRange(i, 1, 0.5, 150))
    }
    case 'activity': {
      return mutateInRange(val, 0.01, 0.00001, 1)
    }
  }
}

/**
 * 개체의 prop을 받아 일정 확률로 변이시킨 prop을 돌려줍니다.
 * 파라미터로 준 prop은 변화되지 않습니다.
 *
 * 10% 확률로 각 속성이 작게 변합니다.
 * 1% 확률로 크게 변합니다.
 * @param {object} props
 * @param {number} props.width
 * @param {number} props.height
 * @param {[number, number]} props.velocity
 * @param {number} props.activity
 */
export default function mutate (props) {
  const mutated = {}

  for (const [key, val] of Object.entries(props)) {
    const p = random()

    if (p <= 0.01) {
      mutated[key] = mutateBig(key, val)
      // console.log(`mutate small on prop ${key}: ${val} => ${mutated[key]}`)
    } else if (p <= 0.1) {
      mutated[key] = mutateSmall(key, val)
      // console.log(`mutate big on prop ${key}: ${val} => ${mutated[key]}`)
    } else {
      mutated[key] = val
    }
  }

  return mutated
}
