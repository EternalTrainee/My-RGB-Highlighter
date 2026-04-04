import * as vscode from "vscode";

// Interface para gerenciar cada instância de brilho individualmente
interface BrilhoInstancia {
  id: string;
  interval: NodeJS.Timeout;
  decorationType: vscode.TextEditorDecorationType;
  range: vscode.Range;
  uri: string;
  tipo?: "dinamico" | "estatico"; // Tipo de brilho
  cor?: string; // Cor estática (se tipo === "estatico")
}

// Lista global para armazenar todos os brilhos ativos
let brilhosAtivos: BrilhoInstancia[] = [];

// Cor amarela para marcação estática
const COR_AMARELA = "#FFFF00";

// Cor do atalho (rainbow é o default)
let corAtalho = "rainbow";

export function activate(context: vscode.ExtensionContext) {
  // Carrega a cor do atalho salva, ou usa 'rainbow' como padrão
  corAtalho = context.globalState.get('corAtalho') || 'rainbow';

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
        tipo: "dinamico",
      });

      // Desseleciona o texto para evitar que seja sobrescrito acidentalmente
      editor.selection = new vscode.Selection(rangeAtual.end, rangeAtual.end);
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
      tipo: "dinamico",
    });

  }

  function iniciarBrilhoEstático(editor: vscode.TextEditor, range: vscode.Range, cor: string) {
    const uriAtual = editor.document.uri.toString();

    const decoration = vscode.window.createTextEditorDecorationType({
      //backgroundColor: cor,
      color: cor,
      fontWeight: "bold",
      textDecoration: `none; text-shadow: 0 0 10px ${cor}, 0 0 20px ${cor};`,
      outline: `1px solid ${cor}`,
      rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
    });

    editor.setDecorations(decoration, [range]);

    // Dummy interval com clearInterval vazio para manter compatibilidade
    const interval = setInterval(() => {}, 999999999);

    brilhosAtivos.push({
      id: Math.random().toString(36).slice(2, 11),
      interval,
      decorationType: decoration,
      range,
      uri: uriAtual,
      tipo: "estatico",
      cor,
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
    
    return resultados.filter(r => !r.isEmpty);
  }
  // Comando para parar TODOS os brilhos
  let stopDisposable = vscode.commands.registerCommand(
    "extension.pararBrilho",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {return;};

      const selecaoUsuario = editor.selection;
      const uriAtual = editor.document.uri.toString();
      const posicaoCursor = editor.selection.active;

      let afetados: BrilhoInstancia[] = [];

      if (selecaoUsuario.isEmpty) {
        // Sem seleção: encontra o brilho que contém o cursor
        afetados = brilhosAtivos.filter(b => 
          b.uri === uriAtual && b.range.contains(posicaoCursor)
        );
      } else {
        // Com seleção: encontra brilhos que intersectam com a seleção
        afetados = brilhosAtivos.filter(b => 
          b.uri === uriAtual && !!b.range.intersection(selecaoUsuario)
        );
      }

      if (afetados.length === 0) {
        vscode.window.setStatusBarMessage("Nenhum efeito RGB para desativar.", 2000);
        return;
      }

      afetados.forEach(brilho => {
        if (selecaoUsuario.isEmpty) {
          // Desativa o brilho inteiro (não cria sobras)
          clearInterval(brilho.interval);
          brilho.decorationType.dispose();
          brilhosAtivos = brilhosAtivos.filter(b => b.id !== brilho.id);
        } else {
          // Desativa apenas a seleção (cria sobras)
          clearInterval(brilho.interval);
          brilho.decorationType.dispose();
          brilhosAtivos = brilhosAtivos.filter(b => b.id !== brilho.id);

          const sobras = subtrairRanges(brilho.range, selecaoUsuario);
          
          sobras.forEach(rangeSobra => {
            if (brilho.tipo === "estatico" && brilho.cor) {
              iniciarBrilhoEstático(editor, rangeSobra, brilho.cor);
            } else {
              iniciarBrilho(editor, rangeSobra);
            }
          });
        }
      });

      vscode.window.setStatusBarMessage(`Desativados ${afetados.length} efeito(s).`, 2000);
    }
  );
  let brilharLinhaDisposable = vscode.commands.registerCommand(
  "extension.brilharLinha",
  () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const uriAtual = editor.document.uri.toString();
    const posicaoCursor = editor.selection.active;
    const linha = editor.document.lineAt(posicaoCursor.line);

    // Remove EXPLICITAMENTE todos os brilhos que intersectam com a linha
    const brilhosNaLinha = brilhosAtivos.filter(b => 
      b.uri === uriAtual && !!b.range.intersection(linha.range)
    );
    
    brilhosNaLinha.forEach(brilho => {
      clearInterval(brilho.interval);
      brilho.decorationType.dispose();
      brilhosAtivos = brilhosAtivos.filter(b => b.id !== brilho.id);
    });

    // 1. Seleciona a linha inteira (do primeiro ao último caractere)
    const novaSelecao = new vscode.Selection(
      linha.range.start,
      linha.range.end
    );
    editor.selection = novaSelecao;

    // 2. Aplica a marcação à linha com a cor do atalho
    if (corAtalho === "rainbow") {
      // Se rainbow, aplica o efeito animado
      iniciarBrilho(editor, linha.range);
    } else {
      // Caso contrário, aplica a cor estática
      iniciarBrilhoEstático(editor, linha.range, corAtalho);
    }

    // 3. Desseleciona o texto para evitar que seja sobrescrito acidentalmente
    editor.selection = new vscode.Selection(linha.range.end, linha.range.end);
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

  // Coletar ranges de sobras que precisam ser recriadas
  const sobrasParaReciar: { range: vscode.Range; uri: string; tipo?: "dinamico" | "estatico"; cor?: string }[] = [];

  // Processa cada mudança de texto
  for (const change of event.contentChanges) {
    const r = change.range;

    // Processa cada brilho
    brilhosAtivos = brilhosAtivos.flatMap((brilho) => {
      if (brilho.uri !== uri) {return [brilho];};

      let novoRange = brilho.range;

      // 1. Ajuste de deslocamento (Edição antes do brilho)
      if (r.end.isBefore(novoRange.start)) {
        // Calcula o número de linhas adicionadas/removidas
        const linhasAdicionadas = (change.text.match(/\n/g) || []).length;
        const linhasRemovidas = r.end.line - r.start.line;
        const deltaLinhas = linhasAdicionadas - linhasRemovidas;
        
        // Calcula delta de caracteres (apenas para mesma linha)
        const delta = change.text.length - change.rangeLength;
        
        // Se a edição foi em linha anterior, ajusta linhas
        if (r.end.line < novoRange.start.line) {
          novoRange = new vscode.Range(
            novoRange.start.translate(deltaLinhas, 0),
            novoRange.end.translate(deltaLinhas, 0)
          );
        } 
        // Se for na mesma linha, ajusta colunas
        else {
          novoRange = new vscode.Range(
            novoRange.start.translate(0, delta),
            novoRange.end.translate(0, delta)
          );
        }
        brilho.range = novoRange;
        return [brilho];
      }

      // 2. Intersecção ou Deletou tudo
      if (novoRange.intersection(r)) {
        // Para o motor do brilho atual, pois ele será "fragmentado" ou removido
        clearInterval(brilho.interval);
        brilho.decorationType.dispose();

        if (r.contains(novoRange)) {
          return []; // Brilho totalmente engolido pela edição
        }

        // Se deletou parcialmente, criamos as sobras
        const sobras = subtrairRanges(novoRange, r);
        sobras.forEach((s) => {
          sobrasParaReciar.push({ range: s, uri: brilho.uri, tipo: brilho.tipo, cor: brilho.cor });
        });

        return []; // Remove o brilho original
      }

      // Se o brilho sobreviveu ou só foi deslocado, atualizamos o range e mantemos
      brilho.range = novoRange;
      return [brilho];
    });
  }



  // Agora inicia os novos brilhos (as sobras) - SEM adicionar à lista antes
  if (editor && sobrasParaReciar.length > 0) {
    sobrasParaReciar.forEach((sobra) => {
      if (sobra.tipo === "estatico" && sobra.cor) {
        iniciarBrilhoEstático(editor, sobra.range, sobra.cor);
      } else {
        iniciarBrilho(editor, sobra.range);
      }
    });
  }

  
  // Reaplica as decorações após as mudanças para garantir que a UI está atualizada
  if (editor) {
    const uri = editor.document.uri.toString();
    brilhosAtivos.forEach((brilho) => {
      if (brilho.uri === uri) {
        editor.setDecorations(brilho.decorationType, [brilho.range]);
      }
    });
  }
});

  // Comando para configurar a cor do atalho
  let configurarCorDisposable = vscode.commands.registerCommand(
    "extension.configurarCorAtalho",
    async () => {
      const opcoes = [
        { label: "🌈 Rainbow (Padrão)", description: "Efeito de cores alternadas", valor: "rainbow" },
        { label: "🟨 Amarelo", description: "#FFFF00", valor: "#FFFF00" },
        { label: "🎨 Cor Personalizada", description: "Escolher outra cor", valor: "personalizado" },
      ];

      const selecionada = await vscode.window.showQuickPick(opcoes, {
        placeHolder: "Escolha a cor para o atalho CTRL+SHIFT+L",
      });

      if (!selecionada) return;

      if (selecionada.valor === "personalizado") {
        // Abrir painel de cor personalizada
        abrirConfigurador(context);
      } else {
        corAtalho = selecionada.valor;
        context.globalState.update('corAtalho', corAtalho);
        vscode.window.showInformationMessage(`Cor do atalho alterada para: ${selecionada.label}`);
      }
    }
  );

  context.subscriptions.push(
    disposable,
    stopDisposable,
    editorChangeListener,
    changeListener,
    brilharLinhaDisposable,
    configurarCorDisposable
  );
}

