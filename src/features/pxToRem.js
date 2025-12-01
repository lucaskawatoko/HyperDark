const vscode = require("vscode");

function activate(context) {

    // 1. COMANDO: SUBSTITUIR APENAS UM (Cirúrgico)
    const replaceOneCommand = vscode.commands.registerCommand('_hyperdark.replacePxOne', (rangeData, newText) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const range = new vscode.Range(rangeData[0], rangeData[1], rangeData[2], rangeData[3]);
        const currentText = editor.document.getText(range);

        // Trava de segurança: se já mudou, não faz nada
        if (!currentText.includes('px')) return;

        editor.edit(editBuilder => {
            editBuilder.replace(range, newText);
        });
    });

    // 2. COMANDO: SUBSTITUIR TODOS NO ARQUIVO (Massa)
    const replaceAllCommand = vscode.commands.registerCommand('_hyperdark.replacePxAll', (pxValue, newText) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const text = editor.document.getText();
        
        // Regex para achar exatamente esse valor (Ex: 20px)
        const regex = new RegExp(`\\b${pxValue}px\\b`, 'g');
        
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            matches.push(new vscode.Range(startPos, endPos));
        }

        if (matches.length === 0) return;

        // Executa todas as substituições de uma vez
        editor.edit(editBuilder => {
            matches.forEach(range => {
                editBuilder.replace(range, newText);
            });
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage(`HyperDark: ${matches.length} ocorrências de ${pxValue}px alteradas!`);
            }
        });
    });

    context.subscriptions.push(replaceOneCommand);
    context.subscriptions.push(replaceAllCommand);


    // 3. O HOVER (O BALÃOZINHO)
    const hoverProvider = vscode.languages.registerHoverProvider(['css', 'scss', 'less', 'html', 'php'], {
        provideHover(document, position, token) {
            
            // --- VERIFICAÇÃO DE CONFIGURAÇÃO (NOVO) ---
            const config = vscode.workspace.getConfiguration('hyperdark');
            const isEnabled = config.get('enablePxToRem');

            // Se o usuário desativou nas configurações, paramos aqui.
            if (!isEnabled) {
                return null;
            }
            // ------------------------------------------

            const range = document.getWordRangeAtPosition(position, /\d+(\.\d+)?px/);
            if (!range) return null;

            const text = document.getText(range);
            const pxValue = parseFloat(text);
            if (isNaN(pxValue)) return null;

            const remValue = parseFloat((pxValue / 16).toFixed(4));
            const newText = `${remValue}rem`;

            // --- Contar quantas vezes aparece no arquivo ---
            const fullText = document.getText();
            const countRegex = new RegExp(`\\b${pxValue}px\\b`, 'g');
            const matchCount = (fullText.match(countRegex) || []).length;

            // --- Links dos Comandos ---
            const rangeArgs = [range.start.line, range.start.character, range.end.line, range.end.character];
            const oneArgs = [rangeArgs, newText];
            const uriOne = vscode.Uri.parse(
                `command:_hyperdark.replacePxOne?${encodeURIComponent(JSON.stringify(oneArgs))}`
            );

            const allArgs = [pxValue, newText];
            const uriAll = vscode.Uri.parse(
                `command:_hyperdark.replacePxAll?${encodeURIComponent(JSON.stringify(allArgs))}`
            );

            // --- Monta o Markdown ---
            const md = new vscode.MarkdownString();
            md.isTrusted = true;
            md.supportHtml = true;

            md.appendMarkdown(`**HyperDark Converter** 🔄\n\n`);
            md.appendMarkdown(`Valor: **${pxValue}px** ➡️ **${newText}**\n\n`);
            
            md.appendMarkdown(`[Mudar **apenas este**](${uriOne})\n\n`);
            
            if (matchCount > 1) {
                md.appendMarkdown(`---\n\n`);
                md.appendMarkdown(`[🚀 Mudar **todas as ${matchCount} ocorrências**](${uriAll})`);
            }
            
            return new vscode.Hover(md);
        }
    });

    context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};