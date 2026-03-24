---
description: Executa as tarefas do MVP seqüencialmente verificando testes e lint.
---

# Workflow: exec (Execução do MVP Revista Gestão)

Este workflow coordena a implementação iterativa do **Revista Gestão**, baseando-se estritamente nas fases e dependências definidas no arquivo de controle `docs/mvp_inicial.json`.

## ⚠️ Regras Inegociáveis (Gatekeepers)
1. **Testes Obrigatórios**: Nenhuma subtask avança sem que seus testes correspondentes sejam criados, executados e passem com sucesso.
2. **Zero Erros de Linter**: O código deve passar de forma limpa pelo ESLint (0 erros).
3. **Abortar no Erro**: Se ocorrer **qualquer erro** (nos testes, no linting, no build ou em tempo de execução), o processo deve ser **abortado imediatamente**. O erro deve ser identificado em detalhes e a execução só pode ser de fato retomada após a resolução completa.
4. **Passo a Passo (Modo Interativo)**: Nunca execute múltiplas tarefas de uma vez. O workflow inicia selecionando a tarefa do topo, foca na **primeira subtask pendente** e a resolve do começo ao fim. Ao final dela, é **obrigatório** perguntar ao usuário: *"Subtask concluída. Deseja avançar para a próxima?"*
5. **Tratamento de Dependências**: Verifique as amarrações do array `dependencies`. Uma tarefa ou módulo não pode ser iniciado se suas dependências listadas não constarem como concluídas.
6. **Atualização Dinâmica e Commits**: Manter o `docs/mvp_inicial.json` atualizado (`pending` ➔ `in_progress` ➔ `completed`) e sempre criar o commit padrão em **português** a cada agrupamento de código consolidado.

---

## 🔄 Ciclo de Execução Interativo

Para processar a fila ordenada estabelecida no campo `execution_order_guidance`, avance passo a passo:

1. **Seleção e Verificação de Dependências**: 
   - Identifique a próxima Task `"pending"`.
   - Confirme se todas as dependências dela estão finalizadas.
   - Mude o status da Task raiz no `docs/mvp_inicial.json` para `"in_progress"`.
   
2. **Execução Segregada por Subtask**:
   Pegue a primeira Subtask não-concluída e:
   - Altere o status dela para `"in_progress"`.
   - Desenvolva o código correspondente à sua respectiva `description` e `user_story`.

3. **Validação de Testes da Subtask**:
   - Crie a cobertura de testes para a funcionalidade (unitário e/ou E2E).
   // turbo
   - Execute o teste. **[Gatilho de Aborto]**: Se houver falha, pare o processo, identifique a origem da quebra no console e proponha a correção imediatamente antes de avançar.

4. **Linting de Código da Subtask**:
   // turbo
   - Execute a verificação (`npm run lint` ou equivalente). **[Gatilho de Aborto]**: Se houver erros ou warnings críticos, estacione e resolva.

5. **Check de Avanço com o Usuário**:
   - Assuma a validação mudando a subtask no JSON para `"completed"`.
   - **PARE**: Pergunte diretamente ao usuário: *"A subtask [NOME/ID] terminou com sucessos em testes e linter. Deseja prosseguir para a próxima subtask/tarefa?"*.
   - Apenas prossiga mediante confirmação.

6. **Fechamento da Task Pai**:
   - Ao liquidar todas as subtasks internamente, coloque a Task respectiva como `"completed"`.
   - Crie um log versionado fazendo o commit no git em português (ex: `feat(db): adiciona tabela de Users e Roles`).

---

## 📋 Trilha Mestra 
*(Fiel à propriedade `execution_order_guidance` listada no JSON do MVP)*

### Fase 1: Modelo de dados e ERP básico
- [ ] `M2-MVP-T1` - Modelagem mínima de banco de dados
- [ ] `M2-MVP-T2` - Autenticação e RBAC básicos no ERP
- [ ] `M2-MVP-T3` - CRUD de artigos no ERP
- [ ] `M2-MVP-T4` - Workflow editorial mínimo
- [ ] `M2-MVP-T5` - Logs básicos de atividade

### Fase 2: Infraestrutura mínima
- [ ] `M3-MVP-T1` - Provisionamento ambiente mínimo
- [ ] `M3-MVP-T2` - Segurança e Cloudflare básicos

### Fase 3: APIs e Portal público
- [ ] `M4-MVP-T1` - API de listagem de artigos
- [ ] `M4-MVP-T2` - API de detalhe de artigo
- [ ] `M4-MVP-T3` - API de categorias
- [ ] `M1-MVP-T1` - Layout base e navegação principal
- [ ] `M1-MVP-T2` - Home com destaques e lista de notícias
- [ ] `M1-MVP-T3` - Página de artigo com legibilidade básica
- [ ] `M1-MVP-T4` - Taxonomia política mínima
- [ ] `M1-MVP-T5` - SEO on-page essencial e sitemap
