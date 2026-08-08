/**
 * Combat3DCamera - 3D Camera Manager for Three Kingdoms Battlefield
 * Handles perspective camera positioning, responsive aspect ratio updates, and camera zoom transitions.
 */
class Combat3DCamera {
  constructor(width, height) {
    const fov = 45;
    const aspect = width / height;
    const near = 0.1;
    const far = 1000;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    // Default Isometric Camera Position & Target
    this.defaultPos = { x: 0, y: 3.8, z: 9.0 };
    this.defaultLook = { x: 0, y: 1.2, z: 0 };

    this.currentLook = { ...this.defaultLook };
    this.camera.position.set(this.defaultPos.x, this.defaultPos.y, this.defaultPos.z);
    this.camera.lookAt(this.currentLook.x, this.currentLook.y, this.currentLook.z);

    this.zoomAnim = null;
  }

  updateAspect(width, height) {
    if (!height || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getCamera() {
    return this.camera;
  }

  /**
   * Smoothly lerps camera position & lookAt target toward focus point over durationMs
   */
  zoomTo(targetX, targetY, targetZ, lookX, lookY, lookZ, durationMs = 1800) {
    const startPos = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
    const startLook = { ...this.currentLook };

    const startTime = performance.now();

    this.zoomAnim = {
      update: () => {
        const elapsed = performance.now() - startTime;
        const p = Math.min(1.0, elapsed / durationMs);
        const easeP = p * (2 - p); // Smooth ease-out curve

        this.camera.position.x = THREE.MathUtils.lerp(startPos.x, targetX, easeP);
        this.camera.position.y = THREE.MathUtils.lerp(startPos.y, targetY, easeP);
        this.camera.position.z = THREE.MathUtils.lerp(startPos.z, targetZ, easeP);

        this.currentLook.x = THREE.MathUtils.lerp(startLook.x, lookX, easeP);
        this.currentLook.y = THREE.MathUtils.lerp(startLook.y, lookY, easeP);
        this.currentLook.z = THREE.MathUtils.lerp(startLook.z, lookZ, easeP);

        this.camera.lookAt(this.currentLook.x, this.currentLook.y, this.currentLook.z);

        if (p >= 1.0) {
          this.zoomAnim = null;
        }
      }
    };
  }

  /**
   * Resets camera instantly back to default position & lookAt
   */
  resetCamera() {
    this.zoomAnim = null;
    this.camera.position.set(this.defaultPos.x, this.defaultPos.y, this.defaultPos.z);
    this.currentLook = { ...this.defaultLook };
    this.camera.lookAt(this.currentLook.x, this.currentLook.y, this.currentLook.z);
  }

  update() {
    if (this.zoomAnim) {
      this.zoomAnim.update();
    }
  }
}

window.Combat3DCamera = Combat3DCamera;
