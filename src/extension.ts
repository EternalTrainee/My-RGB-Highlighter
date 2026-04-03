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

      vscode.commands.executeCommand("extension.pararBrilho");

      const rangeAtual = new vscode.Range(selection.start, selection.end);
      const uriAtual = editor.document.uri.toString();
      let hue = 0;
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
          rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
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
        id: Math.random().toString(36).slice(2, 11),
        interval,
        decorationType: currentDecoration,
        range: rangeAtual,
        uri: uriAtual,
      });
    }
  );

  function iniciarBrilho(editor: vscode.TextEditor, range: vscode.Range) {
    const uriAtual = editor.document.uri.toString();
    let hue = 0;

    const criarDecoracao = (h: number) => {
    const cor = `hsl(${h}, 100%, 50%)`;
    return vscode.window.createTextEditorDecorationType({
      color: cor,
      fontWeight: "bold",
      textDecoration: `none; text-shadow: 0 0 10px ${cor}, 0 0 20px ${cor};`,
      outline: `1px solid ${cor}`,
      rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
    });
  };

    // 1. Já começa com uma decoração colorida (evita o vazio inicial)
    let currentDecoration = criarDecoracao(hue);
    
    // 2. Aplica IMEDIATAMENTE (evita esperar os 80ms)
    editor.setDecorations(currentDecoration, [range]);

    const interval = setInterval(() => {
      hue = (hue + 10) % 360;
      const newDecoration = criarDecoracao(hue);

      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.uri.toString() === uriAtual) {
        activeEditor.setDecorations(newDecoration, [range]);
      }

      currentDecoration.dispose();
      const instancia = brilhosAtivos.find((b) => b.interval === interval);
      if (instancia) {instancia.decorationType = newDecoration;};
      currentDecoration = newDecoration;
    }, 80);

    brilhosAtivos.push({
      id: Math.random().toString(36).slice(2, 11),
      interval,
      decorationType: currentDecoration,
      range,
      uri: uriAtual,
    });
  }

  function subtrairRanges(base: vscode.Range, ocupado: vscode.Range): vscode.Range[] {
    const interseccao = base.intersection(ocupado);
    if (!interseccao || interseccao.isEmpty) {return [base];};

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
      if (!editor) {return;};

      const selecaoUsuario = editor.selection;
      const uriAtual = editor.document.uri.toString();

      // Filtra instâncias que têm qualquer intersecção com a seleção
      const afetados = brilhosAtivos.filter(b => 
        b.uri === uriAtual && !!b.range.intersection(selecaoUsuario)
      );

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
    }
  );
  let brilharLinhaDisposable = vscode.commands.registerCommand(
  "extension.brilharLinha",
  () => {
    vscode.commands.executeCommand("extension.pararBrilho");
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const posicaoCursor = editor.selection.active;
    const linha = editor.document.lineAt(posicaoCursor.line);

    // 1. Seleciona a linha inteira (do primeiro ao último caractere)
    const novaSelecao = new vscode.Selection(
      linha.range.start,
      linha.range.end
    );
    editor.selection = novaSelecao;

    // 2. Executa o comando de brilho que você já criou
    // Isso garante que ele passe pelas validações de limpeza e limite de 5 brilhos
    vscode.commands.executeCommand("extension.brilharRGB");
  }
);
  // Reaplica as decorações ao trocar de aba/editor
  const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (!editor) {return;};

      const uri = editor.document.uri.toString();

      brilhosAtivos.forEach((brilho) => {
        if (brilho.uri === uri) {
          editor.setDecorations(brilho.decorationType, [brilho.range]);
        }
      });
    },
  );

  const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
  const uri = event.document.uri.toString();
  const editor = vscode.window.activeTextEditor;

  // Atribuímos o resultado do flatMap diretamente à variável global no final
  brilhosAtivos = brilhosAtivos.flatMap((brilho) => {
    if (brilho.uri !== uri) {return [brilho];};

    let novoRange = brilho.range;

    for (const change of event.contentChanges) {
      const r = change.range;

      // 1. Ajuste de deslocamento (Edição antes do brilho)
      if (r.end.isBefore(novoRange.start)) {
        const delta = change.text.length - change.rangeLength;
        novoRange = new vscode.Range(
          novoRange.start.translate(0, delta),
          novoRange.end.translate(0, delta)
        );
        continue;
      }

      // 2. Intersecção ou Deletou tudo
      if (novoRange.intersection(r)) {
        // Para o motor do brilho atual, pois ele será "fragmentado" ou removido
        clearInterval(brilho.interval);
        brilho.decorationType.dispose();

        if (r.contains(novoRange)) {
          return []; // Brilho totalmente engolido pela edição
        }

        // Se deletou parcialmente, criamos as sobras e retornamos VAZIO para o original
        const sobras = subtrairRanges(novoRange, r);
        if (editor) {
          sobras.forEach(s => iniciarBrilho(editor, s));
        }
        return []; // O original morre aqui, os novos nascem via iniciarBrilho
      }
    }

    // Se o brilho sobreviveu ou só foi deslocado, atualizamos o range e mantemos
    brilho.range = novoRange;
    return [brilho];
  });
});

  context.subscriptions.push(
    disposable,
    stopDisposable,
    editorChangeListener,
    changeListener,
    brilharLinhaDisposable
  );
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