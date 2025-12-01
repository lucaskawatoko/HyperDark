// src/index.js

// --- Core (O Sistema) ---
const CoreCommands = require("./core/coreCommands");
const Reload = require("./core/reload");
const StatusBarManager = require("./core/statusBarManager");

// --- Features (Funcionalidades Visuais) ---
const Clock = require("./features/clock");
const ColorTheme = require("./features/colorTheme"); // <--- O erro estava aqui (caminho atualizado)
const LiveServer = require("./features/liveServer");
const NeonComments = require("./features/neonComments");
const PxToRem = require("./features/pxToRem");

// --- Providers (Inteligência de Código) ---
const ColorHighlight = require("./providers/colorHighlight");
const PathValidator = require("./providers/pathValidator");
const CursorManager = require("./features/cursorManager");

// A LISTA FINAL (Tudo que será carregado)
const features = [
    // Core
    CoreCommands,
    StatusBarManager,
    Reload,
    
    // Features
    Clock,
    ColorTheme,
    LiveServer,
    NeonComments,
    PxToRem,
    CursorManager,
    
    // Providers
    ColorHighlight,
    PathValidator
];

module.exports = features;