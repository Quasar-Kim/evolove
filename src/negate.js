// eslint-disable-next-line no-unused-vars
import Entity from './Entity.js'

function increase (val, by) {
  if (val < 0) {
    return val - by
  } else if (val > 0) {
    return val + by
  } else {
    return 0
  }
}

/**
 * @param {object} resp
 * @param {object} resp.overlapV
 * @param {number} resp.overlapV.x
 * @param {number} resp.overlapV.y
 * @param {Entity} target
 */
export default function (resp, target) {
  const { overlapV } = resp

  // debugger
  
  target.pos.x -= overlapV.x
  target.pos.y += overlapV.y
}
