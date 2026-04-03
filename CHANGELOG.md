# Changelog

## [1.1.0] - 2026-04-03

### ✨ Novas Funcionalidades

- **abcd:** abcd.

### 🐛 Correções de Bugs (Fixes)

- **Fim do flickering inicial (#22):** Resolvido o problema de cintilação ao iniciar ou reiniciar brilhos; as decorações agora são aplicadas com cor imediata, eliminando o frame vazio antes da primeira animação.

---

## [1.0.0] - 2026-04-02

### ✨ Novas Funcionalidades

- **Comando RGB por linha:** adicionada nova ação `extension.brilharLinha` (atalho `Ctrl+Shift+L` / `Cmd+Shift+L`) para aplicar efeito RGB na linha atual.
- **Artefato de atualização de seleções:** o efeito agora acompanha edições de texto e mantém ranges atualizados automaticamente ao digitar/excluir dentro/outside do destaque.

### 🐛 Correções de Bugs (Fixes)

- **Parar apenas seleção ativa (#28):** `extension.pararBrilho` agora remove apenas os intervalos intersectados pela seleção atual, preservando outros destaques ativos no mesmo arquivo.
- **Evita duplicação de animação (#21):** fim do problema de múltiplas animações no mesmo range quando reativa o comando repetidas vezes.

### ⚙️ Melhorias Técnicas

- **Refatoração de gestão de efeitos:** isolado `BrilhoInstancia` e lógica de `iniciarBrilho`, reduzindo vazamento e melhorando previsibilidade sob edição dinâmica.
- **Reaplicação automática:** ao trocar de aba/editor, o estado do highlight é reaplicado no editor ativado.

---

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
