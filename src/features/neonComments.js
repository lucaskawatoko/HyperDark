const vscode = require("vscode");

function activate(context) {
    // Definição dos estilos Neon
    const todoDecoration = vscode.window.createTextEditorDecorationType({
        color: '#ff9900', // Laranja
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 153, 0, 0.1)',
        border: '1px solid rgba(255, 153, 0, 0.3)',
        borderRadius: '2px',
        overviewRulerColor: '#ff9900',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    const fixmeDecoration = vscode.window.createTextEditorDecorationType({
        color: '#ff0055', // Vermelho/Rosa Neon
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 0, 85, 0.1)',
        border: '1px solid rgba(255, 0, 85, 0.3)',
        borderRadius: '2px',
        overviewRulerColor: '#ff0055',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    const noteDecoration = vscode.window.createTextEditorDecorationType({
        color: '#00ccff', // Azul Cyan
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 204, 255, 0.1)',
        border: '1px solid rgba(0, 204, 255, 0.3)',
        borderRadius: '2px'
    });

    const queryDecoration = vscode.window.createTextEditorDecorationType({
        color: '#00ffcc', // Verde Neon
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        border: '1px solid rgba(0, 255, 204, 0.3)',
        borderRadius: '2px'
    });

    function updateDecorations(editor) {
        if (!editor) return;

        const text = editor.document.getText();
        const todos = [];
        const fixmes = [];
        const notes = [];
        const queries = [];

        // Regex otimizada para pegar // TODO:, // FIXME:, etc
        const regex = /(\/\/|#|\/\*)\s*(TODO|FIXME|NOTE|INFO|BUG|WARN|\?|!)(:| )/gi;

        let match;
        while ((match = regex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length + 50); // Pega um trecho da linha
            const line = editor.document.lineAt(startPos.line);
            const range = new vscode.Range(startPos, line.range.end); // Pinta até o fim da linha

            const type = match[2].toUpperCase();

            if (type === 'TODO') todos.push(range);
            else if (type === 'FIXME' || type === 'BUG' || type === '!') fixmes.push(range);
            else if (type === 'NOTE' || type === 'INFO') notes.push(range);
            else if (type === '?' || type === 'WARN') queries.push(range);
        }

        editor.setDecorations(todoDecoration, todos);
        editor.setDecorations(fixmeDecoration, fixmes);
        editor.setDecorations(noteDecoration, notes);
        editor.setDecorations(queryDecoration, queries);
    }

    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) updateDecorations(editor);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            updateDecorations(vscode.window.activeTextEditor);
        }
    }, null, context.subscriptions);
}

function deactivate() {}

module.exports = { activate, deactivate };