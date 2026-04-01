import * as vscode from "vscode";

// Interface para gerenciar cada instância de brilho individualmente
interface BrilhoInstancia {
  id: string;
  interval: NodeJS.Timeout;
  decorationType: vscode.TextEditorDecorationType;
  range: vscode.Range;
  uri: string;
}

// Lista global para armazenar todos os brilhos ativos
let brilhosAtivos: BrilhoInstancia[] = [];

export function activate(context: vscode.ExtensionContext) {
  // Comando para ativar o brilho RGB
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

      const rangeAtual = new vscode.Range(selection.start, selection.end);
      const uriAtual = editor.document.uri.toString();
      let hue = 0;

      // 1. Verifique se já existe um brilho exatamente no mesmo range/URI
      const jaExiste = brilhosAtivos.find(
        (b) => b.uri === uriAtual && b.range.isEqual(rangeAtual),
      );

      if (jaExiste) {
        vscode.window.showInformationMessage("Este trecho já está brilhando!");
        return; // Interrompe a criação de um novo intervalo
      }

      // Criamos uma referência inicial para a decoração que será atualizada no intervalo
      let currentDecoration = vscode.window.createTextEditorDecorationType({});

      const interval = setInterval(() => {
        hue = (hue + 10) % 360;
        const corPrincipal = `hsl(${hue}, 100%, 50%)`;

        // Criamos a nova decoração com a cor atualizada
        const newDecoration = vscode.window.createTextEditorDecorationType({
          color: corPrincipal,
          fontWeight: "bold",
          textDecoration: `none; text-shadow: 0 0 10px ${corPrincipal}, 0 0 20px ${corPrincipal};`,
          outline: `1px solid ${corPrincipal}`,
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        });

        // Aplica ao editor se ele ainda for o correto
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.uri.toString() === uriAtual) {
          activeEditor.setDecorations(newDecoration, [rangeAtual]);
        }

        // Descarta a decoração antiga para não vazar memória
        currentDecoration.dispose();

        // Atualiza a referência na nossa lista de controle
        const instancia = brilhosAtivos.find((b) => b.interval === interval);
        if (instancia) {
          instancia.decorationType = newDecoration;
        }
        currentDecoration = newDecoration;
      }, 80);

      // Adiciona a nova instância à lista de brilhos ativos
      brilhosAtivos.push({
        id: Math.random().toString(36).substr(2, 9),
        interval: interval,
        decorationType: currentDecoration,
        range: rangeAtual,
        uri: uriAtual,
      });

      vscode.window.setStatusBarMessage(
        `RGB Mode: ${brilhosAtivos.length} ativos 🌈`,
        3000,
      );
    },
  );

  // Comando para parar TODOS os brilhos
  let stopDisposable = vscode.commands.registerCommand(
    "extension.pararBrilho",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selecaoUsuario = editor.selection;
      const uriAtual = editor.document.uri.toString();

      // Filtra quem deve ser removido: mesmo arquivo E tem interseção com a seleção
      const paraRemover = brilhosAtivos.filter(b => 
        b.uri === uriAtual && b.range.intersection(selecaoUsuario)
      );

      if (paraRemover.length === 0) {
        vscode.window.setStatusBarMessage("Nenhum efeito RGB na seleção.", 2000);
        return;
      }

      paraRemover.forEach(brilho => {
        clearInterval(brilho.interval);
        brilho.decorationType.dispose();
        
        // Remove da lista global
        brilhosAtivos = brilhosAtivos.filter(b => b.id !== brilho.id);
      });

      vscode.window.setStatusBarMessage(`Removidos ${paraRemover.length} efeitos.`, 3000);
    }
  );

  // Reaplica as decorações ao trocar de aba/editor
  const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {{}
      if (!editor) return;
      const uri = editor.document.uri.toString();

      brilhosAtivos.forEach((brilho) => {
        if (brilho.uri === uri) {
          editor.setDecorations(brilho.decorationType, [brilho.range]);
        }
      });
    },
  );

  context.subscriptions.push(disposable, stopDisposable, editorChangeListener);
}

function limparTodosOsBrilhos() {
  brilhosAtivos.forEach((brilho) => {
    clearInterval(brilho.interval);
    brilho.decorationType.dispose();
  });
  brilhosAtivos = [];
}

export function deactivate() {
  limparTodosOsBrilhos();
}
