const vscode = require("vscode");
const StatusBarManager = require("./src/statusBarManager"); // Importa o gerenciador da Status Bar
const Reload = require("./src/reload"); // Importa o arquivo de recarregar o VSCode
const Color = require("./src/colorTheme"); // Importa o arquivo de configuração de cores

let statusBarManager;

/**
 * Função chamada quando a extensão é ativada
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("HyperDark extension is now active!");

    // Inicializa o gerenciador da Status Bar
    statusBarManager = new StatusBarManager();
    context.subscriptions.push(statusBarManager);

    // Ativa o comando de recarregar o VSCode
    Reload.activate(context);

    // Aplica as configurações de cores
    Color.activate(context);

    // Comando para abrir as configurações da extensão no VS Code
    const openSettingsCommand = vscode.commands.registerCommand("hyperdark.openSettings", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "hyperdark");
    });
    
    context.subscriptions.push(openSettingsCommand);
}

/**
 * Função chamada quando a extensão é desativada
 */
function deactivate() {
    if (statusBarManager) {
        statusBarManager.dispose();
    }

    Reload.deactivate();
    Color.deactivate();
}

module.exports = {
    activate,
    deactivate
};