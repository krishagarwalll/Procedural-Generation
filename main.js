/*
Procedural Forest Generator

- Random geometry generation: Math.random() is used to place trees, choose tree types,
  vary tree height, vary branch and leaf shapes, and set wind sway values.
- Parametric generation: lil-gui controls tree density, min/max height, tree colour,
  and the enabled tree styles.
- Animated geometry: each tree sways over time using its own random wind settings.
- User customization: changing generation settings rebuilds the forest, while the
  tree colour slider updates the current foliage without regenerating the forest.
*/

import { scene, camera, renderer, controls, forestGroup, setScene, setSceneElements } from "./setup.js";
import { createForestManager } from "./forest.js";
import { setupUI } from "./ui.js";

setScene();
setSceneElements();

const forestManager = createForestManager(forestGroup);

setupUI(forestManager.settings, {
    onGenerate: forestManager.generateForest,
    onColorChange: forestManager.updateTreeColors
});

forestManager.generateForest();

function updateLoop() {
    const time = performance.now() * 0.001;

    forestManager.updateWind(time);
    controls.update();
    renderer.render(scene, camera);
}

renderer.render(scene, camera);
renderer.setAnimationLoop(updateLoop);
