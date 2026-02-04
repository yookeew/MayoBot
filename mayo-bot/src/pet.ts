import { ThreePet } from './threePet';

export class Pet {
  three: ThreePet;
  position = { x: 300, y: 300 }; // Start at center of 600x600 canvas
  canvasSize = { width: 600, height: 600 };
  walkInterval: number | null = null;
  dragOffset: { x: number; y: number } | null = null;
  isDragging = false;
  lastX: number | null = null;
  lastY: number | null = null;


  constructor() {
    const canvas = document.getElementById('pet-canvas') as HTMLCanvasElement;
    this.three = new ThreePet(canvas);

    this.setupDrag();
    this.setupClickFollow();
  }

/*
  moveTo(x: number, y: number) {
    this.position = { x, y };
    this.three.setScreenPosition(x, y, this.canvasSize.width, this.canvasSize.height);
  }*/

    lastX: number | null = null;
    lastY: number | null = null;

   moveTo(x: number, y: number) {
     if (this.lastX !== null && this.lastY !== null) {
       const dx = x - this.lastX;
       const dy = y - this.lastY;

       // Only update facing if movement exceeds threshold
       if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
         let facing: Facing;

         if (dx >= 0 && dy >= 0) facing = 'front-right';
         else if (dx < 0 && dy >= 0) facing = 'front-left';
         else if (dx >= 0 && dy < 0) facing = 'back-right';
         else facing = 'back-left';

         this.three.setFacing(facing);
       }
     }

     this.lastX = x;
     this.lastY = y;

     this.position = { x, y };
     this.three.setScreenPosition(
       x,
       y,
       this.canvasSize.width,
       this.canvasSize.height
     );
   }

  /*
  moveTo(x: number, y: number) {
    if (this.lastX !== null) {
      const dx = x - this.lastX;

      if (dx !== 0) {
        this.three.setFacing(dx > 0 ? 'right' : 'left');
      }
    }

    this.lastX = x;

    this.position = { x, y };
    this.three.setScreenPosition(
      x,
      y,
      this.canvasSize.width,
      this.canvasSize.height
    );
  }*/

  walkTo(x: number, y: number, duration: number) {
    console.log('walkTo called');
    if (!this.three.ready) return;

    this.stopWalking();
    this.three.play('walk');

    const start = { ...this.position };
    const startTime = Date.now();

    this.walkInterval = window.setInterval(() => {
      const t = Math.min((Date.now() - startTime) / duration, 1);

      this.moveTo(
        start.x + (x - start.x) * t,
        start.y + (y - start.y) * t
      );

      if (t >= 1) this.stopWalking();
    }, 16);
  }

  stopWalking() {
    if (this.walkInterval) clearInterval(this.walkInterval);
    this.walkInterval = null;
    this.three.play('idle');
  }

  setupDrag() {
    let startPos: { x: number; y: number } | null = null;
    const DRAG_THRESHOLD = 5; // pixels

    window.addEventListener('mousedown', (e) => {
      startPos = { x: e.clientX, y: e.clientY };
      this.dragOffset = {
        x: e.clientX - this.position.x,
        y: e.clientY - this.position.y,
      };
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.dragOffset || !startPos) return;

      const dist = Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y);

      if (dist > DRAG_THRESHOLD && !this.isDragging) {
        this.isDragging = true;
        this.stopWalking();
        console.log("dragging called")
        this.three.play('grab');
      }

      if (this.isDragging) {
          const rect = this.three.renderer.domElement.getBoundingClientRect();
        this.moveTo(
          e.clientX - rect.left - this.dragOffset.x,
          e.clientY - rect.top - this.dragOffset.y
        );
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.three.play('idle');
      }
      this.dragOffset = null;
      startPos = null;
      this.isDragging = false;
    });
  }

  setupClickFollow() {
    window.addEventListener('click', (e) => {
      // Only walk if we didn't just drag
      if (this.isDragging) return;

      console.log('click event listener called');
      const rect = this.three.renderer.domElement.getBoundingClientRect();
        this.walkTo(
          e.clientX - rect.left,
          e.clientY - rect.top,
          1000
        );
    });
  }
}