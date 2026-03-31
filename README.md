# My RGB Highlighter

Uma extensão para Visual Studio Code que adiciona um efeito de brilho RGB animado ao texto selecionado.

## 🌈 Recursos

- **Brilho RGB Animado**: Realça o texto selecionado com uma animação de cores RGB fluida
- **Commands no Menu de Contexto**: Ative e desative o brilho facilmente pelo menu de contexto do editor
- **Animação Suave**: Transição contínua entre cores HSL para um efeito visual impressionante
- **Text-Shadow Effect**: Cria um efeito de "glow" sutil ao redor do texto

## 📋 Como Usar

1. Selecione o texto que deseja animar no editor
2. Clique com o botão direito e escolha **"Ativar Brilho RGB!"**
3. Para desativar a animação, clique com o botão direito e escolha **"Desativar Brilho RGB"** ou a use qualquer outra animação
<p align="center">
  <img src="https://raw.githubusercontent.com/EternalTrainee/My-RGB-Highlighter/main/sample.gif" alt="RGB Highlighter Demo"/>
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

### 0.1.1 - 2026-03-31

### 🐛 Correções de Bugs (Fixes)

- **Prevenção de Animações Duplicadas (#16):** Corrigido o bug onde múltiplas instâncias de animação eram criadas para o mesmo trecho de texto ao clicar várias vezes em "Ativar Brilho RGB!".
- **Estabilização de Ciclo:** Agora o sistema valida se a seleção atual já possui um efeito ativo através da comparação de `Range` e `URI`, impedindo o acúmulo de intervalos de cor e preservando a performance do editor.

### ⚙️ Melhorias Técnicas

- **Feedback de Estado:** Adicionado alerta informativo para o usuário quando uma tentativa de ativação ocorre em um trecho já destacado.

## 📚 Para mais informações

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- mateus.manufatura@gmail.com

---

**Divirta-se com o brilho RGB!** 🎨✨
