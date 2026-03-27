import * as vscode from "vscode";

// Variáveis para controle global do estado
let activeInterval: NodeJS.Timeout | undefined;
let decorationType: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Registra o comando de ativar o brilho
  let disposable = vscode.commands.registerCommand(
    "extension.brilharRGB",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showWarningMessage("Abra um arquivo primeiro!");
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showInformationMessage(
          "Selecione um texto para brilhar!",
        );
        return;
      }

      // 1. Para qualquer animação anterior
      pararBrilho();

      // 2. Salva o Range (trecho selecionado) para o brilho não "fugir"
      const rangeAlvo = new vscode.Range(selection.start, selection.end);

      let hue = 0;

      // 3. Inicia o loop de cores (RGB/HSL)
      activeInterval = setInterval(() => {
        hue = (hue + 10) % 360; // Velocidade da transição de cor
        const corPrincipal = `hsl(${hue}, 100%, 50%)`;

        // Remove a decoração do frame anterior para não vazar memória
        if (decorationType) {
          decorationType.dispose();
        }

        // 4. Cria a nova decoração com o "Glow"
        // decorationType = vscode.window.createTextEditorDecorationType({
        //   color: corPrincipal,
        //   fontWeight: "bold",
        //   // O truque do ponto-e-vírgula permite injetar o text-shadow no CSS do VS Code
        //   textDecoration: `none; text-shadow: 0 0 10px ${corPrincipal}, 0 0 20px ${corPrincipal};`,
        //   rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        // });
        decorationType = vscode.window.createTextEditorDecorationType({
          color: corPrincipal,
          fontWeight: "bold",
          // Adicionamos um outline sutil para ajudar o VS Code a renderizar a cor
          outline: `1px solid ${corPrincipal}`,
          //   textDecoration: `none; text-shadow: 0 0 10px ${corPrincipal}, 0 0 20px ${corPrincipal};`,
          textDecoration: `none; text-shadow: 0 0 10px ${corPrincipal}, 0 0 20px ${corPrincipal};`,
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        });

        // Aplica ao editor
        editor.setDecorations(decorationType, [rangeAlvo]);
      }, 80); // 80ms garante uma animação bem fluida

      vscode.window.setStatusBarMessage("RGB Mode: ON 🌈", 3000);
    },
  );

  // Registra o comando de parar o brilho
  let stopDisposable = vscode.commands.registerCommand(
    "extension.pararBrilho",
    () => {
      pararBrilho();
      vscode.window.showInformationMessage("RGB Desativado.");
    },
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(stopDisposable);
}

function pararBrilho() {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = undefined;
  }
  if (decorationType) {
    decorationType.dispose();
    decorationType = undefined;
  }
}

// Limpeza quando a extensão é desativada
export function deactivate() {
  pararBrilho();
}
