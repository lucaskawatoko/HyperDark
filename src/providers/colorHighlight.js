const vscode = require("vscode");

let activeDecorations = [];

// Mapa de cores nomeadas HTML5 (W3C standard)
const htmlColors = {
    "black": "#000000", "silver": "#c0c0c0", "gray": "#808080", "white": "#ffffff", "maroon": "#800000", 
    "red": "#ff0000", "purple": "#800080", "fuchsia": "#ff00ff", "green": "#008000", "lime": "#00ff00", 
    "olive": "#808000", "yellow": "#ffff00", "navy": "#000080", "blue": "#0000ff", "teal": "#008080", 
    "aqua": "#00ffff", "orange": "#ffa500", "aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", 
    "aquamarine": "#7fffd4", "azure": "#f0ffff", "beige": "#f5f5dc", "bisque": "#ffe4c4", 
    "blanchedalmond": "#ffebcd", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887", 
    "cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", 
    "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff", 
    "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", 
    "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f", 
    "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", 
    "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1", 
    "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", 
    "dodgerblue": "#1e90ff", "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", 
    "gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", 
    "greenyellow": "#adff2f", "honeydew": "#f0fff0", "hotpink": "#ff69b4", "indianred": "#cd5c5c", 
    "indigo": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c", "lavender": "#e6e6fa", 
    "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", 
    "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2", "lightgray": "#d3d3d3", 
    "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", 
    "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de", "lightyellow": "#ffffe0", 
    "limegreen": "#32cd32", "linen": "#faf0e6", "magenta": "#ff00ff", "mediumaquamarine": "#66cdaa", 
    "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370db", "mediumseagreen": "#3cb371", 
    "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", 
    "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", 
    "moccasin": "#ffe4b5", "navajowhite": "#ffdead", "oldlace": "#fdf5e6", "olivedrab": "#6b8e23", 
    "orangered": "#ff4500", "orchid": "#da70d6", "palegoldenrod": "#eee8aa", "palegreen": "#98fb98", 
    "paleturquoise": "#afeeee", "palevioletred": "#db7093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", 
    "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "rosybrown": "#bc8f8f", 
    "royalblue": "#4169e1", "saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", 
    "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "skyblue": "#87ceeb", 
    "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", 
    "steelblue": "#4682b4", "tan": "#d2b48c", "thistle": "#d8bfd8", "tomato": "#ff6347", 
    "turquoise": "#40e0d0", "violet": "#ee82ee", "wheat": "#f5deb3", "whitesmoke": "#f5f5f5", 
    "yellowgreen": "#9acd32", "rebeccapurple": "#663399"
};

