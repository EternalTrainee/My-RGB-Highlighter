"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
// Variáveis globais para controlar o efeito
let activeInterval;
let decorationType;
let rangeAlvoGlobal;
let documentUriGlobal;
function activate(context) {
    // Comando para ativar o brilho RGB
    let disposable = vscode.commands.registerCommand("extension.brilharRGB", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("Abra um arquivo primeiro!");
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage("Selecione um texto para brilhar!");
            return;
        }
        // Para animação anterior
        pararBrilho();
        // Salva globalmente o range e o documento
        rangeAlvoGlobal = new vscode.Range(selection.start, selection.end);
        documentUriGlobal = editor.document.uri.toString();
        let hue = 0;
        // Loop de animação
        activeInterval = setInterval(() => {
            hue = (hue + 10) % 360;
            const corPrincipal = `hsl(${hue}, 100%, 50%)`;
            // Remove decoração anterior
            if (decorationType) {
                decorationType.dispose();
            }
            decorationType = vscode.window.createTextEditorDecorationType({
                color: corPrincipal,
                fontWeight: "bold",
                textDecoration: `none; text-shadow: 0 0 10px ${corPrincipal}, 0 0 20px ${corPrincipal};`,
                outline: `1px solid ${corPrincipal}`,
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            });
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor &&
                documentUriGlobal === activeEditor.document.uri.toString() &&
                rangeAlvoGlobal) {
                activeEditor.setDecorations(decorationType, [rangeAlvoGlobal]);
            }
        }, 80);
        vscode.window.setStatusBarMessage("RGB Mode: ON 🌈", 3000);
    });
    { }
    // Comando para parar o brilho
    let stopDisposable = vscode.commands.registerCommand("extension.pararBrilho", () => {
        pararBrilho();
        vscode.window.showInformationMessage("RGB Desativado.");
    });
    // Listener para reaplicar a decoração ao trocar de editor
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor)
            return;
        if (rangeAlvoGlobal && documentUriGlobal && decorationType) {
            if (editor.document.uri.toString() === documentUriGlobal) {
                editor.setDecorations(decorationType, [rangeAlvoGlobal]);
            }
        }
    });
    // Registrar disposables
    context.subscriptions.push(disposable);
    context.subscriptions.push(stopDisposable);
    context.subscriptions.push(editorChangeListener);
}
// Função para parar a animação e limpar estado
function pararBrilho() {
    if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = undefined;
    }
    if (decorationType) {
        decorationType.dispose();
        decorationType = undefined;
    }
    rangeAlvoGlobal = undefined;
    documentUriGlobal = undefined;
}
// Limpeza ao desativar a extensão
function deactivate() {
    pararBrilho();
}
//# sourceMappingURL=extension.js.map