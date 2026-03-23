import * as THREE from "./build/three.module.js";
import { OrbitControls } from "./build/OrbitControls.js";

export const FOREST_SIZE = 58;

export let scene;
export let camera;
export let renderer;
export let controls;
export let forestGroup;

export function setScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#d7ecff");
    scene.fog = new THREE.Fog("#d7ecff", 45, 135);

    const renderView = document.querySelector(".render-view");
    const aspectRatio = renderView.clientWidth / renderView.clientHeight;

    camera = new THREE.PerspectiveCamera(55, aspectRatio, 0.1, 250);
    camera.position.set(30, 24, 30);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(renderView.clientWidth, renderView.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderView.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 6, 0);
    controls.minDistance = 8;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.update();

    window.addEventListener("resize", resizeScene);
}

export function setSceneElements() {
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.75);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#fff3cd", 1.1);
    directionalLight.position.set(28, 38, 16);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 140;
    directionalLight.shadow.camera.left = -55;
    directionalLight.shadow.camera.right = 55;
    directionalLight.shadow.camera.top = 55;
    directionalLight.shadow.camera.bottom = -55;
    scene.add(directionalLight);

    const ground = createGround();
    scene.add(ground);

    forestGroup = new THREE.Group();
    forestGroup.name = "forest";
    scene.add(forestGroup);
}

function createGround() {
    const geometry = new THREE.PlaneGeometry(120, 120, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: "#7da66d",
        roughness: 1
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    const scale = (FOREST_SIZE + 24) / 120;
    ground.scale.set(scale, scale, 1);

    return ground;
}

function resizeScene() {
    const renderView = document.querySelector(".render-view");

    camera.aspect = renderView.clientWidth / renderView.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(renderView.clientWidth, renderView.clientHeight);
}
