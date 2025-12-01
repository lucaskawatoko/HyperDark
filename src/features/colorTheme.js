const vscode = require("vscode");
const darkThemeColors = require("../colors/color_dark");
const lightThemeColors = require("../colors/color_light");

class ColorThemeManager {
    constructor() {
        // Aplica o tema assim que inicia
        this.applyTheme();

        // Se o usuário mudar a configuração, reaplica o tema
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (
                event.affectsConfiguration("hyperdark.selectedTheme") ||
                event.affectsConfiguration("hyperdark.themeEnabled")
            ) {
                console.log("Configuração de tema alterada. Aplicando...");
                this.applyTheme();
            }
        });
    }

    /**
     * Obtém as cores baseadas na escolha (Dark ou Light)
     */
    getSelectedThemeColors() {
        const selectedTheme = String(vscode.workspace.getConfiguration("hyperdark").get("selectedTheme", "dark"));

        if (selectedTheme === "light") {
            return lightThemeColors;
        } else {
            return darkThemeColors;
        }
    }

    /**
     * Define o tema nativo do VS Code (Workbench)
     */
    async applyWorkbenchTheme() {
        const selectedTheme = vscode.workspace.getConfiguration("hyperdark").get("selectedTheme", "dark");
        const workbenchTheme = selectedTheme === "dark" ? "Visual Studio Dark" : "Visual Studio Light";

        try {
            // Só aplica se for diferente para evitar loop
            const current = vscode.workspace.getConfiguration("workbench").get("colorTheme");
            if (current !== workbenchTheme) {
                await vscode.workspace.getConfiguration("workbench").update(
                    "colorTheme",
                    workbenchTheme,
                    vscode.ConfigurationTarget.Global
                );
            }
        } catch (error) {
            console.error("Erro ao alterar o tema do Workbench:", error);
        }
    }

    /**
     * Aplica as cores customizadas (O Neon do HyperDark)
     */
    async applyTheme() {
        const config = vscode.workspace.getConfiguration("hyperdark");
        const isEnabled = config.get("themeEnabled", true);
        
        let userColors = {};

        // Se estiver ativado, carrega as cores do arquivo
        if (isEnabled) {
            const defaultColors = this.getSelectedThemeColors();
            Object.keys(defaultColors).forEach(key => {
                userColors[key] = config.get(key, defaultColors[key]);
            });
        }
        // Se estiver desativado, userColors fica vazio {}, o que remove o tema customizado

        try {
            await vscode.workspace.getConfiguration("workbench").update(
                "colorCustomizations",
                userColors,
                vscode.ConfigurationTarget.Global
            );
            
            // Também garante que o tema base (Dark/Light) esteja certo
            await this.applyWorkbenchTheme();
            
        } catch (error) {
            console.error("Erro ao atualizar o tema:", error);
        }
    }

    dispose() {
        // Nada para limpar visualmente, pois removemos os botões
    }
}

function activate(context) {
    const colorManager = new ColorThemeManager();
    context.subscriptions.push(colorManager);

    // Comando para ligar/desligar o tema via Ctrl+Shift+P
    context.subscriptions.push(
        vscode.commands.registerCommand("hyperdark.toggleTheme", async () => {
            const config = vscode.workspace.getConfiguration("hyperdark");
            const isEnabled = config.get("themeEnabled", true);
            
            await config.update("themeEnabled", !isEnabled, vscode.ConfigurationTarget.Global);
            
            // O Listener no constructor vai pegar a mudança e chamar applyTheme()
            vscode.window.showInformationMessage(`HyperDark Theme: ${!isEnabled ? "ATIVADO" : "DESATIVADO"}`);
        })
    );
}

async function deactivate() {
    // Limpa as customizações ao desinstalar/desativar
    await vscode.workspace.getConfiguration("workbench").update("colorCustomizations", {}, vscode.ConfigurationTarget.Global);
}

module.exports = { activate, deactivate };