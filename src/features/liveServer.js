// src/features/liveServer.js

const vscode = require("vscode");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os"); // Necessário para descobrir o IP
const chokidar = require("chokidar");
const { WebSocketServer, WebSocket } = require("ws");

// Importa o utilitário da pasta correta
const findAvailablePort = require("../utils/findPort"); 

let server;
let wss;
let watcher;

// --- UTILS: Descobre o IP da máquina na rede local ---
function getLocalExternalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            // Busca IPv4 que não seja interno (127.0.0.1)
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

function injectReloadScript(htmlContent, wsPort) {
    // O script agora usa window.location.hostname. 
    // Isso garante que se abrir no celular (192.168.x.x), o socket conecta no IP correto.
    const script = `
        <script>
            (function() {
                console.log("[HyperDark] Live Server ativo...");
                const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
                const address = protocol + window.location.hostname + ":${wsPort}";
                const ws = new WebSocket(address);
                
                ws.onmessage = (event) => {
                    if (event.data === "reload") location.reload();
                };
                
                ws.onopen = () => console.log("[HyperDark] Conectado ao Hot Reload.");
                ws.onclose = () => console.log("[HyperDark] Desconectado.");
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
                // Tenta achar index.html se for uma pasta
                if (err.code === 'EISDIR') {
                    const indexInDir = path.join(filePath, "index.html");
                    if (fs.existsSync(indexInDir)) {
                        filePath = indexInDir;
                        // Relê o arquivo agora que sabemos que é o index
                        data = fs.readFileSync(filePath); 
                        // Continua o fluxo abaixo...
                    } else {
                        res.writeHead(404);
                        res.end("404 - Folder listing not allowed (HyperDark)");
                        return;
                    }
                } else {
                    res.writeHead(404);
                    res.end("404 - Not Found (HyperDark)");
                    return;
                }
            }

            // Se chegou aqui, temos 'data' (conteúdo do arquivo)
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

    // '0.0.0.0' permite que outros dispositivos na rede acessem
    server.listen(httpPort, '0.0.0.0');

    try {
        // WebSocket também precisa escutar em 0.0.0.0
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
    
    return httpPort;
}

function stopServer() {
    if (wss) { wss.close(); wss = null; }
    if (watcher) { watcher.close(); watcher = null; }
    if (server) { server.close(); server = null; }
}

// --- ATIVAÇÃO ---
// --- ATIVAÇÃO (Substitua essa parte no src/features/liveServer.js) ---
function activate(context) {
    
    const startCommand = vscode.commands.registerCommand("hyperdark.startLiveServer", async (fileUri) => {
        if (!fileUri && vscode.window.activeTextEditor) {
            fileUri = vscode.window.activeTextEditor.document.uri;
        }

        if (!fileUri) {
            vscode.window.showErrorMessage("Abra um arquivo ou pasta para iniciar.");
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

        try {
            vscode.window.setStatusBarMessage("Iniciando HyperDark Server...", 2000);
            
            const realPort = await startServer(root, port);
            const localIP = getLocalExternalIP();
            
            // Corrige barras invertidas do Windows para URL
            const urlPath = relative.split(path.sep).join("/");
            
            const localUrl = `http://localhost:${realPort}/${urlPath}`;
            const networkUrl = `http://${localIP}:${realPort}/${urlPath}`; // <--- URL COM IP
            
            // Botão para copiar o link (Opcional: Mostra as duas opções)
            vscode.window.showInformationMessage(
                `HyperDark: Server rodando em ${localIP}:${realPort}`, 
                "Copiar Link", 
                "Parar"
            ).then(selection => {
                if (selection === "Copiar Link") {
                    vscode.env.clipboard.writeText(networkUrl);
                } else if (selection === "Parar") {
                    stopServer();
                }
            });

            // --- A MUDANÇA ESTÁ AQUI ---
            // Antes estava localUrl, agora mudamos para networkUrl
            await vscode.env.openExternal(vscode.Uri.parse(networkUrl));

        } catch (err) {
            vscode.window.showErrorMessage(`Erro: ${err.message}`);
        }
    });

    const stopCommand = vscode.commands.registerCommand("hyperdark.stopLiveServer", () => {
        stopServer();
        vscode.window.setStatusBarMessage("HyperDark Server Parado.", 3000);
    });

    context.subscriptions.push(startCommand);
    context.subscriptions.push(stopCommand);
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