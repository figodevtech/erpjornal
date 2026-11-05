import type * as Sentry from "@sentry/nextjs";

type OpcoesInit = NonNullable<Parameters<typeof Sentry.init>[0]>;

/**
 * Coleta de dados RESTRITA (LGPD).
 *
 * No Sentry v11 o padrão passou a coletar quase tudo: cookies (onde fica o
 * token de sessão do Supabase), corpos de requisição (senhas do login e da
 * criação de usuários), variáveis locais das stack frames, dados de queries
 * e e-mail/IP do usuário. Aqui tudo isso fica desligado; erros e stack
 * traces continuam sendo enviados normalmente.
 */
export const COLETA_DE_DADOS: NonNullable<OpcoesInit["dataCollection"]> = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: ["authorization", "cookie", "forwarded", "-ip", "remote-", "via", "-user"] },
    response: false,
  },
  httpBodies: [],
  urlQueryParams: { deny: ["token", "code", "access_token", "refresh_token", "email"] },
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  mcp: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
};

/** Amostragem de performance: 10% em produção, 100% em desenvolvimento. */
export const TAXA_AMOSTRAGEM_TRACES = process.env.NODE_ENV === "production" ? 0.1 : 1.0;
