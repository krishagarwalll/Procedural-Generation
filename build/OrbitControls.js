import * as THREE from "./three.module.js";

const STATE = {
    NONE: -1,
    ROTATE: 0,
    PAN: 1
};

export class OrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.target = new THREE.Vector3();
        this.enabled = true;
        this.minDistance = 5;
        this.maxDistance = 150;
        this.minPolarAngle = 0.01;
        this.maxPolarAngle = Math.PI / 2;
        this.rotateSpeed = 0.005;
        this.zoomSpeed = 0.12;
        this.panSpeed = 0.0025;

        this.state = STATE.NONE;
        this.pointerStart = new THREE.Vector2();
        this.spherical = new THREE.Spherical();
        this.offset = new THREE.Vector3();
        this.panVector = new THREE.Vector3();
        this.sideways = new THREE.Vector3();
        this.upward = new THREE.Vector3();

        this.updateSpherical();

        this.handleContextMenu = (event) => event.preventDefault();
        this.handlePointerDown = (event) => this.onPointerDown(event);
        this.handlePointerMove = (event) => this.onPointerMove(event);
        this.handlePointerUp = () => this.onPointerUp();
        this.handleWheel = (event) => this.onWheel(event);

        this.domElement.style.touchAction = "none";
        this.domElement.addEventListener("contextmenu", this.handleContextMenu);
        this.domElement.addEventListener("pointerdown", this.handlePointerDown);
        this.domElement.addEventListener("wheel", this.handleWheel, { passive: false });
    }

    updateSpherical() {
        this.offset.copy(this.camera.position).sub(this.target);
        this.spherical.setFromVector3(this.offset);
    }

    update() {
        this.spherical.radius = THREE.MathUtils.clamp(
            this.spherical.radius,
            this.minDistance,
            this.maxDistance
        );
        this.spherical.phi = THREE.MathUtils.clamp(
            this.spherical.phi,
            this.minPolarAngle,
            this.maxPolarAngle
        );

        this.offset.setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(this.offset);
        this.camera.lookAt(this.target);
        this.camera.updateMatrixWorld();
    }

    onPointerDown(event) {
        if (!this.enabled) {
            return;
        }

        this.state = event.button === 2 || event.shiftKey ? STATE.PAN : STATE.ROTATE;
        this.pointerStart.set(event.clientX, event.clientY);

        window.addEventListener("pointermove", this.handlePointerMove);
        window.addEventListener("pointerup", this.handlePointerUp);
    }

    onPointerMove(event) {
        if (!this.enabled) {
            return;
        }

        const deltaX = event.clientX - this.pointerStart.x;
        const deltaY = event.clientY - this.pointerStart.y;
        this.pointerStart.set(event.clientX, event.clientY);

        if (this.state === STATE.ROTATE) {
            this.spherical.theta -= deltaX * this.rotateSpeed;
            this.spherical.phi -= deltaY * this.rotateSpeed;
        } else if (this.state === STATE.PAN) {
            const distance = this.camera.position.distanceTo(this.target);
            const movement = distance * this.panSpeed;

            this.camera.updateMatrix();

            this.sideways.setFromMatrixColumn(this.camera.matrix, 0);
            this.upward.setFromMatrixColumn(this.camera.matrix, 1);

            this.panVector
                .copy(this.sideways)
                .multiplyScalar(-deltaX * movement)
                .add(this.upward.multiplyScalar(deltaY * movement));

            this.camera.position.add(this.panVector);
            this.target.add(this.panVector);
            this.updateSpherical();
        }

        this.update();
    }

    onPointerUp() {
        this.state = STATE.NONE;
        window.removeEventListener("pointermove", this.handlePointerMove);
        window.removeEventListener("pointerup", this.handlePointerUp);
    }

    onWheel(event) {
        if (!this.enabled) {
            return;
        }

        event.preventDefault();

        const scale = 1 + Math.sign(event.deltaY) * this.zoomSpeed;
        this.spherical.radius *= scale;
        this.update();
    }

    dispose() {
        this.domElement.removeEventListener("contextmenu", this.handleContextMenu);
        this.domElement.removeEventListener("pointerdown", this.handlePointerDown);
        this.domElement.removeEventListener("wheel", this.handleWheel);
        window.removeEventListener("pointermove", this.handlePointerMove);
        window.removeEventListener("pointerup", this.handlePointerUp);
    }
}
