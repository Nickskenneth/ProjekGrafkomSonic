import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(player);

camera.position.set(0, 5, 10);
camera.lookAt(player.position);

const zoomSpeed = 0.1;
const minDistance = 5;
const maxDistance = 20;

let zoomDirection = 0; // -1 for zoom out, 1 for zoom in

function onKeyDown(event) {
    if (event.code === 'ArrowUp') {
        zoomDirection = 1;
    } else if (event.code === 'ArrowDown') {
        zoomDirection = -1;
    }
}

function onKeyUp(event) {
    if ((event.code === 'ArrowUp' && zoomDirection === 1) ||
        (event.code === 'ArrowDown' && zoomDirection === -1)) {
        zoomDirection = 0;
    }
}

function zoomCamera() {
    const distance = camera.position.distanceTo(player.position);
    const zoomFactor = zoomDirection * zoomSpeed;
    
    if ((distance + zoomFactor >= minDistance && distance + zoomFactor <= maxDistance) ||
        (zoomDirection === 0)) {
        camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), zoomFactor);
    } else {
        // Toggle zoom direction if reaching min or max distance
        zoomDirection = -zoomDirection;
    }
}

function animate() {
    requestAnimationFrame(animate);
    zoomCamera(); // Call zoomCamera in the animation loop
    renderer.render(scene, camera);
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

animate(); // Start animation loop immediately
