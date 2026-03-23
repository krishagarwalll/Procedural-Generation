import * as THREE from "/build/three.module.js";

export function createScene(containerSelector = ".render-view") {
    const container = document.querySelector(containerSelector);

    if (!container) {
        throw new Error(`Could not find render container: ${containerSelector}`);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8f6f1");

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    function resizeScene() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.render(scene, camera);
    }

    window.addEventListener("resize", resizeScene);

    return { scene, camera, renderer };
}
