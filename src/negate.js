// eslint-disable-next-line no-unused-vars
import Entity from './Entity.js'
// eslint-disable-next-line no-unused-vars
import Wall from './Wall.js'

/**
 * @param {object} resp
 * @param {object} resp.overlapV
 * @param {number} resp.overlapV.x
 * @param {number} resp.overlapV.y
 * @param {Entity} target
 * @param {Wall} wall
 */
export default function (resp, target, wall) {
  // FIX: overlapV 부호 문제로 부호 직접 계산
  const { overlapV } = resp
  const deltaX = Math.abs(overlapV.x) * wall.normal[0]
  const deltaY = Math.abs(overlapV.y) * wall.normal[1] * -1

  target.pos.x += deltaX
  target.pos.y += deltaY
}
