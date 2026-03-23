import { FOREST_SIZE } from "./setup.js";
import { applyLeafColour, createTree, randomRange } from "./trees.js";

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
            // Math.random() chooses a tree style from the enabled user options.
            const treeType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

            // Math.random() picks a height inside the current min/max range.
            const treeHeight = randomRange(settings.minHeight, settings.maxHeight);
            const footprintRadius = 0.8 + treeHeight * randomRange(0.1, 0.18);
            const position = findOpenPosition(footprintRadius, placements);

            if (!position) {
                continue;
            }

            const tree = createTree(treeType, treeHeight);

            tree.root.position.set(position.x, 0, position.z);
            // Math.random() gives each tree a different facing direction.
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
                // Math.random() varies the wind response so trees do not sway in sync.
                speed: randomRange(0.7, 1.4),
                amount: randomRange(0.018, 0.05),
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
            // Math.random() spreads candidate trees across the fixed forest area.
            const x = randomRange(-halfSize, halfSize);
            const z = randomRange(-halfSize, halfSize);

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
