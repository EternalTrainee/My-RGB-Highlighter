# My RGB Highlighter

Uma extensão para Visual Studio Code que adiciona um efeito de brilho RGB animado ao texto selecionado.

## 🌈 Recursos

- **Brilho RGB Animado**: Realça o texto selecionado com uma animação de cores RGB fluida
- **Marcador Amarelo Estático**: Marca linhas inteiras em amarelo com efeito neon
- **Commands no Menu de Contexto**: Ative e desative o brilho facilmente pelo menu de contexto do editor
- **Animação Suave**: Transição contínua entre cores HSL para um efeito visual impressionante
- **Text-Shadow Effect**: Cria um efeito de "glow" sutil ao redor do texto
- **Preservação de Tipo**: Mantém o tipo de destaque (animado ou estático) mesmo ao editar o texto dentro da marcação

## 📋 Como Usar

### Comandos e Atalhos
| Ação | Comando (Paleta de Comandos) | Atalho |
| :--- | :--- | :--- |
| **Ativar Brilho** | `RGB: Ativar Brilho RGB!` | - |
| **Brilhar Linha** | `RGB: Brilhar Linha Atual` | `Ctrl+Shift+L` (Win/Lin) / `Cmd+Shift+L` (Mac) |
| **Remover Brilho** | `RGB: Desativar Brilho RGB` | - |

### No Editor
1. **Destaque Manual:** Selecione qualquer bloco de texto > Clique com o botão direito > **"Ativar Brilho RGB!"**.
2. **Destaque de Linha:** Use `Ctrl+Shift+L` (Win/Lin) ou `Cmd+Shift+L` (Mac) para marcar a linha inteira em **amarelo estático com efeito neon**, sem necessidade de seleção prévia.
3. **Destaque Cirúrgico:** Para remover o brilho de apenas uma palavra dentro de uma frase que já brilha, selecione a palavra e use o comando **"Desativar Brilho RGB"**. O restante da frase continuará brilhando!
4. **Edição Segura:** Após aplicar qualquer destaque, o texto é automaticamente desselacionado para evitar sobrescrita acidental ao pressionar uma tecla.

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

### 1.1.0 - 2026-04-04

### 🚀 Novos Recursos

- **Marcador Amarelo Estático:** Adicionada marcação estática em amarelo com efeito neon ao usar `Ctrl+Shift+L` / `Cmd+Shift+L`, imitando marcadores de texto do mundo real.
- **abcd:** abcd.

### 🐛 Correções de Bugs (Fixes)

- **Fim do flickering inicial (#22):** Resolvido o problema de cintilação ao iniciar ou reiniciar brilhos; as decorações agora são aplicadas com cor imediata, eliminando o frame vazio antes da primeira animação.
- **Preservação de tipo de brilho ao editar (#36):** Corrigido bug onde edições dentro de um trecho destacado alternavam o brilho rainbow para amarelo ou vice-versa. Agora o tipo de destaque é mantido ao fragmentar durante edição.
- **Deseleção após aplicar efeito (#36):** Os comandos `extension.brilharRGB` e `extension.brilharLinha` agora desselacionam o texto após aplicar o efeito, prevenindo que o usuário sobrescreva acidentalmente o trecho ao pressionar uma tecla.
- **Funcionamento de stopDisposable ao editar (#36):** Resolvido problema onde `extension.pararBrilho` falhava em encontrar brilhos após edições dentro do trecho destacado, causado por reordenação incorreta de brilhos durante fragmentação.

## 📚 Para mais informações

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- mateus.manufatura@gmail.com

---

**Divirta-se com o brilho RGB!** 🎨✨
