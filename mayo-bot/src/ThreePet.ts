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

    // Scene
    this.scene = new THREE.Scene();

    // Camera
   const size = 5;
   const aspect = 1; // 600 / 600

   this.camera = new THREE.OrthographicCamera(
     -size * aspect,
     size * aspect,
     size,
     -size,
     0.1,
     100
   );

   // Position camera diagonally above the scene
   this.camera.position.set(10, 10, 10);

   // Classic isometric angles
   this.camera.rotation.order = 'YXZ';
   this.camera.rotation.y = Math.PI / 4;        // 45°
   this.camera.rotation.x = -Math.atan(1 / Math.sqrt(2)); // ≈ 35.264°
   this.camera.zoom = 1.2; // try 0.8 – 2.0

   this.camera.updateProjectionMatrix();
    /*
    this.camera = new THREE.PerspectiveCamera(
      50,
      1, // 600/600 = 1
      0.1,
      100
    );
    this.camera.position.set(0, 1.5, 3);
    this.camera.lookAt(0, 1, 0);*/

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(600, 600);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 5);
    this.scene.add(dir);

    // Clock for animations
    this.clock = new THREE.Clock();

    // Load model
    this.loadModel();

    // Start render loop
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
      this.model.scale.setScalar(1);
      this.model.rotation.y = Math.PI * 3 / 2; // rotate 270° (90° left)

      // Animations
      if (gltf.animations.length) {
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach((clip) => {
          const name = clip.name.toLowerCase();
          const action = this.mixer!.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          this.actions[name] = action;
        });

        // Start with idle
        if (this.actions['idle']) {
          this.actions['idle'].play();
        }
      }

      this.ready = true;
      console.log('Model loaded!', gltf);
      console.log('Available animations:', Object.keys(this.actions));
    });
  }

  // Play an animation by lowercase name
  play(actionName: string) {
    if (!this.mixer || !this.actions[actionName]) {
      console.warn(`Animation "${actionName}" not found`);
      return;
    }

    Object.values(this.actions).forEach(a => a.stop());
    this.actions[actionName].play();
  }

  // Convert screen coordinates to world position (perspective-safe)
   setScreenPosition(
     screenX: number,
     screenY: number,
     canvasWidth: number,
     canvasHeight: number
   ) {
     if (!this.model) return;

     const mouse = new THREE.Vector2(
       (screenX / canvasWidth) * 2 - 1,
       -(screenY / canvasHeight) * 2 + 1
     );

     const raycaster = new THREE.Raycaster();
     raycaster.setFromCamera(mouse, this.camera);

     // XZ ground plane (Y = 0)
     const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
     const hit = new THREE.Vector3();

     if (raycaster.ray.intersectPlane(plane, hit)) {
       this.model.position.x = hit.x;
       this.model.position.z = hit.z;
     }
   }

/*
  setScreenPosition(
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (!this.model) return;

    // Normalize mouse coords (-1 to +1)
    const mouse = new THREE.Vector2(
      (screenX / canvasWidth) * 2 - 1,
      -(screenY / canvasHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Horizontal plane at y = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, hit)) {
      this.model.position.x = hit.x;
      this.model.position.z = hit.z;
    }
  }*/


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