import * as THREE from "./build/three.module.js";

export function createTree(type, height) {
    const root = new THREE.Group();
    const swayGroup = new THREE.Group();
    const foliageEntries = [];

    root.add(swayGroup);

    const trunkColor = getTrunkColor();

    if (type === "pine") {
        buildPineTree(swayGroup, height, trunkColor, foliageEntries);
    } else if (type === "round") {
        buildRoundTree(swayGroup, height, trunkColor, foliageEntries);
    } else {
        buildDeadTree(swayGroup, height, trunkColor);
    }

    return { root, swayGroup, foliageEntries };
}

export function applyLeafColour(entry, treeColor) {
    const lightGreen = new THREE.Color("#74b45c");
    const darkGreen = new THREE.Color("#2f6f3b");
    const mix = THREE.MathUtils.clamp(treeColor + entry.mixOffset, 0, 1);

    entry.material.color.lerpColors(darkGreen, lightGreen, mix);
    entry.material.color.offsetHSL(entry.hueOffset, 0, entry.lightnessOffset);
}

export function randomRange(min, max) {
    // Core procedural helper built directly on Math.random().
    return min + Math.random() * (max - min);
}

function buildPineTree(parent, height, trunkColor, foliageEntries) {
    // Math.random() varies trunk proportions so each pine is slightly different.
    const trunkHeight = height * randomRange(0.28, 0.38);
    const trunkRadius = height * randomRange(0.055, 0.08);
    const trunk = createCylinderMesh(
        trunkRadius * 0.7,
        trunkRadius,
        trunkHeight,
        trunkColor
    );
    trunk.position.y = trunkHeight / 2;
    parent.add(trunk);

    const crownCount = 3;

    for (let index = 0; index < crownCount; index += 1) {
        // Math.random() tweaks cone sizes to keep the tree layers procedural.
        const coneHeight = height * randomRange(0.26, 0.34);
        const coneRadius = height * randomRange(0.16, 0.24) * (1.05 - index * 0.16);
        const cone = createConeMesh(coneRadius, coneHeight, createLeafMaterial(foliageEntries));
        cone.position.y = trunkHeight + coneHeight * 0.45 + index * coneHeight * 0.28;
        parent.add(cone);
    }
}

function buildRoundTree(parent, height, trunkColor, foliageEntries) {
    const trunkHeight = height * randomRange(0.42, 0.56);
    const trunkRadius = height * randomRange(0.06, 0.085);
    const trunk = createCylinderMesh(
        trunkRadius * 0.75,
        trunkRadius,
        trunkHeight,
        trunkColor
    );
    trunk.position.y = trunkHeight / 2;
    parent.add(trunk);

    const canopyOffsets = [
        { x: 0, y: trunkHeight + height * 0.2, z: 0, scale: 1 },
        { x: -height * 0.12, y: trunkHeight + height * 0.1, z: height * 0.05, scale: 0.72 },
        { x: height * 0.14, y: trunkHeight + height * 0.12, z: -height * 0.08, scale: 0.64 }
    ];

    canopyOffsets.forEach((offset) => {
        // Math.random() adds small shape changes to the round canopy pieces.
        const radius = height * randomRange(0.16, 0.24) * offset.scale;
        const canopy = createSphereMesh(radius, createLeafMaterial(foliageEntries));
        canopy.position.set(offset.x, offset.y, offset.z);
        parent.add(canopy);
    });
}

function buildDeadTree(parent, height, trunkColor) {
    const trunkHeight = height * randomRange(0.75, 0.92);
    const trunkRadius = height * randomRange(0.05, 0.07);
    const trunk = createCylinderMesh(
        trunkRadius * 0.35,
        trunkRadius,
        trunkHeight,
        trunkColor
    );
    trunk.position.y = trunkHeight / 2;
    parent.add(trunk);

    const branchCount = 3;

    for (let index = 0; index < branchCount; index += 1) {
        const branchLength = height * randomRange(0.22, 0.32);
        const branch = createCylinderMesh(
            trunkRadius * 0.18,
            trunkRadius * 0.26,
            branchLength,
            trunkColor
        );

        branch.position.y = trunkHeight * randomRange(0.45, 0.85);
        // Math.random() sets irregular branch angles for a rough dead-tree silhouette.
        branch.rotation.z = randomRange(-1.2, 1.2);
        branch.rotation.x = randomRange(-0.35, 0.35);
        branch.rotation.y = (index / branchCount) * Math.PI * 2 + randomRange(-0.35, 0.35);
        parent.add(branch);
    }
}

function createLeafMaterial(foliageEntries) {
    const material = new THREE.MeshStandardMaterial({
        color: "#4f8b44",
        flatShading: true,
        roughness: 1
    });

    const entry = {
        material,
        // Math.random() stores a unique palette offset for each canopy piece.
        mixOffset: randomRange(-0.18, 0.18),
        hueOffset: randomRange(-0.02, 0.02),
        lightnessOffset: randomRange(-0.07, 0.07)
    };

    foliageEntries.push(entry);
    return material;
}

function getTrunkColor() {
    const trunkColor = new THREE.Color("#6d4c41");
    // Math.random() shifts the trunk shade a little for procedural bark variation.
    trunkColor.offsetHSL(randomRange(-0.01, 0.01), 0, randomRange(-0.06, 0.03));
    return trunkColor;
}

function createCylinderMesh(radiusTop, radiusBottom, height, color) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 6, 1);
    const material = new THREE.MeshStandardMaterial({
        color,
        flatShading: true,
        roughness: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createConeMesh(radius, height, material) {
    const geometry = new THREE.ConeGeometry(radius, height, 6, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createSphereMesh(radius, material) {
    const geometry = new THREE.SphereGeometry(radius, 6, 5);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
