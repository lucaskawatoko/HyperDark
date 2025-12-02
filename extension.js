const vscode = require("vscode");
const FeatureManager = require("./src/core/featureManager");
const featuresList = require("./src/index"); 
const ThemeCleanup = require("./src/core/themeCleanup"); // <--- IMPORTAMOS DIRETO

let manager;

async function activate(context) {
    console.log("HyperDark: Iniciando...");

    // --- A VACINA (Rodando manualmente para garantir) ---
    try {
        console.log("HyperDark: Tentando rodar limpeza de tema...");
        const cleaner = new ThemeCleanup(context);
        await cleaner.activate(); // Força a execução agora
    } catch (e) {
        console.error("HyperDark: Falha na vacina:", e);
    }
    // ----------------------------------------------------

    // O FeatureManager continua cuidando do resto (Relógio, Servidor, etc)
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