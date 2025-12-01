const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
    // Cria a coleção de diagnósticos (as ondinhas vermelhas)
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("hyperdark-paths");
    context.subscriptions.push(diagnosticCollection);

    // Variável para controlar o "Timer" do Debounce (Performance)
    let timeout = null;

    function validateDocument(document) {
        // SEGURANÇA 1: Filtra apenas linguagens onde links importam
        if (!['html', 'php', 'css', 'scss', 'javascript', 'typescript'].includes(document.languageId)) return;

        const text = document.getText();
        const diagnostics = [];
        
        // Regex poderosa para capturar: src="...", href="...", url(...)
        const regex = /(?:src|href|url)\s*=\s*(['"])(.*?)\1|url\(\s*(['"]?)(.*?)\3\s*\)/gi;
        
        let match;
        // SEGURANÇA 2: Limite de iterações para não travar em arquivos minificados gigantes
        let count = 0;
        const MAX_CHECKS = 500; 

        while ((match = regex.exec(text)) !== null) {
            count++;
            if (count > MAX_CHECKS) break; 

            // Pega o caminho capturado (pode estar no grupo 2 ou 4 da regex)
            let relativePath = match[2] || match[4];
            
            if (!relativePath) continue;
            
            // SEGURANÇA 3: Ignora links externos, âncoras, emails, dados base64
            if (relativePath.match(/^(http|https|ftp|mailto|#|data:|\/\/)/i)) continue;
            
            // Ignora variáveis PHP ($img), templates {{...}} ou EJS <%= ... %>
            if (relativePath.includes('<?') || relativePath.includes('$') || relativePath.includes('{{') || relativePath.includes('<%')) continue;

            // Resolve o caminho base (diretório do arquivo atual)
            const currentFileDir = path.dirname(document.uri.fsPath);
            
            // Limpa query strings (ex: style.css?v=1.2 -> style.css)
            const cleanPath = relativePath.split('?')[0].split('#')[0];

            // Cria o caminho absoluto para checar no sistema
            const absolutePath = path.resolve(currentFileDir, cleanPath);

            // A MÁGICA: Verifica se o arquivo existe no disco
            if (!fs.existsSync(absolutePath)) {
                
                // Se não achou relativo, tenta buscar na raiz do workspace (para caminhos que começam com /)
                let foundInRoot = false;
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
                
                if (workspaceFolder && relativePath.startsWith('/')) {
                     const rootPath = path.join(workspaceFolder.uri.fsPath, relativePath);
                     if (fs.existsSync(rootPath.split('?')[0])) {
                         foundInRoot = true;
                     }
                }

                if (!foundInRoot) {
                    // SE NÃO EXISTE: CRIA O ERRO
                    const matchStart = match.index + match[0].indexOf(relativePath);
                    const matchEnd = matchStart + relativePath.length;
                    
                    const range = new vscode.Range(
                        document.positionAt(matchStart),
                        document.positionAt(matchEnd)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `HyperDark: Arquivo não encontrado: "${relativePath}"`,
                        vscode.DiagnosticSeverity.Error // Vermelho
                    );
                    
                    diagnostics.push(diagnostic);
                }
            }
        }

        // Aplica os erros no editor
        diagnosticCollection.set(document.uri, diagnostics);
    }

    // SEGURANÇA 4: DEBOUNCE
    // Só roda a validação se o usuário PARAR de digitar por 1 segundo (1000ms)
    // Isso garante que o VS Code não fique lento enquanto você digita.
    function triggerValidation(document) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            validateDocument(document);
        }, 1000); 
    }

    // Gatilhos de Eventos
    if (vscode.window.activeTextEditor) {
        triggerValidation(vscode.window.activeTextEditor.document);
    }

    vscode.workspace.onDidChangeTextDocument(event => {
        triggerValidation(event.document);
    }, null, context.subscriptions);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) triggerValidation(editor.document);
    }, null, context.subscriptions);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};