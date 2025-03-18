const vscode = require("vscode");

function activate(context) {
    console.log("HyperDark Reload extension is now active!");

    // Registra o comando que irá recarregar o VSCode
    let reloadCommand = vscode.commands.registerCommand("hyperdark.reloadWindow", () => {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    });

    // Adiciona o comando à lista de disposições da extensão
    context.subscriptions.push(reloadCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
