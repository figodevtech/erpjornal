---
description: Executa as tarefas do MVP seqüencialmente verificando testes e lint.
---

# Workflow: exec (Execução do MVP Revista Gestão)

Este workflow coordena a implementação iterativa do **Revista Gestão**, baseando-se estritamente nas fases e dependências definidas no arquivo de controle `docs/features_extras.json`.

## ⚠️ Regras Inegociáveis (Gatekeepers)
1. **Testes Obrigatórios**: Nenhuma subtask avança sem que seus testes correspondentes sejam criados, executados e passem com sucesso.
2. **Zero Erros de Linter**: O código deve passar de forma limpa pelo ESLint (0 erros).
3. **Abortar no Erro**: Se ocorrer **qualquer erro** (nos testes, no linting, no build ou em tempo de execução), o processo deve ser **abortado imediatamente**. O erro deve ser identificado em detalhes e a execução só pode ser de fato retomada após a resolução completa.
4. **Passo a Passo (Modo Interativo)**: Nunca execute múltiplas tarefas de uma vez. O workflow inicia selecionando a tarefa do topo, foca na **primeira subtask pendente** e a resolve do começo ao fim. Ao final dela, é **obrigatório** perguntar ao usuário: *"Subtask concluída. Deseja avançar para a próxima?"*
5. **Tratamento de Dependências**: Verifique as amarrações do array `dependencies`. Uma tarefa ou módulo não pode ser iniciado se suas dependências listadas não constarem como concluídas.
6. **Atualização Dinâmica e Commits**: Manter o `docs/features_extras.json` atualizado (`pending` ➔ `in_progress` ➔ `completed`) e sempre criar o commit padrão em **português** a cada agrupamento de código consolidado.
7. **Uso de Ferramentas e Skills**: 
   - Utilize as **Skills** mapeadas no diretório `.agent/skills/` para garantir as melhores práticas.
   - Utilize os MCPs do **Supabase** para modelagem, migrações e comandos de banco de dados.
   - Utilize o MCP do **Stitch** para geração acelerada e prototipação de telas e componentes UI.

---

## 🔄 Ciclo de Execução Interativo

Para processar a fila ordenada estabelecida no campo `execution_order_guidance`, avance passo a passo:

1. **Seleção e Verificação de Dependências**: 
   - Identifique a próxima Task `"pending"`.
   - Confirme se todas as dependências dela estão finalizadas.
   - Mude o status da Task raiz no `docs/features_extras.json` para `"in_progress"`.
   
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
*(Fiel à propriedade `execution_order_guidance` listada no JSON de Features Extras)*

### Fase 1: Workflow, versionamento e taxonomia avançada
- [ ] `M2-PLUS-T1` - Workflow Kanban completo
- [ ] `M2-PLUS-T2` - Versionamento de artigos e diff
- [ ] `M2-PLUS-T3` - Revisão jurídica e fact-checking
- [ ] `M1-PLUS-T2` - Taxonomia política avançada e páginas de políticos

### Fase 2: DAM, CRM de fontes e multiformato
- [ ] `M2-PLUS-T4` - DAM avançado (Media_Library com IA)
- [ ] `M2-PLUS-T5` - CRM de fontes e contatos governamentais
- [ ] `M1-PLUS-T3` - Multiformatos no portal (podcasts, vídeos curtos, newsletters)

### Fase 3: Omnichannel, webhooks e SEO avançado
- [ ] `M4-PLUS-T1` - Publicação omnichannel
- [ ] `M4-PLUS-T2` - Webhooks e notificações externas
- [ ] `M1-PLUS-T4` - SEO avançado e Open Graph dinâmico

### Fase 4: Acessibilidade avançada e observabilidade
- [ ] `M1-PLUS-T1` - Dark Mode e acessibilidade avançada
- [ ] `M3-PLUS-T1` - Redis para cache e contagem de visualizações
- [ ] `M3-PLUS-T2` - Observabilidade e monitoramento avançados
- [ ] `M5-PLUS-T1` - Dashboard editorial avançado
- [ ] `M5-PLUS-T2` - Barra lateral de SEO em tempo real no editor
