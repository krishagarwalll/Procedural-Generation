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

function buildPineTree(parent, height, trunkColor, foliageEntries) {
    const trunkHeight = height * (0.28 + Math.random() * 0.1);
    const trunkRadius = height * (0.055 + Math.random() * 0.025);
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
        const coneHeight = height * (0.26 + Math.random() * 0.08);
        const coneRadius = height * (0.16 + Math.random() * 0.08) * (1.05 - index * 0.16);
        const cone = createConeMesh(coneRadius, coneHeight, createLeafMaterial(foliageEntries));
        cone.position.y = trunkHeight + coneHeight * 0.45 + index * coneHeight * 0.28;
        parent.add(cone);
    }
}

function buildRoundTree(parent, height, trunkColor, foliageEntries) {
    const trunkHeight = height * (0.42 + Math.random() * 0.14);
    const trunkRadius = height * (0.06 + Math.random() * 0.025);
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
        const radius = height * (0.16 + Math.random() * 0.08) * offset.scale;
        const canopy = createSphereMesh(radius, createLeafMaterial(foliageEntries));
        canopy.position.set(offset.x, offset.y, offset.z);
        parent.add(canopy);
    });
}

function buildDeadTree(parent, height, trunkColor) {
    const trunkHeight = height * (0.75 + Math.random() * 0.17);
    const trunkRadius = height * (0.05 + Math.random() * 0.02);
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
        const branchLength = height * (0.22 + Math.random() * 0.1);
        const branch = createCylinderMesh(
            trunkRadius * 0.18,
            trunkRadius * 0.26,
            branchLength,
            trunkColor
        );

        branch.position.y = trunkHeight * (0.45 + Math.random() * 0.4);
        // Math.random() sets irregular branch angles for a rough dead-tree silhouette.
        branch.rotation.z = -1.2 + Math.random() * 2.4;
        branch.rotation.x = -0.35 + Math.random() * 0.7;
        branch.rotation.y = (index / branchCount) * Math.PI * 2 + (-0.35 + Math.random() * 0.7);
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
        mixOffset: -0.18 + Math.random() * 0.36,
        hueOffset: -0.02 + Math.random() * 0.04,
        lightnessOffset: -0.07 + Math.random() * 0.14
    };

    foliageEntries.push(entry);
    return material;
}

function getTrunkColor() {
    const trunkColor = new THREE.Color("#6d4c41");
    // Math.random() shifts the trunk shade a little for procedural bark variation.
    trunkColor.offsetHSL(-0.01 + Math.random() * 0.02, 0, -0.06 + Math.random() * 0.09);
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
