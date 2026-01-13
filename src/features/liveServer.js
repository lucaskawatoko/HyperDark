// src/features/liveServer.js

const vscode = require("vscode");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const chokidar = require("chokidar");
const { WebSocketServer, WebSocket } = require("ws");

// Importa o utilitário da pasta correta
const findAvailablePort = require("../utils/findPort"); 

let server;
let wss;
let watcher;

// --- UTILS: Lista todas as interfaces de rede disponíveis ---
function getAllLocalIPs() {
    const interfaces = os.networkInterfaces();
    const options = [];

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            // Filtra para pegar apenas IPv4 e ignorar o loopback interno
            if (iface.family === 'IPv4' && !iface.internal) {
                options.push({
                    label: iface.address,
                    description: `Interface: ${name}`,
                    detail: "Disponível na rede local"
                });
            }
        }
    }
    
    // Adiciona localhost como opção padrão sempre
    options.push({ label: '127.0.0.1', description: 'Localhost', detail: 'Apenas para esta máquina' });
    
    return options;
}

function injectReloadScript(htmlContent, wsPort) {
    const script = `
        <script>
            (function() {
                console.log("[HyperDark] Live Server ativo...");
                const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
                // window.location.hostname garante que o WS conecte no IP que abriu a página
                const address = protocol + window.location.hostname + ":${wsPort}";
                const ws = new WebSocket(address);
                
                ws.onmessage = (event) => {
                    if (event.data === "reload") location.reload();
                };
                
                ws.onopen = () => console.log("[HyperDark] Conectado ao Hot Reload.");
                ws.onclose = () => console.log("[HyperDark] Desconectado.");
                ws.onerror = (err) => console.error("[HyperDark] Erro no WebSocket", err);
            })();
        </script>
    `;
    
    if (htmlContent.includes("</body>")) {
        return htmlContent.replace("</body>", script + "</body>");
    }
    return htmlContent + script;
}

async function startServer(directory, desiredPort = 5500) {
    stopServer();

    const resolvedPath = path.resolve(directory);
    const httpPort = await findAvailablePort(desiredPort);
    const wsPort = await findAvailablePort(httpPort + 1);

    server = http.createServer((req, res) => {
        const requestUrl = decodeURI(req.url.split('?')[0]);
        let filePath = path.join(resolvedPath, requestUrl === "/" ? "index.html" : requestUrl);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'EISDIR') {
                    const indexInDir = path.join(filePath, "index.html");
                    if (fs.existsSync(indexInDir)) {
                        filePath = indexInDir;
                        data = fs.readFileSync(filePath);
                    } else {
                        res.writeHead(404);
                        res.end("404 - Pasta nao contem index.html");
                        return;
                    }
                } else {
                    res.writeHead(404);
                    res.end("404 - Nao Encontrado");
                    return;
                }
            }

            const ext = path.extname(filePath).toLowerCase();
            if (ext === ".html" || ext === ".htm") {
                const html = data.toString("utf8");
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(injectReloadScript(html, wsPort));
            } else {
                const mimes = { 
                    ".css": "text/css", 
                    ".js": "text/javascript", 
                    ".png": "image/png", 
                    ".jpg": "image/jpeg", 
                    ".svg": "image/svg+xml", 
                    ".json": "application/json",
                    ".ico": "image/x-icon"
                };
                res.writeHead(200, { "Content-Type": mimes[ext] || "application/octet-stream" });
                res.end(data);
            }
        });
    });

    // Escuta em 0.0.0.0 para aceitar conexões de qualquer interface escolhida
    server.listen(httpPort, '0.0.0.0');

    try {
        wss = new WebSocketServer({ port: wsPort, host: '0.0.0.0' });
    } catch (error) {
        console.error("Erro WebSocket:", error);
    }

    watcher = chokidar.watch(resolvedPath, { ignored: /(^|[\/\\])\../, ignoreInitial: true });
    watcher.on("all", () => {
        if (wss) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) client.send("reload");
            });
        }
    });
    
    return { httpPort, wsPort };
}

function stopServer() {
    if (wss) { wss.close(); wss = null; }
    if (watcher) { watcher.close(); watcher = null; }
    if (server) { server.close(); server = null; }
}

function activate(context) {
    const startCommand = vscode.commands.registerCommand("hyperdark.startLiveServer", async (fileUri) => {
        if (!fileUri && vscode.window.activeTextEditor) {
            fileUri = vscode.window.activeTextEditor.document.uri;
        }

        if (!fileUri) {
            vscode.window.showErrorMessage("Abra um arquivo HTML para iniciar o servidor.");
            return;
        }

        let root = path.dirname(fileUri.fsPath);
        let relative = path.basename(fileUri.fsPath);
        const ws = vscode.workspace.getWorkspaceFolder(fileUri);
        
        if (ws) {
            root = ws.uri.fsPath;
            relative = path.relative(root, fileUri.fsPath);
        }

        const config = vscode.workspace.getConfiguration("hyperdark");
        const port = config.get("liveServerPort", 5500);

        // --- SELEÇÃO MANUAL DE IP ---
        const ipOptions = getAllLocalIPs();
        let selectedIP = '127.0.0.1';

        if (ipOptions.length > 1) {
            const choice = await vscode.window.showQuickPick(ipOptions, {
                placeHolder: "Selecione a interface de rede (Tailscale, Wi-Fi, Ethernet...)",
                title: "HyperDark Live Server: Escolha o endereço de acesso"
            });
            
            if (!choice) return; // Se o usuário cancelar com ESC
            selectedIP = choice.label;
        }

        try {
            vscode.window.setStatusBarMessage("Iniciando HyperDark Server...", 2000);
            
            const { httpPort } = await startServer(root, port);
            const urlPath = relative.split(path.sep).join("/");
            const networkUrl = `http://${selectedIP}:${httpPort}/${urlPath}`;
            
            vscode.window.showInformationMessage(
                `HyperDark: Rodando em ${selectedIP}:${httpPort}`, 
                "Copiar Link", 
                "Parar"
            ).then(selection => {
                if (selection === "Copiar Link") {
                    vscode.env.clipboard.writeText(networkUrl);
                } else if (selection === "Parar") {
                    stopServer();
                }
            });

            await vscode.env.openExternal(vscode.Uri.parse(networkUrl));

        } catch (err) {
            vscode.window.showErrorMessage(`Erro: ${err.message}`);
        }
    });

    const stopCommand = vscode.commands.registerCommand("hyperdark.stopLiveServer", () => {
        stopServer();
        vscode.window.setStatusBarMessage("HyperDark Server Parado.", 3000);
    });

    context.subscriptions.push(startCommand, stopCommand);
}

function deactivate() {
    stopServer();
}

module.exports = {
    activate,
    deactivate,
    startServer,
    stopServer
};