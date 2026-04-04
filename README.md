# My RGB Highlighter

A Visual Studio Code extension that adds animated RGB highlight effects to selected text.

## 🌈 Features

- **Animated Rainbow Highlight**: Highlights selected text with a smooth flowing RGB color animation
- **Static Color Highlight**: Marks text with a static color and neon glow effect
- **Configurable Colors**: Choose between Rainbow (animated), Yellow, or any custom color for all highlights
- **Unified Color Configuration**: Both manual and line highlighting use the same configured color
- **Context Menu Commands**: Easily enable and disable highlights from the editor's context menu
- **Smooth Animation**: Continuous transition between HSL colors for an impressive visual effect
- **Text-Shadow Effect**: Creates a subtle "glow" effect around the text
- **Highlight Type Preservation**: Maintains the highlight type (animated or static) even when editing text within the marked area
- **Persistent Color Preference**: Saves your custom color choices between VS Code sessions

## 📋 How to Use

### Commands and Shortcuts
| Action | Command (Command Palette) | Shortcut |
| :--- | :--- | :--- |
| **Highlight Text** | `RGB: Highlight Text` | - |
| **Highlight Line** | `RGB: Highlight Current Line` | `Ctrl+Shift+L` (Win/Lin) / `Cmd+Shift+L` (Mac) |
| **Remove Highlight** | `RGB: Remove Highlight` | - |
| **Configure Color** | `RGB: Configure Shortcut Color` | - |

### In the Editor
1. **Manual Highlight:** Select any block of text > Right-click > **"RGB: Highlight Text"**. The highlight will use the color configured via `RGB: Configure Shortcut Color` (Rainbow by default).
2. **Line Highlight:** Use `Ctrl+Shift+L` (Win/Lin) or `Cmd+Shift+L` (Mac) to highlight the entire current line with your configured color.
3. **Configure Color:** Right-click or use command palette to access **"RGB: Configure Shortcut Color"** to choose between Rainbow (animated), Yellow, or any custom color for both manual and line highlights.
4. **Surgical Highlight:** To remove the highlight from just one word within a sentence that's already highlighted, select the word and use the **"RGB: Remove Highlight"** command. The rest of the sentence will continue to glow!
5. **Safe Editing:** After applying any highlight, the text is automatically deselected to prevent accidental overwrite when you press a key.

<p align="center">
  <img src="https://raw.githubusercontent.com/EternalTrainee/My-RGB-Highlighter/main/images/sample.gif" alt="RGB Highlighter Demo"/>
</p>

The animation is displayed only while the command is active. The RGB highlight will continuously change color, creating a vibrant visual effect.

## 🛠️ Requirements

- Visual Studio Code 1.96.0 or higher

## ⚙️ How to Build

```bash
# Compile TypeScript
npm run compile

# Compile in watch mode
npm run watch

# Run tests
npm run test

# Lint code
npm run lint
```

## 📝 Release Notes

### 1.1.0 - 2026-04-04

### 🚀 New Features

- **Color Configurator:** Added a color picker to customize the shortcut highlight color (CTRL+SHIFT+L). Choose from Rainbow (animated), Yellow, or any custom color.
- **Shortcut Enhancement:** The line highlight shortcut now defaults to Rainbow animated effect, with support for custom static colors.
- **Color Persistence:** Your custom color selection is now saved and restored between VS Code sessions.
- **Full Internationalization:** Complete English translation of the entire project including UI, documentation, and code for global accessibility.

### 🐛 Bug Fixes

- **Initial Flickering Fix (#22):** Resolved the flickering issue when starting or restarting highlights; decorations are now applied with immediate color, eliminating the empty frame before the first animation.
- **Highlight Type Preservation (#36):** Fixed bug where edits within a highlighted snippet would toggle the highlight between rainbow and static color. The highlight type is now maintained when fragmenting during edits.
- **Deselection After Effect (#36):** The `RGB: Highlight Text with Rainbow` and `RGB: Highlight Current Line` commands now deselect the text after applying the effect, preventing accidental overwrite when you press a key.
- **Remove Highlight Fix (#36):** Resolved issue where `RGB: Remove Highlight` failed to find highlights after edits within the highlighted area, caused by incorrect reordering of highlights during fragmentation.
- **Overlay Prevention:** Fixed overlap when applying the line shortcut on text already highlighted with rainbow effect.
- **Line Adjustment:** Fixed issue where highlight would shift when typing in previous lines.

## 📚 For More Information

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- mateus.manufatura@gmail.com

---

**Have fun with RGB highlights!** 🎨✨
