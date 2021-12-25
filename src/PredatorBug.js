import Bug from './Bug.js'

export default class PredatorBug extends Bug {
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
