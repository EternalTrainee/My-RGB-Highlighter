# Changelog

## [0.1.0] - 2026-03-30

### ✨ Novas Funcionalidades
- **Suporte a Múltiplos Destaques:** Agora é possível aplicar o efeito RGB em diversos trechos de texto simultaneamente sem que um remova o outro.

### 🐛 Correções de Bugs (Fixes)
- **Persistência de Destaque (#5):** Corrigido o problema onde o brilho desaparecia ao trocar de aba ou navegar entre arquivos. O efeito agora é reaplicado automaticamente ao retornar ao editor.
* **Sobreposição de Seleção (#1):** Resolvida a limitação técnica que impedia a manutenção de mais de um destaque ativo por vez.

### ⚙️ Melhorias Técnicas
- **Gerenciamento de Memória:** Implementação do descarte automático de `TextEditorDecorationType` obsoletos para prevenir vazamentos de memória durante as animações.
- **Refatoração de Estado:** Migração de variáveis globais simples para uma estrutura de lista indexada por URI, garantindo maior estabilidade no rastreamento dos intervalos ativos.

---
