import GUI from "./build/gui/lil-gui.module.min.js";

export function setupUI(settings, actions) {
    const gui = new GUI({ title: "Forest Controls" });

    const forestFolder = gui.addFolder("Generation");
    const appearanceFolder = gui.addFolder("Appearance");
    const typeFolder = gui.addFolder("Tree Types");

    forestFolder
        .add(settings, "treeCount", 20, 180, 1)
        .name("Tree Density")
        .onFinishChange(actions.onGenerate);

    const minHeightController = forestFolder
        .add(settings, "minHeight", 2, 8, 0.1)
        .name("Min Height")
        .onFinishChange(() => {
            if (settings.minHeight > settings.maxHeight) {
                settings.maxHeight = settings.minHeight;
                maxHeightController.updateDisplay();
            }

            actions.onGenerate();
        });

    const maxHeightController = forestFolder
        .add(settings, "maxHeight", 3, 12, 0.1)
        .name("Max Height")
        .onFinishChange(() => {
            if (settings.maxHeight < settings.minHeight) {
                settings.minHeight = settings.maxHeight;
                minHeightController.updateDisplay();
            }

            actions.onGenerate();
        });

    appearanceFolder
        .add(settings, "treeColor", 0, 1, 0.01)
        .name("Tree Colour")
        .onChange(actions.onColorChange);

    typeFolder
        .add(settings, "pineEnabled")
        .name("Pine")
        .onChange(actions.onGenerate);

    typeFolder
        .add(settings, "roundEnabled")
        .name("Round")
        .onChange(actions.onGenerate);

    typeFolder
        .add(settings, "deadEnabled")
        .name("Dead")
        .onChange(actions.onGenerate);

    gui.add({ regenerateForest: actions.onGenerate }, "regenerateForest").name("Regenerate Forest");

    forestFolder.open();
    appearanceFolder.open();
    typeFolder.open();

    return gui;
}
