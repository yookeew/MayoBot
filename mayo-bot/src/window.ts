import { getCurrentWindow } from '@tauri-apps/api/window';

export class WindowDragger {
  element: HTMLElement;
  isDragging: boolean;
  dragStartPos: { x: number; y: number };

  constructor(element: HTMLElement) {
    this.element = element;
    this.isDragging = false;
    this.dragStartPos = { x: 0, y: 0 };

    this.setupDragging();
  }

  setupDragging() {
    this.element.addEventListener('mousedown', async (e) => {
      this.isDragging = true;
      this.dragStartPos = { x: e.clientX, y: e.clientY };

      // Start Tauri window drag
      await getCurrentWindow().startDragging();
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }
}