// src/index.js

// --- Core (O Sistema) ---
const CoreCommands = require("./core/coreCommands");
const Reload = require("./core/reload");
const StatusBarManager = require("./core/statusBarManager");
const ThemeCleanup = require("./core/themeCleanup");

// --- Features (Funcionalidades Visuais) ---
const Clock = require("./features/clock");
const LiveServer = require("./features/liveServer");
const NeonComments = require("./features/neonComments");
const PxToRem = require("./features/pxToRem");
const CursorManager = require("./features/cursorManager");

// --- Providers (Inteligência de Código) ---
const ColorHighlight = require("./providers/colorHighlight");
const PathValidator = require("./providers/pathValidator");


// A LISTA FINAL (Tudo que será carregado)
const features = [
    // Core
    ThemeCleanup, // <--- ADICIONADO AQUI (Recomendo ser o primeiro)
    CoreCommands,
    StatusBarManager,
    Reload,
    
    // Features
    Clock,
    LiveServer,
    NeonComments,
    PxToRem,
    CursorManager,
    
    // Providers
    ColorHighlight,
    PathValidator
];

module.exports = features;