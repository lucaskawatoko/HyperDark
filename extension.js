const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const StatusBarManager = require("./src/statusBarManager");
const Reload = require("./src/reload");
const Color = require("./src/colorTheme");

/**
 * 🧱 Classe que aplica o ícone bloqueado nos arquivos .env reais
 */
class EnvDecorationProvider {
    constructor(context) {
        this._emitter = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this._emitter.event;

        // Caminho absoluto do ícone
        this.iconPath = vscode.Uri.joinPath(
            context.extensionUri,
            "imgs",
            "block",
            "bloqueado.png"
        );

    }

    provideFileDecoration(uri) {
        const fileName = path.basename(uri.fsPath);

        const isEnv = fileName.startsWith(".env");
        const isExample = fileName.match(/example|sample/i);

        // Aplica o ícone só em arquivos .env reais
        if (isEnv && !isExample) {
            return {
                tooltip: "Arquivo .env sensível — commit bloqueado por segurança",
                propagate: false,
                color: new vscode.ThemeColor("errorForeground"),
                badge: "", // sem texto, apenas ícone
                iconPath: this.iconPath
            };
        }

        return null;
    }
}

/**
 * 🧩 Cria o hook Git que impede commits de arquivos .env reais
 */
function ensureGitHook() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const hookPath = path.join(workspacePath, ".git", "hooks", "pre-commit");
    const hookContent = `#!/bin/bash
# Impede commits de arquivos .env reais (mas permite .env.example)
if git diff --cached --name-only | grep -E '\\.env($|[^/])' | grep -v -E 'example|sample' > /dev/null; then
  echo "🚫 Commit bloqueado: arquivos .env reais não podem ser comitados!"
  exit 1
fi
`;

    try {
        const gitDir = path.join(workspacePath, ".git");
        if (!fs.existsSync(gitDir)) return; // não é repo git

        fs.writeFileSync(hookPath, hookContent, "utf8");
        fs.chmodSync(hookPath, 0o755);

        console.log("✅ Hook de segurança (.env) criado com sucesso!");
    } catch (error) {
        console.error("Erro ao criar hook de segurança:", error);
    }
}

/**
 * 🧠 Ativação da extensão
 */
function activate(context) {
    console.log("🔥 HyperDark extension is now active!");

    const statusBarManager = new StatusBarManager();
    context.subscriptions.push(statusBarManager);

    Reload.activate(context);
    Color.activate(context);

    // Ativa o decorador de ícones .env
    const envProvider = new EnvDecorationProvider(context);
    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(envProvider)
    );

    // Cria o hook git automaticamente
    ensureGitHook();

    // Comando para abrir configurações da extensão
    const openSettingsCommand = vscode.commands.registerCommand(
        "hyperdark.openSettings",
        () => vscode.commands.executeCommand("workbench.action.openSettings", "hyperdark")
    );
    context.subscriptions.push(openSettingsCommand);

    // Aviso se o usuário abrir um .env sensível
    vscode.workspace.onDidOpenTextDocument((doc) => {
        const fileName = path.basename(doc.fileName);
        if (fileName.startsWith(".env") && !fileName.match(/example|sample/i)) {
            vscode.window.showWarningMessage(
                "⚠️ Este arquivo .env contém informações sensíveis. Ele não será permitido em commits!"
            );
        }
    });
}

/**
 * 🧹 Desativação
 */
function deactivate() {
    Reload.deactivate();
    Color.deactivate();
}

module.exports = { activate, deactivate };
