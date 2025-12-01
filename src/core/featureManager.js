const vscode = require("vscode");

class FeatureManager {
    constructor(context, features) {
        this.context = context;
        this.features = features;
    }

    activateAll() {
        console.log(`[HyperDark] Carregando ${this.features.length} módulos...`);
        
        this.features.forEach(featureModule => {
            try {
                // Tenta ativar o módulo
                if (featureModule.activate) {
                    featureModule.activate(this.context);
                }
            } catch (error) {
                console.error(`[HyperDark] Erro ao carregar módulo:`, error);
            }
        });
    }

    deactivateAll() {
        this.features.forEach(featureModule => {
            if (featureModule.deactivate) {
                featureModule.deactivate();
            }
        });
    }
}

module.exports = FeatureManager;