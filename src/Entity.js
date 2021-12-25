import { Box } from 'detect-collisions'
// eslint-disable-next-line no-unused-vars
import Engine from './Engine.js'
import { rotate, norm, divide } from 'mathjs'

/**
 * 벡터 정규화
 * @param {[number, number]} vector
 */
function normalize (vector) {
  return divide(vector, norm(vector))
}

/**
 * 개체.
 * NOTE: velocity를 설정해도 `move()`를 호출하지 않으면 움직이지 않습니다.
 */
export default class Entity extends Box {
  /**
   * @param {object} props
   * @param {number} props.x
   * @param {number} props.y
   * @param {number} props.width
   * @param {number} props.height
   * @param {number} props.bodyAngle
   * @param {[number, number]} props.velocity
   */
  constructor (props) {
    super({ x: props.x, y: props.y }, props.width, props.height)

    /**
     * 변이의 대상이 되는 특성들
     */
    this.props = {
      width: props.width,
      height: props.height,
      bodyAngle: props.bodyAngle,
      velocity: props.velocity
    }

    // body angle 적용
    this.setBodyAngle(this.props.bodyAngle)

    /**
     * frame since creation
     * @type {number}
     */
    this.age = 0
    this.create()
  }

  /**
   * creation callback - should implement this rather than extending constructor
   * @abstract
   */
  create () {}

  /**
   * tick callback
   * @abstract
   * @param {Engine} game
   */
  tick (game) {}

  /**
   * collision callback
   * @abstract
   * @param {object} response
   * @param {Engine} game
   */
  collision (response, game) {}

  /**
   * deletion callback
   * @abstract
   * @param {Engine} game
   */
  delete (game) {}

  /**
   * draw callback
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {
    super.draw(ctx)
    this.drawVelocity(ctx)
  }

  /**
   * draw velocity vector
   * @param {CanvasRenderingContext2D} ctx
   */
  drawVelocity (ctx) {
    const centroid = [this.pos.x + this.props.width / 2, this.pos.y + this.props.height / 2]
    const normalizedVelocity = normalize(this.props.velocity)
    ctx.moveTo(...centroid)
    ctx.lineTo(
      centroid[0] + normalizedVelocity[0] * this.props.width,
      centroid[1] - normalizedVelocity[1] * this.props.width // 좌표계가 다르기때문에...
    )
  }

  /**
   * 중심을 기준으로 반시계방향으로 엔티티를 회전시킵니다
   * @param {number} angle new angle in radian
   */
  setBodyAngle (angle) {
    // 먼저 왼쪽 위 기준으로 회전
    super.setAngle(-angle)

    // 무게중심을 처음과 일치하도록 회전시키기
    // NOTE: 아래 모든 좌표는 왼쪽 위 점 기준 상대좌표
    const { x, y } = this.getCentroid()
    this.translate(
      (this.props.width / 2) - x,
      (this.props.height / 2) - y
    )
  }

  /**
   * 운동 방향을 반시계방향으로 회전시킵니다
   * @param {number} angle new angle in radian
   */
  setVelocityAngle (angle) {
    this.props.velocity = rotate(this.props.velocity, angle)
  }

  setAngle (angle) {
    this.setBodyAngle(angle)
    this.setVelocityAngle(angle)
  }

  /**
   * 위치를 평행이동시킵니다. `bodyAngle`과 상관없이 작동합니다.
   * @param {number} x delta x in pixels.
   * @param {number} y delta y in pixels
   */
  translate (x, y) {
    // super.translate는 bodyAngle에 의존해서 작동함
    // 그래서 평행이동 벡터 (x, y)를 현재 각도와 반대로 회전시킨 후 평행이동 적용
    // TODO: this.angle만큼 회전시켜야 되는거 아님?
    super.translate(...rotate([x, y], -this.angle))
  }

  /**
   * 중심을 원점으로 개체를 움직입니다.
   */
  move () {
    const [deltaX, deltaY] = this.props.velocity
    // deltaX, deltaY는 부호가 좌표평면 기준임. y좌표에 +하면 위로 움직임.
    // 하지만 내부 좌표는 왼쪽 가장 위가 원점인 좌표평면 기준임. y좌표에 +하면 아래로 움직임.
    // 따라서 x는 둘이 같지만 y는 부호가 반대임
    this.pos.x += deltaX
    this.pos.y -= deltaY
  }
}