function abrirConfigurador(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "colorPicker",
    "Configurador de Cor - RGB Highlighter",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Configurador de Cor</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          max-width: 500px;
          width: 100%;
        }

        h1 {
          color: #333;
          margin-bottom: 10px;
          text-align: center;
          font-size: 28px;
        }

        .subtitle {
          color: #666;
          text-align: center;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .color-section {
          margin-bottom: 30px;
        }

        label {
          display: block;
          color: #333;
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .color-input-wrapper {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        input[type="color"] {
          width: 80px;
          height: 80px;
          border: 3px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        input[type="color"]:hover {
          border-color: #667eea;
        }

        .hex-display {
          flex: 1;
          padding: 12px 16px;
          background: #f5f5f5;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #333;
          font-size: 16px;
          transition: all 0.2s;
        }

        .hex-display:focus {
          outline: none;
          border-color: #667eea;
          background: white;
        }

        .preview {
          margin-top: 20px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .preview-label {
          color: #666;
          font-size: 12px;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .preview-text {
          padding: 12px 16px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
          background-color: var(--preview-color);
          color: black;
          text-shadow: 0 0 10px var(--preview-color), 0 0 20px var(--preview-color);
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-cancel {
          background: #f0f0f0;
          color: #333;
        }

        .btn-cancel:hover {
          background: #e0e0e0;
        }

        .presets {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .preset-btn {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }

        .preset-btn:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .preset-btn.active {
          border-color: #667eea;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎨 Escolha uma Cor</h1>
        <p class="subtitle">Configure a cor para o atalho CTRL+SHIFT+L</p>

        <div class="color-section">
          <label for="colorPicker">Cor Personalizada</label>
          <div class="color-input-wrapper">
            <input type="color" id="colorPicker" value="#FFFF00">
            <input type="text" id="hexInput" class="hex-display" value="#FFFF00" placeholder="#FFFFFF">
          </div>
        </div>

        <div class="color-section">
          <label>Cores Pré-definidas</label>
          <div class="presets">
            <button class="preset-btn active" data-color="#FFFF00">🟨 Amarelo</button>
            <button class="preset-btn" data-color="#FF5733">🔴 Vermelho</button>
            <button class="preset-btn" data-color="#33FF57">🟢 Verde</button>
            <button class="preset-btn" data-color="#3357FF">🔵 Azul</button>
            <button class="preset-btn" data-color="#FF33F5">🟣 Magenta</button>
            <button class="preset-btn" data-color="#33FFF5">🟦 Ciano</button>
            <button class="preset-btn" data-color="#FFB833">🟠 Laranja</button>
            <button class="preset-btn" data-color="#FF33B8">🎀 Rosa</button>
          </div>
        </div>

        <div class="preview">
          <p class="preview-label">Prévia</p>
          <div class="preview-text" style="--preview-color: #FFFF00">Exemplo de Destaque</div>
        </div>

        <div class="button-group">
          <button class="btn-save" onclick="salvar()">💾 Salvar</button>
          <button class="btn-cancel" onclick="cancelar()">✕ Cancelar</button>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        const colorPicker = document.getElementById('colorPicker');
        const hexInput = document.getElementById('hexInput');
        const previewText = document.querySelector('.preview-text');
        const presets = document.querySelectorAll('.preset-btn');

        colorPicker.addEventListener('input', (e) => {
          const color = e.target.value;
          hexInput.value = color.toUpperCase();
          atualizarPreview(color);
          atualizarPresets(color);
        });

        hexInput.addEventListener('input', (e) => {
          let color = e.target.value;
          if (!color.startsWith('#')) color = '#' + color;
          if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            colorPicker.value = color;
            atualizarPreview(color);
            atualizarPresets(color);
          }
        });

        presets.forEach(btn => {
          btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            colorPicker.value = color;
            hexInput.value = color;
            atualizarPreview(color);
            atualizarPresets(color);
          });
        });

        function atualizarPreview(color) {
          previewText.style.setProperty('--preview-color', color);
        }

        function atualizarPresets(color) {
          presets.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color.toUpperCase() === color.toUpperCase()) {
              btn.classList.add('active');
            }
          });
        }

        function salvar() {
          const cor = hexInput.value;
          vscode.postMessage({ comando: 'salvar', cor: cor });
        }

        function cancelar() {
          vscode.postMessage({ comando: 'cancelar' });
        }
      </script>
    </body>
    </html>
  `;

  panel.webview.html = htmlContent;

  panel.webview.onDidReceiveMessage((message) => {
    if (message.comando === "salvar") {
      corAtalho = message.cor;
      context.globalState.update('corAtalho', corAtalho);
      vscode.window.showInformationMessage(`Cor do atalho alterada para: ${message.cor}`);
      panel.dispose();
    } else if (message.comando === "cancelar") {
      panel.dispose();
    }
  });
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