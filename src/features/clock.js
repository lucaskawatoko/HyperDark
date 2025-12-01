const vscode = require("vscode");

class Clock {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.statusBarItem.tooltip = "Clique para definir um Timer de Foco";
        
        this.commandId = "hyperdark.clockAction";
        this.clickCommand = vscode.commands.registerCommand(this.commandId, () => this.handleUserClick());
        this.statusBarItem.command = this.commandId;

        this.targetTime = null;
        this.isFocusMode = false;

        // Inicia
        this.updateVisibility();
        this.update();
        this.interval = setInterval(() => this.update(), 1000);

        // Escuta mudança nas configurações
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("hyperdark.showClock")) {
                this.updateVisibility();
            }
        });
    }

    updateVisibility() {
        const config = vscode.workspace.getConfiguration("hyperdark");
        const showClock = config.get("showClock");

        if (showClock) {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    async handleUserClick() {
        if (this.isFocusMode) {
            const selection = await vscode.window.showInformationMessage(
                "Deseja parar o Timer de Foco?", "Sim, Parar", "Não"
            );
            if (selection === "Sim, Parar") {
                this.stopTimer();
            }
        } else {
            const input = await vscode.window.showQuickPick(
                ["15 Minutos", "25 Minutos (Pomodoro)", "45 Minutos", "60 Minutos"],
                { placeHolder: "Definir tempo de foco..." }
            );

            if (input) {
                const minutes = parseInt(input.split(' ')[0]);
                this.startTimer(minutes);
            }
        }
    }

    startTimer(minutes) {
        this.isFocusMode = true;
        this.targetTime = new Date().getTime() + (minutes * 60 * 1000);
        this.update();
        vscode.window.showInformationMessage(`HyperDark: Modo Foco iniciado (${minutes}m)! 🚀`);
    }

    stopTimer() {
        this.isFocusMode = false;
        this.targetTime = null;
        this.update();
    }

    update() {
        const now = new Date();

        if (this.isFocusMode && this.targetTime) {
            const diff = this.targetTime - now.getTime();

            if (diff <= 0) {
                this.stopTimer();
                vscode.window.showInformationMessage(
                    "⏰ O TEMPO ACABOU! Hora de descansar.", 
                    { modal: true, detail: "Você completou seu ciclo de foco." },
                    "Ok, entendi"
                );
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                const minStr = minutes.toString().padStart(2, '0');
                const secStr = seconds.toString().padStart(2, '0');
                
                this.statusBarItem.text = `🔥 ${minStr}:${secStr}`;
                this.statusBarItem.color = "#ff0055";
                return;
            }
        }

        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        
        this.statusBarItem.text = `$(clock) ${timeString}`;
        this.statusBarItem.color = undefined;
    }

    dispose() {
        clearInterval(this.interval);
        this.statusBarItem.dispose();
        this.clickCommand.dispose();
    }
}

// --- PADRONIZAÇÃO MODULAR ---
// Isso aqui é o que permite o index.js carregar este arquivo
let instance;

function activate(context) {
    instance = new Clock();
    // Adiciona ao contexto para o VS Code gerenciar a memória
    context.subscriptions.push(vscode.Disposable.from(instance));
}

function deactivate() {
    if (instance) instance.dispose();
}

module.exports = { activate, deactivate };