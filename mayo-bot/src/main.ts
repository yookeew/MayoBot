import { getCurrentWindow } from '@tauri-apps/api/window';
import { Pet } from './pet';

// Configure fullscreen transparent window
async function configureWindow() {
  const win = getCurrentWindow();

  await win.setDecorations(false);
  await win.setAlwaysOnTop(true);
}

// Initialize
configureWindow();

// Create pet
const pet = new Pet('pet');

// ESC key to close
document.addEventListener('keydown', async (e) => {
  if (e.key === 'Escape') {
    await getCurrentWindow().close();
  }
});

// Right-click anywhere to close (backup method)
document.addEventListener('contextmenu', async (e) => {
  e.preventDefault();
  const shouldClose = confirm('Close Mayo Bot?');
  if (shouldClose) {
    await getCurrentWindow().close();
  }
});