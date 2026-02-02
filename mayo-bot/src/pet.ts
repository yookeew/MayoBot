export class Pet {
  element: HTMLElement;
  state: 'idle' | 'walking-left' | 'walking-right';
  position: { x: number; y: number };
  walkInterval: number | null;

  constructor(elementId: string) {
    this.element = document.getElementById(elementId)!;
    this.state = 'idle';
    this.position = { x: 0, y: 0 };
    this.walkInterval = null;

    this.updatePosition();
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
    // Keep within screen bounds
    const maxX = window.innerWidth - this.element.offsetWidth;
    const maxY = window.innerHeight - this.element.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.transform = 'none'; // Remove centering transform
    this.position = { x, y };
  }

  walkLeft(distance: number, duration: number) {
    this.stopWalking();
    this.setState('walking-left');

    const startX = this.position.x;
    const targetX = Math.max(0, startX - distance);
    const startTime = Date.now();

    this.walkInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentX = startX + (targetX - startX) * progress;
      this.moveTo(currentX, this.position.y);

      if (progress >= 1) {
        this.stopWalking();
      }
    }, 16); // ~60fps
  }

  walkRight(distance: number, duration: number) {
    this.stopWalking();
    this.setState('walking-right');

    const startX = this.position.x;
    const maxX = window.innerWidth - this.element.offsetWidth;
    const targetX = Math.min(maxX, startX + distance);
    const startTime = Date.now();

    this.walkInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentX = startX + (targetX - startX) * progress;
      this.moveTo(currentX, this.position.y);

      if (progress >= 1) {
        this.stopWalking();
      }
    }, 16);
  }

  stopWalking() {
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
    this.setState('idle');
  }
}