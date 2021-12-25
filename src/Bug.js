import Entity from './Entity.js'
import { subtract, dot, multiply } from 'mathjs'
import { random } from 'lodash-es'

function reflectVector (vector, normal) {
  return subtract(vector, multiply(2 * dot(vector, normal), normal))
}

// 회전하는 상황
// 1. 벽에 부딛쳤을때 - velocityAngle만 회전
// 2. 움직일때 - bodyAngle, velocityAngle 모두 회전

export default class Bug extends Entity {
  /**
   * @param {object} props
   * @param {number} props.x
   * @param {number} props.y
   * @param {number} props.width
   * @param {number} props.height
   * @param {number} props.bodyAngle
   * @param {[number, number]} props.velocity 속도 벡터, 단위는 px/frame
   * @param {number} props.activity 활동성
   */
  constructor (props) {
    super({
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      bodyAngle: props.bodyAngle,
      velocity: props.velocity
    })

    /**
     * 활동성. 또는 매 프레임 방향을 전환할 확률
     * @type {number}
     */
    this.props.activity = props.activity

    /**
     * 생성된 이후에 지난 프레임 수
     * @type {number}
     */
    this.age = 0

    /**
     * 먹은 무언가의 개수.
     */
    this.consumed = 0
  }

  tick (game) {
    this.age++

    if (this.age % 5 === 0) this.changeDirection()
    this.move()
  }

  changeDirection () {
    if (random(true) > this.props.activity) return
    this.rotate(random(0, Math.PI, true))
  }

  /**
   * 주어진 노말 벡터를 기준으로 반사되듯이 속도 벡터 회전.
   * 몸체의 각도는 변하지 않습니다
   * @param {[number, number]} normal
   */
  reflect (normal) {
    this.props.velocity = reflectVector(this.props.velocity, normal)
  }
}
