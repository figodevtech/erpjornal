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

## 2. Próximas Ideias...
*   [Espaço reservado para futuras discussões]
