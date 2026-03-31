# Changelog

## [0.1.1] - 2026-03-31

### 🐛 Correções de Bugs (Fixes)

- **Bloqueio de Múltiplas Instâncias (#16):** Corrigido o bug onde clicar repetidamente em "Ativar Brilho RGB!" no mesmo trecho de texto criava várias animações sobrepostas, causando um efeito de "pisca-pisca" acelerado.
- **Validação de Range:** Implementada a verificação `isEqual` para garantir que cada `Range` específico em um arquivo (`URI`) possua apenas um intervalo de animação ativo por vez.

### ⚙️ Melhorias Técnicas

- **Feedback de Interface:** Adicionada uma notificação informativa (`showInformationMessage`) para alertar o usuário quando ele tenta ativar o brilho em um trecho que já está animado.
- **Estabilização de Ciclo:** Ajuste no fluxo lógico para interromper a criação de novos `setInterval` caso a validação de existência retorne positiva.

---

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