function activate(context) {

    // --- CONVERSÕES ---
    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
    }

    function getColorWithOpacity(colorString, opacity) {
        colorString = colorString.trim();
        let r = 0, g = 0, b = 0;

        // Verifica se é cor nomeada
        if (htmlColors[colorString.toLowerCase()]) {
            colorString = htmlColors[colorString.toLowerCase()];
        }

        if (colorString.startsWith('#')) {
            let hex = colorString.replace('#', '');
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length >= 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
        } 
        else if (colorString.startsWith('rgb')) {
            const parts = colorString.match(/(\d+(\.\d+)?)/g);
            if (parts && parts.length >= 3) {
                r = parseFloat(parts[0]);
                g = parseFloat(parts[1]);
                b = parseFloat(parts[2]);
            }
        }
        else if (colorString.startsWith('hsl')) {
            const parts = colorString.match(/(\d+(\.\d+)?)/g);
            if (parts && parts.length >= 3) {
                const h = parseFloat(parts[0]);
                const s = parseFloat(parts[1]);
                const l = parseFloat(parts[2]);
                [r, g, b] = hslToRgb(h, s, l);
            }
        } else {
            return colorString;
        }

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    function updateColors(editor) {
        if (!editor) return;

        const config = vscode.workspace.getConfiguration('hyperdark');
        const enableGlow = config.get('enableGlow');
        const opacity = config.get('opacity');
        const enableVars = config.get('enableVariableMatching');

        activeDecorations.forEach(d => d.dispose());
        activeDecorations = [];

        const text = editor.document.getText();
        const colorRanges = new Map();

        const colorNamesRegex = Object.keys(htmlColors).join('|');
        const fullRegex = new RegExp(
            `#(?:[0-9a-fA-F]{3}){1,2}\\b|rgb\\(\\s*\\d+(\\.\\d+)?\\s*,\\s*\\d+(\\.\\d+)?\\s*,\\s*\\d+(\\.\\d+)?\\s*\\)|hsl\\(\\s*\\d+(\\.\\d+)?\\s*,\\s*\\d+(\\.\\d+)?%\\s*,\\s*\\d+(\\.\\d+)?%\\s*\\)|\\b(${colorNamesRegex})\\b`, 
            'gi'
        );
        
        // --- PROTEÇÃO DE PERFORMANCE ---
        const lines = text.split(/\r\n|\r|\n/);
        const MAX_LINE_LENGTH = 500;

        let match;
        while ((match = fullRegex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            
            // Segurança: Ignora linhas muito longas (minificadas)
            if (editor.document.lineAt(startPos.line).text.length > MAX_LINE_LENGTH) {
                continue;
            }

            const color = match[0].toLowerCase();
            if (!colorRanges.has(color)) colorRanges.set(color, []);
            colorRanges.get(color).push(new vscode.Range(startPos, endPos));
        }

        if (enableVars) {
            const varDefRegex = new RegExp(
                `((?:--|\\$)[a-zA-Z0-9-_]+)\\s*:\\s*(#(?:[0-9a-fA-F]{3}){1,2}\\b|rgb\\([^)]+\\)|hsl\\([^)]+\\)|\\b(${colorNamesRegex})\\b)`,
                'gi'
            );
            const variableMap = new Map();

            while ((match = varDefRegex.exec(text)) !== null) {
                const startPos = editor.document.positionAt(match.index);
                if (editor.document.lineAt(startPos.line).text.length > MAX_LINE_LENGTH) continue;

                variableMap.set(match[1], match[2]);
            }

            const varUsageRegex = /var\((--[a-zA-Z0-9-_]+)\)|(\$[a-zA-Z0-9-_]+)/g;
            while ((match = varUsageRegex.exec(text)) !== null) {
                const varName = match[1] || match[2];
                const startPos = editor.document.positionAt(match.index);
                
                if (editor.document.lineAt(startPos.line).text.length > MAX_LINE_LENGTH) continue;

                if (variableMap.has(varName)) {
                    const resolvedColor = variableMap.get(varName).toLowerCase();
                    const range = new vscode.Range(startPos, editor.document.positionAt(match.index + match[0].length));

                    if (!colorRanges.has(resolvedColor)) colorRanges.set(resolvedColor, []);
                    colorRanges.get(resolvedColor).push(range);
                }
            }
        }

        // --- APLICAÇÃO DAS DECORAÇÕES ---
        for (const [color, ranges] of colorRanges) {
            const glassBackground = getColorWithOpacity(color, opacity);
            
            // 1. Calcula o brilho (Glow)
            const boxShadow = enableGlow 
                ? `0 0 5px ${glassBackground}, inset 0 0 2px ${glassBackground}`
                : 'none';

            // 2. Define a borda
            let borderColor = color;
            if (htmlColors[color]) borderColor = htmlColors[color];

            // Se o Glow estiver DESLIGADO, a borda fica transparente (contorno some)
            const borderStyle = enableGlow 
                ? `1px solid ${borderColor}` 
                : `1px solid transparent`; 

            // 3. Cria a decoração com o CSS Injection
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: glassBackground,
                border: borderStyle,
                borderRadius: '3px',
                color: 'inherit',
                // O TRUQUE: Injeta o boxShadow via textDecoration para evitar o erro de API
                textDecoration: `none; box-shadow: ${boxShadow}`
            });

            activeDecorations.push(decorationType);
            editor.setDecorations(decorationType, ranges);
        }
    }

    let timeout = null;
    function triggerUpdate(editor) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => updateColors(editor), 100);
    }

    if (vscode.window.activeTextEditor) triggerUpdate(vscode.window.activeTextEditor);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) triggerUpdate(editor);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            triggerUpdate(vscode.window.activeTextEditor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('hyperdark')) {
            if (vscode.window.activeTextEditor) triggerUpdate(vscode.window.activeTextEditor);
        }
    }, null, context.subscriptions);
}

function deactivate() {
    activeDecorations.forEach(d => d.dispose());
    activeDecorations = [];
}

module.exports = {
    activate,
    deactivate
};