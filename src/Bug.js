import Entity from './Entity.js'
import { subtract, dot, multiply } from 'mathjs'

function reflectVector (vector, normal) {
  return subtract(vector, multiply(2 * dot(vector, normal), normal))
}

// 회전하는 상황
// 1. 벽에 부딛쳤을때 - velocityAngle만 회전
// 2. 움직일때 - bodyAngle, velocityAngle 모두 회전

export default class Bug extends Entity {
  tick (game) {
    this.move()
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
