const vscode = require("vscode");
const http = require("http");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { WebSocketServer, WebSocket } = require("ws");

// Importa o utilitário da pasta correta
const findAvailablePort = require("../utils/findPort"); 

let server;
let wss;
let watcher;

function injectReloadScript(htmlContent, wsPort) {
    const script = `
        <script>
            (function() {
                console.log("[HyperDark] Live Server na porta ${wsPort}...");
                const ws = new WebSocket("ws://localhost:${wsPort}");
                ws.onmessage = (event) => {
                    if (event.data === "reload") location.reload();
                };
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
                res.writeHead(404);
                res.end("404 - Not Found (HyperDark)");
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            if (ext === ".html" || ext === ".htm") {
                const html = data.toString("utf8");
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(injectReloadScript(html, wsPort));
            } else {
                const mimes = { ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json" };
                res.writeHead(200, { "Content-Type": mimes[ext] || "application/octet-stream" });
                res.end(data);
            }
        });
    });

    server.listen(httpPort);

    try {
        wss = new WebSocketServer({ port: wsPort });
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
function activate(context) {
    
    const startCommand = vscode.commands.registerCommand("hyperdark.startLiveServer", async (fileUri) => {
        if (!fileUri && vscode.window.activeTextEditor) {
            fileUri = vscode.window.activeTextEditor.document.uri;
        }

        if (!fileUri) {
            vscode.window.showErrorMessage("Abra um arquivo HTML para iniciar.");
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
            
            // CORRIGIDO: Chama a função direto, sem "LiveServer." antes
            const realPort = await startServer(root, port);
            
            const urlPath = relative.split(path.sep).join("/");
            const fullUrl = `http://localhost:${realPort}/${urlPath}`;
            
            vscode.window.showInformationMessage(`HyperDark Live: ${fullUrl}`);
            await vscode.env.openExternal(vscode.Uri.parse(fullUrl));

        } catch (err) {
            vscode.window.showErrorMessage(`Erro: ${err.message}`);
        }
    });

    const stopCommand = vscode.commands.registerCommand("hyperdark.stopLiveServer", () => {
        stopServer(); // Chama direto
        vscode.window.showInformationMessage("Servidor Parado.");
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