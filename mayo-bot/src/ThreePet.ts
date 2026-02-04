import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class ThreePet {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model?: THREE.Object3D;
  mixer?: THREE.AnimationMixer;
  actions: { [key: string]: THREE.AnimationAction } = {};
  clock: THREE.Clock;
  ready = false;

  constructor(canvas: HTMLCanvasElement) {
    console.log('ThreePet constructor ran', canvas);

    // 1️⃣ Scene
    this.scene = new THREE.Scene();

    // 2️⃣ Camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.5, 3);
    this.camera.lookAt(0, 1, 0);

    // 3️⃣ Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(600, 600);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 4️⃣ Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 5);
    this.scene.add(dir);

    // Clock for animations
    this.clock = new THREE.Clock();

    // 5️⃣ Load model
    this.loadModel();

    // 6️⃣ Start render loop
    this.animate();
  }

  loadModel() {
    console.log('LOADING MODEL FROM: /model.glb');

    const loader = new GLTFLoader();
    loader.load('/model.glb', (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);

      // Position, scale, rotation
      this.model.position.set(0, 0, 0);
      this.model.scale.setScalar(1);       // scale down
      this.model.rotation.y = Math.PI * 3/2; // rotate 270° (90° left)

      // Animations
      if (gltf.animations.length) {
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach((clip) => {
          const name = clip.name.toLowerCase();
          this.actions[name] = this.mixer!.clipAction(clip);
        });
      }

        this.ready = true;

      console.log('Model loaded!', gltf);
    });
  }

  // Play an animation by lowercase name
  play(actionName: string) {
    if (!this.mixer || !this.actions[actionName]) return;

    Object.values(this.actions).forEach(a => a.stop());
    this.actions[actionName].play();
  }

worldPos = new THREE.Vector3(0, 0, 0);

moveBy(dx: number, dy: number) {
  if (!this.model) return;

  const speed = 0.005; // tweak feel here

  this.worldPos.x += dx * speed;
  this.worldPos.y -= dy * speed; // invert Y

  this.model.position.copy(this.worldPos);
}

  // Update mixer each frame
  update(delta: number) {
    if (this.mixer) this.mixer.update(delta);
  }

  // Render loop
  animate = () => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    this.update(delta);

    this.renderer.render(this.scene, this.camera);
  };
}
