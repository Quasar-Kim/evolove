import Bug from './Bug.js'

export default class PredatorBug extends Bug {
  constructor (props) {
    super(props)

    this.starvation = 0
  }

  tick (game) {
    super.tick(game)
    this.starvation++
    if (this.starvation > 300) {
      game.deleteEntity(this)
    }
  }

  /**
   * 색깔을 빨간색으로 렌더링
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {
    ctx.strokeStyle = 'red'
    super.draw(ctx)
    ctx.strokeStyle = 'blue'
  }
}
