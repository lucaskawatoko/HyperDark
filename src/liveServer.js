const http = require("http");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { WebSocketServer, WebSocket } = require("ws");

let server;
let wss;
let watcher;

/**
 * Injeta o script de reload no HTML.
 * Agora com logs para você debugar no F12 do navegador.
 */
function injectReloadScript(htmlContent) {
    const script = `
        <script>
            (function() {
                console.log("[HyperDark] Tentando conectar ao Live Server...");
                const ws = new WebSocket("ws://localhost:5501");
                
                ws.onopen = () => {
                    console.log("[HyperDark] Conectado! Aguardando alterações...");
                };

                ws.onmessage = (event) => {
                    if (event.data === "reload") {
                        console.log("[HyperDark] Alteração detectada. Recarregando...");
                        location.reload();
                    }
                };

                ws.onclose = () => {
                    console.log("[HyperDark] Desconectado do servidor.");
                };

                ws.onerror = (err) => {
                    console.error("[HyperDark] Erro na conexão WebSocket:", err);
                };
            })();
        </script>
    `;

    // Tenta inserir antes do fechamento do body para ser menos intrusivo
    if (htmlContent.includes("</body>")) {
        return htmlContent.replace("</body>", script + "</body>");
    }
    // Se não tiver body, joga no final do arquivo
    return htmlContent + script;
}

/**
 * Inicia o servidor HTTP e o WebSocket
 */
function startServer(directory, port = 5500) {
    // Garante que qualquer instância anterior seja morta antes de iniciar
    stopServer();

    const resolvedPath = path.resolve(directory);
    const wsPort = 5501; // Porta fixa para o WebSocket

    // --- 1. Criar Servidor HTTP ---
    server = http.createServer((req, res) => {
        // Decodifica URL (resolve espaços como %20)
        const requestUrl = decodeURI(req.url.split('?')[0]);
        
        let filePath = path.join(
            resolvedPath,
            requestUrl === "/" ? "index.html" : requestUrl
        );

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("404 - Arquivo nao encontrado (HyperDark)");
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            
            // Se for HTML, injeta o script e define o header correto
            if (ext === ".html" || ext === ".htm") {
                const htmlContent = data.toString("utf8");
                const modifiedHtml = injectReloadScript(htmlContent);
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(modifiedHtml);
            } else {
                // Mime Types básicos
                const mimeTypes = {
                    ".css": "text/css",
                    ".js": "text/javascript",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".svg": "image/svg+xml",
                    ".json": "application/json"
                };
                res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
                res.end(data);
            }
        });
    });

    server.listen(port, () => {
        console.log(`HyperDark HTTP rodando em http://localhost:${port}`);
    });

    // --- 2. Criar Servidor WebSocket (para o reload) ---
    try {
        wss = new WebSocketServer({ port: wsPort });
        console.log(`HyperDark WebSocket rodando na porta ${wsPort}`);
    } catch (error) {
        console.error("Erro ao criar WebSocket:", error);
    }

    // --- 3. Configurar o Watcher (Chokidar) ---
    watcher = chokidar.watch(resolvedPath, {
        ignored: /(^|[\/\\])\../, // Ignora arquivos ocultos (.git, etc)
        persistent: true,
        ignoreInitial: true
    });

    watcher.on("all", (event, path) => {
        console.log(`Arquivo alterado: ${path}`);
        // Avisa todos os clientes conectados para dar reload
        if (wss) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("reload");
                }
            });
        }
    });
}

function stopServer() {
    if (wss) {
        wss.close();
        wss = null;
    }
    if (watcher) {
        watcher.close();
        watcher = null;
    }
    if (server) {
        server.close();
        server = null;
    }
}

module.exports = {
    startServer,
    stopServer
};