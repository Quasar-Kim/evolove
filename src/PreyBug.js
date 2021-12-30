import Bug from './Bug.js'

export default class PreyBug extends Bug {
  super (props) {
    this.starvation = 0
  }

  tick (game) {
    super.tick(game)
    this.starvation++
    if (this.starvation > 300) {
      game.deleteEntity(this)
    }
  }
}
