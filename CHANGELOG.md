# Changelog

## [1.3.1] - 2026-04-16

### 🐛 Bug Fixes

- **Load Saved Highlights Before New Mutations:** Persisted highlights are now loaded into memory before creating, removing, updating, or saving highlights for the active file. This prevents previously saved highlights from being overwritten when a new highlight is added before a manual load.
- **Automatic Restore On Activation:** Saved highlights for the already-open editor are now restored during extension activation, reducing the chance of persistence state drifting before the first command runs.

## [1.3.0] - 2026-04-07

### ✨ New Features

- **Persistent Highlight:** The highlight can now be saved.

## [1.2.2] - 2026-04-06

### 🐛 Bug Fixes

- **Highlight Removal After Partial Removal (#42):** Fixed critical bug where attempting to remove the highlight effect from a second fragment would fail after earlier partial removal and text editing. The system would fail to locate the target highlight even though it existed.
- **Range Offset Calculation at Boundaries (#42):** Fixed incorrect range offset calculation that failed to adjust highlight positions when text edits occurred exactly at the boundary where two highlight fragments met. This caused the second fragment to lose synchronization.
- **Intelligent Cursor Detection Strategy (#42):** Redesigned cursor position detection with a robust three-tier fallback strategy:
  - **Tier 1:** Exact match (cursor inside or at boundary of highlight)
  - **Tier 2:** Smart preference (highlights starting after cursor preferred over those ending before)
  - **Tier 3:** Minimum distance calculation for edge cases
  - This ensures correct highlight selection even when the cursor is positioned in the gap between multiple fragments.
- **Highlight Selection Accuracy with Multiple Fragments (#42):** Resolved ambiguity that could cause the wrong fragment to be selected for removal when multiple highlight fragments existed on the same line, especially after sequential edit operations.

### ⚙️ Technical Improvements

- **Enhanced Text Change Listener:** Improved the change event handler to correctly process multi-range scenarios with proper offset calculations for all edge cases.
- **Range Validation:** Added validation to ensure highlight ranges remain within document bounds after all text modifications.

---

## [1.2.0] - 2026-04-06

### ✨ New Features

- **Smart Toggle Shortcut:** The `Ctrl+Shift+L` / `Cmd+Shift+L` shortcut now features intelligent toggle behavior:
  - **Line completely highlighted** → Press to deactivate and remove the highlight
  - **Line partially highlighted** → Press to remove partial highlights and reapply to the entire line (useful after editing text)
  - **Line not highlighted** → Press to apply the configured highlight color to the entire line
- **Seamless Workflow:** No need for separate commands to toggle on/off; one shortcut handles all scenarios intelligently.

---

## [1.1.0] - 2026-04-04

### ✨ New Features

- **Color Configurator:** Added a color picker to customize the shortcut highlight color (CTRL+SHIFT+L). Choose from Rainbow (animated), Yellow, or any custom color.
- **Shortcut Enhancement:** The line highlight shortcut now defaults to Rainbow animated effect, with support for custom static colors.
- **Color Persistence:** Your custom color selection is now saved and restored between VS Code sessions.
- **Full Internationalization:** Complete English translation of the entire project including UI, code, and documentation for global accessibility.

### 🐛 Bug Fixes

- **Initial Flickering Fix (#22):** Resolved the flickering issue when starting or restarting highlights; decorations are now applied with immediate color, eliminating the empty frame before the first animation.
- **Highlight Type Preservation (#36):** Fixed bug where edits within a highlighted snippet would toggle the highlight between rainbow and static color. The highlight type is now maintained when fragmenting during edits.
- **Deselection After Effect (#36):** The `RGB: Highlight Text with Rainbow` and `RGB: Highlight Current Line` commands now deselect the text after applying the effect, preventing accidental overwrite when you press a key.
- **Remove Highlight Fix (#36):** Resolved issue where `RGB: Remove Highlight` failed to find highlights after edits within the highlighted area, caused by incorrect reordering of highlights during fragmentation.
- **Overlay Prevention:** Fixed overlap when applying the line shortcut on text already highlighted with rainbow effect.
- **Line Adjustment:** Fixed issue where highlight would shift when typing in previous lines.

---

## [1.0.0] - 2026-04-02

### ✨ New Features

- **Line Highlight Command:** Added new action `extension.highlightLine` (shortcut `Ctrl+Shift+L` / `Cmd+Shift+L`) to apply RGB effect on the current line.
- **Dynamic Range Update:** The effect now follows text edits and maintains updated ranges automatically when typing/deleting inside/outside the highlight.

### 🐛 Bug Fixes

- **Deactivate Only Active Selection (#28):** `RGB: Remove Highlight` now removes only the ranges intersected by the current selection, preserving other active highlights in the same file.
- **Prevent Animation Duplication (#21):** Fixed issue with multiple animations on the same range when reactivating the command repeatedly.

### ⚙️ Technical Improvements

- **Effect Management Refactor:** Isolated `HighlightInstance` and `startHighlight` logic, reducing memory leaks and improving predictability under dynamic editing.
- **Automatic Reapplication:** When switching tabs/editors, the highlight state is reapplied in the activated editor.

---

## [0.1.1] - 2026-03-31

### 🐛 Bug Fixes

- **Multiple Instances Lockout (#16):** Fixed bug where repeatedly clicking "RGB: Highlight Text with Rainbow" on the same text snippet created multiple overlapping animations, causing an accelerated "flickering" effect.
- **Range Validation:** Implemented `isEqual` check to ensure each specific `Range` in a file (`URI`) has only one active animation interval at a time.

### ⚙️ Technical Improvements

- **UI Feedback:** Added informative notification (`showInformationMessage`) to alert the user when trying to activate the highlight on a snippet that's already animated.
- **Cycle Stabilization:** Adjusted the logical flow to prevent the creation of new `setInterval` if the existence validation returns positive.

---

## [0.1.0] - 2026-03-30

### ✨ New Features

- **Multiple Highlight Support:** Now possible to apply the RGB effect to various text snippets simultaneously without one removing the other.

### 🐛 Bug Fixes

- **Highlight Persistence (#5):** Fixed issue where the highlight would disappear when switching tabs or navigating between files. The effect is now automatically reapplied when returning to the editor.
- **Selection Overlap (#1):** Resolved the technical limitation that prevented maintaining more than one active highlight at a time.

### ⚙️ Technical Improvements

- **Memory Management:** Implemented automatic disposal of obsolete `TextEditorDecorationType` to prevent memory leaks during animations.
- **State Refactoring:** Migration from simple global variables to a URI-indexed list structure, ensuring greater stability in tracking active intervals.

---
