import { System } from 'detect-collisions'
// eslint-disable-next-line no-unused-vars
import Entity from './Entity.js'

// collision rule example:
// [
//   [[Wall, Bug], (resp, game) => {}]
// ]

/**
 * @name CollisionCallback
 * @function
 * @param {object} response
 * @param {Engine} game
 * @param {Entity} entityA
 * @param {Entity} entityB
 */

export default class Engine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {[[Function, Function], CollisionCallback][]} collisionRules
   */
  constructor (canvas, collisionRules) {
    /**
     * 클래스별 엔티티들
     * @type {Map<Function, Set<Entity>}
     */
    this.entities = new Map()

    /**
     * 충돌 계
     * @type {System}
     */
    this.system = new System()

    /**
     * @type {Map<[Function, Function], CollisionCallback>}
     */
    this.collisionRules = new Map(collisionRules)

    /**
     * requestAnimationFrame의 결과
     * @type {number}
     */
    this.handle = -1

    /**
     * 렌더링이 이루어질 캔버스 2d 컨텍스트
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = canvas.getContext('2d')

    /**
     * 처리된 tick 수
     */
    this.tickCount = 0

    /**
     * Tick당 호출할 함수들
     */
    this.tickFunctions = new Set()

    this.paused = false

    // 캔버스 설정 - 팬 색
    this.ctx.strokeStyle = 'blue'

    // 충돌 룰에 나온 엔티티 종류들 모두 map에 추가
    for (const [[EntityClassA, EntityClassB]] of collisionRules) {
      if (!this.entities.has(EntityClassA)) {
        this.entities.set(EntityClassA, new Set())
      }

      if (!this.entities.has(EntityClassB)) {
        this.entities.set(EntityClassB, new Set())
      }
    }
  }

  /**
   * @param {Entity} entity
   */
  addEntity (entity) {
    this.system.insert(entity)

    const entityClass = entity.constructor
    if (!this.entities.has(entityClass)) {
      this.entities.set(entityClass, new Set())
    }
    this.entities.get(entityClass).add(entity)
  }

  /**
   * @param {Entity} entity
   */
  deleteEntity (entity) {
    this.entities.get(entity.constructor).delete(entity)
    this.system.remove(entity)
    entity.delete(this)
  }

  _tick () {
    if (this.paused) return
    this.tickCount++

    for (const fn of this.tickFunctions) {
      fn(this)
    }

    // 엔티티별 업데이트
    for (const entities of this.entities.values()) {
      for (const entity of entities) {
        entity.tick(this)
      }
    }

    // 물리 엔진 업데이트
    this.system.update()

    // 충돌 처리
    for (const [[EntityClassA, EntityClassB], collisionHandler] of this.collisionRules.entries()) {
      for (const entityA of this.entities.get(EntityClassA)) {
        for (const entityB of this.entities.get(EntityClassB)) {
          if (this.system.checkCollision(entityA, entityB)) {
            collisionHandler(this.system.response, entityA, entityB, this)
          }
        }
      }
    }

    // body를 캔버스에 그리기
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.beginPath()
    this.system.draw(this.ctx)
    this.handle = requestAnimationFrame(this._tick.bind(this))
  }

  start () {
    this.handle = requestAnimationFrame(this._tick.bind(this))
    this.paused = false
  }

  stop () {
    cancelAnimationFrame(this.handle)
    this.paused = true
  }
}
