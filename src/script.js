import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**********************************************
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**********************************************
 * Galaxy
 */
const parameters = {
  count: 10000,
  size: 0.02,
  radius: 5, //lunghezzadel radio del cerchio di galaxy
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: 0xff6030,
  outsideColor: 0x1623df,
};

let geometry = null;
let material = null;
let points = null;

const createGalaxy = () => {
  /**
   * Destroy old Galaxy
   */
  if (points !== null) {
    // metodo "dispose" cancella la mermoria da quel variabile che abbiamo concatenato
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }
  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    // mtodo i3 per creare dei var in base a 3 valori qui per vector 3
    const i3 = i * 3;

    //randomize particles sul raggio di parameters.radius
    const radius = Math.random() * parameters.radius;
    //calc angolo di ogni slice in base del valore parameters.branches
    const branchesAngle =
      //il modulo ci da indice tra 0 e il valore parameters.branches
      //dividendo l'indice modulato al parameters.branches avremmo un valore tra 0-1
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    //multiplicare il valore spin al radius = aumenta il valore di radius spin% quindi cresce esponenzialmente da 0 al max del raggio
    const spinAngle = parameters.spin * radius;

    //Inside & ouside Colors
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    //il colore terzo che viene mischiato con altri due (lerp(...))
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    //usare Power fa che con l'aumento del power i particles più vicini all'radius siano piu vicini tra di loro, e quindi crea luminisità al centro
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    //position([i3], i3 + 1, [i3 + 2])  Math.cos & sin per renderizzare i raggi dentro un cerchio
    //+spinAgnle crea una forma curva
    //i valori randoX,Y,Z randomizza i particles lungo la curva
    positions[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = Math.sin(branchesAngle + spinAngle) * radius + randomY;
    positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ;

    //colors
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);

  scene.add(points);
};
createGalaxy();

/**
 * Gui Tweaks
 */
gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, "radius")
  .min(0.2)
  .max(8)
  .step(0.2)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, "branches")
  .min(1)
  .max(10)
  .step(1)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.1)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(createGalaxy);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(createGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(createGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(createGalaxy);

/**********************************************
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**********************************************
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**********************************************
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**********************************************
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
