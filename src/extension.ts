import * as vscode from "vscode";

// Interface to manage each highlight instance individually
interface HighlightInstance {
  id: string;
  interval: NodeJS.Timeout;
  decorationType: vscode.TextEditorDecorationType;
  range: vscode.Range;
  uri: string;
  type?: "dynamic" | "static"; // Highlight type
  color?: string; // Static color (if type === "static")
}

// Serializable form of a highlight (no decorationType/interval)
interface PersistedHighlight {
  type: "dynamic" | "static";
  color?: string;
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
}

// Global list to store all active highlights
let activeHighlights: HighlightInstance[] = [];

// Yellow color for static highlighting
const YELLOW_COLOR = "#FFFF00";

// Shortcut highlight color (rainbow is the default)
let shortcutColor = "rainbow";

// Whether to persist highlights across sessions (default: true)
let persistHighlights = true;

// globalState key prefix for persisted highlights
const PERSIST_KEY_PREFIX = "rgbHighlighter.highlights.";

export function activate(context: vscode.ExtensionContext) {
  // Load the saved shortcut color, or use 'rainbow' as default
  shortcutColor = context.globalState.get('shortcutColor') || 'rainbow';
  
  // Command to activate RGB highlight
  persistHighlights = context.globalState.get<boolean>("persistHighlights") ?? true;

  // ── Persistence helpers ──────────────────────────────────────────────────

  function saveHighlightsForUri(uri: string) {
    if (!persistHighlights) return;

    const toSave: PersistedHighlight[] = activeHighlights
      .filter((h) => h.uri === uri)
      .map((h) => ({
        type: h.type ?? "dynamic",
        color: h.color,
        startLine: h.range.start.line,
        startChar: h.range.start.character,
        endLine: h.range.end.line,
        endChar: h.range.end.character,
      }));

    context.globalState.update(PERSIST_KEY_PREFIX + uri, toSave.length > 0 ? toSave : undefined);
  }

  function loadHighlightsForUri(editor: vscode.TextEditor) {
    if (!persistHighlights) return;

    const uri = editor.document.uri.toString();
    const saved = context.globalState.get<PersistedHighlight[]>(PERSIST_KEY_PREFIX + uri);
    if (!saved || saved.length === 0) return;

    // Remove any already-active highlights for this URI to avoid duplicates
    const existing = activeHighlights.filter((h) => h.uri === uri);
    existing.forEach((h) => {
      clearInterval(h.interval);
      h.decorationType.dispose();
    });
    activeHighlights = activeHighlights.filter((h) => h.uri !== uri);

    const lineCount = editor.document.lineCount;

    saved.forEach((p) => {
      // Validate that the range still fits inside the (possibly edited) document
      if (p.startLine >= lineCount || p.endLine >= lineCount) return;
      try {
        const startLineLen = editor.document.lineAt(p.startLine).text.length;
        const endLineLen = editor.document.lineAt(p.endLine).text.length;
        if (p.startChar > startLineLen || p.endChar > endLineLen) return;
      } catch {
        return;
      }

      const range = new vscode.Range(p.startLine, p.startChar, p.endLine, p.endChar);
      if (p.type === "static" && p.color) {
        startStaticHighlight(editor, range, p.color);
      } else {
        startHighlight(editor, range);
      }
    });
  }

  // ── Command: highlight selected text (RGB / color) ────────────────────

  let disposable = vscode.commands.registerCommand(
    "extension.brilharRGB", 
    () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("Please open a file first!");
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showInformationMessage(
        "Select text to highlight!",
      );
      return;
    }

    vscode.commands.executeCommand("extension.pararBrilho");

    const currentRange = new vscode.Range(selection.start, selection.end);

    // Apply highlight using the configured shortcut color
    if (shortcutColor === "rainbow") {
      // If rainbow, apply animated effect
      startHighlight(editor, currentRange);
    } else {
      // Otherwise apply static color
      startStaticHighlight(editor, currentRange, shortcutColor);
    }

    // Deselect text to prevent accidental overwrite
    editor.selection = new vscode.Selection(currentRange.end, currentRange.end);
  }
);

  // ── Core highlight creators ───────────────────────────────────────────

  function startHighlight(editor: vscode.TextEditor, range: vscode.Range) {
    const currentUri = editor.document.uri.toString();
    let hue = 0;

    const createDecoration = (h: number) => {
      const color = `hsl(${h}, 100%, 50%)`;
      return vscode.window.createTextEditorDecorationType({
        color: color,
        fontWeight: "bold",
        textDecoration: `none; text-shadow: 0 0 10px ${color}, 0 0 20px ${color};`,
        outline: `1px solid ${color}`,
        rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
        overviewRulerColor: color,
        overviewRulerLane: vscode.OverviewRulerLane.Full,
        backgroundColor: color + '33', // Adiciona o fundo suave para aparecer no Minimap

        dark: { 
          overviewRulerColor: color 
        },
        light: { 
          overviewRulerColor: color 
        }
      });
    };

    // 1. Already starts with a colored decoration (avoids initial void)
    let currentDecoration = createDecoration(hue);
    
    // 2. Apply IMMEDIATELY (avoids waiting 80ms)
    editor.setDecorations(currentDecoration, [range]);

    const interval = setInterval(() => {
      hue = (hue + 10) % 360;
      const newDecoration = createDecoration(hue);

      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.uri.toString() === currentUri) {
        activeEditor.setDecorations(newDecoration, [range]);
      }

      currentDecoration.dispose();
      const instance = activeHighlights.find((h) => h.interval === interval);
      if (instance) {instance.decorationType = newDecoration;};
      currentDecoration = newDecoration;
    }, 80);

    activeHighlights.push({
      id: Math.random().toString(36).slice(2, 11),
      interval,
      decorationType: currentDecoration,
      range,
      uri: currentUri,
      type: "dynamic",
    });

    saveHighlightsForUri(currentUri);
  }

  function startStaticHighlight(editor: vscode.TextEditor, range: vscode.Range, color: string) {
    const currentUri = editor.document.uri.toString();

    const decoration = vscode.window.createTextEditorDecorationType({
      color: color,
      fontWeight: "bold",
      textDecoration: `none; text-shadow: 0 0 10px ${color}, 0 0 20px ${color};`,
      outline: `1px solid ${color}`,
      rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
      overviewRulerColor: color,
      overviewRulerLane: vscode.OverviewRulerLane.Full,
      backgroundColor: color + '33', // Adiciona o fundo suave para aparecer no Minimap
      dark: { 
        overviewRulerColor: color 
      },
      light: { 
        overviewRulerColor: color 
      }
    });

    editor.setDecorations(decoration, [range]);

    // Dummy interval with empty clearInterval to maintain compatibility
    const interval = setInterval(() => {}, 999999999);

    activeHighlights.push({
      id: Math.random().toString(36).slice(2, 11),
      interval,
      decorationType: decoration,
      range,
      uri: currentUri,
      type: "static",
      color,
    });

    saveHighlightsForUri(currentUri);
  }

  // ── Helper: subtract overlapping ranges ──────────────────────────────

  function subtractRanges(base: vscode.Range, occupied: vscode.Range): vscode.Range[] {
    const intersection = base.intersection(occupied);
    if (!intersection || intersection.isEmpty) {return [base];};

    const results: vscode.Range[] = [];

    if (base.start.isBefore(intersection.start)) {
      results.push(new vscode.Range(base.start, intersection.start));
    }

    if (base.end.isAfter(intersection.end)) {
      results.push(new vscode.Range(intersection.end, base.end));
    }

    return results.filter(r => !r.isEmpty);
  }
  // Command to stop ALL highlights
  let stopDisposable = vscode.commands.registerCommand(
    "extension.pararBrilho",
     () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;};

    const userSelection = editor.selection;
    const currentUri = editor.document.uri.toString();
    const cursorPosition = editor.selection.active;

    // Validate all highlights still have valid ranges
    activeHighlights = activeHighlights.filter(h => {
      if (h.uri !== currentUri) return true;
      try {
        const lineCount = editor.document.lineCount;
        const startLineValid = h.range.start.line < lineCount;
        const endLineValid = h.range.end.line < lineCount;

        if (!startLineValid || !endLineValid) {
          return false;
        }

        const startCharValid = h.range.start.character <= editor.document.lineAt(h.range.start.line).text.length;
        const endCharValid = h.range.end.character <= editor.document.lineAt(h.range.end.line).text.length;

        if (!startCharValid || !endCharValid) {
          return false;
        }

        return true;
      } catch(e) {
        return false;
      }
    });

    let affected: HighlightInstance[] = [];

    if (userSelection.isEmpty) {
      // No selection: find the highlight containing the cursor
      // First pass: exact match (cursor inside or at boundary)
      const exactMatches = activeHighlights.filter(h => {
        if (h.uri !== currentUri) return false;

        const inRange = h.range.contains(cursorPosition);
        const atStart = h.range.start.isEqual(cursorPosition);
        const atEnd = h.range.end.isEqual(cursorPosition);
        const singleChar = h.range.start.line === cursorPosition.line &&
                           h.range.start.line === h.range.end.line &&
                           h.range.start.character <= cursorPosition.character &&
                           h.range.end.character >= cursorPosition.character;

        return inRange || atStart || atEnd || singleChar;
      });

      affected = exactMatches;

      // If no exact match, find the closest highlight on the same line
      if (affected.length === 0) {
        // Strategy: prefer highlight that starts after cursor, if none then highlight that ends before cursor
        const highlightsAfterCursor = activeHighlights.filter(h =>
            h.uri === currentUri &&
            h.range.start.line === cursorPosition.line &&
            h.range.start.character >= cursorPosition.character
        );

        const highlightsBeforeCursor = activeHighlights.filter(h =>
            h.uri === currentUri &&
            h.range.start.line === cursorPosition.line &&
            h.range.end.character <= cursorPosition.character
        );

        let closest: HighlightInstance | null = null;

        if (highlightsAfterCursor.length > 0) {
          // Prefer the one that starts earliest after cursor
          closest = highlightsAfterCursor.reduce((prev, curr) =>
            curr.range.start.character < prev.range.start.character ? curr : prev
          );
        } else if (highlightsBeforeCursor.length > 0) {
          // Prefer the one that ends latest before cursor
          closest = highlightsBeforeCursor.reduce((prev, curr) =>
            curr.range.end.character > prev.range.end.character ? curr : prev
          );
        } else {
          // Last resort: find any highlight on same line with minimum distance
          let minDistance = Infinity;
          activeHighlights.forEach(h => {
            if (h.uri !== currentUri || h.range.start.line !== cursorPosition.line) return;

            const distanceToStart = Math.abs(h.range.start.character - cursorPosition.character);
            const distanceToEnd = Math.abs(h.range.end.character - cursorPosition.character);
            const distance = Math.min(distanceToStart, distanceToEnd);

            if (distance < minDistance) {
              minDistance = distance;
              closest = h;
            }
          });
        }

        if (closest !== null) {
          affected = [closest];
        }
      }
    } else {
      // With selection: find highlights that intersect with selection
      affected = activeHighlights.filter((h) => {
        if (h.uri !== currentUri) return false;

        const hasIntersection = !!h.range.intersection(userSelection);
        const containsStart = h.range.contains(userSelection.start);
        const containsEnd = h.range.contains(userSelection.end);

        return hasIntersection || containsStart || containsEnd;
      });
    }

    if (affected.length === 0) {
      vscode.window.setStatusBarMessage("No RGB effect to deactivate. Active: " + activeHighlights.length, 2000);
      return;
    }

    affected.forEach(highlight => {
      if (userSelection.isEmpty) {
        // Deactivate entire highlight (no leftovers)
        clearInterval(highlight.interval);
        highlight.decorationType.dispose();
        activeHighlights = activeHighlights.filter(h => h.id !== highlight.id);
      } else {
        // Deactivate only selection (creates leftovers)
        clearInterval(highlight.interval);
        highlight.decorationType.dispose();
        activeHighlights = activeHighlights.filter(h => h.id !== highlight.id);

        const leftovers = subtractRanges(highlight.range, userSelection);

        leftovers.forEach(leftoverRange => {
          if (highlight.type === "static" && highlight.color) {
            startStaticHighlight(editor, leftoverRange, highlight.color);
          } else {
            startHighlight(editor, leftoverRange);
          }
        });
      }
    });

    saveHighlightsForUri(currentUri);
    vscode.window.setStatusBarMessage(`Deactivated ${affected.length} effect(s).`, 2000);
  }
);
  // Helper function to check if a line is completely highlighted
  function isLineCompletelyHighlighted(lineRange: vscode.Range, highlightsOnLine: HighlightInstance[]): boolean {
    if (highlightsOnLine.length === 0) return false;

    // Sort highlights by start position
    const sortedHighlights = [...highlightsOnLine].sort((a, b) =>
      a.range.start.compareTo(b.range.start)
    );

    // Check if the first highlight starts at line start
    if (!sortedHighlights[0].range.start.isEqual(lineRange.start)) {
      return false;
    }

    // Check if the last highlight ends at line end
    if (!sortedHighlights[sortedHighlights.length - 1].range.end.isEqual(lineRange.end)) {
      return false;
    }

    // Check if highlights cover the entire line without gaps
    for (let i = 0; i < sortedHighlights.length - 1; i++) {
      if (!sortedHighlights[i].range.end.isEqual(sortedHighlights[i + 1].range.start)) {
        return false; // Gap found
      }
    }

    return true;
  }

  let highlightLineDisposable = vscode.commands.registerCommand(
    "extension.brilharLinha", 
    () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const currentUri = editor.document.uri.toString();
    const cursorPosition = editor.selection.active;
    const line = editor.document.lineAt(cursorPosition.line);

    // Find all highlights that intersect with the line
    const highlightsOnLine = activeHighlights.filter(h => 
      h.uri === currentUri && !!h.range.intersection(line.range)
    );

    // Check if the line is completely highlighted
    const isCompletelyHighlighted = isLineCompletelyHighlighted(line.range, highlightsOnLine);

    if (isCompletelyHighlighted) {
      // Toggle OFF: Remove all highlights from the line
      highlightsOnLine.forEach(highlight => {
        clearInterval(highlight.interval);
        highlight.decorationType.dispose();
        activeHighlights = activeHighlights.filter(h => h.id !== highlight.id);
      });
      vscode.window.setStatusBarMessage("Highlight removed.", 2000);
    } else {
      // Toggle ON: Remove partial highlights and reapply to entire line
      highlightsOnLine.forEach(highlight => {
        clearInterval(highlight.interval);
        highlight.decorationType.dispose();
        activeHighlights = activeHighlights.filter(h => h.id !== highlight.id);
      });

      // Apply highlighting to the entire line with shortcut color
      if (shortcutColor === "rainbow") {
        // If rainbow, apply animated effect
        startHighlight(editor, line.range);
      } else {
        // Otherwise apply static color
        startStaticHighlight(editor, line.range, shortcutColor);
      }

      vscode.window.setStatusBarMessage("Line highlighted.", 2000);
    }

    // Deselect text to prevent accidental overwrite
    editor.selection = new vscode.Selection(line.range.end, line.range.end);
    // saveHighlightsForUri is already called inside startHighlight / startStaticHighlight,
    // and for the removal case we save explicitly below:
    if (isCompletelyHighlighted) {
      saveHighlightsForUri(currentUri);
    }
  });

  // ── Reapply decorations when switching tabs ───────────────────────────

  const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor) {
      return;
    }

    const uri = editor.document.uri.toString();

    // Reapply already-active in-memory decorations first
    activeHighlights.forEach((highlight) => {
      if (highlight.uri === uri) {
        editor.setDecorations(highlight.decorationType, [highlight.range]);
      }
    });

    // Then load persisted highlights that aren't in memory yet
    const alreadyLoaded = activeHighlights.some((h) => h.uri === uri);
    if (!alreadyLoaded) {
      loadHighlightsForUri(editor);
    }
  });

  // ── Track document edits → adjust/invalidate ranges ──────────────────

  const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    const uri = event.document.uri.toString();
    const editor = vscode.window.activeTextEditor;

    // Collect ranges of leftovers that need to be recreated
    const leftoversToRecreate: { range: vscode.Range; uri: string; type?: "dynamic" | "static"; color?: string }[] = [];

    // Process each text change
    for (const change of event.contentChanges) {
      const r = change.range;
      const delta = change.text.length - change.rangeLength;
      const linesAdded = (change.text.match(/\n/g) || []).length;
      const linesRemoved = r.end.line - r.start.line;
      const deltaLines = linesAdded - linesRemoved;

      // Process each highlight
      activeHighlights = activeHighlights.flatMap((highlight) => {
        if (highlight.uri !== uri) { return [highlight]; }

        let newRange = highlight.range;

        // 1. Edit is completely before this highlight - only adjust if on same line or later line
        if (r.end.isBefore(newRange.start)) {
          // If edit was on a different line entirely, adjust line numbers
          if (r.end.line < newRange.start.line) {
            newRange = new vscode.Range(
              newRange.start.translate(deltaLines, 0),
              newRange.end.translate(deltaLines, 0)
            );
          }
          // If edit was on same line as highlight start, adjust character position 
          else if (r.end.line === newRange.start.line) {
            newRange = new vscode.Range(
              newRange.start.translate(0, delta),
              newRange.end.translate(0, delta)
            );
          }

          highlight.range = newRange;
          return [highlight];
        }

        // 1.5 Edit ends exactly at the start of this highlight
        if (r.end.line === newRange.start.line && r.end.character === newRange.start.character) {
          newRange = new vscode.Range(
            newRange.start.translate(0, delta),
            newRange.end.translate(0, delta)
          );
          highlight.range = newRange;
          return [highlight];
        }

        // 2. Edit intersects with/contains this highlight
        if (newRange.intersection(r)) {
          clearInterval(highlight.interval);
          highlight.decorationType.dispose();

          // Highlight completely swallowed by edit
          if (r.contains(newRange)) {
            return [];
          }

          // Partially deleted - create leftovers
          const leftovers = subtractRanges(newRange, r);
          leftovers.forEach((l) => {
            leftoversToRecreate.push({
              range: l,
              uri: highlight.uri,
              type: highlight.type,
              color: highlight.color
            });
          });

          return []; // Remove original highlight
        }

        // 3. Edit is after this highlight - no adjustment needed
        return [highlight];
      });
    }

    // Now start new highlights (leftovers)
    if (editor && leftoversToRecreate.length > 0) {
      leftoversToRecreate.forEach((leftover) => {
        if (leftover.type === "static" && leftover.color) {
          startStaticHighlight(editor, leftover.range, leftover.color);
        } else {
          startHighlight(editor, leftover.range);
        }
      });
    }

    // Reapply decorations after changes to ensure UI is updated
    if (editor) {
      const editorUri = editor.document.uri.toString();
      activeHighlights.forEach((highlight) => {
        if (highlight.uri === editorUri) {
          editor.setDecorations(highlight.decorationType, [highlight.range]);
        }
      });
    }

    // Persist updated ranges after any edit (debounce via the interval above is fine;
    // we just make sure the state on disk stays in sync)
    if (uri) {
      saveHighlightsForUri(uri);
    }
  });

  // Comando para configurar a cor do atalho
  let configurarCorDisposable = vscode.commands.registerCommand(
    "extension.configurarCorAtalho",
    async () => {
      const options = [
        { label: "🌈 Rainbow (Default)", description: "Animated color effect", value: "rainbow" },
        { label: "🟨 Yellow", description: "#FFFF00", value: "#FFFF00" },
        { label: "🎨 Custom Color", description: "Pick any color", value: "personalizado" },
      ];

      const selected = await vscode.window.showQuickPick(options, {
        placeHolder: "Choose color for CTRL+SHIFT+L shortcut",
      });

      if (!selected) return;

      if (selected.value === "personalizado") {
        // Open custom color panel
        openColorConfigurator(context);
      } else {
        shortcutColor = selected.value;
        context.globalState.update('shortcutColor', shortcutColor);
        vscode.window.showInformationMessage(`Shortcut color changed to: ${selected.label}`);
      }
    }
  );

  // ── Command: toggle highlight persistence ────────────────────────────

  /*let togglePersistDisposable = vscode.commands.registerCommand(
    "extension.togglePersistHighlights",
    async () => {
      const options = [
        {
          label: `✅ Yes – save highlights between sessions`,
          description: "Current: " + (persistHighlights ? "ON" : "off"),
          value: true,
        },
        {
          label: `❌ No – highlights are lost when the file is closed`,
          description: "Current: " + (!persistHighlights ? "ON" : "off"),
          value: false,
        },
      ];

      const selected = await vscode.window.showQuickPick(options, {
        placeHolder: "Persist highlights across sessions?",
      });

      if (selected === undefined) return;

      persistHighlights = selected.value;
      context.globalState.update("persistHighlights", persistHighlights);

      if (persistHighlights) {
        vscode.window.showInformationMessage(
          "RGB Highlighter: highlights will now be saved between sessions."
        );
      } else {
        vscode.window.showInformationMessage(
          "RGB Highlighter: highlights will NOT be saved between sessions."
        );
      }
    }
  );*/

  // ── Command: manually load highlights for the active file ─────────────

  let carregarHighlightsDisposable = vscode.commands.registerCommand(
    "extension.carregarHighlights",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("Please open a file first!");
        return;
      }
      loadHighlightsForUri(editor);
      vscode.window.setStatusBarMessage("Highlights loaded.", 2000);
    }
  );

  // ── Load highlights for the file that is already open on activation ──

  // if (vscode.window.activeTextEditor) {
  //   loadHighlightsForUri(vscode.window.activeTextEditor);
  // }

  context.subscriptions.push(
    disposable,
    stopDisposable,
    editorChangeListener,
    changeListener,
    highlightLineDisposable,
    configurarCorDisposable,
    //togglePersistDisposable,
    carregarHighlightsDisposable
  );
}

