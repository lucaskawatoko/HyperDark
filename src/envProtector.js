const vscode = require("vscode");

class EnvDecorationProvider {
    constructor() {
        this._emitter = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this._emitter.event;
    }

    provideFileDecoration(uri) {
        const fileName = uri.path.split("/").pop();

        if (fileName === ".env" || fileName.startsWith(".env.")) {
            return {
                badge: "🚫",
                tooltip: "Arquivo .env — commit bloqueado",
                color: new vscode.ThemeColor("errorForeground")
            };
        }
        return null;
    }
}

function activate(context) {
    const provider = new EnvDecorationProvider();
    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(provider)
    );
}

module.exports = { activate };
