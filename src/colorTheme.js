const vscode = require("vscode");
const darkThemeColors = require("./colors/color_dark");
const lightThemeColors = require("./colors/color_ligth");

class ColorThemeManager {
    constructor() {
        this.statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.statusBarButton.command = "hyperdark.toggleTheme";
        this.updateButtonLabel();
        this.statusBarButton.show();

        this.clockStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 900);

        const config = vscode.workspace.getConfiguration("hyperdark");
        if (config.get("showClock", true)) {
            this.updateClock();
            this.clockStatusBarItem.show();
            this.startClockSync();
        }

        this.applyTheme();

        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("hyperdark.showClock")) {
                const showClock = vscode.workspace.getConfiguration("hyperdark").get("showClock", true);
                if (showClock) {
                    this.updateClock();
                    this.clockStatusBarItem.show();
                    this.startClockSync();
                } else {
                    this.clockStatusBarItem.hide();
                }
            }

            if (event.affectsConfiguration("hyperdark.selectedTheme")) {
                console.log("Tema alterado. Aplicando novo tema...");
                this.applyTheme();
            }
        });
    }

    /**
     * Obtém o tema selecionado pelo usuário nas configurações do VS Code.
     */
    getSelectedThemeColors() {
        const selectedTheme = String(vscode.workspace.getConfiguration("hyperdark").get("selectedTheme", "dark"));

        if (selectedTheme === "light") {
            return lightThemeColors;
        } else {
            return darkThemeColors; // Fallback para "dark" caso o valor seja inválido
        }
    }

    /**
     * Define o `workbench.colorTheme` correto com base no tema escolhido.
     */
    async applyWorkbenchTheme() {
        const selectedTheme = vscode.workspace.getConfiguration("hyperdark").get("selectedTheme", "dark");

        let workbenchTheme;
        if (selectedTheme === "dark") {
            workbenchTheme = "Visual Studio Dark";
        } else {
            workbenchTheme = "Visual Studio Light";
        }

        try {
            await vscode.workspace.getConfiguration("workbench").update(
                "colorTheme",
                workbenchTheme,
                vscode.ConfigurationTarget.Global
            );
            console.log(`Tema do Workbench alterado para: ${workbenchTheme}`);
        } catch (error) {
            console.error("Erro ao alterar o tema do Workbench:", error);
        }
    }

    /**
     * Atualiza o relógio na Status Bar sincronizado com o sistema.
     */
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        this.clockStatusBarItem.text = `$(clock) ${timeString}`;
    }

    /**
     * Garante que o relógio atualize exatamente na virada do minuto.
     */
    startClockSync() {
        this.updateClock();
        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000;
        setTimeout(() => {
            this.updateClock();
            setInterval(() => this.updateClock(), 60000);
        }, msUntilNextMinute);
    }

    /**
     * Aplica as configurações de cores do usuário com efeitos visuais e configura o tema do Workbench.
     */
    async applyTheme() {
        console.log("Ativando HyperDark...");
        const config = vscode.workspace.getConfiguration("hyperdark");
        const defaultColors = this.getSelectedThemeColors();
        const isEnabled = config.get("themeEnabled", true);
        const userColors = {};

        if (isEnabled) {
            Object.keys(defaultColors).forEach(key => {
                userColors[key] = config.get(key, defaultColors[key]);
            });
        }

        setTimeout(async () => {
            try {
                await vscode.workspace.getConfiguration("workbench").update(
                    "colorCustomizations",
                    userColors,
                    vscode.ConfigurationTarget.Global
                );
                console.log("Tema atualizado com sucesso!");
                this.updateButtonLabel();
            } catch (error) {
                console.error("Erro ao atualizar o tema:", error);
            }
        }, 500);

        // Aplicar o tema correto do Workbench
        await this.applyWorkbenchTheme();
    }

    /**
     * Atualiza o botão da Status Bar com o estado atual do tema.
     */
    updateButtonLabel() {
        const isEnabled = vscode.workspace.getConfiguration("hyperdark").get("themeEnabled", true);
        this.statusBarButton.text = isEnabled ? "$(eye) Desativar Tema" : "$(paintcan) Ativar Tema";
    }

    dispose() {
        this.statusBarButton.dispose();
        this.clockStatusBarItem.dispose();
    }
}

/**
 * Ativa a configuração de cores no VS Code do usuário.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const colorManager = new ColorThemeManager();
    context.subscriptions.push(colorManager);

    context.subscriptions.push(
        vscode.commands.registerCommand("hyperdark.toggleTheme", async () => {
            const config = vscode.workspace.getConfiguration("hyperdark");
            const isEnabled = config.get("themeEnabled", true);
            await config.update("themeEnabled", !isEnabled, vscode.ConfigurationTarget.Global);
            colorManager.applyTheme();
        })
    );
}

/**
 * Desativa as configurações de cores ao remover a extensão.
 */
async function deactivate() {
    await vscode.workspace.getConfiguration("workbench").update("colorCustomizations", {}, vscode.ConfigurationTarget.Global);
    await vscode.workspace.getConfiguration("workbench").update("colorTheme", "Visual Studio Dark", vscode.ConfigurationTarget.Global);
}

module.exports = { activate, deactivate };