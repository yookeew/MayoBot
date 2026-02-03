export class Pet {
  element: HTMLElement;
  state: 'idle' | 'walking-left' | 'walking-right';
  position: { x: number; y: number };
  walkInterval: number | null;
  dragOffset: { x: number; y: number } | null;

  constructor(elementId: string) {
    this.element = document.getElementById(elementId)!;
    this.state = 'idle';
    this.position = { x: 0, y: 0 };
    this.walkInterval = null;
    this.dragOffset = null;

    this.updatePosition();
    this.setupDrag();
    this.setupClickFollow();
  }

  setState(newState: 'idle' | 'walking-left' | 'walking-right') {
    this.element.classList.remove(this.state);
    this.state = newState;
    this.element.classList.add(this.state);
  }

  updatePosition() {
    const rect = this.element.getBoundingClientRect();
    this.position.x = rect.left;
    this.position.y = rect.top;
  }

  moveTo(x: number, y: number) {
    const maxX = window.innerWidth - this.element.offsetWidth;
    const maxY = window.innerHeight - this.element.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.transform = 'none';
    this.position = { x, y };
  }

  walkTo(targetX: number, targetY: number, duration: number) {
    this.stopWalking();
    this.setState(targetX >= this.position.x ? 'walking-right' : 'walking-left');

    const startX = this.position.x;
    const startY = this.position.y;
    const startTime = Date.now();

    this.walkInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentX = startX + (targetX - startX) * progress;
      const currentY = startY + (targetY - startY) * progress;
      this.moveTo(currentX, currentY);

      if (progress >= 1) this.stopWalking();
    }, 16);
  }

  stopWalking() {
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
    this.setState('idle');
  }

  // -------------------
  // Dragging logic
  // -------------------
  setupDrag() {
    this.element.addEventListener('mousedown', (e) => {
      this.dragOffset = {
        x: e.clientX - this.position.x,
        y: e.clientY - this.position.y,
      };
      this.stopWalking();
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.dragOffset) return;
      this.moveTo(e.clientX - this.dragOffset.x, e.clientY - this.dragOffset.y);
    });

    document.addEventListener('mouseup', () => {
      this.dragOffset = null;
    });
  }

  // -------------------
  // Click-to-follow logic
  // -------------------
  setupClickFollow() {
    window.addEventListener('click', (e) => {
      // Ignore clicks on the pet itself
      if (e.target === this.element) return;

      const targetX = e.clientX - this.element.offsetWidth / 2;
      const targetY = e.clientY - this.element.offsetHeight / 2;

      this.walkTo(targetX, targetY, 1000); // 1 second duration
    });
  }
}