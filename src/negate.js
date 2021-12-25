// eslint-disable-next-line no-unused-vars
import Entity from './Entity.js'

/**
 * @param {object} resp
 * @param {object} resp.overlapV
 * @param {number} resp.overlapV.x
 * @param {number} resp.overlapV.y
 * @param {Entity} target
 */
export default function (resp, target) {
  const { overlapV } = resp
  target.pos.x -= overlapV.x
  target.pos.y -= overlapV.y
}
