import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Player {
  constructor(camera,scene, speed,positionObject) {
    this.camera = camera;
    this.controller = new PlayerController(camera,positionObject); // Pass the camera here
    this.scene = scene;
    this.speed = speed;
    this.state = "idle";
    this.animations = {};
    this.lastRotation = 0;
    this.positionObject = positionObject;

    this.camera.setup(this.positionObject);

    this.loadModel();
  }

  loadModel() {
    var loader = new FBXLoader();
    loader.setPath("sonic1/");
    loader.load("untitled.fbx", (fbx) => {
      console.log(fbx);
      // fbx.scale.setScalar(0.024);
      fbx.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true; // Menambahkan receiveShadow pada setiap mesh
      });
      this.mesh = fbx;
      this.mesh.position.set(this.positionObject);
      this.scene.add(this.mesh);
      this.mesh.scale.set(0.09, 0.09, 0.09);
      this.mesh.rotation.y += Math.PI / -2;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.mixer = new THREE.AnimationMixer(this.mesh);

      var onLoad = (animName, anim) => {
        const clip = anim.animations[14]; //6,14
        const action = this.mixer.clipAction(clip);
        action.timeScale = 4;

        this.animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader();
      loader.setPath("sonic1/");
      loader.load("untitled.fbx", (fbx) => {
        onLoad("idle", fbx);
      });
      //loader.load('untitled.fbx', (fbx) => { onLoad('run', fbx) });
    });
  }

  update(dt) {
    if (this.mesh && this.animations) {
      this.lastRotation = this.mesh.rotation.y;
      var direction = new THREE.Vector3(0, 0, 0);

      if (this.controller.keys["forward"]) {
        console.log("hai");
        direction.x = 1;
        this.mesh.rotation.y = Math.PI / 2;
      }
      if (this.controller.keys["backward"]) {
        direction.x = -1;
        this.mesh.rotation.y = -Math.PI / 2;
      }
      if (this.controller.keys["left"]) {
        direction.z = -1;
        this.mesh.rotation.y = Math.PI;
      }
      if (this.controller.keys["right"]) {
        direction.z = 1;
        this.mesh.rotation.y = 0;
      }
      this.lastRotation = this.mesh.rotation.y;
      if (direction.length() == 0) {
        if (this.animations["idle"]) {
          if (this.state != "idle") {
            this.mixer.stopAllAction();
            this.state = "idle";
          }
          this.mixer.clipAction(this.animations["idle"].clip).play();
        }
      } else {
        if (this.animations["run"]) {
          if (this.state != "run") {
            this.mixer.stopAllAction();
            this.state = "run";
          }
          this.mixer.clipAction(this.animations["run"].clip).play();
        }
      }

      var forwardVector = new THREE.Vector3(1, 0, 0);
      var rightVector = new THREE.Vector3(0, 0, 1);
      forwardVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        // this.rotationVector.y
      );
      rightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        // this.rotationVector.y
      );

      this.mesh.position.add(
        forwardVector.multiplyScalar(dt * this.speed * direction.x)
      );
      this.mesh.position.add(
        rightVector.multiplyScalar(dt * this.speed * direction.z)
      );

      this.camera.setup(this.positionObject);

      if (this.mixer) {
        this.mixer.update(dt);
      }
    }
  }
}

export class PlayerController {
  constructor(ThirdPersonCamera,positionObject) { // Add camera parameter here
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    this.mouseDown = false;
    this.ThirdPersonCamera = ThirdPersonCamera; // Store camera reference
    this.previousMousePosition = {
      x: 0,
      y: 0
    };

    // Variables for rotation around a specific point
    this.center = positionObject; // Center of rotation, e.g., origin
    this.theta = 0;
    this.phi = 0;
    

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
    document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
    document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    document.addEventListener("wheel", (e) => this.onMouseWheel(e), false); // Add this line
  }
  onMouseDown(event) {
    if (event.which === 1) { // Left mouse button
      this.mouseDown = true;
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };
    }
  }
  onMouseUp(event) {
    this.mouseDown = false;
  }
  onMouseMove(event) {
    if (!this.mouseDown) return;

    const deltaX = (event.movementX || event.mozMovementX || event.webkitMovementX || 0) * 0.01; // Convert mouse position to angle
    const deltaY = (event.movementY || event.mozMovementY || event.webkitMovementY || 0) * 0.01; // Vertical rotation

    this.theta += deltaX; // Update theta based on horizontal movement
    this.phi += deltaY; // Update phi based on vertical movement
    // Ensure phi stays within the range of [-π/2, π/2] to avoid flipping the camera
    this.phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.phi));


    this.ThirdPersonCamera.updateCameraPosition(this.theta,this.phi,this.center);
    this.ThirdPersonCamera.camera.lookAt(this.center);

  }
  onMouseWheel(event) { // Add this function
    if (this.camera && this.camera.zoom) {
      if (event.deltaY < 0) {
        this.camera.zoom(-1); // Zoom in
      } else if (event.deltaY > 0) {
        this.camera.zoom(1); // Zoom out
      }
    }
  }
  onKeyDown(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys["forward"] = true;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys["backward"] = true;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys["left"] = true;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys["right"] = true;
        break;
    }
  }
  onKeyUp(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys["forward"] = false;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys["backward"] = false;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys["left"] = false;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys["right"] = false;
        break;
    }
  }
}

export class ThirdPersonCamera {
  constructor(camera, positionOffSet, targetOffSet) {
    this.camera = camera;
    this.positionOffSet = positionOffSet;
    this.targetOffSet = targetOffSet;
    this.zoomLevel = 1; // Default zoom level
    this.camera.rotation.order = 'YXZ'; // Set rotation order if needed
    this.doOnce = false;
    this.radius = 100; // Radius from center to camera position
  }
  // Function to update camera position based on rotation
  updateCameraPosition(theta,phi,center) {
    const x = center.x + this.radius * Math.sin(theta);
    const y = center.y + this.radius * Math.sin(phi);
    const z = center.z + this.radius * Math.cos(theta);
    this.camera.position.set(x, y, z);
  }
  setup(positionObject) {
    if(!this.doOnce){
      this.doOnce = true;
      this.camera.lookAt(positionObject);
    }
  }
  zoom(deltaZoom) {
    this.zoomLevel += deltaZoom * 0.1;
    this.zoomLevel = Math.max(0.5, Math.min(this.zoomLevel, 2)); // Clamp zoom level between 0.5 and 2
  }
}
