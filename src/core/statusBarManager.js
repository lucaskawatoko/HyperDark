const vscode = require("vscode");

class StatusBarManager {
    constructor() {
        // Cria o botão de Reload na direita
        this.reloadButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 500);
        this.reloadButton.text = "$(refresh) Reload";
        this.reloadButton.tooltip = "Clique para recarregar o VS Code";
        this.reloadButton.command = "workbench.action.reloadWindow"; 
        this.reloadButton.show();
    }

    dispose() {
        this.reloadButton.dispose();
    }
}

// --- PADRONIZAÇÃO MODULAR ---
let instance;

function activate(context) {
    instance = new StatusBarManager();
    // Registra no contexto para limpeza automática se necessário
    context.subscriptions.push(instance);
}

function deactivate() {
    if (instance) instance.dispose();
}

module.exports = { activate, deactivate };