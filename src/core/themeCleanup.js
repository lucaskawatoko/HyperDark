const vscode = require("vscode");

class ThemeCleanup {
    constructor(context) {
        this.context = context;
    }

    /**
     * O método activate é chamado pelo seu FeatureManager
     */
    activate() {
        this.runCleanup();
    }

    async runCleanup() {
        const config = vscode.workspace.getConfiguration();
        const colorCustomizations = config.get("workbench.colorCustomizations");

        // Se não houver customizações, não faz nada e economiza processamento
        if (!colorCustomizations || Object.keys(colorCustomizations).length === 0) {
            return;
        }

        // A lista de chaves antigas que precisamos remover
        const keysToRemove = [
            "editor.background", "editor.foreground", "editor.selectionBackground",
            "panel.background", "sideBar.background", "sideBar.foreground",
            "sideBarTitle.foreground", "titleBar.activeBackground", "titleBar.activeForeground",
            "titleBar.inactiveBackground", "titleBar.inactiveForeground", "tab.activeBackground",
            "tab.activeForeground", "tab.inactiveBackground", "tab.inactiveForeground",
            "tab.border", "tab.activeBorderTop", "sideBar.border", "activityBar.background",
            "activityBar.foreground", "activityBar.border", "titleBar.border",
            "statusBar.background", "statusBar.foreground", "gitDecoration.addedResourceForeground",
            "gitDecoration.modifiedResourceForeground", "gitDecoration.deletedResourceForeground",
            "gitDecoration.untrackedResourceForeground", "gitDecoration.ignoredResourceForeground",
            "editorIndentGuide.background1", "editorIndentGuide.background2",
            "editorIndentGuide.background3", "editorIndentGuide.background4",
            "editorIndentGuide.activeBackground1", "editorIndentGuide.activeBackground2",
            "editorIndentGuide.activeBackground3", "editorIndentGuide.activeBackground4",
            "terminal.background", "terminal.foreground", "terminalCursor.background",
            "terminalCursor.foreground", "terminal.ansiBlack", "terminal.ansiRed",
            "terminal.ansiGreen", "terminal.ansiYellow", "terminal.ansiBlue",
            "terminal.ansiMagenta", "terminal.ansiCyan", "terminal.ansiWhite",
            "terminal.ansiBrightBlack", "terminal.ansiBrightRed", "terminal.ansiBrightGreen",
            "terminal.ansiBrightYellow", "terminal.ansiBrightBlue", "terminal.ansiBrightMagenta",
            "terminal.ansiBrightCyan", "terminal.ansiBrightWhite", "debugToolBar.background",
            "debugConsole.infoForeground", "debugConsole.warningForeground", "debugConsole.errorForeground",
            "notification.background", "notification.foreground", "notification.buttonBackground",
            "notification.buttonForeground", "notification.buttonHoverBackground",
            "statusBar.noFolderBackground", "statusBar.debuggingBackground",
            "statusBar.debuggingForeground", "editorBracketMatch.background",
            "editorBracketMatch.border", "editorGutter.background", "editorGutter.modifiedBackground",
            "editorGutter.addedBackground", "editorGutter.deletedBackground",
            "scrollbarSlider.background", "scrollbarSlider.hoverBackground",
            "editor.lineHighlightBorder", "scrollbarSlider.activeBackground", "editorCursor.foreground"
        ];

        let hasChanges = false;
        // Cria uma cópia para não alterar o objeto original diretamente durante o loop
        const newColors = { ...colorCustomizations };

        keysToRemove.forEach((key) => {
            if (newColors[key] !== undefined) {
                delete newColors[key];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            try {
                // Atualiza o settings.json global removendo as chaves sujas
                await config.update(
                    "workbench.colorCustomizations",
                    newColors,
                    vscode.ConfigurationTarget.Global
                );
                
                vscode.window.showInformationMessage(
                    "HyperDark: Ambiente limpo e atualizado para a versão nativa!"
                );
                console.log("HyperDark: Limpeza de configurações antigas concluída.");
            } catch (error) {
                console.error("HyperDark: Erro ao limpar configurações antigas", error);
            }
        }
    }

    dispose() {
        // Nada para limpar ao desligar
    }
}

module.exports = ThemeCleanup;