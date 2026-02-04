import { ThreePet } from './threePet'

export class Pet {
  three: ThreePet
  position = { x: 200, y: 200 }
  walkInterval: number | null = null
  dragOffset: { x: number; y: number } | null = null

  constructor() {
    const canvas = document.getElementById('pet-canvas') as HTMLCanvasElement
    this.three = new ThreePet(canvas)

    this.setupDrag()
    this.setupClickFollow()
  }


  moveTo(x: number, y: number) {
    const dx = x - this.position.x;
    const dy = y - this.position.y;

    this.position = { x, y };
    this.three.moveBy(dx, dy);
  }


  walkTo(x: number, y: number, duration: number) {
      console.log("walkto called")
      if (!this.three.ready) return
    this.stopWalking()
    this.three.play('walk')

    const start = { ...this.position }
    const startTime = Date.now()

    this.walkInterval = window.setInterval(() => {
      const t = Math.min((Date.now() - startTime) / duration, 1)

      this.moveTo(
        start.x + (x - start.x) * t,
        start.y + (y - start.y) * t
      )

      if (t >= 1) this.stopWalking()
    }, 16)
  }

  stopWalking() {
    if (this.walkInterval) clearInterval(this.walkInterval)
    this.walkInterval = null
    this.three.play('idle')
  }

  setupDrag() {
    window.addEventListener('mousedown', (e) => {
      this.dragOffset = {
        x: e.clientX - this.position.x,
        y: e.clientY - this.position.y,
      }
      this.three.play('drag')
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.dragOffset) return
      this.moveTo(
        e.clientX - this.dragOffset.x,
        e.clientY - this.dragOffset.y
      )
    })

    window.addEventListener('mouseup', () => {
      this.dragOffset = null
      this.three.play('idle')
    })
  }

  setupClickFollow() {
    window.addEventListener('click', (e) => {
        console.log("click event listener called")
      this.walkTo(e.clientX, e.clientY, 1000)
    })
  }
}
