const vscode = require("vscode");

class CursorManager {
    constructor() {
        // Aplica as configurações assim que inicia
        this.applySettings();

        // Fica ouvindo mudanças
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (
                event.affectsConfiguration("hyperdark.cursorStyle") ||
                event.affectsConfiguration("hyperdark.cursorBlinking") ||
                event.affectsConfiguration("hyperdark.cursorSmoothAnimation")
            ) {
                this.applySettings();
            }
        });
    }

    async applySettings() {
        const config = vscode.workspace.getConfiguration("hyperdark");
        const editorConfig = vscode.workspace.getConfiguration("editor");

        // Pega os valores escolhidos no menu do HyperDark
        const style = config.get("cursorStyle");
        const blinking = config.get("cursorBlinking");
        const smooth = config.get("cursorSmoothAnimation");

        try {
            // Aplica nas configurações globais do VS Code
            // Se o usuário mudar no menu da extensão, muda no editor dele
            
            if (editorConfig.get("cursorStyle") !== style) {
                await editorConfig.update("cursorStyle", style, vscode.ConfigurationTarget.Global);
            }

            if (editorConfig.get("cursorBlinking") !== blinking) {
                await editorConfig.update("cursorBlinking", blinking, vscode.ConfigurationTarget.Global);
            }

            if (editorConfig.get("cursorSmoothCaretAnimation") !== smooth) {
                await editorConfig.update("cursorSmoothCaretAnimation", smooth, vscode.ConfigurationTarget.Global);
            }

        } catch (error) {
            console.error("Erro ao aplicar estilo do cursor:", error);
        }
    }

    dispose() {}
}

let instance;

function activate(context) {
    instance = new CursorManager();
    context.subscriptions.push(vscode.Disposable.from(instance));
}

function deactivate() {
    if (instance) instance.dispose();
}

module.exports = { activate, deactivate };