// ── Color configurator webview ──────────────────────────────────────────

function openColorConfigurator(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "colorPicker",
    "Color Configurator - RGB Highlighter",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Color Configurator</title>
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
        <h1>🎨 Choose a Color</h1>
        <p class="subtitle">Configure color for CTRL+SHIFT+L shortcut</p>

        <div class="color-section">
          <label for="colorPicker">Custom Color</label>
          <div class="color-input-wrapper">
            <input type="color" id="colorPicker" value="#FFFF00">
            <input type="text" id="hexInput" class="hex-display" value="#FFFF00" placeholder="#FFFFFF">
          </div>
        </div>

        <div class="color-section">
          <label>Preset Colors</label>
          <div class="presets">
            <button class="preset-btn active" data-color="#FFFF00">🟨 Yellow</button>
            <button class="preset-btn" data-color="#FF5733">🔴 Red</button>
            <button class="preset-btn" data-color="#33FF57">🟢 Green</button>
            <button class="preset-btn" data-color="#3357FF">🔵 Blue</button>
            <button class="preset-btn" data-color="#FF33F5">🟣 Magenta</button>
            <button class="preset-btn" data-color="#33FFF5">🟦 Cyan</button>
            <button class="preset-btn" data-color="#FFB833">🟠 Orange</button>
            <button class="preset-btn" data-color="#FF33B8">🎀 Pink</button>
          </div>
        </div>

        <div class="preview">
          <p class="preview-label">Preview</p>
          <div class="preview-text" style="--preview-color: #FFFF00">Example Highlight</div>
        </div>

        <div class="button-group">
          <button class="btn-save" onclick="save()">💾 Save</button>
          <button class="btn-cancel" onclick="cancel()">✕ Cancel</button>
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
          updatePreview(color);
          updatePresets(color);
        });

        hexInput.addEventListener('input', (e) => {
          let color = e.target.value;
          if (!color.startsWith('#')) color = '#' + color;
          if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            colorPicker.value = color;
            updatePreview(color);
            updatePresets(color);
          }
        });

        presets.forEach(btn => {
          btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            colorPicker.value = color;
            hexInput.value = color;
            updatePreview(color);
            updatePresets(color);
          });
        });

        function updatePreview(color) {
          previewText.style.setProperty('--preview-color', color);
        }

        function updatePresets(color) {
          presets.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color.toUpperCase() === color.toUpperCase()) {
              btn.classList.add('active');
            }
          });
        }

        function save() {
          const color = hexInput.value;
          vscode.postMessage({ command: 'save', color: color });
        }

        function cancel() {
          vscode.postMessage({ command: 'cancel' });
        }
      </script>
    </body>
    </html>
  `;

  panel.webview.html = htmlContent;

  panel.webview.onDidReceiveMessage((message) => {
    if (message.command === "save") {
      shortcutColor = message.color;
      context.globalState.update('shortcutColor', shortcutColor);
      vscode.window.showInformationMessage(`Shortcut color changed to: ${message.color}`);
      panel.dispose();
    } else if (message.command === "cancel") {
      panel.dispose();
    }
  });
}

function clearAllHighlights() {
  activeHighlights.forEach((highlight) => {
    clearInterval(highlight.interval);
    highlight.decorationType.dispose();
  });
  activeHighlights = [];
}

export function deactivate() {
  clearAllHighlights();
}