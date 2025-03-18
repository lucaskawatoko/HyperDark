const vscode = require("vscode");

class StatusBarManager {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);

        // Define as configurações padrão ao iniciar a extensão
        this.ensureDefaultSettings();

        // Inicializa a Status Bar ao ativar a extensão
        this.updateStatusBar();

        // Adiciona o botão de recarregamento na Status Bar à direita
        this.reloadButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000);
        this.reloadButton.text = "$(refresh) Reload"; // Ícone de recarregar com o texto "Reload"
        this.reloadButton.tooltip = "Clique para recarregar o VSCode"; // Tooltip quando passar o mouse sobre o botão
        this.reloadButton.command = "hyperdark.reloadWindow"; // Comando para recarregar o VSCode
        this.reloadButton.show(); // Exibe o botão

        // Atualiza automaticamente quando as configurações são alteradas
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (
                event.affectsConfiguration("hyperdark.statusBarText") ||
                event.affectsConfiguration("hyperdark.statusBarEmoji") ||
                event.affectsConfiguration("hyperdark.statusBarTooltip")
            ) {
                this.updateStatusBar();
            }
        });
    }

    /**
     * Garante que as configurações padrão sejam aplicadas na primeira vez que a extensão é executada.
     */
    ensureDefaultSettings() {
        const config = vscode.workspace.getConfiguration("hyperdark");

        const defaults = {
            statusBarText: "HyperDark",
            statusBarEmoji: "",
            statusBarTooltip: "Seu melhor tema do VsCode",
        };

        Object.keys(defaults).forEach((key) => {
            if (config.get(key) === undefined) {
                config.update(key, defaults[key], vscode.ConfigurationTarget.Global);
            }
        });
    }

    /**
     * Atualiza a Status Bar com as configurações do usuário
     */
    updateStatusBar() {
        try {
            const config = vscode.workspace.getConfiguration("hyperdark");
            const statusBarText = config.get("statusBarText", "HyperDark");
            const statusBarEmoji = config.get("statusBarEmoji", "");
            const statusBarTooltip = config.get("statusBarTooltip", "Seu melhor tema do VsCode");

            this.statusBarItem.text = `${statusBarEmoji} ${statusBarText}`.trim(); // Evita espaços extras
            this.statusBarItem.tooltip = statusBarTooltip;
            this.statusBarItem.show();
        } catch (error) {
            console.error("Erro ao atualizar a Status Bar:", error);
        }
    }

    /**
     * Remove a Status Bar quando a extensão é desativada
     */
    dispose() {
        this.statusBarItem.dispose();
        this.reloadButton.dispose();
    }
}

module.exports = StatusBarManager;
