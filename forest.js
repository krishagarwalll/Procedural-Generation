import { FOREST_SIZE } from "./setup.js";
import { applyLeafColour, createTree } from "./trees.js";

export function createForestManager(forestGroup) {
    const swayTargets = [];
    const foliageEntries = [];

    const settings = {
        treeCount: 90,
        minHeight: 3,
        maxHeight: 7,
        treeColor: 0.56,
        pineEnabled: true,
        roundEnabled: true,
        deadEnabled: true
    };

    function generateForest() {
        clearForest();

        const enabledTypes = getEnabledTreeTypes();
        const placements = [];

        for (let index = 0; index < settings.treeCount; index += 1) {
            const treeType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

            const treeHeight =
                settings.minHeight + Math.random() * (settings.maxHeight - settings.minHeight);
            const footprintRadius = 0.8 + treeHeight * (0.1 + Math.random() * 0.08);
            const position = findOpenPosition(footprintRadius, placements);

            if (!position) {
                continue;
            }

            const tree = createTree(treeType, treeHeight);

            tree.root.position.set(position.x, 0, position.z);
            tree.root.rotation.y = Math.random() * Math.PI * 2;

            placements.push({
                x: position.x,
                z: position.z,
                radius: footprintRadius
            });

            tree.foliageEntries.forEach((entry) => {
                foliageEntries.push(entry);
            });

            swayTargets.push({
                group: tree.swayGroup,

                speed: 0.7 + Math.random() * 0.7,
                amount: 0.018 + Math.random() * 0.032,
                phase: Math.random() * Math.PI * 2
            });

            forestGroup.add(tree.root);
        }

        updateTreeColors();
    }

    function updateTreeColors() {
        foliageEntries.forEach((entry) => {
            applyLeafColour(entry, settings.treeColor);
        });
    }

    function updateWind(time) {
        swayTargets.forEach((target) => {
            target.group.rotation.z = Math.sin(time * target.speed + target.phase) * target.amount;
            target.group.rotation.x =
                Math.cos(time * target.speed * 0.55 + target.phase) * target.amount * 0.35;
        });
    }

    function clearForest() {
        swayTargets.length = 0;
        foliageEntries.length = 0;

        while (forestGroup.children.length > 0) {
            const child = forestGroup.children[0];
            disposeTree(child);
            forestGroup.remove(child);
        }
    }

    function getEnabledTreeTypes() {
        const enabledTypes = [];

        if (settings.pineEnabled) {
            enabledTypes.push("pine");
        }

        if (settings.roundEnabled) {
            enabledTypes.push("round");
        }

        if (settings.deadEnabled) {
            enabledTypes.push("dead");
        }

        return enabledTypes.length ? enabledTypes : ["pine"];
    }

    function findOpenPosition(radius, placements) {
        const halfSize = FOREST_SIZE / 2;

        for (let attempt = 0; attempt < 40; attempt += 1) {
            const x = -halfSize + Math.random() * (halfSize * 2);
            const z = -halfSize + Math.random() * (halfSize * 2);

            const overlaps = placements.some((placement) => {
                const dx = placement.x - x;
                const dz = placement.z - z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                return distance < placement.radius + radius;
            });

            if (!overlaps) {
                return { x, z };
            }
        }

        return null;
    }

    function disposeTree(object) {
        object.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }

            if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
            } else if (child.material) {
                child.material.dispose();
            }
        });
    }

    return {
        settings,
        generateForest,
        updateTreeColors,
        updateWind
    };
}
