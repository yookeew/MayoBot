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
  facingLocked = false;
  clickTimeout: number | null = null;
  currentFacing: Facing = 'front-right';

  constructor() {
    const canvas = document.getElementById('pet-canvas') as HTMLCanvasElement;
    this.three = new ThreePet(canvas);

    this.setupDrag();
    this.setupClickFollow();
    this.setupDoubleClickPet();
  }

  moveTo(x: number, y: number) {
    // Clamp x/y to canvas bounds
    x = Math.max(0, Math.min(this.canvasSize.width, x));
    y = Math.max(0, Math.min(this.canvasSize.height, y));

    if (!this.facingLocked && this.lastX !== null && this.lastY !== null) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        let facing: Facing;

        if (dx >= 0 && dy >= 0) facing = 'front-right';
        else if (dx < 0 && dy >= 0) facing = 'front-left';
        else if (dx >= 0 && dy < 0) facing = 'back-right';
        else facing = 'back-left';

        this.three.setFacing(facing);
        this.currentFacing = facing;
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

  walkTo(x: number, y: number) {
    if (!this.three.ready) return;

    // Clamp destination to canvas bounds
    x = Math.max(0, Math.min(this.canvasSize.width, x));
    y = Math.max(0, Math.min(this.canvasSize.height, y));

    this.stopWalking();
    this.three.play('walk');

    const start = { ...this.position };
    const dx = x - start.x;
    const dy = y - start.y;
    const distance = Math.hypot(dx, dy);

    // Set a constant duration per pixel
    const SPEED = 3; // pixels per frame, higher = faster
    const totalFrames = distance / SPEED;
    const startTime = Date.now();

    this.walkInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / (totalFrames * 16), 1); // 16ms per frame

      this.moveTo(
        start.x + dx * t,
        start.y + dy * t
      );

      if (t >= 1) this.stopWalking();
    }, 16);
  }


  stopWalking() {
    if (this.walkInterval) clearInterval(this.walkInterval);
    this.walkInterval = null;
    this.three.play('idle');
  }

  isPointOnPet(clientX: number, clientY: number) {
    const rect = this.three.renderer.domElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const PET_RADIUS = 50; // adjust to match your pet size

    const dx = x - this.position.x;
    const dy = y - this.position.y;

    return dx * dx + dy * dy <= PET_RADIUS * PET_RADIUS;
  }

  setupDrag() {
    let startPos: { x: number; y: number } | null = null;
    const DRAG_THRESHOLD = 5; // pixels

    window.addEventListener('mousedown', (e) => {
      if (!this.isPointOnPet(e.clientX, e.clientY)) return;

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
        this.facingLocked = true;
        this.stopWalking();
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
      this.facingLocked = false;
      this.dragOffset = null;
      startPos = null;
      this.isDragging = false;
    });
  }

  setupClickFollow() {
    window.addEventListener('click', (e) => {
      if (this.isDragging) return;

      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
        return;
      }

      this.clickTimeout = window.setTimeout(() => {
        const rect = this.three.renderer.domElement.getBoundingClientRect();
        this.walkTo(
          e.clientX - rect.left,
          e.clientY - rect.top
        );
        this.clickTimeout = null;
      }, 250); // must be < system double-click time
    });
  }

  setupDoubleClickPet() {
    window.addEventListener('dblclick', (e) => {
      if (this.isDragging) return;

      // Only pet if double-click is on the pet
      if (!this.isPointOnPet(e.clientX, e.clientY)) return;

      this.stopWalking();
      this.facingLocked = true;

      const previousFacing = this.currentFacing;

      // Face front for petting
      this.three.setFacing('front');
      this.currentFacing = 'front';

      this.three.play('pet');

      // Hold pet animation for 2 seconds
      setTimeout(() => {
        //this.three.setFacing(previousFacing);
        this.currentFacing = previousFacing;
        this.facingLocked = false;
        this.three.play('idle');
      }, 2000);
    });
  }
}
