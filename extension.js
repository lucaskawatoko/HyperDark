const vscode = require("vscode");
const FeatureManager = require("./src/core/featureManager");
const featuresList = require("./src/index"); 

let manager;

function activate(context) {
    console.log("HyperDark: Iniciando...");

    // O FeatureManager pega a lista e ativa um por um
    manager = new FeatureManager(context, featuresList);
    manager.activateAll();
}

function deactivate() {
    if (manager) {
        manager.deactivateAll();
    }
}

module.exports = {
    activate,
    deactivate
};