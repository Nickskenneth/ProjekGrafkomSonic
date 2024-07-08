import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Player {
  constructor(camera, controller, scene, speed) {
    this.camera = camera;
    this.controller = new PlayerController(camera); // Pass the camera here
    this.scene = scene;
    this.speed = speed;
    this.state = "idle";
    this.rotationVector = new THREE.Vector3(0, 0, 0);
    this.animations = {};
    this.lastRotation = 0;

    this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);

    this.loadModel();
  }

  loadModel() {
    var loader = new FBXLoader();
    loader.setPath("sonic1/");
    loader.load("untitled.fbx", (fbx) => {
      // fbx.scale.setScalar(0.024);
      fbx.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true; // Menambahkan receiveShadow pada setiap mesh
      });
      this.mesh = fbx;
      this.scene.add(this.mesh);
      this.mesh.position.set(-20, -17, 55);
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
      console.log(direction.length());
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

      if (this.controller.mouseDown) {
        var dtMouse = this.controller.deltaMousePos;
        dtMouse.x = dtMouse.x / Math.PI;
        dtMouse.y = dtMouse.y / Math.PI;

        // this.rotationVector.y += dtMouse.x * dt * 10;
        // this.rotationVector.z += dtMouse.y * dt * 10;
        this.rotationVector.y += dtMouse.x * dt * 0; // untuk dia tidak rotate pas diem
        this.rotationVector.z += dtMouse.y * dt * 0;
      }
      this.mesh.rotation.y += this.rotationVector.y;

      var forwardVector = new THREE.Vector3(1, 0, 0);
      var rightVector = new THREE.Vector3(0, 0, 1);
      forwardVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.rotationVector.y
      );
      rightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.rotationVector.y
      );

      this.mesh.position.add(
        forwardVector.multiplyScalar(dt * this.speed * direction.x)
      );
      this.mesh.position.add(
        rightVector.multiplyScalar(dt * this.speed * direction.z)
      );

      this.camera.setup(this.mesh.position, this.rotationVector);

      if (this.mixer) {
        this.mixer.update(dt);
      }
    }
  }
}

export class PlayerController {
  constructor(camera) { // Add camera parameter here
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();
    this.camera = camera; // Store camera reference

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
    document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
    document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    document.addEventListener("wheel", (e) => this.onMouseWheel(e), false); // Add this line
  }
  onMouseDown(event) {
    this.mouseDown = true;
  }
  onMouseUp(event) {
    this.mouseDown = false;
  }
  onMouseMove(event) {
    var currentMousePos = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    this.deltaMousePos.addVectors(
      currentMousePos,
      this.mousePos.multiplyScalar(-1)
    );
    this.mousePos.copy(currentMousePos);
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
  }
  setup(target, angle) {
    var temp = new THREE.Vector3(0, 0, 0);
    temp.copy(this.positionOffSet);
    temp.multiplyScalar(this.zoomLevel); // Apply zoom level

    // Apply rotations (roll, pitch, yaw)
    var roll = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), angle.x);
    var pitch = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle.y);
    var yaw = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.z);
    
    temp.applyAxisAngle(roll, angle.x);
    temp.applyAxisAngle(pitch, angle.y);
    temp.applyAxisAngle(yaw, angle.z);

    temp.add(target);

    this.camera.position.copy(temp);

    var newTarget = new THREE.Vector3(0, 0, 0);
    newTarget.copy(this.targetOffSet);
    newTarget.add(target);

    this.camera.lookAt(newTarget);
  }
  zoom(deltaZoom) {
    this.zoomLevel += deltaZoom * 0.1;
    this.zoomLevel = Math.max(0.5, Math.min(this.zoomLevel, 2)); // Clamp zoom level between 0.5 and 2
  }
}
