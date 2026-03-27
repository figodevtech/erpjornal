# 💡 Ideias de Implementação Futura - Revista Gestão

Este documento registra funcionalidades que foram discutidas, mas removidas do workflow principal para foco em outras prioridades do MVP/Pós-MVP.

---

## 1. Integração com Redes Sociais (Omnichannel)
**Contexto:** Permitir que o ERP dispare automaticamente posts para redes sociais ao publicar uma matéria.

### Abordagem Recomendada (Opção C do Brainstorm)
**Uso de Webhooks + n8n/Zapier**

- **Como funcionaria:**
  - O ERP Revista Gestão dispara um evento (webhook) para uma URL configurada sempre que uma notícia troca o status para `PUBLISHED`.
  - O payload do webhook contém: Título, Resumo, URL da Notícia e URL da OG Image.
  - Uma ferramenta externa (n8n ou Make.com) recebe esse webhook e executa a postagem no X (Twitter), Facebook e LinkedIn de forma assíncrona.

- **Vantagens:**
  - Desacoplamento total: O ERP não precisa lidar com as APIs instáveis das redes sociais.
  - Flexibilidade: Adicionar ou remover redes sociais não exige novo deploy do portal.
  - Resiliência: Sistemas de automação externos tratam retentativas (retries) automaticamente.

---

## 2. Webhooks e Notificações Externas (Event-Driven)
**Contexto:** Permitir que o sistema dispare alertas para canais internos (Telegram/WhatsApp) e exponha webhooks para integrações externas.

- **Por que é uma ideia futura:** A integração via webhook é poderosa, mas exige uma camada robusta de gerenciamento de retentativas (retries) e logs para garantir confiabilidade. Atualmente, o foco está na experiência direta do leitor e do editor no portal.
- **Implementação Sugerida:**
  - Criar um sistema de fila (Queue/Job) para disparar os eventos sem bloquear o fluxo principal.
  - Interface no ERP para usuários Admin cadastrarem URLs externas e quais eventos querem ouvir (`news.published`, `breaking.active`).

---

## 3. Próximas Ideias...
*   [Espaço reservado para futuras discussões]
