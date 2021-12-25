import Entity from './Entity.js'
import { random } from 'lodash-es'

export default class Food extends Entity {
  /**
   * @param {number} x x position in pixel
   * @param {number} y y position in pixel
   */
  constructor (x, y) {
    super({
      x,
      y,
      width: 10,
      height: 10,
      bodyAngle: random(0, Math.PI / 2, true),
      velocity: [0, 0]
    })
  }
}
