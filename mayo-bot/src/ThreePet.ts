import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class ThreePet {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model?: THREE.Object3D;

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
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 4️⃣ Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 5);
    this.scene.add(dir);

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

      this.model.position.set(0, 0, 0);
      this.model.scale.setScalar(0.1);
        this.model.rotation.y = Math.PI * 3 / 2;


      console.log('Model loaded!', gltf);
    });
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
