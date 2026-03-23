import { createScene } from "./setup.js";

const { scene, camera, renderer } = createScene(".render-view");

renderer.render(scene, camera);
