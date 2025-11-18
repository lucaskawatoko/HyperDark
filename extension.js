const vscode = require("vscode");
const path = require("path");
const StatusBarManager = require("./src/statusBarManager");
const Reload = require("./src/reload");
const Color = require("./src/colorTheme");
const LiveServer = require("./src/liveServer");
let statusBarManager;
/**
 * Ativação da extensão
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("HyperDark extension is now active!");
    // --- Status Bar ---
    statusBarManager = new StatusBarManager();
    context.subscriptions.push(statusBarManager);
    // --- Reload VS Code ---
    Reload.activate(context);
    // --- Tema e Cores ---
    Color.activate(context);
    // --- Abrir configurações ---
    const openSettingsCommand = vscode.commands.registerCommand("hyperdark.openSettings", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "hyperdark");
    });
    context.subscriptions.push(openSettingsCommand);
    // --- Comando: Iniciar Live Server ---
    // O argumento 'fileUri' vem automaticamente quando você clica com botão direito no arquivo
    const startServerCommand = vscode.commands.registerCommand("hyperdark.startLiveServer", async (fileUri) => {
        
        let serverRoot = "";
        let relativeFilePath = "";
        // 1. Verifica se o comando veio pelo Menu de Contexto (clique direito no arquivo)
        if (fileUri && fileUri.fsPath) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
            if (workspaceFolder) {
                // O arquivo está dentro de um projeto aberto no VS Code
                serverRoot = workspaceFolder.uri.fsPath;
                // Calcula o caminho relativo (ex: "pages/contato.html")
                relativeFilePath = path.relative(serverRoot, fileUri.fsPath);
            } else {
                // O arquivo é solto (não está num workspace), usa a pasta dele como raiz
                serverRoot = path.dirname(fileUri.fsPath);
                relativeFilePath = path.basename(fileUri.fsPath);
            }
        } 
        // 2. Se o comando foi rodado via Ctrl+Shift+P (sem arquivo selecionado)
        else {
            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                serverRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                relativeFilePath = "index.html"; // Padrão
            } else {
                vscode.window.showErrorMessage("Abra uma pasta ou clique com o botão direito em um arquivo HTML para iniciar o servidor.");
                return;
            }
        }
        // Inicia o servidor na pasta raiz identificada
        LiveServer.startServer(serverRoot, 5500);
        // Ajusta barras invertidas (Windows) para barras normais de URL
        // ex: "pasta\arquivo.html" vira "pasta/arquivo.html"
        const urlPath = relativeFilePath.split(path.sep).join("/");
        const fullUrl = `http://localhost:5500/${urlPath}`;
        
        vscode.window.showInformationMessage(`HyperDark Live Server iniciado: ${fullUrl}`);
        
        // --- INÍCIO DA MUDANÇA (Melhorando a abertura do navegador) ---
        try {
            // Tenta abrir o navegador usando a API nativa do VS Code (Mais confiável)
            await vscode.env.openExternal(vscode.Uri.parse(fullUrl));
        } catch (error) {
            console.error("Erro ao tentar abrir navegador (vscode.env.openExternal):", error);
            
            // Se falhar, exibe uma mensagem com opção para o usuário copiar o link
            const copyAction = "Copiar Link";
            vscode.window.showErrorMessage(
                "O servidor iniciou, mas não foi possível abrir o navegador automaticamente.",
                copyAction
            ).then(selection => {
                if (selection === copyAction) {
                    // Copia a URL para a área de transferência do usuário
                    vscode.env.clipboard.writeText(fullUrl);
                    vscode.window.showInformationMessage(`URL copiada: ${fullUrl}`);
                }
            });
        }
        // --- FIM DA MUDANÇA ---

    });
    context.subscriptions.push(startServerCommand);
    // --- Comando: Parar Live Server ---
    const stopServerCommand = vscode.commands.registerCommand("hyperdark.stopLiveServer", () => {
        LiveServer.stopServer();
        vscode.window.showInformationMessage("HyperDark Live Server parado.");
    });
    context.subscriptions.push(stopServerCommand);
}
/**
 * Desativação da extensão
 */
function deactivate() {
    if (statusBarManager) {
        statusBarManager.dispose();
    }
    Reload.deactivate();
    Color.deactivate();
    LiveServer.stopServer();
}
module.exports = {
    activate,
    deactivate
};