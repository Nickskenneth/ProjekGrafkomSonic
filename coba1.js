// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer
document.body.appendChild(renderer.domElement);

// Ground plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.ShadowMaterial({ color: 0x000000 });
planeMaterial.opacity = 0.5;
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true; // This plane receives shadows
scene.add(plane);

// Transparent Box (shadow caster)
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 0.5;
box.castShadow = true; // This box casts shadows
scene.add(box);

// Transparent Sphere (shadow caster)
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 0.5, 0);
sphere.castShadow = true; // This sphere casts shadows
scene.add(sphere);

// Light setup
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
light.castShadow = true; // This light casts shadows
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
scene.add(light);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();