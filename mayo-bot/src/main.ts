import { getCurrentWindow } from '@tauri-apps/api/window';
import { Pet } from './pet';
import { WindowDragger } from './window';

// Initialize pet
const pet = new Pet('pet');

// Setup dragging
const petElement = document.getElementById('pet')!;
new WindowDragger(petElement);

// ESC key to close
document.addEventListener('keydown', async (e) => {
  if (e.key === 'Escape') {
    await getCurrentWindow().close();
  }
});

// Test walking - click background to make pet walk
document.addEventListener('click', (e) => {
  if (e.target !== petElement) {
    // Walk to clicked position
    const petCenter = pet.position.x + petElement.offsetWidth / 2;
    const clickX = e.clientX;

    if (clickX < petCenter) {
      pet.walkLeft(100, 1000); // 100px in 1 second
    } else {
      pet.walkRight(100, 1000);
    }
  }
});