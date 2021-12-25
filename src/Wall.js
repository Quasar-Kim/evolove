import Entity from './Entity.js'

export default class Wall extends Entity {
  /**
   * @param {object} config
   * @param {number} config.x x position of an upper left point in pixel
   * @param {number} config.y y position of an upper left point in pixel
   * @param {'vertical' | 'horizontal'} config.orientation
   * @param {number} config.thickness thickness in pixel
   * @param {[number, number]} config.normal normal vector of wall
   */
  constructor (config) {
    const superConfig = {
      x: config.x,
      y: config.y,
      bodyAngle: 0,
      velocity: [0, 0]
    }

    if (config.orientation === 'horizontal') {
      superConfig.width = window.innerWidth
      superConfig.height = config.thickness
    } else if (config.orientation === 'vertical') {
      superConfig.width = config.thickness
      superConfig.height = window.innerHeight
    } else {
      throw new TypeError('invalid orientation:', config.orientation)
    }

    super(superConfig)

    /**
     * 벽의 노멀 벡터. reflection 계산에 사용됨.
     * @type {[number, number]}
     */
    this.normal = config.normal
  }
}
