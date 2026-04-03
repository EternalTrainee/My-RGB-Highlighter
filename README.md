# My RGB Highlighter

Uma extensão para Visual Studio Code que adiciona um efeito de brilho RGB animado ao texto selecionado.

## 🌈 Recursos

- **Brilho RGB Animado**: Realça o texto selecionado com uma animação de cores RGB fluida
- **Commands no Menu de Contexto**: Ative e desative o brilho facilmente pelo menu de contexto do editor
- **Animação Suave**: Transição contínua entre cores HSL para um efeito visual impressionante
- **Text-Shadow Effect**: Cria um efeito de "glow" sutil ao redor do texto

## 📋 Como Usar

### Comandos e Atalhos
| Ação | Comando (Paleta de Comandos) | Atalho |
| :--- | :--- | :--- |
| **Ativar Brilho** | `RGB: Ativar Brilho RGB!` | - |
| **Brilhar Linha** | `RGB: Brilhar Linha Atual` | `Ctrl+Shift+L` (Win/Lin) / `Cmd+Shift+L` (Mac) |
| **Remover Brilho** | `RGB: Desativar Brilho RGB` | - |

### No Editor
1. **Destaque Manual:** Selecione qualquer bloco de texto > Clique com o botão direito > **"Ativar Brilho RGB!"**.
2. **Destaque Cirúrgico:** Para remover o brilho de apenas uma palavra dentro de uma frase que já brilha, selecione a palavra e use o comando **"Desativar Brilho RGB"**. O restante da frase continuará brilhando!

<p align="center">
  <img src="https://raw.githubusercontent.com/EternalTrainee/My-RGB-Highlighter/main/images/sample.gif" alt="RGB Highlighter Demo"/>
</p>
A animação será exibida apenas enquanto o comando estiver ativo. O brilho RGB mudará continuamente de cor, criando um efeito visual vibrante.

## 🛠️ Requisitos

- Visual Studio Code 1.96.0 ou superior

## ⚙️ Como Compilar

```bash
# Compilar TypeScript
npm run compile

# Compilar em modo watch
npm run watch

# Executar testes
npm run test

# Lint do código
npm run lint
```

## 📝 Release Notes

### 1.1.0 - 2026-04-03

### 🚀 Novos Recursos

-- **abcd:** abcd.

### 🐛 Correções de Bugs (Fixes)

- **Fim do flickering inicial (#22):** Resolvido o problema de cintilação ao iniciar ou reiniciar brilhos; as decorações agora são aplicadas com cor imediata, eliminando o frame vazio antes da primeira animação.

## 📚 Para mais informações

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- mateus.manufatura@gmail.com

---

**Divirta-se com o brilho RGB!** 🎨✨
