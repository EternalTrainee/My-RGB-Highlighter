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

### 0.1.0 - 2026-03-30

### ✨ Novas Funcionalidades
- **Suporte a Múltiplos Destaques:** Agora é possível aplicar o efeito RGB em diversos trechos de texto simultaneamente sem que um remova o outro.

### 🐛 Correções de Bugs (Fixes)
- **Persistência de Destaque (#5):** Corrigido o problema onde o brilho desaparecia ao trocar de aba ou navegar entre arquivos. O efeito agora é reaplicado automaticamente ao retornar ao editor.
* **Sobreposição de Seleção (#1):** Resolvida a limitação técnica que impedia a manutenção de mais de um destaque ativo por vez.

### ⚙️ Melhorias Técnicas
- **Gerenciamento de Memória:** Implementação do descarte automático de `TextEditorDecorationType` obsoletos para prevenir vazamentos de memória durante as animações.
- **Refatoração de Estado:** Migração de variáveis globais simples para uma estrutura de lista indexada por URI, garantindo maior estabilidade no rastreamento dos intervalos ativos.

## 📚 Para mais informações

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- mateus.manufatura@gmail.com

---

**Divirta-se com o brilho RGB!** 🎨✨
