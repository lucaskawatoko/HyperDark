const vscode = require("vscode");

function activate(context) {
    // Abrir Configurações
    context.subscriptions.push(
        vscode.commands.registerCommand("hyperdark.openSettings", () => {
            vscode.commands.executeCommand("workbench.action.openSettings", "hyperdark");
        })
    );

    // Alternar Glow
    context.subscriptions.push(
        vscode.commands.registerCommand("hyperdark.toggleGlow", async () => {
            const config = vscode.workspace.getConfiguration('hyperdark');
            const currentValue = config.get('enableGlow');
            await config.update('enableGlow', !currentValue, true);
            const status = !currentValue ? "ATIVADO" : "DESATIVADO";
            vscode.window.showInformationMessage(`HyperDark Neon: ${status}`);
        })
    );
}

function deactivate() {}

module.exports = { activate, deactivate };