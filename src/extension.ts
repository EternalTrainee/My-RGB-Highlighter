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

      if (brilhosAtivos.length >= 5) {
        vscode.window.showWarningMessage("Calma lá, entusiasta de RGB! Vai derreter a GPU.");
        return;
      }
      vscode.commands.executeCommand("extension.pararBrilho");
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
function iniciarBrilho(editor: vscode.TextEditor, range: vscode.Range) {
  const uriAtual = editor.document.uri.toString();
  let hue = 0;
  let currentDecoration = vscode.window.createTextEditorDecorationType({});

  const interval = setInterval(() => {
    hue = (hue + 10) % 360;
    const cor = `hsl(${hue}, 100%, 50%)`;
    const newDecoration = vscode.window.createTextEditorDecorationType({
      color: cor,
      fontWeight: "bold",
      textDecoration: `none; text-shadow: 0 0 10px ${cor}, 0 0 20px ${cor};`,
      outline: `1px solid ${cor}`,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.toString() === uriAtual) {
      activeEditor.setDecorations(newDecoration, [range]);
    }

    currentDecoration.dispose();
    const instancia = brilhosAtivos.find((b) => b.interval === interval);
    if (instancia) instancia.decorationType = newDecoration;
    currentDecoration = newDecoration;
  }, 80);

  brilhosAtivos.push({
    id: Math.random().toString(36).substr(2, 9),
    interval: interval,
    decorationType: currentDecoration,
    range: range,
    uri: uriAtual,
  });
}

function subtrairRanges(base: vscode.Range, ocupado: vscode.Range): vscode.Range[] {
  const interseccao = base.intersection(ocupado);
  if (!interseccao || interseccao.isEmpty) return [base];

  const resultados: vscode.Range[] = [];
  if (base.start.isBefore(interseccao.start)) {
    resultados.push(new vscode.Range(base.start, interseccao.start));
  }
  if (base.end.isAfter(interseccao.end)) {
    resultados.push(new vscode.Range(interseccao.end, base.end));
  }
  return resultados;
}
  // Comando para parar TODOS os brilhos
  let stopDisposable = vscode.commands.registerCommand(
  "extension.pararBrilho",
  () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selecaoUsuario = editor.selection;
    const uriAtual = editor.document.uri.toString();

    // Filtra instâncias que têm qualquer intersecção com a seleção
    const afetados = brilhosAtivos.filter(b => 
      b.uri === uriAtual && !!b.range.intersection(selecaoUsuario)
    );

    if (afetados.length === 0) {
      vscode.window.setStatusBarMessage("Nenhum efeito RGB nesta área.", 2000);
      return;
    }

    afetados.forEach(brilho => {
      // 1. Para o motor e remove a decoração antiga
      clearInterval(brilho.interval);
      brilho.decorationType.dispose();
      
      // 2. Remove da lista global de rastreamento
      brilhosAtivos = brilhosAtivos.filter(b => b.id !== brilho.id);

      // 3. Calcula o que SOBROU do brilho original (áreas fora da seleção)
      const sobras = subtrairRanges(brilho.range, selecaoUsuario);

      // 4. Reinicia o brilho apenas para as partes que devem continuar
      sobras.forEach(rangeSobra => {
        iniciarBrilho(editor, rangeSobra);
      });
    });

    vscode.window.setStatusBarMessage(`Efeito removido da seleção.`, 3000);
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
