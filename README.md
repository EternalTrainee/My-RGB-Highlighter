# My RGB Highlighter

A Visual Studio Code extension that adds animated RGB highlight effects to selected text.

## 🌈 Features

- **Animated Rainbow Highlight**: Highlights selected text with a smooth flowing RGB color animation
- **Static Color Highlight**: Marks text with a static color and neon glow effect
- **Configurable Colors**: Choose between Rainbow (animated), Yellow, or any custom color for all highlights
- **Unified Color Configuration**: Both manual and line highlighting use the same configured color
- **Smart Toggle Shortcut**: The line highlight shortcut intelligently toggles on/off or reapplies when partially highlighted
- **Context Menu Commands**: Easily enable and disable highlights from the editor's context menu
- **Smooth Animation**: Continuous transition between HSL colors for an impressive visual effect
- **Text-Shadow Effect**: Creates a subtle "glow" effect around the text
- **Highlight Type Preservation**: Maintains the highlight type (animated or static) even when editing text within the marked area
- **Persistent Color Preference**: Saves your custom color choices between VS Code sessions

<p align="center">
  <img src="https://raw.githubusercontent.com/EternalTrainee/My-RGB-Highlighter/refs/heads/main/images/sample.gif" alt="RGB Highlighter Demo"/>
</p>

The animation is displayed only while the command is active. The RGB highlight will continuously change color, creating a vibrant visual effect.

## 📋 How to Use

### Commands and Shortcuts
| Action | Command (Command Palette) | Shortcut |
| :--- | :--- | :--- |
| **Highlight Text** | `RGB: Highlight Text` | - |
| **Highlight Line** | `RGB: Highlight Current Line` | `Ctrl+Shift+L` (Win/Lin) / `Cmd+Shift+L` (Mac) |
| **Remove Highlight** | `RGB: Remove Highlight` | - |
| **Set Color** | `RGB: Configure Shortcut Color` | - |
| **Load Saved Highlights** | `RGB: Load Saved Highlights` | - |

### In the Editor
1. **Manual Highlight:** Select any block of text > Right-click > **"RGB: Highlight Text"**. The highlight will use the color configured via `RGB: Configure Shortcut Color` (Rainbow by default).
2. **Line Highlight with Smart Toggle:** Use `Ctrl+Shift+L` (Win/Lin) or `Cmd+Shift+L` (Mac) to intelligently toggle the highlight on/off:
   - **First press:** Highlights the entire current line with your configured color
   - **Second press (if entirely highlighted):** Removes the highlight
   - **Press while partially highlighted:** Removes all highlights and reapplies to the entire line (useful after text edits that expanded the line)
3. **Configure Color:** Right-click or use command palette to access **"RGB: Configure Shortcut Color"** to choose between Rainbow (animated), Yellow, or any custom color for both manual and line highlights.
4. **Surgical Highlight:** To remove the highlight from just one word within a sentence that's already highlighted, select the word and use the **"RGB: Remove Highlight"** command. The rest of the sentence will continue to glow!
5. **Safe Editing:** After applying any highlight, the text is automatically deselected to prevent accidental overwrite when you press a key.

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

### 1.3.0 - 2026-04-07

### 🚀 New Features

- **Persistent Highlight:** The highlight can now be saved.

## 📚 For More Information

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- mateus.manufatura@gmail.com

---

**Have fun with RGB highlights!** 🎨✨
